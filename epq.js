/* EPQ page: Jihan's hexapod research project. Content from data.js (epq),
   which comes from his Obsidian vault. Everything here is plans, design data
   and explanations. No experimental results are shown until trials exist. */
window.PF_EPQ = (() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const calm = () => document.body.classList.contains("calm") || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rad = (d) => (d * Math.PI) / 180;
  function fitCanvas(cv, w, h) {
    const dpr = Math.min(devicePixelRatio || 1, 2), cw = cv.clientWidth || w;
    cv.width = Math.round(cw * dpr); cv.height = Math.round(cw * (h / w) * dpr);
    const g = cv.getContext("2d"); g.setTransform(cv.width / w, 0, 0, cv.height / h, 0, 0); return g;
  }
  function runWhenVisible(el, step) {
    let raf = 0, last = 0, vis = false;
    const f = (t) => { if (!vis || document.hidden) { raf = 0; return; } const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t; step(dt); raf = requestAnimationFrame(f); };
    const kick = () => { if (!raf && vis && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(f); } };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; kick(); }).observe(el);
    document.addEventListener("visibilitychange", kick);
  }

  function mount(root, ctx) {
    const { data: D, icon, ico, esc } = ctx;
    const E = D.epq;
    if (!E) { root.innerHTML = `<p class="muted">No EPQ details yet.</p>`; return null; }
    const today = new Date();
    const gates = E.gates.map((g) => ({ ...g, d: new Date(g.date + "T23:59:59") }));
    const nextGate = gates.find((g) => g.d >= today);
    const t0 = new Date("2026-10-01"), t1 = gates[gates.length - 1].d;
    const pos = (d) => Math.max(0, Math.min(100, ((d - t0) / (t1 - t0)) * 100));
    const fmt = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const totalWords = E.words.reduce((a, w) => a + w[1], 0);

    root.innerHTML = `
      <nav class="toc" aria-label="On this page">
        ${[["question", "Question"], ["gates", "Progress"], ["gaits", "Gaits"], ["leg", "The leg"], ["method", "Method"], ["energy", "Energy"], ["hardware", "Hardware"], ["evolution", "How it evolved"], ["reading", "Reading"], ["results", "Results"]].map(([id, l]) => `<a class="chip" href="#${id}">${l}</a>`).join("")}
      </nav>

      <section class="epq-block" id="question">
        <div class="q-card spot">
          <div class="q-top"><span class="pill-status"><i></i>${esc(E.stage)} · ${esc(E.asOf)}</span><span class="mono muted">Hand-in ${esc(E.handIn)}</span></div>
          <p class="eyebrow">Research question</p>
          <blockquote class="q-text">“${esc(E.question)}”</blockquote>
          <p class="q-sub">${esc(E.format)}</p>
        </div>
        <div class="var-grid">
          ${E.variables.map((v) => `<article class="var-card spot"><p class="eyebrow">${esc(v.kind)} variable</p><h3>${esc(v.what)}</h3><p>${esc(v.detail)}</p></article>`).join("")}
        </div>
      </section>

      <section class="epq-block" id="gates">
        <header class="sec-head row"><div><p class="eyebrow">Project plan</p><h2>Decision gates</h2></div>
          <p class="sec-sub">Each gate has a pass test written before the work starts, so the goalposts can't move later. ${nextGate ? `Next up: <b>${esc(nextGate.id)} ${esc(nextGate.name)}</b>, ${fmt(nextGate.d)}.` : ""}</p></header>
        <div class="gate-track">
          <div class="gate-line"><i style="width:${pos(today)}%"></i>
            ${gates.map((g) => `<span class="gl-dot${g === nextGate ? " next" : ""}${g.id === "G4" ? " key" : ""}" style="left:${pos(g.d)}%" title="${esc(g.id)} ${esc(g.name)}"><em>${esc(g.id)}</em></span>`).join("")}
            <span class="gate-today" style="left:${pos(today)}%"><b>Today</b></span>
          </div>
          <div class="gl-months">${Array.from({ length: 9 }, (_, i) => new Date(2026, 9 + i, 1)).map((m) => `<span style="left:${pos(m)}%">${m.toLocaleDateString("en-GB", { month: "short" })}</span>`).join("")}</div>
        </div>
        <ol class="gate-cards">
          ${gates.map((g) => `<li class="gate-card${g === nextGate ? " next" : ""}${g.id === "G4" ? " key" : ""}">
            <div class="gc-top"><span class="gc-id mono">${esc(g.id)}</span><span class="mono muted">${fmt(g.d)}</span>${g === nextGate ? '<span class="gc-next">Next</span>' : ""}</div>
            <b>${esc(g.name)}</b><small>${esc(g.test)}</small></li>`).join("")}
        </ol>
        <div class="checkpoint">
          <div class="cp-q spot"><p class="eyebrow">The big checkpoint · ${esc(E.checkpoint.date)}</p><h3>Does the learned controller walk, and does it work on the real robot?</h3><p class="muted">${esc(gates.find((g) => g.id === "G4")?.test || "")}</p></div>
          <div class="cp-branches">
            <article class="cp pass"><span class="mono">PASS</span><p>${esc(E.checkpoint.pass)}</p></article>
            <article class="cp fail"><span class="mono">FAIL</span><p>${esc(E.checkpoint.fail)}</p></article>
            <article class="cp neither"><span class="mono">NEITHER TRANSFERS</span><p>${esc(E.checkpoint.neither)}</p></article>
          </div>
          <p class="muted small">Every branch ends in a valid comparison, so there's a result whichever way it goes.</p>
        </div>
      </section>

      <section class="epq-block" id="gaits">
        <header class="sec-head row"><div><p class="eyebrow">Background · interactive</p><h2>How a hexapod walks</h2></div>
          <p class="sec-sub">The tripod gait is the baseline the learned controller has to beat: three legs on the ground while the other three swing forward, then swap. Compare it with two other classic insect gaits.</p></header>
        <div class="panel gait-panel">
          <div class="gait-controls">
            <div class="seg" role="tablist" aria-label="Gait">
              <button class="seg-btn is-on" data-gait="tripod">Tripod</button><button class="seg-btn" data-gait="ripple">Ripple</button><button class="seg-btn" data-gait="wave">Wave</button>
            </div>
            <div class="gait-readout mono"><span>Legs on the ground <b id="gStance">3</b></span><span>Duty factor <b id="gDuty">0.50</b></span><span>Relative speed <b id="gSpeed">1.00×</b></span></div>
          </div>
          <div class="gait-grid">
            <canvas id="gaitTop" width="360" height="360" aria-label="Top view of a hexapod walking"></canvas>
            <div class="gait-diagram"><canvas id="gaitDiag" width="560" height="260" aria-label="Gait diagram: which legs are on the ground over time"></canvas>
              <p class="muted small">Gait diagram: a filled bar means that foot is on the ground. Illustration of standard gaits, not experimental data.</p></div>
          </div>
        </div>
      </section>

      <section class="epq-block" id="leg">
        <header class="sec-head row"><div><p class="eyebrow">Design · interactive</p><h2>The prototype leg (v4)</h2></div>
          <p class="sec-sub">These are the real dimensions and collision-checked joint limits from Jihan's CAD. The same numbers go into the MuJoCo simulation. Move the joints to see where the foot ends up.</p></header>
        <div class="panel leg-panel">
          <div class="leg-view"><canvas id="legCv" width="560" height="380" aria-label="Side view of the hexapod leg with adjustable joints"></canvas></div>
          <div class="leg-side">
            <div class="slider"><label for="jHip">Hip (yaw)</label><input type="range" id="jHip" min="-40" max="40" value="0"><output id="oHip"></output></div>
            <div class="slider"><label for="jThigh">Thigh</label><input type="range" id="jThigh" min="-40" max="80" value="0"><output id="oThigh"></output></div>
            <div class="slider"><label for="jKnee">Knee (relative to thigh)</label><input type="range" id="jKnee" min="-110" max="-20" value="-95"><output id="oKnee"></output></div>
            <div class="demo-btns"><button class="btn tonal sm" data-pose="stand">Standing</button><button class="btn tonal sm" data-pose="lift">Lift</button><button class="btn tonal sm" data-pose="reach">Reach</button><button class="btn ghost sm" data-pose="anim">Step cycle</button></div>
            <dl class="leg-read">
              <div><dt>Foot reach</dt><dd id="rReach">-</dd></div><div><dt>Foot height</dt><dd id="rHeight">-</dd></div>
              <div><dt>Thigh → knee</dt><dd>62 mm</dd></div><div><dt>Knee → foot</dt><dd>97.7 mm</dd></div>
            </dl>
          </div>
          <div class="leg-notes">
            <div><p class="eyebrow">Designed in code</p><p>${esc(E.leg.designedIn)}.</p></div>
            <div><p class="eyebrow">Version history</p><ol class="vlist">${E.leg.history.map((h) => `<li>${esc(h)}</li>`).join("")}</ol></div>
            <div><p class="eyebrow">Printing</p><p>${esc(E.leg.print)}</p></div>
          </div>
        </div>
      </section>

      <section class="epq-block" id="method">
        <header class="sec-head"><p class="eyebrow">Method</p><h2>From simulation to a real robot</h2></header>
        <ol class="pipeline">
          ${E.method.map((m, i) => `<li class="pipe spot"><span class="pipe-n mono">${i + 1}</span><h3>${esc(m.step)}</h3><p>${esc(m.text)}</p></li>`).join("")}
        </ol>
        <div class="integrity">${ico("check")}<p>${esc(E.integrity)}</p></div>
      </section>

      <section class="epq-block" id="energy">
        <header class="sec-head row"><div><p class="eyebrow">Measurement</p><h2>Energy per metre</h2></div>
          <p class="sec-sub">The INA219 samples the servos' voltage and current many times a second. Adding up power × time gives the energy; dividing by distance gives the result. Cost of transport also accounts for the robot's weight, so it can be compared with animals and other robots.</p></header>
        <div class="energy-grid">
          <div class="formulas panel">
            <div class="f"><span class="f-l">Energy</span><span class="f-m">E ≈ Σ V<sub>k</sub> · I<sub>k</sub> · Δt</span></div>
            <div class="f"><span class="f-l">Energy per metre</span><span class="f-m">J/m = E ÷ d</span></div>
            <div class="f"><span class="f-l">Cost of transport</span><span class="f-m">CoT = E ÷ (m · g · d)</span></div>
            <p class="muted small">Fair test: same robot, surface, track and mass; controllers alternate A-B-A-B so battery drift affects both equally; every run logged, including failures.</p>
          </div>
          <form class="calc panel" id="eCalc">
            <p class="eyebrow">Try the maths · example numbers, not results</p>
            <div class="calc-in">
              <label>Average voltage <span><input type="number" step="0.1" min="0" id="cV" value="6.0"> V</span></label>
              <label>Average current <span><input type="number" step="0.1" min="0" id="cI" value="1.5"> A</span></label>
              <label>Walk time <span><input type="number" step="1" min="0" id="cT" value="25"> s</span></label>
              <label>Distance <span><input type="number" step="0.1" min="0.1" id="cD" value="2.0"> m</span></label>
              <label>Robot mass <span><input type="number" step="0.05" min="0.05" id="cM" value="0.9"> kg</span></label>
            </div>
            <div class="calc-out">
              <div><span>Energy</span><b id="oE">-</b></div><div class="hl"><span>Energy per metre</span><b id="oJm">-</b></div><div><span>Cost of transport</span><b id="oCot">-</b></div>
            </div>
          </form>
        </div>
      </section>

      <section class="epq-block" id="hardware">
        <header class="sec-head row"><div><p class="eyebrow">Apparatus</p><h2>Hardware</h2></div>
          <p class="sec-sub">Estimated cost ${esc(E.budget)}. Servo power always comes from its own supply, never from USB or the board.</p></header>
        <div class="hw-grid">${E.hardware.map((h) => `<article class="hw spot"><h3>${esc(h.part)}</h3><p>${esc(h.role)}</p></article>`).join("")}</div>
        <div class="plan-strip">
          <div><b>${E.hours}</b><span>planned hours, about 5 a week</span></div>
          <div><b>${E.gates.length}</b><span>decision gates</span></div>
          <div><b>${E.sources.reduce((a, g) => a + g.items.length, 0)}</b><span>sources mapped to the method</span></div>
          <div><b>${totalWords.toLocaleString("en-GB")}</b><span>word report</span></div>
        </div>
        <div class="words panel">
          <p class="eyebrow">Report word budget</p>
          <div class="word-bar">${E.words.map(([n, w], i) => `<i style="flex:${w};--k:${i}" title="${esc(n)}: ${w} words"></i>`).join("")}</div>
          <ul class="word-legend">${E.words.map(([n, w], i) => `<li><i style="--k:${i}"></i>${esc(n)} <span>${w}</span></li>`).join("")}</ul>
        </div>
      </section>

      <section class="epq-block" id="evolution">
        <header class="sec-head row"><div><p class="eyebrow">Amendments</p><h2>How the question evolved</h2></div>
          <p class="sec-sub">Good research questions are rarely the first idea. Each change came from feedback or from asking whether the result would actually mean something.</p></header>
        <ol class="qhist">${E.questionHistory.map((q, i) => `<li class="qh${q.dropped ? " dropped" : ""}${q.current ? " current" : ""}"><span class="qh-n mono">${i + 1}</span><div><h3>${esc(q.title)}</h3><p>${esc(q.note)}</p></div>${q.dropped ? '<span class="qh-tag">Dropped</span>' : q.current ? '<span class="qh-tag now">Current</span>' : ""}</li>`).join("")}</ol>
      </section>

      <section class="epq-block" id="reading">
        <header class="sec-head"><p class="eyebrow">Literature</p><h2>Reading list</h2></header>
        <div class="src-grid">${E.sources.map((g) => `<article class="src-card"><h3>${esc(g.group)}</h3><ul>${g.items.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></article>`).join("")}</div>
      </section>

      <section class="epq-block" id="results">
        <header class="sec-head"><p class="eyebrow">Results</p><h2>Results</h2></header>
        <div class="results-empty panel">
          <div class="re-icon">${icon("hexapod")}</div>
          <div>
            <h3>No trials yet</h3>
            <p class="muted">Real-robot trials of both controllers are planned for March and April 2027. This section will show energy per metre for the tripod gait and the learned controller, with spread, confidence intervals and the sim-to-real gap.</p>
            <table class="res-table"><thead><tr><th>Controller</th><th>Trials</th><th>Mean J/m</th><th>Spread</th><th>Mean CoT</th></tr></thead>
              <tbody><tr><td>Tripod gait</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>RL (PPO)</td><td>-</td><td>-</td><td>-</td><td>-</td></tr></tbody></table>
          </div>
        </div>
      </section>`;

    /* --------------------------------------------------------- gait view */
    const GAITS = {
      tripod: { duty: 0.5, off: [0, 0.5, 0, 0.5, 0, 0.5] },
      ripple: { duty: 2 / 3, off: [0, 1 / 3, 2 / 3, 0.5, 5 / 6, 1 / 6] },
      wave: { duty: 5 / 6, off: [2 / 6, 1 / 6, 0, 5 / 6, 4 / 6, 3 / 6] }
    };
    const LEGS = ["L1", "L2", "L3", "R1", "R2", "R3"];
    let gait = "tripod", phase = 0, ground = 0;
    const gTop = $("#gaitTop", root), gDiag = $("#gaitDiag", root);
    let gt = fitCanvas(gTop, 360, 360), gd = fitCanvas(gDiag, 560, 260);
    new ResizeObserver(() => { gt = fitCanvas(gTop, 360, 360); gd = fitCanvas(gDiag, 560, 260); drawGait(); }).observe(gTop);
    const legState = (i) => { const G = GAITS[gait]; const p = (((phase - G.off[i]) % 1) + 1) % 1; return { stance: p < G.duty, p, G }; };
    const STRIDE = 36;
    function drawGait() {
      const fg = css("--fg"), muted = css("--muted"), line = css("--line"), prim = css("--primary"), acc = css("--accent"), s2 = css("--surface-2");
      // top view
      gt.clearRect(0, 0, 360, 360);
      gt.fillStyle = s2; gt.fillRect(0, 0, 360, 360);
      gt.strokeStyle = line; gt.lineWidth = 1;
      for (let y = (ground % 30) - 30; y < 360; y += 30) { gt.beginPath(); gt.moveTo(0, y); gt.lineTo(360, y); gt.stroke(); }
      const cx = 180, cy = 180, hips = [[-24, -64], [-28, 0], [-24, 64], [24, -64], [28, 0], [24, 64]];
      let n = 0;
      // body first, legs on top so every leg is visible
      gt.fillStyle = acc; gt.beginPath(); gt.ellipse(cx, cy, 30, 84, 0, 0, 7); gt.fill();
      gt.fillStyle = s2; gt.beginPath(); gt.moveTo(cx, cy - 72); gt.lineTo(cx - 9, cy - 56); gt.lineTo(cx + 9, cy - 56); gt.fill();
      hips.forEach(([hx, hy], i) => {
        const { stance, p, G } = legState(i);
        if (stance) n++;
        const along = stance ? STRIDE / 2 - (p / G.duty) * STRIDE : -STRIDE / 2 + ((p - G.duty) / (1 - G.duty)) * STRIDE;
        const sx = Math.sign(hx), kx = cx + hx + sx * 40, ky = cy + hy - along * 0.45, fx = cx + hx + sx * 84, fy = cy + hy - along;
        gt.strokeStyle = stance ? fg : muted; gt.lineWidth = stance ? 5 : 4; gt.lineCap = "round"; gt.lineJoin = "round";
        gt.beginPath(); gt.moveTo(cx + hx, cy + hy); gt.lineTo(kx, ky); gt.lineTo(fx, fy); gt.stroke();
        gt.fillStyle = s2; gt.beginPath(); gt.arc(cx + hx, cy + hy, 5, 0, 7); gt.fill();
        gt.beginPath(); gt.arc(fx, fy, stance ? 8 : 6, 0, 7); gt.fillStyle = stance ? prim : s2; gt.fill();
        gt.lineWidth = 2; gt.strokeStyle = stance ? prim : muted; gt.stroke();
        gt.fillStyle = muted; gt.font = "500 11px 'Geist Mono', monospace"; gt.textAlign = "center"; gt.fillText(LEGS[i], fx + sx * 22, fy + 4);
      });
      $("#gStance", root).textContent = n;
      // diagram
      gd.clearRect(0, 0, 560, 260);
      const x0 = 46, w = 500, rowH = 34, G = GAITS[gait];
      LEGS.forEach((l, i) => {
        const y = 14 + i * rowH;
        gd.fillStyle = muted; gd.font = "500 12px 'Geist Mono', monospace"; gd.textAlign = "left"; gd.fillText(l, 6, y + 20);
        gd.fillStyle = s2; gd.fillRect(x0, y + 6, w, 20);
        for (let c = -1; c < 3; c++) {
          const a = (c + G.off[i]) / 2, b = a + G.duty / 2;
          const xa = x0 + Math.max(0, a) * w, xb = x0 + Math.min(1, b) * w;
          if (xb > xa) { gd.fillStyle = i < 3 ? prim : acc; gd.fillRect(xa, y + 6, xb - xa, 20); }
        }
      });
      const cur = x0 + ((phase % 2) / 2) * w;
      gd.strokeStyle = fg; gd.lineWidth = 2; gd.beginPath(); gd.moveTo(cur, 10); gd.lineTo(cur, 14 + 6 * rowH); gd.stroke();
      gd.fillStyle = muted; gd.textAlign = "center"; gd.fillText("cycle 1", x0 + w / 4, 250); gd.fillText("cycle 2", x0 + (3 * w) / 4, 250);
    }
    function setGait(k) {
      gait = k; const G = GAITS[k];
      root.querySelectorAll("[data-gait]").forEach((b) => b.classList.toggle("is-on", b.dataset.gait === k));
      $("#gDuty", root).textContent = G.duty.toFixed(2);
      $("#gSpeed", root).textContent = (0.5 / G.duty).toFixed(2) + "×";
      drawGait();
    }
    root.querySelectorAll("[data-gait]").forEach((b) => (b.onclick = () => setGait(b.dataset.gait)));
    setGait("tripod");
    runWhenVisible(gTop, (dt) => {
      if (calm()) return;
      const G = GAITS[gait];
      phase += dt * 0.7;
      ground += dt * 0.7 * (STRIDE / G.duty);
      drawGait();
    });

    /* ----------------------------------------------------------- leg view */
    const lc = $("#legCv", root); let lg = fitCanvas(lc, 560, 380);
    new ResizeObserver(() => { lg = fitCanvas(lc, 560, 380); drawLeg(); }).observe(lc);
    const J = { hip: $("#jHip", root), thigh: $("#jThigh", root), knee: $("#jKnee", root) };
    const STAND_Z = (() => { const a2 = rad(0 - 95); return 12 + 55 * Math.sin(a2) + 45 * Math.sin(a2 - rad(25)); })();
    function legPts(th, kn) {
      const a1 = rad(th), a2 = a1 + rad(kn), a3 = a2 - rad(25);
      const p0 = [0, 0], p1 = [30, 12], p2 = [p1[0] + 62 * Math.cos(a1), p1[1] + 62 * Math.sin(a1)];
      const p3 = [p2[0] + 55 * Math.cos(a2), p2[1] + 55 * Math.sin(a2)], p4 = [p3[0] + 45 * Math.cos(a3), p3[1] + 45 * Math.sin(a3)];
      return [p0, p1, p2, p3, p4];
    }
    function drawLeg() {
      const th = +J.thigh.value, kn = +J.knee.value, hip = +J.hip.value;
      $("#oHip", root).textContent = hip + "°"; $("#oThigh", root).textContent = th + "°"; $("#oKnee", root).textContent = kn + "°";
      const pts = legPts(th, kn), foot = pts[4];
      const S = 1.9, ox = 150, oy = 150, X = (p) => ox + p[0] * S, Y = (p) => oy - p[1] * S;
      const fg = css("--fg"), muted = css("--muted"), line = css("--line"), prim = css("--primary"), acc = css("--accent"), s2 = css("--surface-2"), s3 = css("--surface-3");
      lg.clearRect(0, 0, 560, 380);
      lg.fillStyle = s2; lg.fillRect(0, 0, 560, 380);
      // grid every 20 mm
      lg.strokeStyle = line; lg.lineWidth = 1;
      for (let mm = -60; mm <= 200; mm += 20) { lg.beginPath(); lg.moveTo(X([mm, 0]), 0); lg.lineTo(X([mm, 0]), 380); lg.stroke(); }
      for (let mm = -100; mm <= 60; mm += 20) { lg.beginPath(); lg.moveTo(0, Y([0, mm])); lg.lineTo(560, Y([0, mm])); lg.stroke(); }
      // ground at the standing foot height
      const gy = Y([0, STAND_Z]);
      lg.fillStyle = s3; lg.fillRect(0, gy, 560, 380 - gy);
      lg.fillStyle = muted; lg.font = "500 11px 'Geist Mono', monospace"; lg.textAlign = "left"; lg.fillText("ground (standing height)", 12, gy + 16);
      // body
      lg.fillStyle = acc; lg.beginPath(); lg.roundRect(X([-75, 0]), Y([0, 22]), 70 * S, 34 * S, 10); lg.fill();
      lg.fillStyle = s2; lg.font = "600 12px 'Geist Mono', monospace"; lg.textAlign = "center"; lg.fillText("BODY", X([-40, 0]), Y([0, 3]));
      // segments
      lg.lineCap = "round"; lg.lineJoin = "round";
      const seg = (a, b, w, c) => { lg.strokeStyle = c; lg.lineWidth = w; lg.beginPath(); lg.moveTo(X(a), Y(a)); lg.lineTo(X(b), Y(b)); lg.stroke(); };
      seg(pts[0], pts[1], 16, muted);
      seg(pts[1], pts[2], 22, fg);
      lg.strokeStyle = prim; lg.lineWidth = 16; lg.beginPath(); lg.moveTo(X(pts[2]), Y(pts[2])); lg.lineTo(X(pts[3]), Y(pts[3])); lg.lineTo(X(pts[4]), Y(pts[4])); lg.stroke();
      // joints (servos)
      [[pts[0], "HIP"], [pts[1], "THIGH"], [pts[2], "KNEE"]].forEach(([p, l]) => {
        lg.fillStyle = s2; lg.strokeStyle = fg; lg.lineWidth = 3; lg.beginPath(); lg.arc(X(p), Y(p), 11, 0, 7); lg.fill(); lg.stroke();
        lg.fillStyle = muted; lg.font = "500 10px 'Geist Mono', monospace"; lg.textAlign = "center"; lg.fillText(l, X(p), Y(p) - 18);
      });
      lg.fillStyle = prim; lg.beginPath(); lg.arc(X(foot), Y(foot), 6, 0, 7); lg.fill();
      // hip yaw inset (top view)
      const ix = 470, iy = 80;
      lg.fillStyle = css("--surface"); lg.beginPath(); lg.roundRect(ix - 70, iy - 64, 140, 128, 12); lg.fill();
      lg.fillStyle = muted; lg.font = "500 10px 'Geist Mono', monospace"; lg.fillText("TOP VIEW · HIP", ix, iy - 46);
      lg.strokeStyle = line; lg.lineWidth = 1; lg.beginPath(); lg.moveTo(ix - 50, iy + 10); lg.lineTo(ix + 50, iy + 10); lg.stroke();
      [-40, 40].forEach((a) => { lg.strokeStyle = line; lg.setLineDash([3, 3]); lg.beginPath(); lg.moveTo(ix - 40, iy + 10); lg.lineTo(ix - 40 + 70 * Math.cos(rad(a)), iy + 10 - 70 * Math.sin(rad(a))); lg.stroke(); lg.setLineDash([]); });
      lg.strokeStyle = prim; lg.lineWidth = 6; lg.beginPath(); lg.moveTo(ix - 40, iy + 10); lg.lineTo(ix - 40 + 70 * Math.cos(rad(hip)), iy + 10 - 70 * Math.sin(rad(hip))); lg.stroke();
      lg.fillStyle = acc; lg.fillRect(ix - 62, iy - 8, 22, 36);
      const reach = Math.hypot(foot[0], 0), height = foot[1] - STAND_Z;
      $("#rReach", root).textContent = `${reach.toFixed(0)} mm`;
      $("#rHeight", root).textContent = Math.abs(height) < 1 ? "on the ground" : height > 0 ? `${height.toFixed(0)} mm lifted` : `${(-height).toFixed(0)} mm below ground`;
      $("#rHeight", root).classList.toggle("warn", height < -1);
    }
    Object.values(J).forEach((s) => s.addEventListener("input", () => { stopAnim(); drawLeg(); }));
    const POSES = { stand: [0, 0, -95], lift: [0, 30, -110], reach: [25, 15, -70] };
    let animStop = null;
    const stopAnim = () => { if (animStop) { animStop(); animStop = null; } };
    function setPose([h, t, k]) { J.hip.value = h; J.thigh.value = t; J.knee.value = k; drawLeg(); }
    root.querySelectorAll("[data-pose]").forEach((b) => (b.onclick = () => {
      stopAnim();
      if (b.dataset.pose !== "anim") return setPose(POSES[b.dataset.pose]);
      let ph = 0, on = true, raf;
      const f = () => { if (!on) return; ph += 0.012; const s = ph % 1, stance = s < 0.5;
        const hip = stance ? 25 - (s / 0.5) * 50 : -25 + ((s - 0.5) / 0.5) * 50;
        const lift = stance ? 0 : Math.sin(((s - 0.5) / 0.5) * Math.PI);
        J.hip.value = Math.round(hip); J.thigh.value = Math.round(lift * 30); J.knee.value = Math.round(-95 - lift * 15); drawLeg(); raf = requestAnimationFrame(f); };
      raf = requestAnimationFrame(f);
      animStop = () => { on = false; cancelAnimationFrame(raf); };
    }));
    drawLeg();

    /* ----------------------------------------------------- energy example */
    const calc = () => {
      const v = (id) => Math.max(0, parseFloat($("#" + id, root).value) || 0);
      const V = v("cV"), I = v("cI"), t = v("cT"), d = v("cD") || 0.1, m = v("cM") || 0.05;
      const En = V * I * t;
      $("#oE", root).textContent = `${En.toFixed(0)} J`;
      $("#oJm", root).textContent = `${(En / d).toFixed(1)} J/m`;
      $("#oCot", root).textContent = (En / (m * 9.81 * d)).toFixed(1);
    };
    $("#eCalc", root).addEventListener("input", calc);
    $("#eCalc", root).addEventListener("submit", (e) => e.preventDefault());
    calc();

    return { refreshTheme() { drawGait(); drawLeg(); } };
  }
  return { mount };
})();
