/**
 * ---------------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH FOR ALL PORTFOLIO CONTENT
 * ---------------------------------------------------------------------------
 * Everything the desktop apps display comes from this file. Edit here, nowhere
 * else.
 *
 * Sourced from resume.pdf and projects.pdf (public/assets/). Every link below
 * was checked with a live HTTP request before being added — see the per-entry
 * notes for anything that needed a correction or a judgment call.
 * ---------------------------------------------------------------------------
 */

export const profile = {
  name: 'Shreyash Kolhe',
  // Resume header reads "Software Engineer — Backend & Applied AI"; kept short
  // here so the large hero title doesn't wrap to two lines, with the
  // specialisation carried separately in hero.roleKicker below.
  role: 'Software Engineer',
  tagline: 'Turning ideas into thoughtful digital experiences.',

  summary:
    'Backend engineer with hands-on Java/Spring Boot experience building REST APIs, '
    + 'microservices, and event-driven systems (Kafka); proven track record debugging '
    + 'production issues and shipping to cloud (AWS, GCP) with Docker.',

  intro: [
    'Backend engineer with hands-on Java/Spring Boot experience building REST APIs, microservices, and event-driven systems (Kafka); proven track record debugging production issues and shipping to cloud (AWS, GCP) with Docker.',
    'I care about readable code, honest error handling, and systems a teammate can pick up without a tour guide.',
  ],
  location: 'Pune, Maharashtra, India',
  status: 'Open to software engineering roles',
};

/**
 * THE LANDING PAGE — the first thing a visitor sees, over the wide room.
 * Every string here appears in the hero; nothing is repeated elsewhere.
 */
export const hero = {
  /* Rendered as two pieces with a CSS-drawn rule between them. The separator
     is deliberately NOT a character: Anurati has no dash, and one fallback
     glyph in the middle of a word mark reads as a mistake. */
  brandMark: 'SK',
  brandWord: 'workspace',
  greeting: "Hi, I'm",
  headline: 'Building with purpose',
  roleKicker: 'Backend Engineering & Applied AI',
  cta: 'Enter my desktop',
  navCta: 'Get in touch',
  /** Top-bar links. Each maps to an id in `contact` below; a link with no real
   *  URL there falls back to opening the Contact app inside the desktop, so it
   *  is never a dead end. */
  nav: [
    { id: 'github', label: 'Github' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'email', label: 'Mail' },
  ],
};

/**
 * SCROLL STATEMENTS — revealed one at a time as the camera moves toward the
 * monitor, each fading in and back out across its own slice of the scroll.
 *
 * `from`/`to` are scroll progress (0 = wide room, 1 = desktop). Keep them
 * clear of 0.88+, where the cross-fade and the desktop hand-over happen.
 */
export const statements = [
  {
    id: 'st-1',
    kicker: 'What I build',
    line: 'Systems that stay simple as they grow.',
    from: 0.20,
    to: 0.48,
  },
  {
    id: 'st-2',
    kicker: 'Where I build it',
    line: 'Everything I have shipped lives on the machine ahead.',
    from: 0.52,
    to: 0.80,
  },
];

/**
 * SCROLL GUIDE — reassurance for the stretch AFTER the last statement, where
 * nothing else is on screen.
 *
 * Statement 2 is gone by 0.80; the desktop does not wake until 0.999. Without
 * this, that is a 20-point span of scroll — a fifth of the whole journey —
 * where a visitor sees only the room quietly getting closer, with nothing
 * telling them a destination exists or that anything is still happening. That
 * silence is exactly what reads as "the page is stuck".
 *
 * Two short beats carry them the rest of the way: a plain nudge, then a sign
 * of progress that holds until the desktop wakes — timed so it hands straight
 * off to the boot screen's "You're in" rather than leaving a gap.
 */
export const scrollGuide = [
  { id: 'sg-1', text: 'Keep scrolling', sub: 'to enter my desktop', from: 0.80, to: 0.90 },
  { id: 'sg-2', text: 'Almost there', sub: 'just a little more', from: 0.90, to: 0.995 },
];

/** Shown as chips in the About window. Mirrors resume.pdf's own skill list. */
export const coreTech = [
  'Java', 'Spring Boot', 'Node.js (NestJS)', 'Python',
  'LangChain / LangGraph', 'Kafka', 'REST APIs', 'PostgreSQL',
  'AWS', 'Docker', 'React',
];

/**
 * EXPERIENCE — from resume.pdf.
 * Rendered in the Education window, above the Education timeline: the
 * timeline component is generic (period / role / org / detail), so a work
 * entry fits it without a second window or a new icon.
 */
export const experience = [
  {
    id: 'exp-1',
    role: 'Backend Developer Intern',
    org: 'CareerPhi (Remote)',
    period: 'Sep 2025 – Dec 2025',
    detail: [
      'Cut average API response latency 40% across 10K+ daily requests',
      'Reduced request payload overhead 35%, taking P95 response time from 800ms to 520ms',
      'Introduced a layered service architecture for long-term scalability and maintainability',
    ],
  },
];

/** EDUCATION — from resume.pdf. */
export const education = [
  {
    id: 'edu-1',
    credential: 'Master of Computer Applications (MCA)',
    institution: 'Savitribai Phule Pune University',
    period: '2024 – 2026',
    detail: [],
  },
  {
    id: 'edu-2',
    credential: 'Bachelor of Computer Applications (BCA)',
    institution: 'Sant Gadge Baba Amravati University',
    period: '2021 – 2024',
    detail: [],
  },
];

/**
 * PROJECTS — from projects.pdf. Every github/demo URL below was verified with
 * a live request before being added:
 *
 *  - LiftNShift's demo links to the site root, not the /login path projects.pdf
 *    gives — that path 404s (client-side routing on Vercel; the app itself is
 *    live). Root resolves cleanly.
 *  - Kadak FM's repo genuinely ends in a hyphen ("kadak-fm-") — checked both
 *    with and without it; only the hyphenated form resolves. Not a PDF
 *    extraction artifact.
 *  - Swypee and the AI Voice Agent have no URL in either source document, so
 *    github/demo are left null rather than guessed — the UI shows a disabled
 *    state instead of a dead link.
 *
 * `year` is intentionally blank: neither document dates the projects, and
 * that is not a number to invent.
 */
export const projects = [
  {
    id: 'liftnshift',
    name: 'LiftNShift — Home Relocation Platform',
    kind: 'Full-stack platform',
    year: '',
    summary: 'GPS-priced, slot-booked relocation platform with an event-driven post-payment flow.',
    description:
      'A full-stack relocation platform with GPS-based dynamic pricing, slot booking, and '
      + 'JWT-authenticated user/admin flows. Payments run through Razorpay with HMAC-SHA256 '
      + 'verification, and a Kafka pipeline (3 consumers) decouples booking confirmation from '
      + 'downstream tasks, including Gemini AI truck recommendations.',
    stack: ['Java', 'Spring Boot', 'React 18', 'MySQL', 'Redis', 'Kafka', 'Razorpay', 'JWT', 'Gemini AI', 'OpenRouteService'],
    features: [
      'Eliminated N+1 queries — 51 calls down to 1 per request',
      'Cut database load ~60% with Redis caching',
      'Prevented booking race conditions with DB-level constraints + @Retryable',
    ],
    github: 'https://github.com/Shreyashkolhe22/liftNshift',
    demo: 'https://lift-nshift.vercel.app/',
  },
  {
    id: 'swypee',
    name: 'Swypee — Pet-Social Platform',
    kind: 'Mobile + backend platform',
    year: '',
    summary: 'A React Native pet-social app with a hardened concurrent-write backend.',
    description:
      'A full-stack pet-social platform built with React Native/Expo and a NestJS backend. '
      + 'Diagnosed a production data-loss bug traced to a non-atomic MongoDB read-modify-write '
      + 'race under concurrent uploads and replaced it with atomic operations. Also root-caused '
      + 'a native Android OAuth failure to a signing-certificate mismatch and owned the release '
      + 'pipeline end to end.',
    stack: ['React Native', 'Expo', 'MongoDB', 'Redis', 'Socket.IO', 'Docker', 'Google Cloud', 'Gemini API'],
    features: [
      'Fixed a multi-threaded MongoDB race causing silent upload loss',
      'Root-caused an Android OAuth certificate mismatch via SHA-1 cross-referencing',
      'Owned CI/CD via Cloud Build → Cloud Run',
    ],
    github: null, // not given in either source document
    demo: null,
  },
  {
    id: 'ai-voice-agent',
    name: 'AI Voice Agent',
    kind: 'AI voice agent — production',
    year: '',
    summary: 'A production voice agent with real-time speech, RAG, and a from-scratch eval harness.',
    description:
      'An end-to-end AI voice agent live in production, with LangGraph orchestrating '
      + 'conversation state, tool use, and context across concurrent sessions. Real-time speech '
      + 'runs over WebSocket via Deepgram STT/TTS, and the RAG pipeline is grounded strictly in '
      + 'verified domain data — RBAC, full audit logging, and prompt guardrails hold it to a '
      + 'zero hallucination rate in production.',
    stack: ['Python', 'LangGraph', 'RAG', 'Deepgram', 'OpenAI API', 'Claude API', 'NestJS', 'WebSocket', 'PostgreSQL', 'Docker', 'AWS'],
    features: [
      'Zero hallucination rate in production, via RAG + guardrails',
      'Built the eval harness from scratch — adversarial cases, LLM-as-judge, regression detection',
      'RBAC and full audit logging across concurrent sessions',
    ],
    github: null, // no URL given in either source document
    demo: null,
  },
  {
    id: 'fitfuel',
    name: 'FitFuel — Nutrition Tracker',
    kind: 'Web application',
    year: '',
    summary: 'A Spring MVC nutrition tracker for logging daily food and nutritional intake.',
    description:
      'A nutrition tracking web application built with Java, Spring Boot MVC, JSP and Hibernate. '
      + 'Food and nutrition management runs through an MVC architecture with JPA/Hibernate '
      + 'persistence, behind a responsive interface for tracking daily intake.',
    stack: ['Java', 'Spring Boot MVC', 'JSP', 'Hibernate', 'MySQL'],
    features: [
      'MVC architecture with JPA/Hibernate persistence',
      'Responsive interface for daily nutrition tracking',
    ],
    github: 'https://github.com/Shreyashkolhe22/fitfuel',
    demo: 'https://fitfuel-latest.onrender.com/dashboard',
  },
  {
    id: 'kadak-fm',
    name: 'Kadak FM — Audio Player',
    kind: 'Client-side web app',
    year: '',
    summary: 'A chai-tapri themed, 100% client-side audio player.',
    description:
      'A single-page audio player built with React and Vite, themed after an Indian roadside '
      + 'chai tapri. Playlist management, track playback and custom cover art sit behind a '
      + 'responsive, animated interface — the whole thing is a 100% client-side static app, '
      + 'built for a one-step deploy to Vercel or Netlify.',
    stack: ['React', 'Vite', 'JavaScript', 'HTML', 'CSS'],
    features: [
      'Playlist management and track playback with custom cover art',
      '100% client-side static app — no backend to deploy',
    ],
    github: 'https://github.com/Shreyashkolhe22/kadak-fm-',
    demo: 'https://kadak-fm.vercel.app/',
  },
];

/**
 * SKILLS — grouped, deliberately without invented proficiency percentages.
 * `level` is a keyword, not a number:
 *   'core'      — reach for it daily / cited as a resume headline
 *   'working'   — comfortable, have shipped with it
 *   'familiar'  — used it, would need a warm-up
 * Categories mirror resume.pdf's own grouping.
 */
export const skills = [
  {
    category: 'Programming',
    items: [
      { name: 'Java', level: 'core' },
      { name: 'Python', level: 'working' },
      { name: 'JavaScript', level: 'working' },
      { name: 'SQL', level: 'core' },
    ],
  },
  {
    category: 'Backend & Systems',
    items: [
      { name: 'Spring Boot', level: 'core' },
      { name: 'Node.js (NestJS)', level: 'working' },
      { name: 'REST APIs', level: 'core' },
      { name: 'Microservices', level: 'working' },
      { name: 'Kafka', level: 'working' },
      { name: 'Redis', level: 'working' },
      { name: 'WebSocket', level: 'familiar' },
    ],
  },
  {
    category: 'Database',
    items: [
      { name: 'PostgreSQL', level: 'working' },
      { name: 'MySQL', level: 'working' },
      { name: 'MongoDB', level: 'working' },
    ],
  },
  {
    category: 'Frontend',
    items: [
      { name: 'React', level: 'working' },
      { name: 'HTML5 / CSS3', level: 'working' },
    ],
  },
  {
    category: 'Cloud & Infra',
    items: [
      { name: 'AWS (EC2, RDS, Lambda, ECS)', level: 'working' },
      { name: 'Docker', level: 'working' },
      { name: 'Google Cloud', level: 'familiar' },
    ],
  },
  {
    category: 'Tools & Practices',
    items: [
      { name: 'Git', level: 'core' },
      { name: 'Postman', level: 'working' },
      { name: 'CI/CD', level: 'working' },
      { name: 'Agile / Scrum', level: 'working' },
      { name: 'Design Patterns', level: 'working' },
    ],
  },
  {
    category: 'AI & Agents',
    items: [
      { name: 'LangChain', level: 'core' },
      { name: 'LangGraph', level: 'core' },
      { name: 'RAG', level: 'core' },
      { name: 'Semantic Search', level: 'working' },
      { name: 'Vector Databases', level: 'working' },
      { name: 'Prompt Guardrails & Evals', level: 'working' },
    ],
  },
];

/**
 * RESUME
 * File lives at public/assets/resume.pdf; `download` (in ResumeWindow) saves
 * it locally under `fileName` regardless of that path, so the two can differ.
 */
export const resume = {
  file: '/assets/resume.pdf',
  fileName: 'Shreyash_Kolhe_Resume.pdf',
  updated: 'September 2026',
  highlights: [
    'Backend Developer Intern at CareerPhi — cut average API latency 40% across 10K+ daily requests',
    'Shipped an end-to-end AI voice agent to production with a zero hallucination rate',
    'Built LiftNShift, an event-driven relocation platform that cut DB load ~60% via Redis caching',
  ],
};

/** CONTACT — from resume.pdf / projects.pdf, each link checked live. */
export const contact = [
  { id: 'email', label: 'Email', value: 'shreyashkolhe23@gmail.com', href: 'mailto:shreyashkolhe23@gmail.com' },
  { id: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/shreyash-kolhe22', href: 'https://www.linkedin.com/in/shreyash-kolhe22/' },
  { id: 'github', label: 'GitHub', value: 'github.com/Shreyashkolhe22', href: 'https://github.com/Shreyashkolhe22' },
];

/** NOTES — default text shown in the Notes app. */
export const notes = [
  '~/notes/readme.md',
  '',
  'PLACEHOLDER — this is your scratchpad.',
  '',
  '  - Things I am learning right now',
  '  - A problem I enjoyed solving recently',
  '  - What I want to work on next',
  '',
  'Edits here live only for the session; change the default',
  'text in src/data/portfolio.js.',
].join('\n');

/** RECYCLE BIN — personality only. */
export const recycleBin = [
  { name: 'bad_code.txt', size: '2.4 MB', note: 'Worked on my machine.' },
  { name: 'bugs_final_FINAL.txt', size: '813 KB', note: 'Superseded by bugs_final_FINAL_v2.txt.' },
  { name: 'my_sleep_schedule.exe', size: '0 bytes', note: 'Corrupted. Unrecoverable.' },
  { name: 'unfinished_project.zip', size: '48 MB', note: 'Last modified: a long time ago.' },
  { name: 'it_works_dont_touch.sh', size: '1 KB', note: 'Nobody knows what it does.' },
  { name: 'temp_final_v9_real.sql', size: '19 MB', note: 'Ran in production once. Once.' },
];
