/* Portfolio app: builds the shared frame (rail, status island, palette, terminal,
   theme studio) on every page, then renders whatever sections the page contains.
   Content comes from window.PORTFOLIO (data.js). No build step, no libraries. */
(() => {
  "use strict";
  const D = window.PORTFOLIO;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const PAGE = document.body.dataset.page || "index";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
  };
  const calm = () => document.body.classList.contains("calm") || matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ icons */
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    factory: '<path d="M3 21V10l5 3V10l5 3V10l5 3V4h3v17z"/><path d="M7 17h2M12 17h2M17 17h1"/>',
    hexapod: '<ellipse cx="12" cy="12" rx="3.5" ry="5.5"/><path d="M8.5 8 4.5 5M8.5 12h-5M8.5 16l-4 3M15.5 8l4-3M15.5 12h5M15.5 16l4 3"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    route: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H17a3.5 3.5 0 0 0 0-7H7a3.5 3.5 0 0 1 0-7h8.5"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    spark: '<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"/><path d="M19 3v4M17 5h4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A4.7 4.7 0 0 0 22 9.7C22 5.9 17.5 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
    command: '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.4 6.4-1.5 6.4-7A5.4 5.4 0 0 0 20 4.8 5.1 5.1 0 0 0 19.9 1S18.7.7 16 2.5a13.4 13.4 0 0 0-7 0C6.3.7 5.1 1 5.1 1A5.1 5.1 0 0 0 5 4.8a5.4 5.4 0 0 0-1.5 3.7c0 5.4 3.3 6.6 6.4 7A3.4 3.4 0 0 0 9 18.1V22"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    out: '<path d="M7 17 17 7M8 7h9v9"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
    hammer: '<path d="m15 12-8.5 8.5a2.1 2.1 0 0 1-3-3L12 9"/><path d="M17.6 15 22 10.6l-2.4-2.4c-.6-.6-1-.9-1-1.7V5.4L15 2h-3.4l3.4 3.4v1.2c0 .7.3 1.3.8 1.8L17 9.6"/>',
    commit: '<circle cx="12" cy="12" r="3.5"/><path d="M2 12h6.5M15.5 12H22"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    pr: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M6 8.5v7M18 15.5V9a3 3 0 0 0-3-3h-4m2-2-2 2 2 2"/>',
    issue: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="1.5"/>',
    branch: '<circle cx="6" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="7" r="2.5"/><path d="M6 7.5v9M18 9.5c0 4-6 3.5-11 7.5"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    fork: '<circle cx="6" cy="5" r="2.5"/><circle cx="18" cy="5" r="2.5"/><circle cx="12" cy="19" r="2.5"/><path d="M6 7.5v1a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-1M12 11.5v5"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    play: '<path d="M7 4v16l13-8z"/>',
    square: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    school: '<path d="M2 9 12 4l10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
    gamepad: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M15 12h.01M18 13h.01"/>'
  };
  const icon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || P.spark}</svg>`;
  const ico = (n) => `<span class="ico">${icon(n)}</span>`;

  /* ---------------------------------------------------------------- pages */
  const PAGES = [
    { id: "index", label: "Home", icon: "home", mob: true, blurb: "Who I am and what I do" },
    { id: "control", label: "Control room", icon: "factory", mob: true, blurb: "Run a PLC-controlled sorting line" },
    { id: "projects", label: "Projects", icon: "grid", mob: true, blurb: "Things I've built, with playable demos" },
    { id: "epq", label: "EPQ", icon: "hexapod", mob: true, blurb: "Can a robot learn to walk more efficiently?" },
    { id: "journey", label: "Journey", icon: "route", mob: false, blurb: "School, work experience and milestones" },
    { id: "github", label: "GitHub", icon: "chart", mob: false, blurb: "Repositories and contributions" },
    { id: "contact", label: "Contact", icon: "mail", mob: true, blurb: "Get in touch" }
  ];
  const href = (id, hash = "") => (id === "index" ? "index.html" : `${id}.html`) + hash;
  const goPage = (id, hash = "") => { if (id === PAGE && !hash) { scrollTo({ top: 0, behavior: calm() ? "auto" : "smooth" }); return; } location.href = href(id, hash); };

  /* --------------------------------------------------------- shared frame */
  document.body.insertAdjacentHTML("afterbegin", `
    <a class="skip" href="#main">Skip to content</a>
    <div class="progress" id="progress" aria-hidden="true"></div>
    <nav class="rail" aria-label="Pages">
      <a class="rail-logo" href="index.html" aria-label="Home">${esc((D.initials || D.name[0]).slice(0, 2))}</a>
      <div class="rail-links">${PAGES.map((p) => `<a class="rail-link${p.mob ? "" : " desk-only"}${p.id === PAGE ? " is-active" : ""}" href="${href(p.id)}" data-tip="${p.label}" aria-label="${p.label}"${p.id === PAGE ? ' aria-current="page"' : ""}>${icon(p.icon)}</a>`).join("")}</div>
      <div class="rail-tools">
        <button class="rail-btn" id="btnPalette" data-tip="Command palette (Ctrl K)" aria-label="Open command palette">${icon("command")}</button>
        <button class="rail-btn" id="btnTerminal" data-tip="Terminal ( \` )" aria-label="Open terminal">${icon("terminal")}</button>
        <button class="rail-btn" id="btnTheme" data-tip="Theme studio" aria-label="Open theme studio">${icon("palette")}</button>
      </div>
    </nav>
    <div class="island" id="island">
      <button class="island-pill" id="islandPill" aria-expanded="false" aria-controls="islandPanel">
        <span class="island-time"><b id="islandClock">--:--</b><small id="islandDate"></small></span>
        <span class="island-sep" aria-hidden="true"></span>
        <span class="island-status"><i class="dot" id="islandDot"></i><span id="islandTicker"></span></span>
      </button>
      <div class="island-panel" id="islandPanel" hidden></div>
    </div>`);
  document.body.insertAdjacentHTML("beforeend", `
    <dialog class="modal" id="projModal" aria-labelledby="pmTitle"><div class="modal-inner" id="projModalBody"></div></dialog>
    <dialog class="palette" id="palette" aria-label="Command palette">
      <div class="palette-inner">
        <label class="palette-search">${ico("search")}<input id="palInput" placeholder="Type a command or search…" autocomplete="off" aria-label="Command"></label>
        <ul class="palette-list" id="palList" role="listbox"></ul>
        <p class="palette-foot"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>Enter</kbd> run <kbd>Esc</kbd> close</p>
      </div>
    </dialog>
    <dialog class="term" id="terminal" aria-label="Terminal">
      <div class="term-bar"><span class="term-dots"><i></i><i></i><i></i></span><span class="term-title" id="termTitle">~</span><button class="icon-btn" id="termClose" aria-label="Close terminal">${icon("x")}</button></div>
      <div class="term-out" id="termOut" aria-live="polite"></div>
      <form class="term-in" id="termForm"><span class="term-ps" id="termPs">$</span><input id="termInput" autocomplete="off" spellcheck="false" aria-label="Terminal input"></form>
    </dialog>
    <aside class="studio" id="studio" aria-label="Theme studio" hidden>
      <div class="studio-head"><div><p class="eyebrow">Customize</p><h3>Theme studio</h3></div><button class="icon-btn" id="studioClose" aria-label="Close theme studio">${icon("x")}</button></div>
      <div class="studio-body">
        <p class="studio-label">Mode</p>
        <div class="seg full" id="modeSeg"><button class="seg-btn" data-mode="system">System</button><button class="seg-btn" data-mode="light">Light</button><button class="seg-btn" data-mode="dark">Dark</button></div>
        <p class="studio-label">Presets</p>
        <div class="presets" id="presets"></div>
        <p class="studio-label">Fine-tune</p>
        <div class="slider"><label for="hue1">Primary hue</label><input type="range" id="hue1" min="0" max="360"><output id="hue1Out"></output></div>
        <div class="slider"><label for="hue2">Accent hue</label><input type="range" id="hue2" min="0" max="360"><output id="hue2Out"></output></div>
        <div class="slider"><label for="chroma">Colourfulness</label><input type="range" id="chroma" min="0" max="20"><output id="chromaOut"></output></div>
        <div class="swatches" id="swatches"></div>
        <label class="toggle"><input type="checkbox" id="optMotion"><span>Reduce motion</span></label>
        <label class="toggle"><input type="checkbox" id="optGrain" checked><span>Background texture</span></label>
        <label class="toggle"><input type="checkbox" id="optCircuit" checked><span>Animated circuit board</span></label>
        <button class="btn ghost full" id="themeReset">Reset theme</button>
      </div>
    </aside>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <div class="tip" id="tip" role="tooltip" hidden></div>`);
  $$("[data-icon]").forEach((el) => (el.innerHTML = icon(el.dataset.icon)));

  // Footer with page links + previous / next page
  const main = $("#main");
  const pi = PAGES.findIndex((p) => p.id === PAGE);
  const prev = PAGES[pi - 1], next = PAGES[pi + 1];
  main.insertAdjacentHTML("beforeend", `
    <nav class="pager wrap" aria-label="Next and previous page">
      ${prev ? `<a class="pager-link prev" href="${href(prev.id)}"><small>${icon("arrowL")}Previous</small><b>${prev.label}</b><span>${prev.blurb}</span></a>` : "<span></span>"}
      ${next ? `<a class="pager-link next" href="${href(next.id)}"><small>Next${icon("arrow")}</small><b>${next.label}</b><span>${next.blurb}</span></a>` : ""}
    </nav>
    <footer class="foot wrap">
      <div class="foot-links">${PAGES.map((p) => `<a href="${href(p.id)}"${p.id === PAGE ? ' aria-current="page"' : ""}>${p.label}</a>`).join("")}</div>
      <span>© ${new Date().getFullYear()} ${esc(D.name)}. Hand-built with HTML, CSS and JavaScript.</span>
    </footer>`);

  /* --------------------------------------------------------------- helpers */
  const toastEl = $("#toast");
  let toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("show"), 2400); }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast("Copied to clipboard"); }
    catch {
      const n = $("#emailText");
      if (n) { const r = document.createRange(); r.selectNodeContents(n); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      toast("Press Ctrl+C to copy");
    }
  }
  const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const fmtTime = (tz) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(new Date());
  const hourIn = (tz) => Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: tz }).format(new Date()));
  const emph = (s) => esc(s).replace(/\*(.+?)\*/g, "<em>$1</em>");
  const isTyping = () => /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  const nf = new Intl.NumberFormat("en-US");
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Rail tooltips
  const tip = $("#tip");
  function showTip(el) {
    if (matchMedia("(max-width: 720px)").matches) return;
    const r = el.getBoundingClientRect();
    tip.textContent = el.dataset.tip; tip.hidden = false;
    tip.style.left = r.right + 12 + "px";
    tip.style.top = r.top + r.height / 2 - tip.offsetHeight / 2 + "px";
  }
  $$("[data-tip]").forEach((el) => {
    el.addEventListener("pointerenter", () => showTip(el));
    el.addEventListener("focus", () => showTip(el));
    ["pointerleave", "blur", "click"].forEach((e) => el.addEventListener(e, () => (tip.hidden = true)));
  });

  // Scroll progress
  const prog = $("#progress");
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { const max = root.scrollHeight - innerHeight; prog.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`; ticking = false; });
  }, { passive: true });

  // Spotlight hover on cards
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest?.(".spot"); if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", e.clientX - r.left + "px"); card.style.setProperty("--my", e.clientY - r.top + "px");
  }, { passive: true });

  /* ---------------------------------------------------------------- island */
  const tz = D.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  function presence() {
    const h = hourIn(tz);
    if (h < 7) return { idle: true, text: "Probably asleep right now" };
    if (h < 8) return { idle: true, text: "Just woke up" };
    if (h >= 23) return { idle: true, text: "Probably asleep soon" };
    return { idle: !D.availability?.open, text: D.availability?.text || "Online" };
  }
  const tickerItems = () => [presence().text, D.epq && `EPQ: ${D.epq.stage}`, D.now?.building && `Building: ${D.now.building}`, D.now?.learning && `Learning: ${D.now.learning}`].filter(Boolean);
  let tickI = 1;
  $("#islandTicker").textContent = tickerItems()[0];
  setInterval(() => {
    const items = tickerItems(), el = $("#islandTicker");
    el.style.opacity = 0;
    setTimeout(() => { el.textContent = items[tickI++ % items.length]; el.style.opacity = 1; }, 250);
  }, 4500);
  const NOW_ROWS = [["building", "Building", "hammer"], ["learning", "Learning", "flask"], ["reading", "Reading", "book"], ["listening", "Listening", "music"]];
  $("#islandPanel").innerHTML =
    (D.epq ? `<a class="now-row" href="epq.html">${ico("hexapod")}<div><small>EPQ · ${esc(D.epq.stage)}</small><span>${esc(D.epq.title)}</span></div></a>` : "") +
    NOW_ROWS.filter(([k]) => D.now?.[k]).map(([k, l, ic]) => `<div class="now-row">${ico(ic)}<div><small>${l}</small><span>${esc(D.now[k])}</span></div></div>`).join("") +
    `<div class="now-row">${ico("pin")}<div><small>Based in</small><span>${esc(D.location)}</span></div></div>`;
  const pill = $("#islandPill"), panel = $("#islandPanel");
  pill.addEventListener("click", () => { panel.hidden = !panel.hidden; pill.setAttribute("aria-expanded", String(!panel.hidden)); });
  document.addEventListener("click", (e) => { if (!e.target.closest("#island")) { panel.hidden = true; pill.setAttribute("aria-expanded", "false"); } });
  function tickClock() {
    $("#islandClock").textContent = fmtTime(tz);
    $("#islandDate").textContent = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: tz }).format(new Date());
    const p = presence();
    $("#islandDot").classList.toggle("idle", p.idle);
    $(".presence .dot")?.classList.toggle("idle", p.idle);
    $(".avatar .badge")?.classList.toggle("idle", p.idle);
    const pt = $("#presenceText"); if (pt) pt.textContent = p.text;
    $$(".clock b[data-tz]").forEach((b) => (b.textContent = fmtTime(b.dataset.tz)));
  }

  /* ------------------------------------------------------------------ HOME */
  if ($("#profile")) {
    $("#profile").innerHTML = `
      <div class="module-bar">
        <span class="mono">CPU · ${esc(D.initials)}-1500</span>
        <span class="leds"><i class="led run on" title="RUN"></i><small>RUN</small><i class="led err" title="ERROR"></i><small>ERR</small><i class="led net on" title="NETWORK"></i><small>NET</small></span>
      </div>
      <div class="avatar"><div class="avatar-inner">${D.avatar ? `<img src="${esc(D.avatar)}" alt="${esc(D.name)}">` : esc(D.initials || D.name[0])}</div><span class="badge" aria-hidden="true"></span></div>
      <div><h1>${esc(D.name)}</h1><p class="handle">@${esc(D.handle)}</p></div>
      <p class="role-line"><b id="roleText">${esc(D.roles?.[0] || "")}</b><span class="caret" aria-hidden="true"></span></p>
      <div class="chips" style="justify-content:center">${(D.languages || []).map((l) => `<span class="chip">${esc(l)}</span>`).join("")}</div>
      <div class="presence">
        <div class="presence-top"><i class="dot" aria-hidden="true"></i><span id="presenceText"></span></div>
        ${(D.clocks || []).map((c) => `<div class="clock"><span>${ico("clock")}${esc(c.city)}</span><b data-tz="${esc(c.tz)}"></b></div>`).join("")}
      </div>`;
    $("#heroCopy").innerHTML = `
      <p class="eyebrow">${D.education ? `${esc(D.education.stage)} · ${esc(D.education.school)}` : `About me · ${esc(D.location)}`}</p>
      <p class="hero-title" role="heading" aria-level="2">${emph(D.headline)}</p>
      <p class="hero-bio">${esc(D.bio)}</p>
      <div class="cta-row">
        <a class="btn primary" href="control.html">${ico("factory")}Try the live PLC demo</a>
        <a class="btn tonal" href="epq.html">${ico("hexapod")}See my EPQ</a>
        <a class="btn ghost" href="projects.html">${ico("grid")}Projects</a>
      </div>
      <div class="facts">${(D.facts || []).map((f) => `<div class="fact"><b data-count="${f.value}" data-suffix="${esc(f.suffix || "")}" data-plain="${f.plain ? 1 : 0}">${f.value}${esc(f.suffix || "")}</b><span>${esc(f.label)}</span></div>`).join("")}</div>
      <p class="hint">Tip: press <kbd>Ctrl</kbd><kbd>K</kbd> for the command palette, or <kbd>\`</kbd> to open a terminal.</p>`;

    new IntersectionObserver((es, obs) => es.forEach((e) => {
      if (!e.isIntersecting || calm()) return; obs.disconnect();
      $$(".fact b").forEach((b) => {
        const end = +b.dataset.count, start = b.dataset.plain === "1" ? end - 12 : 0, suf = b.dataset.suffix, t0 = performance.now();
        const f = (t) => { const k = Math.min(1, (t - t0) / 1400), v = Math.round(start + (end - start) * (1 - Math.pow(1 - k, 3))); b.textContent = v + suf; if (k < 1) requestAnimationFrame(f); };
        requestAnimationFrame(f);
      });
    }), { threshold: 0.5 }).observe($(".facts"));

    (function typewriter() {
      const roles = D.roles || []; if (roles.length < 2) return;
      const el = $("#roleText"); let i = 0, ch = roles[0].length, del = true;
      function step() {
        const word = roles[i];
        if (calm()) { i = (i + 1) % roles.length; el.textContent = roles[i]; return setTimeout(step, 2600); }
        if (del) { ch--; if (ch <= 0) { del = false; i = (i + 1) % roles.length; } }
        else { ch++; if (ch >= roles[i].length) { del = true; el.textContent = roles[i]; return setTimeout(step, 2200); } }
        el.textContent = (del ? word : roles[i]).slice(0, Math.max(ch, 0));
        setTimeout(step, del ? 35 : 70);
      }
      setTimeout(step, 2200);
    })();
  }
  tickClock(); setInterval(tickClock, 1000);

  // Home: page directory (bento)
  if ($("#explore")) {
    const S = window.GITHUB_SNAPSHOT;
    const feat = (D.projects || []).slice(0, 3).map((p) => `<li>${esc(p.title)}</li>`).join("");
    const card = (id, cls, inner) => `<a class="bento-card spot reveal ${cls}" href="${href(id)}">${inner}<span class="bento-go">${icon("arrow")}</span></a>`;
    $("#explore").innerHTML = [
      card("control", "b-control", `<p class="eyebrow">Live demo</p><h3>Control room</h3><p>Run a colour-sorting conveyor from an HMI and watch the Structured Text and ladder logic change live.</p>
        <div class="mini-belt" aria-hidden="true"><i class="r"></i><i class="g"></i><i class="b"></i><i class="r"></i><i class="b"></i></div>`),
      card("epq", "b-epq", `<p class="eyebrow">${esc(D.epq?.qualification || "EPQ")}</p><h3>Can a robot learn to walk more efficiently?</h3><p>${esc(D.epq?.oneLine || "")}</p>
        <svg class="mini-hex" viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="60" rx="15" ry="26"/>${[[-1, 40], [-1, 60], [-1, 80], [1, 40], [1, 60], [1, 80]].map(([s, y], i) => `<g class="leg ${i % 2 === 0 ? "a" : "b"}"><line x1="${60 + s * 14}" y1="${y}" x2="${60 + s * 44}" y2="${y + (y - 60) * 0.5}"/><circle cx="${60 + s * 44}" cy="${y + (y - 60) * 0.5}" r="4"/></g>`).join("")}</svg>`),
      card("projects", "b-projects", `<p class="eyebrow">${(D.projects || []).length} projects · 5 playable</p><h3>Projects</h3><ul class="mini-list">${feat}</ul>`),
      card("journey", "b-journey", `<p class="eyebrow">Since 2023</p><h3>Journey</h3><p>${esc(D.education?.school || "")} · work experience at ${esc(D.experience?.[0]?.company || "")}</p>`),
      card("github", "b-github", `<p class="eyebrow">Open source</p><h3>GitHub</h3><p>${S ? `${S.user.repos} public repos, from a PLC Sudoku solver to a space simulator.` : "Repositories and contributions."}</p>`),
      card("contact", "b-contact", `<p class="eyebrow">Say hello</p><h3>Contact</h3><p>${esc(D.availability?.text || "")}</p>`)
    ].join("");
  }

  /* ---------------------------------------------------------------- skills */
  const levelWord = (v) => (v >= 85 ? "Advanced" : v >= 65 ? "Confident" : v >= 45 ? "Comfortable" : "Learning");
  if ($("#skillGrid")) $("#skillGrid").innerHTML = (D.skills || []).map((g) => `
    <article class="skill-card spot reveal">
      <h3>${ico(g.icon || "code")}${esc(g.group)}</h3>
      ${g.items.map((s) => `<div class="skill"><div class="skill-top"><span>${esc(s.name)}</span><small>${levelWord(s.level)}</small></div>
        <div class="meter" role="meter" aria-label="${esc(s.name)}" aria-valuenow="${s.level}" aria-valuemin="0" aria-valuemax="100"><i style="--v:${s.level}%"></i></div></div>`).join("")}
    </article>`).join("");

  if ($("#nowGrid")) $("#nowGrid").innerHTML = NOW_ROWS.filter(([k]) => D.now?.[k]).map(([k, l, ic]) =>
    `<article class="now-card spot reveal">${ico(ic)}<small>${l}</small><p>${esc(D.now[k])}</p></article>`).join("") +
    (D.setup?.length ? `<article class="setup reveal"><h3>My setup</h3><dl>${D.setup.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join("")}</dl></article>` : "");

  /* -------------------------------------------------------- circuit backdrop */
  const circuit = (() => {
    const cv = $("#circuit");
    if (!cv) return { refresh() {}, set() {} };
    const g = cv.getContext("2d");
    let w = 0, h = 0, traces = [], pulses = [], on = true, raf = 0, visible = true, col = {};
    const STEP = 28;
    function readCol() { const cs = getComputedStyle(root); col = { line: cs.getPropertyValue("--line").trim(), p: cs.getPropertyValue("--primary").trim(), a: cs.getPropertyValue("--accent").trim() }; }
    function build() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      let s = 12345; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
      traces = [];
      const n = Math.round((w * h) / 26000);
      for (let i = 0; i < n; i++) {
        let x = Math.round((rnd() * w) / STEP) * STEP, y = Math.round((rnd() * h) / STEP) * STEP;
        const pts = [[x, y]]; let dir = Math.floor(rnd() * 4);
        for (let k = 0; k < 3 + Math.floor(rnd() * 4); k++) {
          const len = (2 + Math.floor(rnd() * 5)) * STEP;
          const d = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [1, -1]][dir];
          x += d[0] * len; y += d[1] * len; pts.push([x, y]);
          dir = rnd() < 0.5 ? (dir + 1) % 4 : rnd() < 0.5 ? 4 + Math.floor(rnd() * 2) : dir % 4;
        }
        let L = 0; for (let k = 1; k < pts.length; k++) L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
        traces.push({ pts, L });
      }
      pulses = traces.filter((_, i) => i % 3 === 0).map((t, i) => ({ t, d: rnd() * t.L, v: 60 + rnd() * 90, c: i % 2 }));
      draw();
    }
    function at(t, d) {
      for (let k = 1; k < t.pts.length; k++) {
        const [x0, y0] = t.pts[k - 1], [x1, y1] = t.pts[k], l = Math.hypot(x1 - x0, y1 - y0);
        if (d <= l) return [x0 + ((x1 - x0) * d) / l, y0 + ((y1 - y0) * d) / l];
        d -= l;
      }
      return t.pts[t.pts.length - 1];
    }
    function draw() {
      g.clearRect(0, 0, w, h);
      g.lineWidth = 1.5; g.strokeStyle = col.line;
      traces.forEach(({ pts }) => {
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
        [pts[0], pts[pts.length - 1]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 3.5, 0, 7); g.stroke(); });
      });
      pulses.forEach((p) => { const [x, y] = at(p.t, p.d); const c = p.c ? col.a : col.p; g.save(); g.shadowColor = c; g.shadowBlur = 12; g.fillStyle = c; g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill(); g.restore(); });
    }
    let last = 0;
    function frame(t) {
      if (!on || !visible || document.hidden || calm()) { raf = 0; return; }
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
      pulses.forEach((p) => { p.d += p.v * dt; if (p.d > p.t.L) p.d = 0; });
      draw(); raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!raf && on && visible && !calm()) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    readCol(); build();
    new ResizeObserver(() => build()).observe(cv);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(cv);
    document.addEventListener("visibilitychange", kick);
    return { refresh() { readCol(); draw(); kick(); }, set(v) { on = v; cv.hidden = !v; kick(); } };
  })();

  /* ---------------------------------------------------------- control room */
  const factory = $("#factory") && window.PF_Factory ? window.PF_Factory.mount($("#factory"), { icon, toast }) : null;
  if (factory && location.hash === "#start") factory.press("start");

  /* -------------------------------------------------------------- projects */
  const CAT_ICONS = { electronics: "cpu", automation: "factory", software: "code", web: "globe", design: "palette" };
  const projects = (D.projects || []).map((p, i) => ({ ...p, i, ph: hash(p.title) % 360 }));
  const cover = (p, big) => `<div class="cover" style="--ph:${p.ph};--ph2:${(p.ph + 70) % 360}">
      ${ico(CAT_ICONS[(p.category || "").toLowerCase()] || "spark")}<span class="cover-year">${esc(p.year)}</span>
      <span class="cover-mark"${big ? ' style="font-size:clamp(2.4rem,7vw,4.4rem)"' : ""}>${esc(p.title)}</span></div>`;
  const modal = $("#projModal");
  let demoCleanup = null;
  function openProject(i) {
    const p = projects[i]; if (!p) return;
    const hasDemo = p.demo && p.demo !== "factory" && window.PF_Demos?.[p.demo];
    modal.classList.toggle("wide", !!hasDemo);
    $("#projModalBody").innerHTML = `
      <div style="position:relative">${hasDemo ? `<div class="modal-strip" style="--ph:${p.ph};--ph2:${(p.ph + 70) % 360}"></div>` : cover(p, true)}<button class="icon-btn modal-close${hasDemo ? " on-strip" : ""}" id="pmClose" aria-label="Close">${icon("x")}</button></div>
      <div class="modal-body">
        <div><p class="eyebrow">${esc(p.category)} · ${esc(p.year)}</p><h3 id="pmTitle">${esc(p.title)}</h3></div>
        ${hasDemo ? `<div class="demo" id="demoBox"></div>` : ""}
        <p>${esc(p.details || p.summary)}</p>
        ${p.highlights?.length ? `<ul>${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
        <div class="chips">${(p.stack || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <div class="cta-row">
          ${p.demo === "factory" ? `<a class="btn primary" href="control.html#start">${ico("factory")}Open the live demo</a>` : ""}
          ${p.links?.code ? `<a class="btn ${p.demo === "factory" ? "tonal" : "primary"}" href="${esc(p.links.code)}" target="_blank" rel="noopener">${ico("github")}Source code</a>` : ""}
          ${p.links?.demo ? `<a class="btn tonal" href="${esc(p.links.demo)}" target="_blank" rel="noopener">${ico("out")}Live site</a>` : ""}
        </div>
      </div>`;
    $("#pmClose").onclick = () => modal.close();
    try { history.replaceState(null, "", "#project-" + slug(p.title)); } catch { /* ignore */ }
    modal.showModal();
    if (hasDemo) { try { demoCleanup = window.PF_Demos[p.demo]($("#demoBox"), { data: D, toast }); } catch (err) { console.error(err); } }
  }
  modal.addEventListener("close", () => {
    if (demoCleanup) { demoCleanup(); demoCleanup = null; }
    if (location.hash.startsWith("#project-")) try { history.replaceState(null, "", location.pathname + location.search); } catch { /* ignore */ }
  });
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  if ($("#projGrid")) {
    const cats = ["All", ...new Set(projects.map((p) => p.category).filter(Boolean))];
    let curCat = "All";
    $("#projFilters").innerHTML = cats.map((c) => `<button class="chip${c === "All" ? " is-on" : ""}" role="tab" aria-selected="${c === "All"}" data-cat="${esc(c)}">${c === "All" ? ico("check") : ""}${esc(c)}</button>`).join("");
    const renderProjects = () => {
      const q = $("#projSearch").value.trim().toLowerCase();
      const list = projects.filter((p) => (curCat === "All" || p.category === curCat) && (!q || [p.title, p.summary, p.details, ...(p.stack || [])].join(" ").toLowerCase().includes(q)));
      $("#projGrid").innerHTML = list.map((p) => `
        <article class="proj spot reveal${p.featured && curCat === "All" && !q ? " featured" : ""}" tabindex="0" role="button" data-i="${p.i}" aria-label="Open ${esc(p.title)} details">
          ${cover(p)}
          <div class="proj-body">
            <h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p>
            <div class="proj-foot">${(p.stack || []).slice(0, 3).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
              <span class="proj-flags">${p.demo ? `<span class="badge-demo">${icon("play")}${p.demo === "factory" ? "Live demo" : "Playable"}</span>` : ""}${p.links?.code ? `<span class="badge-src" title="Source on GitHub">${icon("github")}</span>` : ""}</span></div>
          </div>
        </article>`).join("");
      $("#projEmpty").hidden = list.length > 0;
    };
    $("#projFilters").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]"); if (!b) return;
      curCat = b.dataset.cat;
      $$("#projFilters .chip").forEach((c) => { const on = c === b; c.classList.toggle("is-on", on); c.setAttribute("aria-selected", on); c.innerHTML = (on ? ico("check") : "") + esc(c.dataset.cat); });
      renderProjects();
    });
    $("#projSearch").addEventListener("input", renderProjects);
    renderProjects();
    $("#projGrid").addEventListener("click", (e) => { const c = e.target.closest(".proj"); if (c) openProject(+c.dataset.i); });
    $("#projGrid").addEventListener("keydown", (e) => { const c = e.target.closest(".proj"); if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openProject(+c.dataset.i); } });
    const openFromHash = () => {
      const m = location.hash.match(/^#project-([a-z0-9-]+)$/); if (!m) return;
      const p = projects.find((x) => slug(x.title) === m[1]);
      if (p && !modal.open) setTimeout(() => openProject(p.i), 150);
    };
    addEventListener("hashchange", openFromHash);
    openFromHash();
  }

  /* --------------------------------------------------------------- journey */
  const TL_ICONS = { start: "spark", learn: "book", github: "github", work: "briefcase", project: "hammer" };
  if ($("#education") && D.education) {
    const E = D.education;
    $("#education").innerHTML = `
      <article class="exp-card edu spot reveal">
        <div class="exp-logo">${icon("school")}</div>
        <div class="exp-main">
          <p class="eyebrow">Education · ${esc(E.stage)}</p>
          <h3>${esc(E.school)}</h3>
          <p class="muted">${ico("pin")}${esc(E.place)}</p>
          <div class="subjects">${E.subjects.map((s) => `<span class="subject"><b>${esc(s.name)}</b><small>${esc(s.board)}</small></span>`).join("")}</div>
        </div>
      </article>`;
  }
  if ($("#experience")) $("#experience").innerHTML = (D.experience || []).map((x) => `
    <article class="exp-card spot reveal">
      <div class="exp-logo">${icon("factory")}</div>
      <div class="exp-main">
        <p class="eyebrow">${esc(x.role)} · ${esc(x.date)}</p>
        <h3>${esc(x.company)}</h3>
        <p class="muted">${ico("pin")}${esc(x.place)}</p>
        <ul>${(x.points || []).map((pt) => `<li>${esc(pt)}</li>`).join("")}</ul>
      </div>
    </article>`).join("");
  if ($("#timeline")) {
    let lastYear = null;
    $("#timeline").innerHTML = (D.timeline || []).map((t) => {
      const showYear = t.date !== lastYear; lastYear = t.date;
      return `<li class="tl reveal${showYear ? "" : " same-year"}"><span class="tl-date">${showYear ? esc(t.date) : ""}</span>
        <div class="tl-card spot" data-type="${esc(t.type || "")}"><span class="tl-ico">${icon(TL_ICONS[t.type] || "spark")}</span>
          <div><h3>${esc(t.title)}</h3><p class="muted">${esc(t.place)}</p><p>${esc(t.text)}</p></div></div></li>`;
    }).join("");
  }

  /* --------------------------------------------------------------- contact */
  if ($("#contactCopy")) {
    $("#contactCopy").innerHTML = `
      <p class="eyebrow">Contact</p>
      <h1 class="contact-title">Let's build something together.</h1>
      <p class="muted">${esc(D.availability?.text || "")}. The fastest way to reach me is email.</p>
      <div class="email-box"><span id="emailText">${esc(D.email)}</span><button class="icon-btn" id="copyEmail" aria-label="Copy email address">${icon("copy")}</button></div>
      <div class="socials">${(D.socials || []).map((s) => `<a class="chip" href="${esc(s.url)}" target="_blank" rel="noopener">${ico(s.icon || "globe")}${esc(s.label)}</a>`).join("")}</div>`;
    $("#copyEmail").addEventListener("click", () => copy(D.email));
    $("#contactForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.currentTarget; let ok = true;
      $$(".field", f).forEach((fl) => { const inp = $("input,textarea", fl); const bad = !inp.checkValidity() || !inp.value.trim(); fl.classList.toggle("bad", bad); if (bad) ok = false; });
      const st = $("#cfStatus");
      if (!ok) { st.textContent = "Please fill in all three fields with a valid email address."; return; }
      const subject = `Hello from ${f.name.value.trim()}`;
      const body = `${f.message.value.trim()}\n\n- ${f.name.value.trim()} (${f.email.value.trim()})`;
      location.href = `mailto:${D.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      st.textContent = `Your email app should open with the message ready to send. If nothing opens, copy ${D.email} and paste the message there.`;
    });
  }

  /* ---------------------------------------------------------------- GitHub
     Only real data: live from GitHub, or the saved snapshot (github-snapshot.js). */
  const DAY = 864e5;
  const iso = (d) => d.toISOString().slice(0, 10);
  const LANG_NAMES = D.githubLanguageNames || {};
  const langName = (l) => LANG_NAMES[l] || l;
  const LANG_COLORS = { JavaScript: "oklch(0.86 0.17 100)", HTML: "oklch(0.66 0.19 35)", CSS: "oklch(0.55 0.17 290)", Python: "oklch(0.6 0.12 250)", "Structured Text": "oklch(0.7 0.14 165)", C: "oklch(0.6 0.03 250)", "C++": "oklch(0.6 0.16 350)", TypeScript: "oklch(0.6 0.13 245)" };
  const langColor = (l) => LANG_COLORS[l] || `oklch(0.7 0.12 ${hash(l) % 360})`;
  const monthYear = (s) => new Date(s).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  const shortDate = (s) => s ? new Date(s + (s.length === 10 ? "T00:00:00Z" : "")).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "";
  const prettyRepo = (n) => n.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  function ago(t) {
    const s = (Date.now() - new Date(t)) / 1000;
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + "m ago";
    if (s < 86400) return Math.round(s / 3600) + "h ago";
    if (s < 86400 * 30) return Math.round(s / 86400) + "d ago";
    return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  async function getJSON(url, ms = 9000) {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
    try { const r = await fetch(url, { signal: ctl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); }
    finally { clearTimeout(t); }
  }
  const fromSnapshot = (S) => S && ({ source: "snapshot", fetchedAt: S.fetchedAt, user: S.user, repos: S.repos, days: new Map(S.days), events: S.events || [] });
  async function liveData(u, snap) {
    const enc = encodeURIComponent(u);
    const [user, repos, contrib, events] = await Promise.allSettled([
      getJSON(`https://api.github.com/users/${enc}`),
      getJSON(`https://api.github.com/users/${enc}/repos?per_page=100&sort=pushed`),
      getJSON(`https://github-contributions-api.jogruber.de/v4/${enc}?y=all`),
      getJSON(`https://api.github.com/users/${enc}/events/public?per_page=40`)
    ]);
    if (user.status !== "fulfilled" || repos.status !== "fulfilled") throw new Error("GitHub unavailable");
    const U = user.value, R = repos.value.filter((r) => !r.fork);
    const snapLangs = Object.fromEntries((snap?.repos || []).map((r) => [r.name, r.languages]));
    const langs = await Promise.allSettled(R.slice(0, 10).map((r) => snapLangs[r.name] ? Promise.resolve(snapLangs[r.name]) : getJSON(`https://api.github.com/repos/${enc}/${r.name}/languages`)));
    const today = iso(new Date());
    return {
      source: "live", fetchedAt: new Date().toISOString(),
      user: { login: U.login, url: U.html_url, created: U.created_at, repos: U.public_repos, followers: U.followers, following: U.following },
      repos: R.map((r, i) => ({ name: r.name, description: r.description, url: r.html_url, language: r.language, stars: r.stargazers_count, forks: r.forks_count, created: r.created_at, pushed: r.pushed_at, languages: langs[i]?.status === "fulfilled" ? langs[i].value : (r.language ? { [r.language]: 1 } : {}) })),
      days: contrib.status === "fulfilled" ? new Map(contrib.value.contributions.filter((d) => d.count && d.date <= today).map((d) => [d.date, d.count])) : (snap ? new Map(snap.days) : new Map()),
      events: events.status === "fulfilled" ? events.value : []
    };
  }
  function stats(G) {
    const days = [...G.days.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
    const total = days.reduce((a, d) => a + d[1], 0);
    const best = days.reduce((b, d) => (d[1] > b[1] ? d : b), ["", 0]);
    let longest = 0, run = 0, prevD = null;
    days.forEach(([d]) => { run = prevD && (new Date(d) - new Date(prevD)) === DAY ? run + 1 : 1; longest = Math.max(longest, run); prevD = d; });
    const langSet = new Set(); G.repos.forEach((r) => Object.keys(r.languages || {}).forEach((l) => langSet.add(langName(l))));
    return { total, best, longest, langs: langSet.size };
  }
  let GH = fromSnapshot(window.GITHUB_SNAPSHOT), calYear = "last";
  function renderGitHub(G) {
    GH = G;
    if (!$("#ghStats")) return;
    const s = stats(G);
    const ghUser = $("#ghUser");
    ghUser.innerHTML = `${icon("github").replace("<svg", '<svg class="ico"')}@${esc(G.user.login)} <span class="ico">${icon("out")}</span>`;
    ghUser.href = G.user.url;
    $("#ghSource").textContent = G.source === "live" ? "Live from GitHub." : `Snapshot from ${shortDate(G.fetchedAt)}. Live stats load when GitHub can be reached.`;
    const tiles = [
      ["folder", nf.format(G.user.repos), "public repositories", true],
      ["commit", nf.format(s.total), "contributions, all time"],
      ["code", nf.format(s.langs), "languages used"],
      ["calendar", monthYear(G.user.created), "member since"],
      ["trophy", nf.format(s.best[1]), s.best[0] ? `best day · ${shortDate(s.best[0])}` : "best day"],
      ["users", nf.format(G.user.followers), `followers · ${nf.format(G.user.following || 0)} following`]
    ];
    $("#ghStats").innerHTML = tiles.map(([ic, v, l, hl]) => `<div class="stat${hl ? " hl" : ""}">${ico(ic)}<b>${esc(v)}</b><span>${esc(l)}</span></div>`).join("");
    const bytes = {};
    G.repos.forEach((r) => Object.entries(r.languages || {}).forEach(([l, b]) => { const n = langName(l); bytes[n] = (bytes[n] || 0) + b; }));
    const tot = Object.values(bytes).reduce((a, b) => a + b, 0) || 1;
    const langs = Object.entries(bytes).sort((a, b) => b[1] - a[1]);
    $("#langBar").innerHTML = langs.map(([l, b]) => `<i style="flex:${b};background:${langColor(l)}" title="${esc(l)} ${((b / tot) * 100).toFixed(1)}%"></i>`).join("");
    $("#langLegend").innerHTML = langs.map(([l, b]) => `<li><i style="background:${langColor(l)}"></i>${esc(l)} <span>${((b / tot) * 100).toFixed(1)}%</span></li>`).join("");
    $("#repoList").innerHTML = [...G.repos].sort((a, b) => (a.pushed < b.pushed ? 1 : -1)).map((r) => {
      const l = r.language ? langName(r.language) : null;
      return `<a class="repo" href="${esc(r.url)}" target="_blank" rel="noopener">
        <div class="repo-top"><b>${esc(prettyRepo(r.name))}</b>${ico("out")}</div>
        ${r.description ? `<p>${esc(r.description)}</p>` : ""}
        <div class="repo-meta">${l ? `<span><i style="background:${langColor(l)}"></i>${esc(l)}</span>` : ""}<span>Updated ${esc(monthYear(r.pushed))}</span>${r.stars ? `<span>${icon("star").replace("<svg", '<svg class="ico"')}${r.stars}</span>` : ""}</div></a>`;
    }).join("");
    const firstYear = new Date(G.user.created).getUTCFullYear(), thisYear = new Date().getUTCFullYear();
    const years = ["last"]; for (let y = thisYear; y >= firstYear; y--) years.push(String(y));
    $("#calYears").innerHTML = years.map((y) => `<button class="seg-btn${y === calYear ? " is-on" : ""}" data-y="${y}" role="tab" aria-selected="${y === calYear}">${y === "last" ? "Last 12 months" : y}</button>`).join("");
    renderCalendar();
    const EV = { PushEvent: ["commit", (e) => `Pushed to ${prettyRepo(e.repo.name.split("/")[1])}`], CreateEvent: ["branch", (e) => `Created ${e.payload.ref_type} in ${prettyRepo(e.repo.name.split("/")[1])}`], WatchEvent: ["star", (e) => `Starred ${e.repo.name}`], PullRequestEvent: ["pr", (e) => `${e.payload.action} pull request in ${e.repo.name}`], IssuesEvent: ["issue", (e) => `${e.payload.action} issue in ${e.repo.name}`], ForkEvent: ["fork", (e) => `Forked ${e.repo.name}`], ReleaseEvent: ["tag", (e) => `Released ${e.payload.release?.tag_name || ""} of ${e.repo.name}`] };
    let items;
    if (G.events.length) {
      items = G.events.slice(0, 10).map((e) => { const m = EV[e.type] || ["commit", () => e.type.replace(/Event$/, "")]; return { ic: m[0], title: m[1](e), sub: e.repo.name, url: `https://github.com/${e.repo.name}`, time: e.created_at }; });
      $("#feedMeta").textContent = "Public events from GitHub";
    } else {
      items = [...G.repos].sort((a, b) => (a.pushed < b.pushed ? 1 : -1)).map((r) => { const fresh = Math.abs(new Date(r.pushed) - new Date(r.created)) < 36e5; return { ic: fresh ? "spark" : "commit", title: `${fresh ? "Published" : "Pushed to"} ${prettyRepo(r.name)}`, sub: r.description || r.name, url: r.url, time: r.pushed }; });
      $("#feedMeta").textContent = "Latest updates to each repository";
    }
    $("#ghFeed").innerHTML = items.map((e) => `
      <li class="ev">${ico(e.ic)}
        <div class="ev-main"><a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.title)}</a><p>${esc(e.sub)}</p></div>
        <time datetime="${esc(e.time)}" title="${new Date(e.time).toLocaleString()}">${ago(e.time)}</time></li>`).join("");
  }
  function renderCalendar() {
    const G = GH; if (!G || !$("#ghHeat")) return;
    let end, startD;
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    if (calYear === "last") { end = today; startD = new Date(+today - 364 * DAY); }
    else { const y = +calYear; startD = new Date(Date.UTC(y, 0, 1)); end = y === today.getUTCFullYear() ? today : new Date(Date.UTC(y, 11, 31)); }
    const start = new Date(startD); start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    const range = [];
    for (let d = new Date(start); d <= end; d = new Date(+d + DAY)) range.push({ date: iso(d), count: d < startD ? -1 : G.days.get(iso(d)) || 0, d });
    const nz = range.map((r) => r.count).filter((c) => c > 0).sort((a, b) => a - b);
    const q = (p) => nz[Math.floor((nz.length - 1) * p)] || 1;
    const cuts = [q(0.25), q(0.5), q(0.75)];
    const level = (c) => (c <= 0 ? 0 : c <= cuts[0] ? 1 : c <= cuts[1] ? 2 : c <= cuts[2] ? 3 : 4);
    let html = "", lastMonth = -1;
    for (let w = 0; w < range.length; w += 7) {
      const wk = range.slice(w, w + 7);
      const first = wk.find((c) => c.count >= 0) || wk[0];
      const m = first.d.getUTCMonth();
      const label = m !== lastMonth ? first.d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }) : "";
      if (label) lastMonth = m;
      html += `<span class="m">${label}</span>`;
      for (let k = 0; k < 7; k++) { const c = wk[k]; html += c && c.count >= 0 ? `<span class="d" data-l="${level(c.count)}" title="${c.count} contribution${c.count === 1 ? "" : "s"} on ${shortDate(c.date)}"></span>` : `<span></span>`; }
    }
    $("#ghHeat").innerHTML = html;
    const sum = range.reduce((a, r) => a + Math.max(0, r.count), 0);
    $("#ghRange").textContent = `${nf.format(sum)} contribution${sum === 1 ? "" : "s"} ${calYear === "last" ? "in the last 12 months" : "in " + calYear}`;
    $("#heatLegend").innerHTML = `Less ${[0, 1, 2, 3, 4].map((l) => `<span class="d" data-l="${l}"></span>`).join("")} More`;
  }
  if ($("#ghStats")) {
    $("#calYears").addEventListener("click", (e) => {
      const b = e.target.closest("[data-y]"); if (!b) return;
      calYear = b.dataset.y;
      $$("#calYears .seg-btn").forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-selected", x === b); });
      renderCalendar();
    });
    if (GH) renderGitHub(GH);
    if (D.github) liveData(D.github, window.GITHUB_SNAPSHOT).then(renderGitHub).catch(() => {
      if (!GH) { $("#ghSource").textContent = "GitHub couldn't be reached right now. Visit the profile directly:"; $("#ghUser").textContent = "@" + D.github; $("#ghUser").href = "https://github.com/" + D.github; }
    });
  }

  /* ------------------------------------------------------------------- EPQ */
  const epq = $("#epqRoot") && window.PF_EPQ ? window.PF_EPQ.mount($("#epqRoot"), { data: D, icon, ico, esc }) : null;

  /* ----------------------------------------------------------------- theme */
  const PRESETS = [
    { id: "aurora", name: "Aurora", h: 168, h2: 28, c: 13 }, { id: "ember", name: "Ember", h: 35, h2: 350, c: 15 },
    { id: "ocean", name: "Ocean", h: 240, h2: 190, c: 13 }, { id: "orchid", name: "Orchid", h: 305, h2: 60, c: 14 },
    { id: "matrix", name: "Matrix", h: 145, h2: 100, c: 16 }, { id: "sakura", name: "Sakura", h: 350, h2: 280, c: 12 },
    { id: "solar", name: "Solar", h: 80, h2: 25, c: 14 }, { id: "graphite", name: "Graphite", h: 260, h2: 200, c: 2 }
  ];
  const DEFAULT = { preset: "aurora", h: 168, h2: 28, c: 13, mode: "system", calm: false, grain: true, circuit: true };
  let T = { ...DEFAULT, ...store.get("pf-theme", {}) };
  const repaint = () => requestAnimationFrame(() => { circuit.refresh(); factory?.refreshTheme(); epq?.refreshTheme?.(); });
  function applyTheme(save = true) {
    root.style.setProperty("--h", T.h); root.style.setProperty("--h2", T.h2); root.style.setProperty("--c", (T.c / 100).toFixed(3));
    if (T.mode === "system") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", T.mode);
    document.body.classList.toggle("calm", !!T.calm);
    document.body.classList.toggle("no-grain", !T.grain);
    $("#hue1").value = T.h; $("#hue2").value = T.h2; $("#chroma").value = T.c;
    $("#hue1Out").textContent = T.h + "°"; $("#hue2Out").textContent = T.h2 + "°"; $("#chromaOut").textContent = Math.round((T.c / 20) * 100) + "%";
    $$("#modeSeg .seg-btn").forEach((b) => b.classList.toggle("is-on", b.dataset.mode === T.mode));
    $$(".preset").forEach((b) => b.classList.toggle("is-on", b.dataset.id === T.preset));
    $("#optMotion").checked = !!T.calm; $("#optGrain").checked = !!T.grain; $("#optCircuit").checked = !!T.circuit;
    if (save) store.set("pf-theme", T);
    circuit.set(!!T.circuit); repaint();
  }
  const hueBg = "linear-gradient(90deg," + Array.from({ length: 13 }, (_, i) => `oklch(0.75 0.14 ${i * 30})`).join(",") + ")";
  $("#hue1").style.background = hueBg; $("#hue2").style.background = hueBg;
  $("#presets").innerHTML = PRESETS.map((p) => `<button class="preset" data-id="${p.id}"><span class="preset-dots"><i style="background:oklch(0.72 ${p.c / 100 + 0.02} ${p.h})"></i><i style="background:oklch(0.75 ${p.c / 100} ${p.h2})"></i></span>${p.name}</button>`).join("");
  $("#swatches").innerHTML = ["--bg", "--surface-2", "--primary-soft", "--primary", "--accent-soft", "--accent"].map((v) => `<i style="background:var(${v})" title="${v.slice(2)}"></i>`).join("");
  function setPreset(id) { const p = PRESETS.find((x) => x.id === id); if (!p) return false; Object.assign(T, { preset: id, h: p.h, h2: p.h2, c: p.c }); applyTheme(); return true; }
  function setMode(m) { T.mode = m; applyTheme(); }
  $("#presets").addEventListener("click", (e) => { const b = e.target.closest(".preset"); if (b) setPreset(b.dataset.id); });
  $("#modeSeg").addEventListener("click", (e) => { const b = e.target.closest("[data-mode]"); if (b) setMode(b.dataset.mode); });
  [["hue1", "h"], ["hue2", "h2"], ["chroma", "c"]].forEach(([id, k]) => $("#" + id).addEventListener("input", (e) => { T[k] = +e.target.value; T.preset = "custom"; applyTheme(); }));
  $("#optMotion").addEventListener("change", (e) => { T.calm = e.target.checked; applyTheme(); });
  $("#optGrain").addEventListener("change", (e) => { T.grain = e.target.checked; applyTheme(); });
  $("#optCircuit").addEventListener("change", (e) => { T.circuit = e.target.checked; applyTheme(); });
  $("#themeReset").addEventListener("click", () => { T = { ...DEFAULT }; applyTheme(); toast("Theme reset"); });
  const studio = $("#studio");
  const toggleStudio = (open = studio.hidden) => { studio.hidden = !open; };
  $("#btnTheme").addEventListener("click", () => toggleStudio());
  $("#studioClose").addEventListener("click", () => toggleStudio(false));
  const isDark = () => T.mode === "dark" || (T.mode === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", repaint);
  new MutationObserver(repaint).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  applyTheme(false);

  /* ------------------------------------------------------- command palette */
  const pal = $("#palette"), palInput = $("#palInput"), palList = $("#palList");
  const projectRun = (p) => () => (PAGE === "projects" ? openProject(p.i) : goPage("projects", "#project-" + slug(p.title)));
  const COMMANDS = () => [
    ...PAGES.map((p) => ({ g: "Pages", label: p.label, hint: p.id === PAGE ? "you are here" : "", ic: p.icon, run: () => goPage(p.id) })),
    ...(factory ? [
      { g: "Control room", label: "PLC: Start the line", ic: "play", run: () => factory.press("start") },
      { g: "Control room", label: "PLC: Stop the line", ic: "square", run: () => factory.press("stop") },
      { g: "Control room", label: "PLC: Emergency stop", ic: "bolt", run: () => factory.press("estop") }
    ] : [{ g: "Control room", label: "Start the PLC demo", ic: "play", run: () => goPage("control", "#start") }]),
    ...projects.map((p) => ({ g: "Projects", label: p.title, hint: p.demo ? "demo" : p.category, ic: p.demo ? "gamepad" : "grid", run: projectRun(p) })),
    { g: "Theme", label: isDark() ? "Switch to light mode" : "Switch to dark mode", ic: isDark() ? "sun" : "moon", run: () => setMode(isDark() ? "light" : "dark") },
    { g: "Theme", label: "Open theme studio", ic: "palette", run: () => toggleStudio(true) },
    ...PRESETS.map((p) => ({ g: "Theme", label: `Theme: ${p.name}`, ic: "palette", run: () => setPreset(p.id) })),
    { g: "Actions", label: "Open terminal", hint: "`", ic: "terminal", run: openTerm },
    { g: "Actions", label: "Copy email address", ic: "copy", run: () => copy(D.email) },
    ...(D.socials || []).map((s) => ({ g: "Links", label: `Open ${s.label}`, ic: s.icon || "out", run: () => window.open(s.url, "_blank", "noopener") }))
  ];
  let palItems = [], palSel = 0;
  function score(label, q) {
    label = label.toLowerCase(); if (!q) return 1;
    if (label.includes(q)) return 100 - label.indexOf(q);
    let i = 0; for (const ch of label) if (ch === q[i]) i++;
    return i === q.length ? 10 : 0;
  }
  function renderPal() {
    const q = palInput.value.trim().toLowerCase();
    palItems = COMMANDS().map((c) => ({ ...c, s: score(c.label + " " + (c.hint || ""), q) })).filter((c) => c.s > 0);
    if (q) palItems.sort((a, b) => b.s - a.s);
    palSel = Math.min(palSel, Math.max(palItems.length - 1, 0));
    let lastG = "", html = "";
    palItems.forEach((c, i) => {
      if (!q && c.g !== lastG) { html += `<li class="grp" role="presentation">${c.g}</li>`; lastG = c.g; }
      html += `<li role="option" data-i="${i}" class="${i === palSel ? "is-sel" : ""}" aria-selected="${i === palSel}">${ico(c.ic)}${esc(c.label)}${c.hint ? `<small>${esc(c.hint)}</small>` : ""}</li>`;
    });
    palList.innerHTML = html || `<li class="grp">No matching command</li>`;
    palList.querySelector(".is-sel")?.scrollIntoView({ block: "nearest" });
  }
  function openPal() { palInput.value = ""; palSel = 0; renderPal(); pal.showModal(); palInput.focus(); }
  function runPal(i) { const c = palItems[i]; if (!c) return; pal.close(); setTimeout(c.run, 60); }
  palInput.addEventListener("input", () => { palSel = 0; renderPal(); });
  palInput.addEventListener("keydown", (e) => {
    if (!palItems.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); palSel = (palSel + 1) % palItems.length; renderPal(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); palSel = (palSel - 1 + palItems.length) % palItems.length; renderPal(); }
    else if (e.key === "Enter") { e.preventDefault(); runPal(palSel); }
  });
  palList.addEventListener("click", (e) => { const li = e.target.closest("[data-i]"); if (li) runPal(+li.dataset.i); });
  palList.addEventListener("pointermove", (e) => { const li = e.target.closest("[data-i]"); if (li && +li.dataset.i !== palSel) { palSel = +li.dataset.i; $$("[data-i]", palList).forEach((x) => x.classList.toggle("is-sel", x === li)); } });
  pal.addEventListener("click", (e) => { if (e.target === pal) pal.close(); });
  $("#btnPalette").addEventListener("click", openPal);

  /* -------------------------------------------------------------- terminal */
  const term = $("#terminal"), out = $("#termOut"), tin = $("#termInput");
  const user = (D.handle || "guest").toLowerCase();
  const PS = `${user}@portfolio:~/${PAGE === "index" ? "" : PAGE}$`;
  $("#termPs").textContent = PS; $("#termTitle").textContent = `${user}@portfolio: ~/${PAGE === "index" ? "" : PAGE}`;
  const hist = store.get("pf-hist", []); let hi = hist.length;
  const print = (html) => { out.insertAdjacentHTML("beforeend", html + "\n"); out.scrollTop = out.scrollHeight; };
  const closeThen = (fn) => { term.close(); setTimeout(fn, 80); };
  const CMDS = {
    help: () => `<span class="acc">Available commands</span>
  about       who I am             skills      what I work with
  pages       list the pages       goto &lt;page&gt; open a page
  projects    list my projects     open &lt;n&gt;    open project n (with demo)
  epq         my EPQ in brief      school      education
  plc &lt;cmd&gt;   start | stop | estop | reset | status   (Control room)
  github      repo stats           contact     how to reach me
  theme [x]   list or set a theme  mode &lt;m&gt;    light | dark | system
  neofetch    system info          clear / exit`,
    about: () => `<span class="acc">${esc(D.name)}</span> <span class="dim">(@${esc(D.handle)})</span>\n${esc(D.bio)}\n<span class="dim">Based in ${esc(D.location)}</span>`,
    whoami: () => esc(user),
    pages: () => PAGES.map((p) => `  ${p.id === PAGE ? '<span class="acc">●</span>' : " "} ${p.id.padEnd(10)} <span class="dim">${p.blurb}</span>`).join("\n"),
    ls: () => PAGES.map((p) => href(p.id)).join("  "),
    cd: (a) => CMDS.goto(a),
    goto: (a) => { const k = (a || "").toLowerCase().replace(/\.html$/, ""); const p = PAGES.find((x) => x.id === k || x.label.toLowerCase() === k || (k === "home" && x.id === "index")); if (!p) return `goto: pages are ${PAGES.map((x) => x.id).join(", ")}`; closeThen(() => goPage(p.id)); return `Opening ${p.label}…`; },
    skills: () => (D.skills || []).map((g) => `<span class="acc2">${esc(g.group)}</span>\n` + g.items.map((s) => `  ${esc(s.name.padEnd(30))} ${"█".repeat(Math.round(s.level / 10))}<span class="dim">${"░".repeat(10 - Math.round(s.level / 10))}</span>`).join("\n")).join("\n"),
    projects: () => projects.map((p, i) => `  <span class="acc">${i + 1}</span>  ${esc(p.title.padEnd(26))} <span class="dim">${esc(p.category)} · ${p.year}${p.demo ? " · demo" : ""}</span>`).join("\n") + `\n<span class="dim">Type "open 1" to see details.</span>`,
    open: (a) => { const n = parseInt(a, 10) - 1; const p = projects[n] ?? projects.find((x) => x.title.toLowerCase() === (a || "").toLowerCase()); if (!p) return `open: no project "${esc(a || "")}". Try "projects".`; closeThen(projectRun(p)); return `Opening ${esc(p.title)}…`; },
    epq: () => D.epq ? `<span class="acc">${esc(D.epq.qualification)}</span>\n  Q: ${esc(D.epq.question)}\n  Stage: ${esc(D.epq.stage)} (${esc(D.epq.asOf)}) · hand-in ${esc(D.epq.handIn)}\n<span class="dim">Type "goto epq" for the full page.</span>` : "No EPQ yet.",
    school: () => D.education ? `<span class="acc">${esc(D.education.school)}</span> <span class="dim">${esc(D.education.stage)}</span>\n` + D.education.subjects.map((s) => `  ${esc(s.name.padEnd(24))} <span class="dim">${esc(s.board)}</span>`).join("\n") : "",
    plc: (a) => {
      if (!factory) return `The PLC lives in the Control room. Type <span class="acc">goto control</span>.`;
      const k = (a || "status").toLowerCase();
      if (k === "status") { const s = factory.state(); return `  State   <span class="acc">${s.state}</span>\n  Motor   ${s.motor ? '<span class="acc">ON</span>' : "OFF"}\n  E_Stop  ${s.estop ? '<span class="acc2">LATCHED</span>' : "released"}\n  Bins    A ${s.counts.a} · B ${s.counts.b} · C ${s.counts.c}`; }
      if (!["start", "stop", "estop", "reset"].includes(k)) return "Usage: plc start | stop | estop | reset | status";
      factory.press(k); return `${k.toUpperCase()} sent to the PLC.`;
    },
    github: () => { if (!GH) return "GitHub data isn't loaded."; const s = stats(GH); return `  repos          ${GH.user.repos}\n  contributions  ${nf.format(s.total)}\n  languages      ${s.langs}\n  since          ${monthYear(GH.user.created)}\n  <a href="${esc(GH.user.url)}" target="_blank" rel="noopener">${esc(GH.user.url)}</a>`; },
    contact: () => `  email   <span class="acc">${esc(D.email)}</span>\n` + (D.socials || []).map((s) => `  ${esc(s.label.toLowerCase().padEnd(8))}<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a>`).join("\n"),
    theme: (a) => { if (!a) return PRESETS.map((p) => `  ${p.id === T.preset ? '<span class="acc">●</span>' : " "} ${p.id}`).join("\n") + `\n<span class="dim">Usage: theme ocean</span>`; return setPreset(a.toLowerCase()) ? `Theme set to ${esc(a)}.` : `theme: unknown theme "${esc(a)}"`; },
    mode: (a) => { if (!["light", "dark", "system"].includes(a)) return "Usage: mode light | dark | system"; setMode(a); return `Mode set to ${a}.`; },
    neofetch: () => {
      const art = ["  ┌─────────┐ ", "  │ ▣ ▣ ▣ ▣ │ ", "  │ RUN ● ○ │ ", "  │ ▤▤▤▤▤▤▤ │ ", "  └─┬─┬─┬─┬─┘ ", "    ╵ ╵ ╵ ╵   ", "              "];
      const s = GH ? stats(GH) : null;
      const info = [`<span class="acc">${esc(user)}</span>@<span class="acc">portfolio</span>`, "─".repeat(user.length + 10), `<span class="acc2">Name</span>: ${esc(D.name)}`, `<span class="acc2">School</span>: ${esc(D.education?.school || "")}`, `<span class="acc2">EPQ</span>: hexapod + reinforcement learning`, `<span class="acc2">PLCs</span>: B&R, Siemens S5, S7`, `<span class="acc2">Repos</span>: ${GH ? GH.user.repos : "?"}${s ? ` · ${s.langs} languages` : ""}`];
      return info.map((l, i) => `<span class="acc">${art[i] || " ".repeat(14)}</span> ${l}`).join("\n");
    },
    date: () => new Date().toString(),
    echo: (a) => esc(a || ""),
    history: () => hist.map((h, i) => `  ${i + 1}  ${esc(h)}`).join("\n"),
    sudo: (a) => (/hire/.test(a || "") ? (closeThen(() => goPage("contact")), "Permission granted. Taking you to the contact page…") : `${esc(user)} is not in the sudoers file. This incident will be reported.`),
    hire: () => CMDS.sudo("hire"),
    clear: () => { out.innerHTML = ""; return null; },
    exit: () => { term.close(); return null; }
  };
  function runCmd(raw) {
    const line = raw.trim();
    print(`<span class="acc">${esc(PS)}</span> ${esc(line)}`);
    if (!line) return;
    hist.push(line); hi = hist.length; store.set("pf-hist", hist.slice(-50));
    const [cmd, ...rest] = line.split(/\s+/);
    const fn = CMDS[cmd.toLowerCase()];
    const res = fn ? fn(rest.join(" ")) : `command not found: ${esc(cmd)}. Type <span class="acc">help</span>.`;
    if (res) print(res);
  }
  function openTerm() {
    if (!out.innerHTML) print(`<span class="acc">Welcome to ${esc(D.name)}'s terminal.</span>\n<span class="dim">Type</span> help <span class="dim">to see what you can do, or try</span> pages<span class="dim">.</span>\n`);
    term.showModal(); tin.focus();
  }
  $("#termForm").addEventListener("submit", (e) => { e.preventDefault(); runCmd(tin.value); tin.value = ""; });
  tin.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); if (hi > 0) tin.value = hist[--hi]; }
    else if (e.key === "ArrowDown") { e.preventDefault(); hi = Math.min(hist.length, hi + 1); tin.value = hist[hi] || ""; }
    else if (e.key === "Tab") { e.preventDefault(); const m = Object.keys(CMDS).filter((k) => k.startsWith(tin.value)); if (m.length === 1) tin.value = m[0] + " "; else if (m.length) print(m.join("  ")); }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); out.innerHTML = ""; }
  });
  $("#termClose").addEventListener("click", () => term.close());
  term.addEventListener("click", (e) => { if (e.target === term) term.close(); else if (!getSelection().toString()) tin.focus(); });
  $("#btnTerminal").addEventListener("click", openTerm);

  /* ------------------------------------------------------------- shortcuts */
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.open ? pal.close() : openPal(); return; }
    if (isTyping() || document.querySelector("dialog[open]")) return;
    if (e.key === "`") { e.preventDefault(); openTerm(); }
    else if (e.key === "/" && $("#projSearch")) { e.preventDefault(); $("#projSearch").focus(); }
    else if (e.key === "Escape" && !studio.hidden) toggleStudio(false);
    else if (/^[1-7]$/.test(e.key) && e.altKey) { e.preventDefault(); goPage(PAGES[+e.key - 1].id); }
  });
})();
