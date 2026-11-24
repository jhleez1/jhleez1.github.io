/* Playable demos shown inside project popups.
   Each demo: (container, ctx) => cleanup function. */
window.PF_Demos = (() => {
  "use strict";
  const $ = (s, el) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function loop(fn) {
    let id, last = performance.now(), on = true;
    const f = (t) => { if (!on) return; const dt = Math.min(0.05, (t - last) / 1000); last = t; fn(dt); id = requestAnimationFrame(f); };
    id = requestAnimationFrame(f);
    return () => { on = false; cancelAnimationFrame(id); };
  }
  function fit(cv, w, h) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const cw = cv.clientWidth || w;
    cv.width = Math.round(cw * dpr); cv.height = Math.round(cw * (h / w) * dpr);
    const g = cv.getContext("2d"); g.setTransform(cv.width / w, 0, 0, cv.height / h, 0, 0); return g;
  }

  /* ---------------------------------------------------------------- Sudoku
     Same idea as Jihan's Cyclic.st: walk the cells, try numbers with checkNum,
     push on success, pop on a dead end. Runs a set number of steps per PLC scan. */
  const BOARD254 = [[0,0,0,2,6,0,7,0,1],[6,8,0,0,7,0,0,9,0],[1,9,0,0,0,4,5,0,0],[8,2,0,1,0,0,0,4,0],[0,0,4,6,0,2,9,0,0],[0,5,0,0,0,3,0,2,8],[0,0,9,3,0,0,0,7,4],[0,4,0,0,5,0,0,3,6],[7,0,3,0,1,8,0,0,0]];
  const HARD = [[8,0,0,0,0,0,0,0,0],[0,0,3,6,0,0,0,0,0],[0,7,0,0,9,0,2,0,0],[0,5,0,0,0,7,0,0,0],[0,0,0,0,4,5,7,0,0],[0,0,0,1,0,0,0,3,0],[0,0,1,0,0,0,0,6,8],[0,0,8,5,0,0,0,1,0],[0,9,0,0,0,0,4,0,0]];
  function sudoku(el) {
    el.innerHTML = `
      <div class="demo-head"><p class="eyebrow">Run it on a virtual PLC</p>
        <div class="seg" role="tablist" aria-label="Puzzle"><button class="seg-btn is-on" data-p="254">board254.txt</button><button class="seg-btn" data-p="hard">Hardest puzzle</button></div></div>
      <div class="sdk-wrap">
        <div class="sdk" role="grid" aria-label="Sudoku board"></div>
        <div class="sdk-side">
          <div class="sdk-stats">
            <div><span>Scans</span><b data-k="scans">0</b></div><div><span>Counter</span><b data-k="counter">0</b></div>
            <div><span>Stack_Top</span><b data-k="top">0</b></div><div><span>Pops</span><b data-k="pops">0</b></div>
          </div>
          <p class="sdk-status mono" data-k="status">BoardSolved = FALSE</p>
          <div class="slider"><label for="sdkSpeed">Steps per scan</label><input type="range" id="sdkSpeed" min="0" max="4" value="0"><output data-k="spd">1</output></div>
          <div class="demo-btns"><button class="btn primary sm" data-a="run">Run</button><button class="btn tonal sm" data-a="step">1 scan</button><button class="btn ghost sm" data-a="reset">Reset</button></div>
        </div>
      </div>
      <details class="src"><summary>From the real code: checkNum.st</summary><pre class="st-code small">FUNCTION checkNum
  FOR checkCol := 1 TO 9 DO
    IF board[row, checkCol] = num THEN
      checkNum := FALSE;
      RETURN;
    END_IF;
  END_FOR;
  (* ...same for the column and the 3x3 box... *)
  checkNum := TRUE;
END_FUNCTION</pre></details>`;
    const grid = $(".sdk", el);
    grid.innerHTML = Array.from({ length: 81 }, (_, i) => `<span class="cell" role="gridcell" data-i="${i}"></span>`).join("");
    const cells = [...grid.children];
    const SPEEDS = [1, 10, 50, 250, 2000];
    let src = BOARD254, B, given, empties, vals, k, st, running = false, stop = null, prev = -1;
    const ok = (r, c, n) => {
      for (let i = 0; i < 9; i++) if (B[r][i] === n || B[i][c] === n) return false;
      const br = r - (r % 3), bc = c - (c % 3);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (B[br + i][bc + j] === n) return false;
      return true;
    };
    function reset() {
      B = src.map((r) => r.slice()); given = B.map((r) => r.map((v) => v > 0));
      empties = []; B.forEach((r, ri) => r.forEach((v, ci) => { if (!v) empties.push([ri, ci]); }));
      vals = new Array(empties.length).fill(0); k = 0; st = { scans: 0, counter: 0, pops: 0, solved: false }; prev = -1;
      cells.forEach((c, i) => { const r = Math.floor(i / 9), col = i % 9; c.textContent = B[r][col] || ""; c.className = "cell" + (given[r][col] ? " given" : ""); });
      setRun(false); paint();
    }
    function stepOnce() {
      if (k >= empties.length) { st.solved = true; return false; }
      if (k < 0) return false;
      const [r, c] = empties[k]; let n = vals[k] + 1; B[r][c] = 0;
      while (n <= 9 && !ok(r, c, n)) n++;
      const cell = cells[r * 9 + c];
      if (n <= 9) { B[r][c] = n; vals[k] = n; k++; cell.textContent = n; cell.className = "cell try"; }
      else { vals[k] = 0; cell.textContent = ""; cell.className = "cell back"; k--; st.pops++; }
      if (prev >= 0 && prev !== r * 9 + c) cells[prev].classList.remove("try", "back");
      prev = r * 9 + c; st.counter++;
      return true;
    }
    function scan() {
      st.scans++;
      const n = SPEEDS[+$("#sdkSpeed", el).value];
      for (let i = 0; i < n; i++) if (!stepOnce()) break;
      if (k >= empties.length) { st.solved = true; setRun(false); cells.forEach((c) => c.classList.remove("try", "back")); grid.classList.add("solved"); setTimeout(() => grid.classList.remove("solved"), 1200); }
      paint();
    }
    function paint() {
      const q = (x) => $(`[data-k="${x}"]`, el);
      q("scans").textContent = st.scans.toLocaleString("en-US"); q("counter").textContent = st.counter.toLocaleString("en-US");
      q("top").textContent = Math.max(k, 0); q("pops").textContent = st.pops.toLocaleString("en-US");
      q("status").textContent = st.solved ? "BoardSolved = TRUE" : running ? "SolveState = 1 (solving)" : "BoardSolved = FALSE";
      q("status").classList.toggle("ok", st.solved);
    }
    function setRun(v) {
      running = v; $('[data-a="run"]', el).textContent = v ? "Pause" : st && st.solved ? "Solved" : "Run";
      if (stop) { stop(); stop = null; }
      if (v) { let acc = 0; stop = loop((dt) => { acc += dt; if (acc >= 0.016) { acc = 0; scan(); } }); }
    }
    $("#sdkSpeed", el).oninput = (e) => ($('[data-k="spd"]', el).textContent = SPEEDS[e.target.value]);
    el.addEventListener("click", (e) => {
      const a = e.target.closest("[data-a]")?.dataset.a, p = e.target.closest("[data-p]");
      if (a === "run" && !st.solved) setRun(!running);
      if (a === "step" && !st.solved) { setRun(false); scan(); }
      if (a === "reset") reset();
      if (p) { el.querySelectorAll("[data-p]").forEach((b) => b.classList.toggle("is-on", b === p)); src = p.dataset.p === "hard" ? HARD : BOARD254; reset(); }
    });
    reset();
    return () => setRun(false);
  }

  /* ---------------------------------------------------------------- Orbits */
  const PLANETS = [
    { n: "Mercury", au: 0.39, p: 88, r: 3, c: "oklch(0.7 0.02 60)", moons: 0, f: "Smallest planet; a year lasts 88 days." },
    { n: "Venus", au: 0.72, p: 225, r: 5, c: "oklch(0.82 0.09 80)", moons: 0, f: "Hottest planet, around 465 °C at the surface." },
    { n: "Earth", au: 1, p: 365, r: 5.5, c: "oklch(0.65 0.13 240)", moons: 1, f: "The only planet known to have life." },
    { n: "Mars", au: 1.52, p: 687, r: 4, c: "oklch(0.62 0.16 35)", moons: 2, f: "Home to Olympus Mons, the tallest volcano in the solar system." },
    { n: "Jupiter", au: 5.2, p: 4333, r: 11, c: "oklch(0.75 0.08 60)", moons: 95, f: "Its Great Red Spot is a storm bigger than Earth." },
    { n: "Saturn", au: 9.58, p: 10759, r: 9, c: "oklch(0.82 0.08 85)", moons: 146, f: "Its rings are mostly ice, some pieces as big as houses.", ring: true },
    { n: "Uranus", au: 19.2, p: 30687, r: 7, c: "oklch(0.8 0.07 200)", moons: 28, f: "Spins on its side, tilted about 98°." },
    { n: "Neptune", au: 30.1, p: 60190, r: 7, c: "oklch(0.6 0.14 260)", moons: 16, f: "Has the fastest winds measured, over 2,000 km/h." }
  ];
  function orbits(el) {
    el.innerHTML = `
      <div class="demo-head"><p class="eyebrow">Click a planet</p><span class="mono muted" data-k="day">Day 0</span></div>
      <canvas class="orb-cv" width="720" height="420" aria-label="Solar system with orbiting planets"></canvas>
      <div class="orb-info" data-k="info"><b>The Sun</b><span>Holds 99.8% of the solar system's mass.</span></div>
      <div class="slider"><label for="orbSpeed">Days per second</label><input type="range" id="orbSpeed" min="5" max="1000" value="120"><output data-k="spd">120</output></div>`;
    const cv = $("canvas", el); let g = fit(cv, 720, 420);
    const ro = new ResizeObserver(() => (g = fit(cv, 720, 420))); ro.observe(cv);
    const stars = Array.from({ length: 90 }, () => [Math.random() * 720, Math.random() * 420, Math.random() * 1.3 + 0.3]);
    let day = 0, sel = null, pos = [];
    const R = (au) => 26 + Math.sqrt(au) * 33;
    cv.addEventListener("click", (e) => {
      const b = cv.getBoundingClientRect(); const x = (e.clientX - b.left) * 720 / b.width, y = (e.clientY - b.top) * 420 / b.height;
      const hit = pos.find((p) => Math.hypot(p.x - x, p.y - y) < p.r + 10);
      sel = hit ? hit.pl : null;
      $('[data-k="info"]', el).innerHTML = sel ? `<b>${sel.n}</b><span>${sel.au} AU from the Sun · year: ${sel.p.toLocaleString("en-US")} days · ${sel.moons} moon${sel.moons === 1 ? "" : "s"}</span><span>${sel.f}</span>` : `<b>The Sun</b><span>Holds 99.8% of the solar system's mass.</span>`;
    });
    $("#orbSpeed", el).oninput = (e) => ($('[data-k="spd"]', el).textContent = e.target.value);
    const cx = 360, cy = 210, tilt = 0.55;
    return (() => { const s = loop((dt) => {
      day += dt * +$("#orbSpeed", el).value;
      g.fillStyle = "oklch(0.15 0.02 270)"; g.fillRect(0, 0, 720, 420);
      stars.forEach(([x, y, r]) => { g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(x, y, r, r); });
      PLANETS.forEach((pl) => { g.strokeStyle = sel === pl ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.12)"; g.beginPath(); g.ellipse(cx, cy, R(pl.au), R(pl.au) * tilt, 0, 0, 7); g.stroke(); });
      const glow = g.createRadialGradient(cx, cy, 2, cx, cy, 34); glow.addColorStop(0, "oklch(0.95 0.1 90)"); glow.addColorStop(0.5, "oklch(0.82 0.17 70 / .6)"); glow.addColorStop(1, "transparent");
      g.fillStyle = glow; g.beginPath(); g.arc(cx, cy, 34, 0, 7); g.fill();
      g.fillStyle = "oklch(0.92 0.14 85)"; g.beginPath(); g.arc(cx, cy, 13, 0, 7); g.fill();
      pos = PLANETS.map((pl, i) => { const a = (day / pl.p) * Math.PI * 2 + i; return { pl, x: cx + Math.cos(a) * R(pl.au), y: cy + Math.sin(a) * R(pl.au) * tilt, r: pl.r }; });
      pos.sort((a, b) => a.y - b.y).forEach(({ pl, x, y, r }) => {
        if (pl.ring) { g.strokeStyle = "oklch(0.85 0.06 85 / .8)"; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, r * 2, r * 0.7, -0.3, 0, 7); g.stroke(); g.lineWidth = 1; }
        g.fillStyle = pl.c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
        if (sel === pl) { g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, r + 5, 0, 7); g.stroke(); g.lineWidth = 1;
          g.fillStyle = "#fff"; g.font = "600 12px 'Geist', system-ui"; g.textAlign = "center"; g.fillText(pl.n, x, y - r - 9); }
      });
      $('[data-k="day"]', el).textContent = `Day ${Math.floor(day).toLocaleString("en-US")}`;
    }); return () => { s(); ro.disconnect(); }; })();
  }

  /* --------------------------------------------------------------- Browser */
  function browser(el, ctx) {
    const D = ctx.data;
    const PAGES = {
      "neon://home": { t: "Home", h: () => `<div class="nb-home"><h4>NEON</h4><p>Jihan's Electron browser</p><div class="nb-bm">${["neon://about", "neon://projects", "neon://bookmarks", "neon://history"].map((u) => `<button data-go="${u}">${u.replace("neon://", "")}</button>`).join("")}</div></div>` },
      "neon://about": { t: "About", h: () => `<h4>About this browser</h4><p>Built with Electron, HTML, CSS and JavaScript. Tabs, back, forward, refresh, a homepage, and bookmarks and history saved as JSON.</p>` },
      "neon://projects": { t: "Projects", h: () => `<h4>Projects</h4><ul>${D.projects.map((p) => `<li>${esc(p.title)} <span>${p.year}</span></li>`).join("")}</ul>` },
      "neon://bookmarks": { t: "Bookmarks", h: () => `<h4>bookmarks.json</h4><pre>${esc(JSON.stringify(["neon://home", "neon://about", "neon://projects"], null, 2))}</pre>` },
      "neon://history": { t: "History", h: (tab) => `<h4>history.json</h4><pre>${esc(JSON.stringify(tab.hist.slice(0, tab.i + 1), null, 2))}</pre>` }
    };
    el.innerHTML = `
      <div class="demo-head"><p class="eyebrow">Try the tabs and the address bar</p></div>
      <div class="nb">
        <div class="nb-tabs"></div>
        <div class="nb-bar">
          <button data-nav="back" aria-label="Back">‹</button><button data-nav="fwd" aria-label="Forward">›</button><button data-nav="ref" aria-label="Refresh">⟳</button>
          <form class="nb-url"><input aria-label="Address" spellcheck="false"></form>
        </div>
        <div class="nb-page"></div>
      </div>`;
    let tabs = [], cur = 0, n = 0;
    const tabEl = $(".nb-tabs", el), page = $(".nb-page", el), url = $(".nb-url input", el);
    const newTab = (u = "neon://home") => { tabs.push({ id: n++, hist: [u], i: 0 }); cur = tabs.length - 1; render(); };
    function nav(u) {
      u = u.trim(); if (!u) return;
      if (!/^[a-z]+:\/\//i.test(u)) u = PAGES["neon://" + u.toLowerCase()] ? "neon://" + u.toLowerCase() : "https://" + u;
      const t = tabs[cur]; t.hist = t.hist.slice(0, t.i + 1); t.hist.push(u); t.i++; render();
    }
    function render() {
      const t = tabs[cur], u = t.hist[t.i], p = PAGES[u];
      tabEl.innerHTML = tabs.map((x, i) => { const pu = x.hist[x.i]; return `<div class="nb-tab${i === cur ? " on" : ""}" data-t="${i}"><span>${esc(PAGES[pu]?.t || pu.replace(/^https?:\/\//, ""))}</span><button data-close="${i}" aria-label="Close tab">×</button></div>`; }).join("") + `<button class="nb-new" data-new aria-label="New tab">+</button>`;
      url.value = u;
      page.innerHTML = p ? p.h(t) : `<h4>External page</h4><p>This demo only loads neon:// pages. The real browser would open:</p><p><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a></p>`;
      page.classList.remove("flash"); void page.offsetWidth; page.classList.add("flash");
    }
    el.addEventListener("click", (e) => {
      const c = e.target.closest("[data-close]"), t = e.target.closest("[data-t]"), nv = e.target.closest("[data-nav]"), go = e.target.closest("[data-go]");
      if (c) { e.stopPropagation(); tabs.splice(+c.dataset.close, 1); if (!tabs.length) newTab(); cur = Math.min(cur, tabs.length - 1); render(); return; }
      if (e.target.closest("[data-new]")) newTab();
      else if (t) { cur = +t.dataset.t; render(); }
      else if (go) nav(go.dataset.go);
      else if (nv) { const tb = tabs[cur]; if (nv.dataset.nav === "back" && tb.i > 0) tb.i--; if (nv.dataset.nav === "fwd" && tb.i < tb.hist.length - 1) tb.i++; render(); }
    });
    $(".nb-url", el).onsubmit = (e) => { e.preventDefault(); nav(url.value); };
    newTab(); newTab("neon://projects"); cur = 0; render();
    return () => {};
  }

  /* --------------------------------------------------------------- Traffic */
  function traffic(el) {
    const STEPS = [
      { id: "M_GREEN", t: 6, main: "g", side: "r", ped: "r", stl: "L T1 · SD T1, S5T#6S" },
      { id: "M_AMBER", t: 2, main: "a", side: "r", ped: "r", stl: "A T1 · = Q0.1 (main amber)" },
      { id: "ALL_RED", t: 1, main: "r", side: "r", ped: "r", stl: "A T2 · S M10.0 (all red)" },
      { id: "PED_WALK", t: 4, main: "r", side: "r", ped: "g", stl: "A M20.0 · = Q1.0 (walk)", ped_only: true },
      { id: "S_GREEN", t: 4, main: "r", side: "g", ped: "r", stl: "L T3 · SD T3, S5T#4S" },
      { id: "S_AMBER", t: 2, main: "r", side: "a", ped: "r", stl: "A T3 · = Q0.4 (side amber)" },
      { id: "ALL_RED2", t: 1, main: "r", side: "r", ped: "r", stl: "A T4 · S M10.1 (all red)" }
    ];
    el.innerHTML = `
      <div class="demo-head"><p class="eyebrow">STEP 7 · OB1 sequence</p><span class="mono muted" data-k="step"></span></div>
      <div class="tl-wrap">
        <canvas class="tl-cv" width="420" height="300" aria-label="Road junction with traffic lights"></canvas>
        <div class="tl-side">
          <ol class="tl-steps">${STEPS.map((s) => `<li data-s="${s.id}"><span class="mono">${s.id}</span><small class="mono">${s.stl}</small></li>`).join("")}</ol>
          <div class="demo-btns"><button class="btn primary sm" data-a="ped">Pedestrian button</button><label class="toggle"><input type="checkbox" data-a="night"><span>Night mode</span></label></div>
          <p class="muted small" data-k="msg">Press the pedestrian button to request a crossing.</p>
        </div>
      </div>`;
    const cv = $("canvas", el); let g = fit(cv, 420, 300);
    const ro = new ResizeObserver(() => (g = fit(cv, 420, 300))); ro.observe(cv);
    let si = 0, t = 0, pedReq = false, night = false, blink = 0, cars = [];
    el.addEventListener("click", (e) => { if (e.target.closest('[data-a="ped"]')) { pedReq = true; $('[data-k="msg"]', el).textContent = "Request latched (M20.0). Walk comes after the next all-red."; } });
    $('[data-a="night"]', el).onchange = (e) => { night = e.target.checked; };
    const light = (x, y, state, vertical) => {
      g.fillStyle = "oklch(0.2 0.01 260)"; g.beginPath(); g.roundRect(x - 11, y - 31, 22, 62, 6); g.fill();
      [["r", "oklch(0.64 0.21 25)"], ["a", "oklch(0.82 0.16 80)"], ["g", "oklch(0.72 0.18 150)"]].forEach(([k, c], i) => {
        const on = night ? k === "a" && Math.floor(blink * 2) % 2 === 0 : state === k;
        g.fillStyle = on ? c : "oklch(0.3 0.01 260)"; g.beginPath(); g.arc(x, y - 18 + i * 18, 6.5, 0, 7); g.fill();
      });
    };
    const stop = loop((dt) => {
      blink += dt; const s = STEPS[si];
      if (!night) { t += dt; if (t >= s.t) { t = 0; si = (si + 1) % STEPS.length; if (STEPS[si].ped_only && !pedReq) si = (si + 1) % STEPS.length; if (STEPS[si].ped_only) { pedReq = false; $('[data-k="msg"]', el).textContent = "Walk! Request cleared."; } } }
      const cs = night ? { main: "a", side: "a", ped: "r" } : STEPS[si];
      // cars
      if (Math.random() < dt * 0.9) cars.push({ dir: Math.random() < 0.6 ? "h" : "v", p: -20 });
      cars.forEach((c) => {
        const go = c.dir === "h" ? cs.main : cs.side, stopAt = 150;
        const canGo = go === "g" || (go === "a" && c.p > stopAt - 10) || c.p > stopAt;
        const ahead = cars.filter((o) => o !== c && o.dir === c.dir && o.p > c.p).sort((a, b) => a.p - b.p)[0];
        let v = canGo || c.p < stopAt - 30 ? 120 : 0;
        if (!canGo && c.p >= stopAt - 30 && c.p < stopAt) v = 0;
        if (ahead && ahead.p - c.p < 34) v = 0;
        c.p += v * dt;
      });
      cars = cars.filter((c) => c.p < 460);
      // draw
      g.fillStyle = css("--surface-2") || "#222"; g.fillRect(0, 0, 420, 300);
      g.fillStyle = "oklch(0.32 0.01 260)"; g.fillRect(0, 120, 420, 60); g.fillRect(180, 0, 60, 300);
      g.strokeStyle = "rgba(255,255,255,.5)"; g.setLineDash([10, 10]); g.beginPath(); g.moveTo(0, 150); g.lineTo(180, 150); g.moveTo(240, 150); g.lineTo(420, 150); g.moveTo(210, 0); g.lineTo(210, 120); g.moveTo(210, 180); g.lineTo(210, 300); g.stroke(); g.setLineDash([]);
      g.fillStyle = "rgba(255,255,255,.75)"; for (let i = 0; i < 6; i++) g.fillRect(248 + 0, 124 + i * 9.5, 22, 5);
      cars.forEach((c) => { g.fillStyle = c.dir === "h" ? "oklch(0.7 0.13 240)" : "oklch(0.75 0.14 60)";
        if (c.dir === "h") { g.beginPath(); g.roundRect(c.p - 26, 155, 26, 16, 4); g.fill(); } else { g.beginPath(); g.roundRect(184, c.p - 26, 16, 26, 4); g.fill(); } });
      light(160, 80, cs.main); light(270, 230, cs.side);
      g.fillStyle = cs.ped === "g" && !night ? "oklch(0.72 0.18 150)" : "oklch(0.64 0.21 25)"; g.beginPath(); g.arc(300, 105, 8, 0, 7); g.fill();
      g.fillStyle = css("--muted") || "#999"; g.font = "500 11px 'Geist Mono', monospace"; g.fillText("MAIN", 128, 40); g.fillText("SIDE", 284, 196); g.fillText("WALK", 312, 109);
      el.querySelectorAll(".tl-steps li").forEach((li) => li.classList.toggle("on", !night && li.dataset.s === STEPS[si].id));
      $('[data-k="step"]', el).textContent = night ? "NIGHT: flashing amber" : `${STEPS[si].id} · ${(STEPS[si].t - t).toFixed(1)} s`;
    });
    return () => { stop(); ro.disconnect(); };
  }

  /* ----------------------------------------------------------------- Flags
     Mirrors flagsinp.py: a dictionary of three-stripe flags and one draw function. */
  const FLAGS = { Belgium: ["Black", "Yellow", "Red"], "Canary Islands": ["White", "Blue", "Yellow"], France: ["Blue", "White", "Red"], Ireland: ["Green", "White", "Orange"], Italy: ["Green", "White", "Red"], "Ivory Coast": ["Orange", "White", "Green"], Nigeria: ["Green", "White", "Green"], Romania: ["Blue", "Yellow", "Red"] };
  function flags(el) {
    el.innerHTML = `
      <div class="demo-head"><p class="eyebrow">flagsinp.py</p></div>
      <form class="flag-form"><label for="flagIn" class="mono">Enter the name of a country:</label><input id="flagIn" list="flagList" placeholder="France" autocomplete="off"><datalist id="flagList">${Object.keys(FLAGS).map((k) => `<option value="${k}">`).join("")}</datalist><button class="btn primary sm">Draw</button></form>
      <div class="flag-stage"><canvas width="360" height="200" aria-label="Turtle drawing a flag"></canvas><p class="mono small" data-k="out"></p></div>
      <div class="chips">${Object.keys(FLAGS).map((k) => `<button class="chip" data-f="${k}">${k}</button>`).join("")}</div>`;
    const cv = $("canvas", el); let g = fit(cv, 360, 200);
    let stop = null;
    const turtle = (x, y, a) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = "oklch(0.6 0.15 150)"; g.beginPath(); g.moveTo(9, 0); g.lineTo(-6, -6); g.lineTo(-3, 0); g.lineTo(-6, 6); g.closePath(); g.fill(); g.restore(); };
    function draw(name) {
      const key = Object.keys(FLAGS).find((k) => k.toLowerCase() === name.trim().toLowerCase());
      const out = $('[data-k="out"]', el);
      if (stop) stop();
      g = fit(cv, 360, 200); g.clearRect(0, 0, 360, 200);
      if (!key) { out.textContent = "Sorry, flag data not available for that country."; return; }
      out.textContent = `flagDraw(-90, 50, ${JSON.stringify(FLAGS[key])})`;
      const cols = FLAGS[key], W = 80, Hh = 160, X = 60, Y = 20; let t = 0;
      stop = loop((dt) => {
        t += dt * 1.6; g.clearRect(0, 0, 360, 200);
        cols.forEach((c, i) => {
          const p = Math.max(0, Math.min(1, t - i));
          if (p <= 0) return;
          g.fillStyle = c.toLowerCase(); g.fillRect(X + i * W, Y, W, Hh * p);
          g.strokeStyle = "black"; g.lineWidth = 1.5; g.strokeRect(X + i * W, Y, W, Hh * p);
        });
        const i = Math.min(2, Math.floor(t)), p = Math.min(1, t - i);
        if (t < 3) turtle(X + i * W + (p < 0.5 ? W * p * 2 : W), Y + (p < 0.5 ? 0 : Hh * (p - 0.5) * 2), p < 0.5 ? 0 : Math.PI / 2); else { stop(); stop = null; g.fillStyle = css("--muted"); g.font = "500 11px 'Geist Mono', monospace"; g.fillText(key, X, Y + Hh + 14); }
      });
    }
    $(".flag-form", el).onsubmit = (e) => { e.preventDefault(); draw($("#flagIn", el).value || "France"); };
    el.addEventListener("click", (e) => { const f = e.target.closest("[data-f]"); if (f) { $("#flagIn", el).value = f.dataset.f; draw(f.dataset.f); } });
    draw("France");
    return () => { if (stop) stop(); };
  }

  return { sudoku, orbits, browser, traffic, flags };
})();
