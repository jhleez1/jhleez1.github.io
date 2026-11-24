/* Control room: a simulated colour-sorting conveyor driven by a PLC-style
   state machine. Shows the HMI, the Structured Text program (with the active
   lines highlighted), a Watch table, a live ladder diagram and the I/O map. */
window.PF_Factory = (() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);

  // ---- Program shown in the code view. s = state(s) that light the line. ----
  const ST = [
    ["PROGRAM _CYCLIC"],
    [""],
    ["  (* Emergency stop always wins *)", "estop"],
    ["  IF E_Stop THEN", "estop"],
    ["    State := 99;", "estop"],
    ["  END_IF", "estop"],
    [""],
    ["  CASE State OF"],
    ["    0:  (* IDLE *)", 0],
    ["        Motor := FALSE;", 0],
    ["        IF Start THEN State := 10; END_IF", 0],
    [""],
    ["    10: (* RUN *)", 10],
    ["        Motor := TRUE;", 10],
    ["        IF Part_Sensor THEN State := 20; END_IF", 10],
    ["        IF At_Pusher_A AND Target = RED THEN State := 30; END_IF", 10],
    ["        IF At_Pusher_B AND Target = BLUE THEN State := 40; END_IF", 10],
    ["        IF Stop THEN State := 0; END_IF", 10],
    [""],
    ["    20: (* READ COLOUR *)", 20],
    ["        Target := ReadColour(Colour_Sensor);", 20],
    ["        State := 10;", 20],
    [""],
    ["    30: (* PUSH TO BIN A *)", 30],
    ["        Pusher_A := TRUE;", 30],
    ["        IF tPush.Q THEN Pusher_A := FALSE; Count_A := Count_A + 1; State := 10; END_IF", 30],
    [""],
    ["    40: (* PUSH TO BIN B *)", 40],
    ["        Pusher_B := TRUE;", 40],
    ["        IF tPush.Q THEN Pusher_B := FALSE; Count_B := Count_B + 1; State := 10; END_IF", 40],
    [""],
    ["    99: (* EMERGENCY STOP *)", 99],
    ["        Motor := FALSE; Pusher_A := FALSE; Pusher_B := FALSE;", 99],
    ["        IF Reset AND NOT E_Stop THEN State := 0; END_IF", 99],
    ["  END_CASE"],
    [""],
    ["END_PROGRAM"]
  ];
  const KW = /\b(PROGRAM|END_PROGRAM|IF|THEN|END_IF|CASE|OF|END_CASE|AND|NOT|OR|TRUE|FALSE)\b/g;
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  function hl(line) {
    if (/^\s*\(\*/.test(line)) return `<span class="c-com">${esc(line)}</span>`;
    let out = esc(line).replace(/(\(\*.*?\*\))/g, "\u0001$1\u0002");
    out = out.replace(KW, '<span class="c-kw">$1</span>').replace(/\b(\d+)\b/g, '<span class="c-num">$1</span>');
    return out.replace(/\u0001(.*?)\u0002/g, (_, c) => `<span class="c-com">${c.replace(/<[^>]+>/g, "")}</span>`);
  }

  const COLORS = { r: "oklch(0.64 0.2 25)", b: "oklch(0.62 0.17 255)", g: "oklch(0.70 0.17 150)" };
  const NAMES = { r: "RED", b: "BLUE", g: "GREEN" };
  const STATE_NAMES = { 0: "IDLE", 10: "RUN", 20: "READ COLOUR", 30: "PUSH A", 40: "PUSH B", 99: "E-STOP" };
  // World coordinates (canvas is drawn at 1000 x 380 and scaled)
  const W = 1000, H = 380, BELT_Y = 150, BELT_X0 = 70, BELT_X1 = 900, SENSOR_X = 250, PA_X = 470, PB_X = 680, PART = 36;

  function mount(root, ctx) {
    const { icon } = ctx;
    root.innerHTML = `
      <div class="fac">
        <div class="panel fac-main">
          <div class="fac-top">
            <div class="fac-id"><span class="mono">LINE 01</span><b>Colour sorter</b></div>
            <span class="fac-state" id="facState"><i></i><span>RUN</span></span>
            <div class="fac-scan mono"><span>Scan <b id="facScans">0</b></span><span>Cycle <b>10 ms</b></span></div>
          </div>
          <div class="fac-canvas-wrap"><canvas id="facCanvas" width="1000" height="380" role="img" aria-label="Animated conveyor sorting coloured parts into bins"></canvas></div>
          <div class="counters strip">
            <div class="ctr"><i style="background:${COLORS.r}"></i><span>Bin A · red</span><b id="cntA">0</b></div>
            <div class="ctr"><i style="background:${COLORS.b}"></i><span>Bin B · blue</span><b id="cntB">0</b></div>
            <div class="ctr"><i style="background:${COLORS.g}"></i><span>Bin C · green</span><b id="cntC">0</b></div>
            <div class="ctr total"><span>Parts / min</span><b id="cntRate">0</b></div>
          </div>
        </div>
        <div class="panel fac-hmi">
          <p class="eyebrow">HMI</p>
          <div class="hmi-btns">
            <button class="hmi-btn go" id="hmiStart">${icon("play")}<span>Start</span></button>
            <button class="hmi-btn stop" id="hmiStop">${icon("square")}<span>Stop</span></button>
            <button class="hmi-btn reset" id="hmiReset">${icon("reset")}<span>Reset</span></button>
          </div>
          <button class="estop" id="hmiEstop" aria-pressed="false"><span class="estop-cap">E-STOP</span></button>
          <p class="estop-hint" id="estopHint">Press to stop everything</p>
          <div class="slider"><label for="facSpeed">Belt speed</label><input type="range" id="facSpeed" min="40" max="200" value="100"><output id="facSpeedOut">100%</output></div>
          <label class="toggle"><input type="checkbox" id="facFeed" checked><span>Feed new parts</span></label>
        </div>
        <div class="panel fac-code">
          <div class="code-tabs seg" role="tablist" aria-label="Program views">
            <button class="seg-btn is-on" data-tab="st" role="tab" aria-selected="true">Structured Text</button>
            <button class="seg-btn" data-tab="ladder" role="tab" aria-selected="false">Ladder</button>
            <button class="seg-btn" data-tab="io" role="tab" aria-selected="false">I/O map</button>
          </div>
          <div class="code-pane" data-pane="st">
            <div class="st-grid">
              <pre class="st-code" id="stCode" aria-label="Structured Text program">${ST.map(([l], i) => `<span class="ln" data-i="${i}"><em>${i + 1}</em>${hl(l) || " "}</span>`).join("")}</pre>
              <div class="watch">
                <p class="eyebrow">Watch</p>
                <table><thead><tr><th>Variable</th><th>Value</th></tr></thead><tbody id="watchBody"></tbody></table>
              </div>
            </div>
          </div>
          <div class="code-pane" data-pane="ladder" hidden><div class="ladder-wrap"><svg id="ladder" viewBox="0 0 760 340" role="img" aria-label="Ladder diagram with live power flow"></svg></div></div>
          <div class="code-pane" data-pane="io" hidden><div class="io-wrap"><table class="io"><thead><tr><th>Address</th><th>Symbol</th><th>Description</th><th>State</th></tr></thead><tbody id="ioBody"></tbody></table></div></div>
        </div>
      </div>`;

    // ---------------------------------------------------------------- model
    const S = {
      state: 10, motor: true, estop: false, start: 0, stop: 0, reset: 0,
      speed: 1, feed: true, parts: [], belt: 0, spawnT: 0.4, scans: 0,
      pusherA: 0, pusherB: 0, pushA: false, pushB: false, pushT: 0,
      sensor: false, target: null, count: { a: 0, b: 0, c: 0 }, log: [], hold20: 0, lampBlink: 0
    };
    // Seed a few parts so the first frame already shows the line working
    [["r", 150], ["g", 330], ["b", 560], ["r", 790]].forEach(([c, x]) => S.parts.push({ c, x, y: 0, st: "belt", tgt: x > SENSOR_X ? c : null }));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || document.body.classList.contains("calm");
    if (reduced) { S.state = 0; S.motor = false; }

    const cv = $("#facCanvas", root), g = cv.getContext("2d");
    let theme = {};
    function readTheme() {
      const cs = getComputedStyle(document.documentElement);
      const v = (n) => cs.getPropertyValue(n).trim();
      theme = { bg: v("--surface-2"), panel: v("--surface"), line: v("--line"), fg: v("--fg"), muted: v("--muted"), primary: v("--primary"), accent: v("--accent"), s3: v("--surface-3") };
    }
    readTheme();
    function fitCanvas() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = cv.clientWidth || 1000;
      cv.width = Math.round(w * dpr); cv.height = Math.round(w * (H / W) * dpr);
      g.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
    }
    new ResizeObserver(fitCanvas).observe(cv);
    fitCanvas();

    // ---------------------------------------------------------------- HMI
    const pressed = (k) => { S[k] = 0.35; };
    $("#hmiStart", root).onclick = () => { if (S.estop) return ctx.toast("Release E-STOP and press Reset first"); pressed("start"); };
    $("#hmiStop", root).onclick = () => pressed("stop");
    $("#hmiReset", root).onclick = () => pressed("reset");
    const eBtn = $("#hmiEstop", root);
    eBtn.onclick = () => {
      S.estop = !S.estop; eBtn.setAttribute("aria-pressed", S.estop);
      $("#estopHint", root).textContent = S.estop ? "Latched. Press again to release, then Reset." : "Press to stop everything";
    };
    $("#facSpeed", root).oninput = (e) => { S.speed = e.target.value / 100; $("#facSpeedOut", root).textContent = e.target.value + "%"; };
    $("#facFeed", root).onchange = (e) => { S.feed = e.target.checked; };
    root.querySelectorAll(".code-tabs .seg-btn").forEach((b) => (b.onclick = () => {
      root.querySelectorAll(".code-tabs .seg-btn").forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-selected", x === b); });
      root.querySelectorAll(".code-pane").forEach((p) => (p.hidden = p.dataset.pane !== b.dataset.tab));
    }));

    // ---------------------------------------------------------------- scan
    function scan(dt) {
      S.scans += Math.round(dt / 0.01);
      ["start", "stop", "reset"].forEach((k) => (S[k] = Math.max(0, S[k] - dt)));
      const partAt = (x) => S.parts.find((p) => p.st === "belt" && Math.abs(p.x - x) < 10);
      const atA = partAt(PA_X), atB = partAt(PB_X);
      const sensed = S.parts.find((p) => p.st === "belt" && Math.abs(p.x - SENSOR_X) < PART / 2);
      S.sensor = !!sensed;

      if (S.estop) S.state = 99;
      switch (S.state) {
        case 0:
          S.motor = false;
          if (S.start) S.state = 10;
          break;
        case 10: case 20: case 30: case 40:
          S.motor = true;
          if (sensed && sensed.tgt == null) { sensed.tgt = sensed.c; S.target = sensed.c; S.hold20 = 0.25; }
          if (atA && atA.tgt === "r" && !S.pushA) { S.pushA = true; S.pushT = 0; atA.st = "pushA"; atA.py = 0; }
          if (atB && atB.tgt === "b" && !S.pushB) { S.pushB = true; S.pushT = 0; atB.st = "pushB"; atB.py = 0; }
          S.hold20 = Math.max(0, S.hold20 - dt);
          S.state = S.pushA ? 30 : S.pushB ? 40 : S.hold20 > 0 ? 20 : 10;
          if (S.stop) S.state = 0;
          break;
        case 99:
          S.motor = false; S.pushA = S.pushB = false;
          if (S.reset && !S.estop) S.state = 0;
          break;
      }
      if (S.state === 0 || S.state === 99) S.motor = false;

      // Pushers: extend 0.18 s, retract 0.22 s
      const anim = (k, on) => { S[k] = on ? Math.min(1, S[k] + dt / 0.18) : Math.max(0, S[k] - dt / 0.22); };
      if (S.pushA || S.pushB) S.pushT += dt;
      if (S.pushT > 0.3) { if (S.pushA) S.count.a++; if (S.pushB) S.count.b++; S.log.push(performance.now()); S.pushA = S.pushB = false; S.pushT = 0; }
      anim("pusherA", S.pushA); anim("pusherB", S.pushB);

      // Belt + parts
      const v = S.motor ? 130 * S.speed : 0;
      S.belt = (S.belt + v * dt) % 40;
      if (S.motor && S.feed) {
        S.spawnT -= dt * S.speed;
        const clear = !S.parts.some((p) => p.st === "belt" && p.x < BELT_X0 + PART * 1.6);
        if (S.spawnT <= 0 && clear) { S.parts.push({ c: "rgb"[Math.floor(Math.random() * 3)], x: BELT_X0 - 10, y: 0, st: "belt", tgt: null }); S.spawnT = 1.05 + Math.random() * 0.6; }
      }
      S.parts.forEach((p) => {
        if (p.st === "belt") {
          p.x += v * dt;
          if (p.x > BELT_X1 + 10) { p.st = "fall"; p.vy = 0; }
        } else if (p.st === "pushA" || p.st === "pushB") {
          p.py = Math.min(1, p.py + dt / 0.25);
          if (p.py >= 1) { p.st = "bin"; p.t = 0; p.bx = p.st === "pushA" ? PA_X : PB_X; }
        } else if (p.st === "fall") {
          p.vy += 1400 * dt; p.y += p.vy * dt; p.x += 90 * dt;
          if (p.y > 140) { p.st = "gone"; S.count.c++; S.log.push(performance.now()); }
        } else if (p.st === "bin") { p.t += dt; if (p.t > 0.35) p.st = "gone"; }
      });
      S.parts = S.parts.filter((p) => p.st !== "gone");
      const now = performance.now(); S.log = S.log.filter((t) => now - t < 60000);
      S.lampBlink += dt;
    }

    // ---------------------------------------------------------------- draw
    function rr(x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
    function label(t, x, y, align = "center", col = theme.muted) { g.fillStyle = col; g.font = "500 12px 'Geist Mono', ui-monospace, monospace"; g.textAlign = align; g.fillText(t, x, y); }
    function drawPart(p, x, y, a = 1) {
      g.save(); g.globalAlpha = a;
      g.shadowColor = "rgba(0,0,0,.25)"; g.shadowBlur = 8; g.shadowOffsetY = 3;
      rr(x - PART / 2, y - PART / 2, PART, PART, 8); g.fillStyle = COLORS[p.c]; g.fill();
      g.shadowColor = "transparent";
      rr(x - PART / 2 + 5, y - PART / 2 + 4, PART - 10, 7, 4); g.fillStyle = "rgba(255,255,255,.28)"; g.fill();
      g.restore();
    }
    function draw() {
      g.clearRect(0, 0, W, H);
      rr(0, 0, W, H, 18); g.fillStyle = theme.bg; g.fill();
      g.fillStyle = theme.line;
      for (let x = 20; x < W; x += 28) for (let y = 20; y < H; y += 28) g.fillRect(x, y, 1.5, 1.5);

      // Stack light
      const lx = 26, on = (c, i) => { g.beginPath(); g.arc(lx, 52 + i * 26, 10, 0, 7); g.fillStyle = c; g.fill(); };
      rr(lx - 3, 30, 6, 100, 3); g.fillStyle = theme.s3; g.fill();
      on(S.state === 99 && Math.floor(S.lampBlink * 3) % 2 ? COLORS.r : theme.s3, 0);
      on(S.state === 0 ? "oklch(0.82 0.16 85)" : theme.s3, 1);
      on(S.motor ? COLORS.g : theme.s3, 2);

      // Bins
      const bin = (x, c, n, name) => {
        const y = BELT_Y + 92;
        rr(x - 52, y, 104, 96, 12); g.fillStyle = theme.panel; g.fill(); g.strokeStyle = theme.line; g.lineWidth = 2; g.stroke();
        rr(x - 52, y, 104, 8, 4); g.fillStyle = COLORS[c]; g.fill();
        g.fillStyle = theme.fg; g.font = "700 28px 'Bricolage Grotesque', system-ui, sans-serif"; g.textAlign = "center"; g.fillText(n, x, y + 56);
        label(name, x, y + 80);
      };
      bin(PA_X, "r", S.count.a, "BIN A"); bin(PB_X, "b", S.count.b, "BIN B"); bin(BELT_X1 + 40, "g", S.count.c, "BIN C");

      // Belt
      rr(BELT_X0 - 22, BELT_Y - 24, BELT_X1 - BELT_X0 + 44, 48, 24); g.fillStyle = theme.s3; g.fill();
      g.save(); rr(BELT_X0 - 22, BELT_Y - 24, BELT_X1 - BELT_X0 + 44, 48, 24); g.clip();
      g.strokeStyle = theme.line; g.lineWidth = 2;
      for (let x = BELT_X0 - 40 + S.belt; x < BELT_X1 + 40; x += 40) { g.beginPath(); g.moveTo(x, BELT_Y - 24); g.lineTo(x - 14, BELT_Y + 24); g.stroke(); }
      g.restore();
      [BELT_X0 - 2, BELT_X1 + 2].forEach((x) => { g.beginPath(); g.arc(x, BELT_Y, 18, 0, 7); g.fillStyle = theme.panel; g.fill(); g.strokeStyle = theme.line; g.stroke();
        g.save(); g.translate(x, BELT_Y); g.rotate(S.belt / 18); g.strokeStyle = theme.muted; g.beginPath(); g.moveTo(-10, 0); g.lineTo(10, 0); g.moveTo(0, -10); g.lineTo(0, 10); g.stroke(); g.restore(); });
      label(S.motor ? "M1  ON" : "M1  OFF", BELT_X0 - 2, BELT_Y + 46, "center", S.motor ? theme.primary : theme.muted);

      // Colour sensor
      rr(SENSOR_X - 22, 46, 44, 34, 8); g.fillStyle = theme.panel; g.fill(); g.strokeStyle = theme.line; g.stroke();
      const sp = S.parts.find((p) => p.st === "belt" && Math.abs(p.x - SENSOR_X) < PART / 2);
      g.fillStyle = sp ? COLORS[sp.c] : theme.line; g.globalAlpha = sp ? 0.55 : 0.6;
      g.beginPath(); g.moveTo(SENSOR_X - 4, 80); g.lineTo(SENSOR_X + 4, 80); g.lineTo(SENSOR_X + 14, BELT_Y - 20); g.lineTo(SENSOR_X - 14, BELT_Y - 20); g.fill(); g.globalAlpha = 1;
      g.beginPath(); g.arc(SENSOR_X, 63, 6, 0, 7); g.fillStyle = sp ? COLORS[sp.c] : theme.s3; g.fill();
      label("COLOUR SENSOR", SENSOR_X, 34);

      // Pushers (housing above belt, rod pushes down across belt)
      const pusher = (x, ext, name) => {
        rr(x - 26, 40, 52, 40, 8); g.fillStyle = theme.panel; g.fill(); g.strokeStyle = theme.line; g.stroke();
        const rodLen = 6 + ext * 70;
        rr(x - 4, 80, 8, rodLen, 3); g.fillStyle = theme.muted; g.fill();
        rr(x - 22, 80 + rodLen, 44, 9, 4); g.fillStyle = ext > 0.05 ? theme.primary : theme.muted; g.fill();
        label(name, x, 32);
      };
      pusher(PA_X, S.pusherA, "PUSHER A"); pusher(PB_X, S.pusherB, "PUSHER B");

      // Parts
      S.parts.forEach((p) => {
        if (p.st === "belt") drawPart(p, p.x, BELT_Y);
        else if (p.st === "pushA" || p.st === "pushB") drawPart(p, p.x, BELT_Y + p.py * 105);
        else if (p.st === "fall") drawPart(p, p.x, BELT_Y + p.y);
        else if (p.st === "bin") drawPart(p, p.x, BELT_Y + 105 + p.t * 30, 1 - p.t / 0.35);
        if (p.st === "belt" && p.tgt) { g.fillStyle = "rgba(255,255,255,.9)"; g.font = "700 11px 'Geist Mono', monospace"; g.textAlign = "center"; g.fillText({ r: "A", b: "B", g: "C" }[p.tgt], p.x, BELT_Y + 5); }
      });

      if (S.state === 99) {
        g.fillStyle = "oklch(0.64 0.2 25 / 0.10)"; rr(0, 0, W, H, 18); g.fill();
        g.fillStyle = COLORS.r; g.font = "800 22px 'Bricolage Grotesque', system-ui, sans-serif"; g.textAlign = "right"; g.fillText("EMERGENCY STOP", W - 24, 40);
      }
    }

    // ---------------------------------------------------------------- views
    const lines = [...root.querySelectorAll("#stCode .ln")];
    const watchBody = $("#watchBody", root), ioBody = $("#ioBody", root), ladder = $("#ladder", root);
    const st = $("#facState", root);
    let lastState = -1;
    const IO = () => {
      const atA = S.parts.some((p) => p.st === "belt" && Math.abs(p.x - PA_X) < PART / 2) || S.pushA;
      const atB = S.parts.some((p) => p.st === "belt" && Math.abs(p.x - PB_X) < PART / 2) || S.pushB;
      return [
        ["%I0.0", "Start", "Start push button", S.start > 0],
        ["%I0.1", "Stop", "Stop push button", S.stop > 0],
        ["%I0.2", "E_Stop", "Emergency stop (latched)", S.estop],
        ["%I0.3", "Reset", "Reset push button", S.reset > 0],
        ["%I0.4", "Part_Sensor", "Part under colour sensor", S.sensor],
        ["%I0.5", "At_Pusher_A", "Part in front of pusher A", atA],
        ["%I0.6", "At_Pusher_B", "Part in front of pusher B", atB],
        ["%Q0.0", "Motor", "Conveyor motor M1", S.motor],
        ["%Q0.1", "Pusher_A", "Pusher A solenoid", S.pushA],
        ["%Q0.2", "Pusher_B", "Pusher B solenoid", S.pushB],
        ["%Q0.3", "Lamp_Green", "Stack light green", S.motor],
        ["%Q0.4", "Lamp_Red", "Stack light red", S.state === 99]
      ];
    };
    ioBody.innerHTML = IO().map(([a, s, d]) => `<tr><td class="mono">${a}</td><td class="mono">${s}</td><td>${d}</td><td><span class="led" data-io="${s}"></span></td></tr>`).join("");
    const leds = [...ioBody.querySelectorAll(".led")];

    // Ladder diagram
    const rungs = [
      { y: 40, items: [["NO", "Start", "start"], ["NC", "Stop", "stop"], ["NC", "E_Stop", "estop"]], coil: ["Motor", "motor"], seal: ["NO", "Motor", "motor"] },
      { y: 128, items: [["NO", "At_Pusher_A", "atA"], ["NO", "Is_Red", "isRed"]], coil: ["Pusher_A", "pushA"] },
      { y: 196, items: [["NO", "At_Pusher_B", "atB"], ["NO", "Is_Blue", "isBlue"]], coil: ["Pusher_B", "pushB"] },
      { y: 264, items: [["NO", "E_Stop", "estop"]], coil: ["Lamp_Red", "lampRed"] },
      { y: 316, items: [["NO", "Motor", "motor"]], coil: ["Lamp_Green", "motor"] }
    ];
    const X0 = 30, X1 = 730, CW = 64, cx = (i) => 120 + i * 150;
    let svg = `<line class="rail-l" x1="${X0}" y1="16" x2="${X0}" y2="332"/><line class="rail-l" x1="${X1}" y1="16" x2="${X1}" y2="332"/>`;
    rungs.forEach((r, ri) => {
      let x = X0;
      r.items.forEach(([type, name], i) => {
        const c = cx(i);
        svg += `<line class="w" data-r="${ri}" data-seg="${i}" x1="${x}" y1="${r.y}" x2="${c - 14}" y2="${r.y}"/>`;
        svg += `<g class="ct" data-r="${ri}" data-i="${i}"><line x1="${c - 14}" y1="${r.y - 14}" x2="${c - 14}" y2="${r.y + 14}"/><line x1="${c + 14}" y1="${r.y - 14}" x2="${c + 14}" y2="${r.y + 14}"/>${type === "NC" ? `<line x1="${c - 10}" y1="${r.y + 12}" x2="${c + 10}" y2="${r.y - 12}"/>` : ""}<text x="${c}" y="${r.y - 22}">${name}</text></g>`;
        x = c + 14;
      });
      const coilX = X1 - 90;
      svg += `<line class="w" data-r="${ri}" data-seg="${r.items.length}" x1="${x}" y1="${r.y}" x2="${coilX - 16}" y2="${r.y}"/>`;
      svg += `<g class="coil" data-r="${ri}"><path d="M${coilX - 8} ${r.y - 14} q-10 14 0 28 M${coilX + 8} ${r.y - 14} q10 14 0 28"/><text x="${coilX}" y="${r.y - 22}">${r.coil[0]}</text></g>`;
      svg += `<line class="w out" data-r="${ri}" data-seg="out" x1="${coilX + 16}" y1="${r.y}" x2="${X1}" y2="${r.y}"/>`;
      if (r.seal) {
        const c = cx(0), y2 = r.y + 44;
        svg += `<path class="w" data-r="${ri}" data-seg="seal" d="M${X0} ${r.y} V${y2} H${c - 14} M${c + 14} ${y2} H${c + 26} V${r.y}" fill="none"/>`;
        svg += `<g class="ct" data-r="${ri}" data-i="seal"><line x1="${c - 14}" y1="${y2 - 14}" x2="${c - 14}" y2="${y2 + 14}"/><line x1="${c + 14}" y1="${y2 - 14}" x2="${c + 14}" y2="${y2 + 14}"/><text x="${c}" y="${y2 + 30}">${r.seal[1]}</text></g>`;
      }
    });
    ladder.innerHTML = svg;

    function sig() {
      const atA = S.parts.some((p) => p.st === "belt" && Math.abs(p.x - PA_X) < PART / 2) || S.pushA;
      const atB = S.parts.some((p) => p.st === "belt" && Math.abs(p.x - PB_X) < PART / 2) || S.pushB;
      return { start: S.start > 0, stop: S.stop > 0, estop: S.estop, motor: S.motor, atA, atB, isRed: S.pushA || (atA && S.parts.some((p) => Math.abs(p.x - PA_X) < PART / 2 && p.c === "r")), isBlue: S.pushB || (atB && S.parts.some((p) => Math.abs(p.x - PB_X) < PART / 2 && p.c === "b")), pushA: S.pushA, pushB: S.pushB, lampRed: S.state === 99 };
    }
    function updateLadder() {
      const s = sig();
      rungs.forEach((r, ri) => {
        const conducts = (type, key) => (type === "NO" ? !!s[key] : !s[key]);
        let flow = true;
        const first = r.seal ? (conducts("NO", r.items[0][2]) || conducts("NO", r.seal[2])) : null;
        r.items.forEach(([type, , key], i) => {
          const segOn = flow;
          ladder.querySelector(`[data-r="${ri}"][data-seg="${i}"]`)?.classList.toggle("on", segOn);
          const c = conducts(type, key);
          ladder.querySelector(`.ct[data-r="${ri}"][data-i="${i}"]`)?.classList.toggle("on", c);
          flow = flow && (i === 0 && r.seal ? first : c);
        });
        if (r.seal) {
          const sealOn = conducts("NO", r.seal[2]);
          ladder.querySelector(`.ct[data-r="${ri}"][data-i="seal"]`)?.classList.toggle("on", sealOn);
          ladder.querySelector(`[data-r="${ri}"][data-seg="seal"]`)?.classList.toggle("on", true);
        }
        ladder.querySelector(`[data-r="${ri}"][data-seg="${r.items.length}"]`)?.classList.toggle("on", flow);
        ladder.querySelector(`.coil[data-r="${ri}"]`)?.classList.toggle("on", !!s[r.coil[1]]);
      });
    }

    function updateViews() {
      if (S.state !== lastState) {
        lines.forEach((ln) => {
          const tag = ST[+ln.dataset.i][1];
          ln.classList.toggle("act", tag === S.state || (tag === "estop" && S.estop));
        });
        lastState = S.state;
        const kind = S.state === 99 ? "err" : S.state === 0 ? "idle" : "run";
        st.dataset.kind = kind; st.querySelector("span").textContent = STATE_NAMES[S.state];
      }
      $("#facScans", root).textContent = S.scans.toLocaleString("en-US");
      $("#cntA", root).textContent = S.count.a; $("#cntB", root).textContent = S.count.b; $("#cntC", root).textContent = S.count.c;
      $("#cntRate", root).textContent = S.log.length;
      const B = (v) => `<span class="bool ${v ? "t" : "f"}">${v ? "TRUE" : "FALSE"}</span>`;
      watchBody.innerHTML = [
        ["State", `<b>${S.state}</b> <span class="muted">${STATE_NAMES[S.state]}</span>`],
        ["Motor", B(S.motor)], ["E_Stop", B(S.estop)], ["Part_Sensor", B(S.sensor)],
        ["Target", S.target ? NAMES[S.target] : "-"], ["Pusher_A", B(S.pushA)], ["Pusher_B", B(S.pushB)],
        ["Count_A", S.count.a], ["Count_B", S.count.b], ["Count_C", S.count.c]
      ].map(([k, v]) => `<tr><td class="mono">${k}</td><td class="mono">${v}</td></tr>`).join("");
      const io = IO(); leds.forEach((l, i) => l.classList.toggle("on", !!io[i][3]));
      updateLadder();
    }

    // ---------------------------------------------------------------- loop
    let running = false, last = 0, acc = 0, viewT = 0, visible = false;
    function frame(t) {
      if (!running) return;
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
      acc += dt;
      while (acc >= 0.01) { scan(0.01); acc -= 0.01; }
      draw();
      viewT += dt; if (viewT > 0.1) { viewT = 0; updateViews(); }
      requestAnimationFrame(frame);
    }
    function setRunning(v) {
      if (v === running) return; running = v;
      if (v) { last = performance.now(); requestAnimationFrame(frame); }
    }
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; setRunning(visible && !document.hidden); }, { rootMargin: "100px" }).observe(root);
    document.addEventListener("visibilitychange", () => setRunning(visible && !document.hidden));
    draw(); updateViews();

    return {
      refreshTheme() { readTheme(); draw(); },
      state: () => ({ state: STATE_NAMES[S.state], counts: { ...S.count }, motor: S.motor, estop: S.estop }),
      press(k) { if (k === "estop") eBtn.click(); else if (k === "start") $("#hmiStart", root).click(); else pressed(k); }
    };
  }
  return { mount };
})();
