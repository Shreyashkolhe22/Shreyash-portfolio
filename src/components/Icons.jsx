/**
 * Hand-rolled SVG icon set. Line-drawn, single stroke weight, no icon library.
 * Every icon draws on `currentColor` so hover/active states are pure CSS.
 */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const IconAbout = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8.2" r="3.6" />
    <path d="M4.8 20c.6-3.8 3.5-5.8 7.2-5.8s6.6 2 7.2 5.8" />
  </svg>
);

export const IconEducation = (p) => (
  <svg {...base} {...p}>
    <path d="M12 4 2.8 8.6 12 13.2l9.2-4.6L12 4Z" />
    <path d="M6.6 10.9v4.7c0 1.6 2.4 2.9 5.4 2.9s5.4-1.3 5.4-2.9v-4.7" />
    <path d="M21.2 8.6v5.1" />
  </svg>
);

export const IconProjects = (p) => (
  <svg {...base} {...p}>
    <path d="M3 7.4a1.6 1.6 0 0 1 1.6-1.6h3.7l1.9 2.2h8.2A1.6 1.6 0 0 1 20 9.6v8A1.6 1.6 0 0 1 18.4 19H4.6A1.6 1.6 0 0 1 3 17.4V7.4Z" />
    <path d="M3 11h17" />
  </svg>
);

export const IconSkills = (p) => (
  <svg {...base} {...p}>
    <path d="m9 8-4 4 4 4" />
    <path d="m15 8 4 4-4 4" />
    <path d="M13.4 5.6 10.6 18.4" />
  </svg>
);

export const IconResume = (p) => (
  <svg {...base} {...p}>
    <path d="M6 3.2h7.4L18.6 8v12.8H6V3.2Z" />
    <path d="M13.2 3.4V8.2h5" />
    <path d="M8.8 12.6h6.4M8.8 15.6h6.4M8.8 9.6h2.6" />
  </svg>
);

export const IconContact = (p) => (
  <svg {...base} {...p}>
    <rect x="2.8" y="5.4" width="18.4" height="13.2" rx="1.8" />
    <path d="m3.4 7 8.6 6 8.6-6" />
  </svg>
);

export const IconRecycle = (p) => (
  <svg {...base} {...p}>
    <path d="M4.6 6.8h14.8" />
    <path d="M9.2 6.8V4.9c0-.6.5-1.1 1.1-1.1h3.4c.6 0 1.1.5 1.1 1.1v1.9" />
    <path d="M6.4 6.8 7.5 19a1.6 1.6 0 0 0 1.6 1.4h5.8a1.6 1.6 0 0 0 1.6-1.4l1.1-12.2" />
    <path d="M10.4 10.6v5.8M13.6 10.6v5.8" />
  </svg>
);

export const IconTerminal = (p) => (
  <svg {...base} {...p}>
    <rect x="2.8" y="4.4" width="18.4" height="15.2" rx="2" />
    <path d="m6.8 9.6 3 2.8-3 2.8" />
    <path d="M12.6 15.4h4.4" />
  </svg>
);

export const IconNotes = (p) => (
  <svg {...base} {...p}>
    <path d="M5.4 3.8h13.2v16.4H5.4z" />
    <path d="M8.6 8.2h6.8M8.6 11.6h6.8M8.6 15h4.2" />
  </svg>
);

export const IconStart = (p) => (
  <svg {...base} {...p}>
    <path d="M4.2 4.6h6.2v6.2H4.2zM13.6 4.6h6.2v6.2h-6.2zM4.2 13.2h6.2v6.2H4.2zM13.6 13.2h6.2v6.2h-6.2z" />
  </svg>
);

export const IconSearch = (p) => (
  <svg {...base} {...p}>
    <circle cx="10.8" cy="10.8" r="6.2" />
    <path d="m15.4 15.4 4 4" />
  </svg>
);

export const IconSettings = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.2 14.4a1.5 1.5 0 0 0 .3 1.7l.1.1a1.8 1.8 0 1 1-2.6 2.6l-.1-.1a1.5 1.5 0 0 0-2.6 1.1v.2a1.8 1.8 0 1 1-3.6 0v-.1a1.5 1.5 0 0 0-2.6-1.1l-.1.1a1.8 1.8 0 1 1-2.6-2.6l.1-.1a1.5 1.5 0 0 0-1.1-2.6h-.2a1.8 1.8 0 0 1 0-3.6h.1a1.5 1.5 0 0 0 1.1-2.6l-.1-.1a1.8 1.8 0 1 1 2.6-2.6l.1.1a1.5 1.5 0 0 0 2.6-1.1v-.2a1.8 1.8 0 0 1 3.6 0v.1a1.5 1.5 0 0 0 2.6 1.1l.1-.1a1.8 1.8 0 1 1 2.6 2.6l-.1.1a1.5 1.5 0 0 0 1.1 2.6h.2a1.8 1.8 0 0 1 0 3.6h-.1a1.5 1.5 0 0 0-1.4.9Z" />
  </svg>
);

export const IconWifi = (p) => (
  <svg {...base} {...p}>
    <path d="M2.8 8.6a14 14 0 0 1 18.4 0" />
    <path d="M6.2 12.2a9 9 0 0 1 11.6 0" />
    <path d="M9.6 15.7a4.2 4.2 0 0 1 4.8 0" />
    <circle cx="12" cy="19" r=".9" fill="currentColor" />
  </svg>
);

export const IconSound = (p) => (
  <svg {...base} {...p}>
    <path d="M4.6 9.4h3.2L12 5.8v12.4l-4.2-3.6H4.6z" />
    <path d="M15.6 9.6a3.4 3.4 0 0 1 0 4.8" />
    <path d="M18 7.2a6.8 6.8 0 0 1 0 9.6" />
  </svg>
);

export const IconPower = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.6v7.6" />
    <path d="M17.6 6.6a7.6 7.6 0 1 1-11.2 0" />
  </svg>
);

export const IconGithub = (p) => (
  <svg {...base} {...p}>
    <path d="M14.8 20.6v-3a2.6 2.6 0 0 0-.7-2c2.4-.3 4.9-1.2 4.9-5.3a4.1 4.1 0 0 0-1.1-2.8 3.8 3.8 0 0 0-.1-2.8s-.9-.3-3 1.1a10.3 10.3 0 0 0-5.4 0C7.3 4.4 6.4 4.7 6.4 4.7a3.8 3.8 0 0 0-.1 2.8 4.1 4.1 0 0 0-1.1 2.9c0 4 2.5 4.9 4.9 5.2a2.6 2.6 0 0 0-.7 2v3" />
    <path d="M9.4 18.6c-2.8.9-2.8-1.4-4-1.7" />
  </svg>
);

export const IconLink = (p) => (
  <svg {...base} {...p}>
    <path d="M10.3 13.7a3.6 3.6 0 0 0 5.4.4l2.4-2.4a3.6 3.6 0 0 0-5.1-5.1l-1.4 1.4" />
    <path d="M13.7 10.3a3.6 3.6 0 0 0-5.4-.4l-2.4 2.4a3.6 3.6 0 0 0 5.1 5.1l1.4-1.4" />
  </svg>
);

export const IconDownload = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.8v10.4" />
    <path d="m7.8 10.4 4.2 4.2 4.2-4.2" />
    <path d="M4.6 18.4h14.8" />
  </svg>
);

export const IconFile = (p) => (
  <svg {...base} {...p}>
    <path d="M6.4 3.4h7L18 8v12.6H6.4z" />
    <path d="M13.2 3.6v4.6h4.6" />
  </svg>
);

export const IconBack = (p) => (
  <svg {...base} {...p}>
    <path d="M15 5.6 8.4 12l6.6 6.4" />
  </svg>
);
