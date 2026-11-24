/* ==========================================================================
   PORTFOLIO CONTENT - edit this file only.
   Everything on the site (name, projects, skills, timeline...) comes from here.
   ========================================================================== */

window.PORTFOLIO = {
  // ---- Identity -----------------------------------------------------------
  name: "Jihan Lee",
  handle: "jhleez1",
  initials: "JL",
  avatar: "",                       // e.g. "me.jpg" next to index.html. Empty = initials
  roles: ["Student", "PLC programmer", "Automation engineer in training", "Structured Text coder", "Siemens STEP 7 tinkerer", "Python & C developer", "Builder of space simulators"],
  // Wrap words in *stars* to give them the gradient highlight.
  headline: "I program the machines that *build everything else.*",
  bio: "Student into industrial automation: Structured Text on B&R PLCs, plus Siemens STEP 5 and STEP 7. I also write Python, C and JavaScript, and have built everything from a Sudoku solver that runs on a PLC to my own web browser.",
  languages: ["EN", "KO"],          // spoken languages
  location: "Tonbridge, UK",
  timezone: "Europe/London",
  clocks: [
    { city: "Tonbridge", tz: "Europe/London" },
    { city: "Seoul", tz: "Asia/Seoul" },
    { city: "New York", tz: "America/New_York" }
  ],

  // ---- Education ------------------------------------------------------------
  education: {
    school: "Tonbridge School",
    place: "Tonbridge, Kent, UK",
    stage: "Year 12 (Sixth Form)",
    subjects: [
      { name: "Computer Science", board: "AQA" },
      { name: "Mathematics", board: "OCR (MEI)" },
      { name: "Further Mathematics", board: "OCR (MEI)" },
      { name: "Physics", board: "Eduqas" },
      { name: "Extended Project (EPQ)", board: "AQA" }
    ]
  },
  availability: { open: true, text: "Open to automation internships" },

  // ---- GitHub ---------------------------------------------------------------
  github: "jhleez1",
  // GitHub guesses languages from file extensions and gets B&R files wrong:
  // .st -> Smalltalk, .fun -> Standard ML, .prg -> xBase. They are all Structured Text.
  githubLanguageNames: { Smalltalk: "Structured Text", "Standard ML": "Structured Text", xBase: "Structured Text" },

  // ---- Contact --------------------------------------------------------------
  email: "jihanlee155@gmail.com",
  socials: [
    { label: "GitHub", url: "https://github.com/jhleez1", icon: "github" }
  ],

  // ---- "Now" ----------------------------------------------------------------
  now: {
    building:  "A conveyor sorting station in B&R Automation Studio",
    learning:  "Siemens TIA Portal and OPC UA",
    reading:   "Programmable Logic Controllers by Frank Petruzella",
    listening: "Whatever keeps the ladder logic flowing"
  },

  // ---- Quick numbers in the hero (count up on load) -------------------------
  facts: [
    { value: 3, suffix: "", label: "PLC platforms" },
    { value: 5, suffix: "+", label: "programming languages" },
    { value: 2023, suffix: "", label: "writing code since", plain: true }
  ],

  // ---- Skills (level 0-100 draws the meter) ---------------------------------
  skills: [
    { group: "Industrial automation", icon: "cpu", items: [
      { name: "Structured Text (B&R)", level: 80 },
      { name: "Siemens STEP 7 (STL / LAD)", level: 70 },
      { name: "Siemens STEP 5", level: 60 },
      { name: "B&R Automation Studio", level: 75 },
      { name: "PLC I/O & wiring basics", level: 55 } ] },
    { group: "Programming", icon: "code", items: [
      { name: "Python", level: 80 },
      { name: "C", level: 65 },
      { name: "JavaScript", level: 70 },
      { name: "STL (assembly-style)", level: 65 },
      { name: "HTML & CSS", level: 75 } ] },
    { group: "Apps & tools", icon: "terminal", items: [
      { name: "Electron", level: 60 },
      { name: "Canvas & simulations", level: 65 },
      { name: "Git & GitHub", level: 65 },
      { name: "VS Code", level: 80 },
      { name: "VNC & Watch debugging", level: 65 } ] },
    { group: "Engineering", icon: "bolt", items: [
      { name: "Algorithms & backtracking", level: 70 },
      { name: "Ladder logic design", level: 65 },
      { name: "State machines", level: 70 },
      { name: "Technical English & Korean", level: 85 },
      { name: "Reading electrical schematics", level: 50 } ] }
  ],

  // ---- Projects ---------------------------------------------------------------
  // demo: sudoku | factory | orbits | browser | traffic | flags  (playable demo in the popup)
  // Projects marked IDEA are suggestions that are not on GitHub yet.
  projects: [
    {
      title: "PLC Sudoku Solver",
      year: 2025, category: "Automation", featured: true, demo: "sudoku",
      summary: "A Sudoku solver written in Structured Text that runs on a B&R PLC.",
      details: "PLCs are built to run conveyors and valves, not puzzles. This program reads a puzzle from a text file, then solves it with backtracking. PLCs have no recursion, so it keeps its own stack: every guess pushes a copy of the board, and every dead end pops back to the last good one. You watch it solve live through VNC and Automation Studio's Watch window.",
      highlights: ["Backtracking with a hand-built stack of board states", "Reads puzzles from a file, Unicode or ASCII", "Split into functions: checkNum, checkCell, push, pop"],
      stack: ["Structured Text", "B&R Automation Studio", "IEC 61131-3"],
      links: { code: "https://github.com/jhleez1/Structured-Text-ST-language-PLC-Sudoku-Solver" }
    },
    {
      title: "Conveyor Sorter",
      year: 2026, category: "Automation", demo: "factory",
      summary: "A B&R Structured Text program that sorts parts by colour, with a browser simulator.",
      details: "A colour sensor identifies each part, and two pushers knock red and blue parts into their bins. The pushers sit further down the belt, so the program tracks every part by encoder count in a ring buffer and fires a pusher when the belt has carried its part into place. Speed changes and stops can't confuse it. The emergency stop latches until reset. The browser simulator runs a line-for-line port of the same logic, with unit tests.",
      highlights: ["Encoder-based part tracking with fixed-size ring buffers", "IDLE / RUNNING / FAULT state machine; E-STOP latches until Reset", "Same logic runs in the browser, covered by tests"],
      stack: ["Structured Text", "B&R Automation Studio", "JavaScript"],
      links: { code: "https://github.com/jhleez1/conveyor-sorter", demo: "https://jhleez1.github.io/conveyor-sorter/" }
    },
    {
      title: "Space Sim",
      year: 2026, category: "Software", demo: "orbits",
      summary: "A solar system simulator with planet facts and live orbits.",
      details: "Interactive simulation of the planets and some stars. Click a body to read about it and watch the orbits play out.",
      highlights: ["Animated orbits for every planet", "Info panel for each planet and star", "Runs in any browser"],
      stack: ["JavaScript", "HTML Canvas", "CSS"],
      links: { code: "https://github.com/jhleez1/Space-Sim" }
    },
    {
      title: "Web Browser",
      year: 2025, category: "Software", demo: "browser",
      summary: "My own desktop web browser built with Electron.",
      details: "A working browser with a URL bar, tabs you can open and close, back, forward and refresh, a custom homepage, bookmarks and history, all styled with a neon theme.",
      highlights: ["Multiple tabs", "Bookmarks and history saved as JSON", "Custom neon homepage"],
      stack: ["Electron", "JavaScript", "HTML", "CSS"],
      links: { code: "https://github.com/jhleez1/Web-Browser" }
    },
    {
      title: "Traffic Light Controller",
      year: 2026, category: "Automation", demo: "traffic",
      summary: "A junction with a pedestrian crossing, programmed in Siemens STEP 7 STL.",
      details: "A seven-step light sequence with a latched pedestrian request and a night mode with flashing amber, written in STL for an S7-300. To test it without a PLC, I wrote a small S7 CPU emulator in JavaScript that runs the real .awl source scan by scan. The web page shows which lines ran in the last scan, and you can edit the program and reload it. The same controller is also written in Structured Text for comparison.",
      highlights: ["Jump list (JL) and S5 timer step sequencer in STL", "S7 emulator: bit logic, timers, jumps, clock memory", "Tests run the real OB1.awl and check every step and timing"],
      stack: ["STEP 7", "STL", "Structured Text", "JavaScript"],
      links: { code: "https://github.com/jhleez1/traffic-light-controller", demo: "https://jhleez1.github.io/traffic-light-controller/" }
    },
    {
      title: "Flag Drawer",
      year: 2025, category: "Software", demo: "flags",
      summary: "Type a country and Python's turtle draws its flag.",
      details: "Enter the name of a country and the program draws its three-stripe flag with turtle graphics. A dictionary holds each country's colours, and one function draws any of them.",
      highlights: ["8 countries in a dictionary", "One reusable draw function", "Turtle graphics"],
      stack: ["Python", "turtle"],
      links: { code: "https://github.com/jhleez1/Python_Flag_Drawer" }
    },
    {
      title: "st-tidy",
      year: 2026, category: "Software",
      summary: "A formatter and linter for Structured Text, for B&R and CODESYS projects.",
      details: "Automation Studio has no auto-formatter, so I built one. It re-indents IF, CASE, loops and VAR blocks, upper-cases keywords and fixes spacing, but never touches comments or strings. It also catches mistakes before they reach the PLC: an END_IF that closes a CASE, a missing semicolon, or \"=\" where \":=\" was meant. I tested it on my Sudoku solver.",
      highlights: ["Lexer, block analysis, formatter and linter", "--check mode for CI; keeps Windows line endings and encodings", "Pure Python with no dependencies, 33 tests"],
      stack: ["Python", "Structured Text", "CLI"],
      links: { code: "https://github.com/jhleez1/st-tidy" }
    },
    {
      title: "revise",
      year: 2026, category: "Software",
      summary: "Offline flashcards with spaced repetition and a focus timer, for revising A-levels.",
      details: "A study app that works offline and keeps data on your device. You grade each card Again, Hard, Good or Easy, and a simplified SM-2 algorithm (the one behind Anki) decides when you see it again. It also has a 25/5 focus timer, a streak and a 30-day chart, and comes with A-level Physics and Computer Science decks.",
      highlights: ["Spaced repetition scheduler with unit tests", "Installable, works offline (service worker)", "Paste cards from a spreadsheet; backup and restore"],
      stack: ["JavaScript", "PWA", "HTML", "CSS"],
      links: { code: "https://github.com/jhleez1/revise", demo: "https://jhleez1.github.io/revise/" }
    },
    {
      // IDEA - not on GitHub yet
      title: "PLC Live Dashboard",
      year: 2026, category: "Automation",
      summary: "A Python dashboard that reads live PLC values over OPC UA.",
      details: "Connects to a PLC's OPC UA server, reads tags such as motor states, counters and temperatures, and charts them live in the browser.",
      highlights: ["Live charts of PLC tags", "Alarm when a value goes out of range", "Works with B&R and Siemens"],
      stack: ["Python", "OPC UA", "JavaScript"],
      links: {}
    }
  ],

  // ---- EPQ (Extended Project Qualification) ----------------------------------
  // Source: Jihan's Obsidian vault (Hexapod EPQ). Plans and facts only; add results when trials happen.
  epq: {
    qualification: "AQA Extended Project Qualification",
    title: "Hexapod robot: learned walking vs the tripod gait",
    question: "Can a reinforcement learning controller make a small hexapod robot walk more energy-efficiently than the standard tripod gait?",
    oneLine: "Build a small 3D-printed six-legged robot and test whether a controller learned by reinforcement learning can make it walk using less energy per metre than the standard hand-designed tripod gait.",
    format: "Research-based investigation written up as a report of about 5,000 words, plus a presentation. The robot is the apparatus for the experiment, not the product being assessed.",
    stage: "Setup and prototype leg",
    asOf: "November 2026",
    handIn: "June 2027",
    variables: [
      { kind: "Independent", what: "The controller", detail: "The standard tripod gait (baseline) or a reinforcement learning policy: a small neural network." },
      { kind: "Dependent", what: "Energy per metre", detail: "Electrical energy drawn by the servos, measured with a current/voltage sensor, divided by distance walked. Also expressed as cost of transport." },
      { kind: "Controlled", what: "Everything else", detail: "Same robot, surface, supply voltage, distance and body mass, with repeated trials." }
    ],
    method: [
      { step: "Research", text: "Legged locomotion and gaits, cost of transport, reinforcement learning (MDPs, policy gradients, PPO), sim-to-real transfer and domain randomisation, neuroevolution for the fallback." },
      { step: "Simulation", text: "A MuJoCo model of the hexapod built from the real leg dimensions and weighed part masses, wrapped as a Gymnasium environment. Reward = forward progress minus an energy penalty, with penalties for falling or drifting. PPO trained with Stable-Baselines3 against a tripod-gait baseline." },
      { step: "Real robot", text: "18 MG90S servos (6 legs × 3), driven by an ESP32 and two PCA9685 boards. Both controllers walk the same track, alternating A-B-A-B, while an INA219 logs the servo energy." },
      { step: "Analysis", text: "Mean, standard deviation and 95% confidence interval; Welch's t-test (or Mann-Whitney U) with effect size; simulated vs real energy per metre to measure the sim-to-real gap." }
    ],
    gates: [
      { id: "G0", name: "Setup done", date: "2026-11-20", test: "Parts checked, fit test fits a real servo, dual-credit reply recorded" },
      { id: "G1", name: "Prototype leg works", date: "2026-11-30", test: "All 3 joints move within safe limits; INA219 readings stream to CSV" },
      { id: "G2", name: "Simulation baseline", date: "2026-12-31", test: "MuJoCo model walks a tripod gait; simulated J/m computed" },
      { id: "G3", name: "Real robot walks", date: "2027-01-31", test: "18-servo robot completes the track on tripod with no resets" },
      { id: "G4", name: "RL checkpoint", date: "2027-02-28", test: "Sim: 2 m without falling in 8/10 randomised episodes. Real: completes the track in 3/5 attempts" },
      { id: "G5", name: "Data collected", date: "2027-04-30", test: "Planned trials logged for both controllers; analysis done" },
      { id: "G6", name: "Full draft", date: "2027-05-31", test: "About 5,000-word draft to supervisor" },
      { id: "G7", name: "Hand-in", date: "2027-06-30", test: "Report, production log and presentation" }
    ],
    checkpoint: {
      date: "28 February 2027",
      pass: "Continue with PPO: real trials in March and April, PPO vs tripod.",
      fail: "Switch to neuroevolution: evolve the same network with the same reward in March, then trials in April.",
      neither: "If neither transfers by 31 March, compare all controllers in simulation plus the real tripod data. The sim-to-real gap becomes a central finding."
    },
    questionHistory: [
      { title: "Drone swarm", note: "Emergent behaviour with up to 7 small indoor drones. Set aside: too complex and a risk of overlapping A-level content.", dropped: true },
      { title: "Teacher feedback", note: "The early pitches had no clear question, measurement or interesting outcome." },
      { title: "A small legged robot", note: "Inspired by the MIT Cheetah. A hexapod was chosen." },
      { title: "How many disabled legs before it stops walking straight?", note: "Dropped: no clear purpose.", dropped: true },
      { title: "Leg proportions (tibia/femur ratio)", note: "Dropped, even after designing five leg-ratio parts for it.", dropped: true },
      { title: "Evolutionary algorithm vs tripod gait", note: "A neural-network approach was suggested as a much stronger idea." },
      { title: "Reinforcement learning vs tripod gait", note: "Final question, with neuroevolution kept as the fallback.", current: true }
    ],
    hardware: [
      { part: "18 × MG90S servos", role: "Metal-gear micro servos, about 2.2-2.5 kg·cm. 3 per leg: hip, thigh, knee." },
      { part: "ESP32-WROOM-32", role: "Wi-Fi controller. Chosen over a Raspberry Pi: about 10 g vs 45 g, lower power, simpler real-time control." },
      { part: "2 × PCA9685", role: "16-channel PWM servo drivers over I2C." },
      { part: "INA219", role: "Current and voltage sensor in series with the servo supply: measures exactly the energy the experiment needs." },
      { part: "2S LiPo + 6 V 5 A UBEC", role: "Battery power for the full robot, separate from the ESP32 to avoid resets." },
      { part: "VL53L0X or light gates", role: "Automatic distance measurement, so no timing by hand." }
    ],
    leg: {
      designedIn: "Python with signed-distance functions (numpy), meshed with marching cubes (scikit-image) into STL files",
      version: "v4: each servo centred inside its joint, wrapped by a symmetric U-fork; paddle thigh with a cable channel; curved skeleton shin tapering from 22 mm to 14 mm",
      history: ["v1: legs too thin, single-sided joints", "v2: shin beside the thigh instead of inside the fork", "v3: too thick and asymmetric", "v4: symmetric U-fork, servos centred in their joints"],
      print: "Bambu Lab P2S, PLA, 0.2 mm layers, 3 walls, 15% gyroid infill. About 72 cm³ and 45-55 g per leg."
    },
    budget: "≈ £137-178",
    hours: 188,
    words: [["Abstract", 150], ["Introduction and aims", 400], ["Literature review", 1300], ["Method", 1000], ["Results", 700], ["Discussion and sim-to-real gap", 900], ["Evaluation and conclusion", 550]],
    integrity: "I write the core code myself: the simulation environment, the reward, the training script and the robot control. Any AI use is recorded in the production log.",
    sources: [
      { group: "Legged locomotion", items: ["Raibert (1986) Legged Robots That Balance", "Wilson (1966) Insect Walking", "Siegwart et al. (2011) Introduction to Autonomous Mobile Robots", "Ijspeert (2008) Central pattern generators for locomotion control", "Seok et al. (2015) Energy-efficient legged locomotion and the MIT Cheetah", "Tucker (1975) The energetic cost of moving about"] },
      { group: "Reinforcement learning", items: ["Sutton & Barto (2018) Reinforcement Learning: An Introduction", "Silver (2015) UCL Reinforcement Learning course", "Achiam (2018) Spinning Up in Deep RL", "Schulman et al. (2017) Proximal Policy Optimization Algorithms", "Kober et al. (2013) Reinforcement learning in robotics: a survey", "Goodfellow et al. (2016) Deep Learning"] },
      { group: "Learning to walk & sim-to-real", items: ["Haarnoja et al. (2019) Learning to walk via deep RL", "Hwangbo et al. (2019) Learning agile and dynamic motor skills", "Rudin et al. (2022) Learning to walk in minutes", "Tan et al. (2018) Sim-to-real: agile locomotion for quadrupeds", "Tobin et al. (2017) Domain randomization", "Peng et al. (2018) Sim-to-real with dynamics randomization"] },
      { group: "Fallback: neuroevolution", items: ["Salimans et al. (2017) Evolution strategies as a scalable alternative to RL", "Stanley & Miikkulainen (2002) NEAT", "Cully et al. (2015) Robots that can adapt like animals"] },
      { group: "Tools & hardware", items: ["Todorov et al. (2012) MuJoCo", "Towers et al. (2024) Gymnasium", "Raffin et al. (2021) Stable-Baselines3", "Espressif ESP32 datasheet", "NXP PCA9685 datasheet", "Texas Instruments INA219 datasheet"] }
    ]
  },

  // ---- Experience (shown at the top of Journey) ------------------------------
  experience: [
    {
      company: "GIAutomation",
      role: "Work experience",
      place: "Daejeon, Korea",
      date: "2025",
      points: ["Saw PLC control panels and production systems working on site", "Followed engineers through programming and testing", "Learned how I/O lists and electrical drawings connect to the code"]
    }
  ],

  // ---- Journey / timeline (newest first) ------------------------------------
  // type: start | learn | github | work | project
  timeline: [
    { date: "2026", type: "learn", title: "Started my EPQ: a hexapod that learns to walk", place: "AQA EPQ", text: "Reinforcement learning vs the tripod gait, measured in energy per metre." },
    { date: "2026", type: "project", title: "Space Sim and this portfolio", place: "JavaScript", text: "A solar system simulator with live orbits." },
    { date: "2025", type: "project", title: "Solved Sudoku on a PLC", place: "B&R · Structured Text", text: "Proved a controller built for factories can also solve puzzles." },
    { date: "2025", type: "project", title: "Built my own web browser", place: "Electron", text: "Tabs, navigation, bookmarks and history from scratch." },
    { date: "2025", type: "work", title: "Work experience at GIAutomation", place: "Daejeon, Korea", text: "Saw industrial automation on a real site." },
    { date: "2024", type: "learn", title: "Started Structured Text on B&R", place: "Automation Studio", text: "Moved from STL to the modern IEC 61131-3 language." },
    { date: "2024", type: "github", title: "Joined GitHub", place: "@jhleez1", text: "First commit in July 2024." },
    { date: "2023", type: "learn", title: "Discovered PLCs with Siemens STEP 5 & 7", place: "STL", text: "Learned assembly-style Statement List and fell for automation." },
    { date: "2023", type: "start", title: "Wrote my first programs", place: "Python", text: "Turtle graphics, small games and the first version of my flag drawer." }
  ],

  // ---- Setup ("uses") -------------------------------------------------------
  setup: [
    { label: "PLC IDE", value: "B&R Automation Studio" },
    { label: "Siemens", value: "SIMATIC Manager / STEP 7" },
    { label: "Editor", value: "VS Code" },
    { label: "Languages", value: "ST, STL, Python, C, JS" },
    { label: "Debugging", value: "VNC Viewer + Watch" },
    { label: "Code lives on", value: "GitHub" }
  ]
};
