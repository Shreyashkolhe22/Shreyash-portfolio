# Shreyash Kolhe — Developer Portfolio

A portfolio you walk into. The visitor lands in a physical developer room, scrolls
the camera toward the monitor, and the black screen wakes up into a real,
interactive desktop built from ordinary React DOM.

```
ROOM ──scroll down──> MONITOR ──> BLACK SCREEN ──> DESKTOP
                                                     │
ROOM <──scroll back── MONITOR <── BLACK SCREEN <─────┘
```

No Three.js, no WebGL, no 3D, and no video. React + CSS + JavaScript, with the
camera move driven entirely by scroll-linked CSS transforms.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

---

## How the transition works

There is **no video**. The camera move is reproduced as a single continuous CSS
zoom across two high-resolution stills of the same room — `start-room` (wide)
and `end-room` (close).

The whole experience runs off one scroll track (`TRACK_VH`, 520vh) with a
sticky, viewport-filling stage pinned to it. A single `requestAnimationFrame`
loop in `src/hooks/useCinematicScroll.js` reads `window.scrollY` and writes two
transform strings and one opacity straight to the DOM. **No React state is
updated on scroll** — the only state change in the whole journey is the single
flip between cinematic and desktop mode.

```
progress 0 ──────────────────────────────────────── 1
|  wide room ─── continuous push-in ─── close room  |  desktop wakes
                          [cross-fade, last 16%]
```

### Why two stills work

The two photographs are related by a **pure zoom**, which was verified rather
than assumed. Both monitor panels were located by edge detection, and a
normalised-cross-correlation check then tested whether one scale anchored on the
panel also predicts every other landmark:

| Landmark | Depth | Alignment error |
|---|---|---|
| PERSISTENCE poster | wall | 1 px |
| Batman poster | wall, far left | 2 px |
| Wall speaker (right) | desk | 1 px |
| Alarm clock | desk | 1 px |
| Keyboard | desk front, nearest camera | 1 px |
| White vase | desk | 0 px |
| Hanging plant | near wall, top | 2 px |

Landmarks at every depth land within 0–2px (correlation 0.97–0.998). There is no
parallax, so a CSS transform reproduces the original camera move *exactly* — and
does it on the GPU compositor rather than in a video decoder. That is why the
move is completely smooth: no decoding, no keyframe seeking, no dropped frames.

### How the two stills stay locked together

Every frame, the loop computes one **target panel rectangle** — where the
monitor's black panel should sit on screen right now — by interpolating the zoom
multiplicatively (so the perceived zoom rate stays constant) between the panel's
natural position in each image. Both stills are then transformed so their own
panel lands on that same rectangle.

Because both images always show an identical framing, the cross-fade between
them is invisible: where the close still does not yet reach the frame edge, the
wide one behind it is showing exactly the same picture.

### Why the camera tracks the scroll linearly

Progress maps to the camera **linearly**, and the two knobs that shape the feel
are elsewhere:

- **The zoom is interpolated multiplicatively** (`kx ** e`), which is what gives
  a constant *perceived* zoom rate. That is the part that stops it looking
  mechanical — not easing the progress.
- **`SMOOTH_TAU` (95ms) is exponential decay over real elapsed time**, not a
  fixed per-frame lerp. A per-frame lerp silently assumes 60Hz: on a 120 or
  144Hz laptop it converges twice as fast as intended, and when frames drop it
  converges slower, so the camera speeds up and slows down with the refresh
  rate. That reads as judder without any frame actually being late — which is
  why it never showed up in frame-time numbers.

Running an ease-in-out on the progress as well was the original mistake. The
visitor is the one supplying the motion, and easing on top of their scroll made
the camera move **19x faster through the middle of the track than at the ends**:

```
scroll   0-  5%  camera moves 0.50%   #
scroll  45- 50%  camera moves 9.50%   ###################
scroll  95-100%  camera moves 0.50%   #
```

Scrolling near either end felt stuck, and the middle lurched. Linear progress
gives a flat 5% per 5% everywhere. Easing still belongs in `glideTo()`, which is
a genuine automatic animation.

The close still is also skipped entirely while it is invisible — no transform,
no opacity write, for the first 88% of the scroll. Note it is *not* hidden with
`visibility`: that would tear down and rebuild a full-frame compositor layer at
exactly the moment the blend starts.

### Tuning the final framing

```js
// src/hooks/useCinematicScroll.js
export const FINAL_ZOOM = 1.2;
```

`1` stops exactly on `end-room`, framing the monitor as that photograph does.
Raising it keeps pushing in past the still. Measured on a 1440×900 viewport:

| FINAL_ZOOM | Monitor on screen (1440×900) | Viewport fill |
|---|---|---|
| 1.0 | 608 × 365 | 42% |
| **1.2** (current) | 730 × 438 | 48% |
| 1.35 | 821 × 492 | 57% |
| 1.7 | 1034 × 620 | 72% |

This is a single knob: the overlay rectangle, the desktop scale and both stills'
transforms all follow it. Past about 1.4 the close still starts being upscaled,
so the room softens.

The project sits at **1.2** — a small step past where `end-room` itself frames
the monitor, just enough that the icon labels, taskbar clock and window text
render clearly instead of at the photograph's native (fairly small) crop, while
the desk, posters and keyboard stay in shot. The desktop is designed around
that decision rather than fighting it; see below.

### Two things that are easy to get wrong here

**The pinned scene must not rubber-band.** `overscroll-behavior: none` lives on
`html`, not `body`. Unlike `overflow`, this property does *not* propagate from
`<body>` to the viewport — declaring it there computes `auto` on the root and
does nothing, so pushing past either end of the track bounces the document,
drags the pinned scene with it, and exposes the black page behind the room.

**The loop must never read layout.** `track.offsetHeight` is measured once and
cached, never touched inside the rAF loop. Reading it per frame — right after
writing transforms — forces a synchronous layout every frame. Fixing that took
the count from 191 forced layouts per scroll down to 2.

### Calibration

Eight measured numbers are the *only* calibration in the system; everything else
is derived from them.

```js
// src/hooks/useCinematicScroll.js — panel as a fraction of each image
START_PANEL  // start-room.png 3344x1880, panel x 1328..2094, y 724..1182
END_PANEL    // end-room.png   3492x1972, panel x 1115..2447, y 545..1343
```

If you replace either photograph, re-measure its black panel and update that
entry. The matching resting values are mirrored into `--monitor-*` in
`src/index.css` so the overlay is correct before JavaScript runs.

---

## Editing content

**Everything lives in `src/data/portfolio.js`.** Anything marked `PLACEHOLDER`
is scaffolding and should be replaced. Nothing is invented: project links are
`null` until you fill them in, and the UI renders a disabled state rather than a
dead link.

| What | Where |
|---|---|
| Name, role, intro, tech chips | `profile`, `coreTech` |
| Landing hero copy (name, tagline, nav) | `hero` |
| Work experience | `experience` |
| Education timeline | `education` |
| Projects (cards + detail views) | `projects` |
| Skills, grouped, no fake percentages | `skills` |
| Resume metadata | `resume` |
| Email / LinkedIn / GitHub | `contact` |
| Notes app text, Recycle Bin jokes | `notes`, `recycleBin` |

All of the above are populated with real content sourced from
`public/assets/resume.pdf` and `public/assets/projects.pdf`. Every GitHub/live
demo URL was checked with a live HTTP request before being added — see the
comment block above `projects` in `portfolio.js` for the two links that needed
a correction (LiftNShift's demo path, Kadak FM's trailing-hyphen repo name) and
the two projects left without links because neither source document gave one.

### Assets to drop in

| File | Effect |
|---|---|
| `public/assets/Shreyash_Kolhe_Resume.pdf` | The Resume download button detects it and enables itself |
| `src/assets/wallpaper*.{jpg,png,webp}` | Becomes the desktop wallpaper automatically |

### Changing the wallpaper

Drop an image into `src/assets` named anything starting with `wallpaper` —
`wallpaper.jpg`, `wallpaper1.jpg`, `wallpaper-batmobile.png` all work. Vite
picks it up, hashes it and bundles it; there is nothing to copy and no code to
change. If several are present the last by filename wins, so adding
`wallpaper2.jpg` supersedes `wallpaper1.jpg` without deleting anything.

With no image present the desktop falls back to a layered SVG scene (rainy sky,
distant pagoda and torii, lone cloaked traveller), so it is never bare.

Icon labels use a layered dark text halo rather than a solid plate, so they stay
readable on a dark wallpaper without looking like boxes — and still hold up on a
light one.

`public/assets` ships only two files — `start-room.webp` (254 KB) and
`end-room.webp` (183 KB), both 2400px wide. The full-resolution PNGs and the
original `room-transition.mp4` are kept in `src/assets` as references and are
never served.

### Anurati

Two places use it: the landing page's **word mark** (SK — WORKSPACE) and the
desktop clock's **day**. Both resolve to pure A-Z, which matters — see below.

The face is **Anurati** by Emmeran Richard, self-hosted at
`public/fonts/Anurati-Regular.otf` (8 KB) because no CDN serves it. The
`@font-face` lives in `index.css`, not next to either component, since both
need it.

**It is uppercase-only** — 38 glyphs covering A-Z, space and `! & + / ~`, with
no digits, no lowercase and no comma/period/colon/hyphen. Only ever apply it to
text you know is pure A-Z. That is why the clock's date and time lines stay on
the sans stack: putting Anurati on `- 6:11 PM -` would fall back per character
and render as two mixed typefaces.

Availability is resolved **once** for the whole app by `hooks/useAnurati.js`,
which adds `anurati-ready` to the root element. Both consumers key off that
class in plain CSS rather than running their own detection and racing each
other for the same file.

Each consumer carries **two sets of metrics**, not one compromise: Anurati is
drawn to be set far wider than a normal face. Without it the word mark is the
italic serif at `0.02em`; with it, Anurati at `0.3em`.

Two tricks make the word mark work despite the glyph limits:

- `text-transform: uppercase` — the transform happens *before* shaping, so
  "workspace" becomes glyphs the face actually has.
- **The dash is drawn in CSS, not typed.** Anurati has no dash at any
  codepoint, and a single fallback glyph in the middle of a word mark reads as
  a mistake. `brandMark` and `brandWord` are separate fields in
  `portfolio.js` for exactly this reason.

**Licence:** the free version is for personal use only; commercial projects
need Anurati Pro.

---

## Power on

The monitor shows a plain loading screen — a spinning ring and a line of text,
held long enough to actually read. No scan lines, no flash, no fake OS branding.

| | duration | screen |
|---|---|---|
| **Cold boot** | 2600ms | "You're in" / "Please wait, the system is starting" |
| **Wake** (re-entry) | 1200ms | "Welcome back" / "Resuming your session" |

Cold boot happens once per session; every re-entry is the shorter wake, because
a full wait is fine the first time and tiresome on the fourth. Copy and
durations live in `src/components/power.js` — one place, no repeats. They sit
in a plain module rather than next to the component because a file exporting
both a component and constants loses React Fast Refresh.

**There is no power-off screen.** Leaving fades the desktop out over 240ms and
the camera pulls back — the monitor going dark *is* the exit.

Under `prefers-reduced-motion: reduce` the ring stops spinning; the message and
the wait remain.

### Two orderings that have to hold

Everything inside `.monitor-screen` is positioned by the panel's **resting**
rectangle, so it is only correct once the camera has arrived. Both ends of the
journey have to respect that:

- **Entering**, the mode flip reads `s.eased`, not `s.target`. The raw scroll
  position snaps to 1 the instant you hit the bottom, but the camera is still
  travelling — measured on a fast scroll, the picture was at **71% of its final
  size** when the boot screen appeared, so the black panel covered the bezel,
  the wall and part of the desk for ~430ms. Gating on the eased value puts it
  at 100%.
- **Leaving**, `SCREEN_OFF_MS` holds the room still until the desktop has
  finished fading. It must stay longer than the fade in `styles/desktop.css`,
  or a lit rectangle hangs over the bezel while the camera moves.

This is the same class of bug as the inset shadow that used to bleed onto the
bezel, and as the cross-fade seam: **anything positioned by the resting monitor
rectangle must not be visible while the camera is in motion.**

## The landing view and scroll statements

The first thing a visitor sees is a landing page laid over the wide room, which
then hands off to two statements that reveal one at a time as the camera moves
toward the monitor.

```
progress  0 ───── hero ────┐
                           └── "What I build" ──┐
                                                └── "Where I build it" ──┐
                                                                         └─ desktop
```

Nothing in the overlay animates itself. Blocks declare their own slice of the
scroll and the cinematic loop drives them, so there is exactly one per-frame
writer for the whole experience:

```jsx
<div data-from="0.20" data-to="0.48" data-in="0.07" data-out="0.07" data-rise="22">
```

Copy and timings are in `statements` and `hero` in `src/data/portfolio.js`.
Keep statement windows clear of 0.88+, where the cross-fade and the desktop
hand-over happen.

`.is-gone` is toggled on the crossing, not every frame — and it matters: without
it a faded-out hero still catches clicks on buttons nobody can see.

### Two things worth knowing

**The overlay renders against the WINDOW, not the picture.** It is passed to
`CinematicScene` as `overlay`, not as `children`. Children go inside
`.scene-frame`, which is sized to the photograph — `max(100vw, 100vh * ar)` —
so on any window that is not 16:9 it is wider than the viewport. Measured at
1813px in a 1280x1024 window, which put the top-right button 227px off screen.
Anything that should line up with the window belongs in `overlay`.

**The room is graded under the hero.** It is a warm, bright photograph and the
copy is white; without the gradient the role paragraph sits straight on top of
the lamp and vanishes. The grade is weighted to the edges where the text is, so
the centre — the monitor the visitor is being drawn towards — stays clear.

---

## The magnetic cursor

A physics-driven cursor over the landing page: it trails the pointer, stretches
along its velocity, and snaps to the shape of anything marked `data-magnetic`,
pulling that element toward the pointer at the same time.

```jsx
<button data-magnetic className="hero-cta">Get in touch</button>
```

Ported from a TypeScript/Tailwind/shadcn original to this project's stack.
**None of that scaffolding was needed** — the component's styling is inline
`CSSProperties`, and only its demo used Tailwind classes. Converting ~30
hand-written stylesheets to install one cursor would have been a bad trade.

Dependencies added: `gsap` and `vecteur` — **+83 KB raw, +32 KB gzipped**, which
roughly doubles the JS bundle (74 KB → 106 KB gzipped). Worth knowing if payload
matters more than the flourish.

### Four changes from the original

- **Targets are found by delegation**, not one `querySelectorAll` on mount.
  Windows, menus and the landing page come and go here, so a fixed list would
  silently miss everything created later and leak listeners on everything
  destroyed.
- **The text-hover stretch is latched.** The original starts a fresh 0.3s tween
  on *every* pointermove over text — a lot of tween churn for one visual state.
- **It goes quiet when idle.** The loop runs on gsap's ticker, i.e. every frame
  for the life of the page, including while scrolling with the pointer parked.
  Measured: **1 DOM write per 150 frames** at rest, 147 when moving.
- **`contrastBoost` defaults to off.** It costs a backdrop root, sampled and
  filtered every frame it moves — expensive over the scaled room stills.
- **The blend is `difference` over a greyscaled backdrop.** This is what makes
  white text read as black under the cursor. `difference` alone also turns the
  cursor blue — inverting the warm room (about R200 G170 B130) gives roughly
  (55, 85, 125). Greyscaling the backdrop *before* the blend means inverting it
  can only produce a grey. Measured over the lit wall:

  | | over the lit wall | white text under it |
  |---|---|---|
  | `normal` | rgb(255,255,255) | **hidden** |
  | `difference` | **rgb(55,85,125)** blue | inverts |
  | `difference` + greyscale | rgb(82,82,82) neutral | inverts |

  The trade to know: with any inverting blend the disc is **not a fixed white**
  — it is the inverse of what is behind it. White over the dark graded areas
  where all the copy sits, darker over the lit wall. Nothing can avoid that and
  still turn text black. `desaturateBackdrop={false}` gives back the plain
  invert (and the blue); `blendMode="normal"` gives a permanently white disc
  (and text disappears under it).

  Cost was **not measurable above the noise floor** in this environment: across
  five runs each, medians came out 1500ms with the filter and 1569ms without,
  i.e. the OFF runs were nominally slower. Headless software rasterisation may
  not represent a real GPU, so if it ever stutters, `desaturateBackdrop` is the
  switch.

### The stuck-shape bug

Clicking a magnetic button while snapped to it — "Enter my desktop", "Get in
touch" — used to leave the cursor as a stretched rectangle the size of that
button, visible the next time the pointer moved after returning. Screenshot:
a skewed white bar sitting where the cursor should be.

Cause: the per-frame trailing loop only ever writes `x`, `y`, `rotate` and
`scale`. Width, height, border-radius and colour are written solely by
`enter()`/`leave()` on hover. The effect's cleanup only set `opacity: 0` —
never the geometry — so if it tore down while snapped (which is exactly what
happens the instant the desktop goes live and the cursor switches off), the
element kept the button's shape forever. Nothing in the trailing loop could
ever put it right, because that loop does not touch those properties.

Fixed with one `resetGeometry()`, called both on mount (in case a previous
mount left it dirty) and on teardown (so it never leaves dirty in the first
place) — the two places state could otherwise survive past its context.

Anything marked `data-magnetic` also needs `pointer-events: auto`. The hero
layer is `pointer-events: none`, so a plain `<span>` target is invisible to
hit-testing and the snap silently never fires.

### Where it is, and is not

It switches off inside the desktop. A blend-mode cursor is a nice flourish over
a photograph, but the desktop has text fields, a terminal and draggable windows
— the visitor needs a real pointer there, and a simulated OS reading as an
ordinary computer is the whole point.

That gating has a trap worth naming: the `cursor: none` rule must be scoped to
`.track.has-magnetic-cursor`, not applied unconditionally. Without the class the
custom cursor turns off inside the desktop while the native one stays
suppressed, leaving no pointer at all over the room outside the monitor.

---

## The palette

White on black. The desktop originally ran a red accent sampled from the
wallpaper's tail light, with every colour driven off one `--os-hue` variable
at varying saturation/lightness (10 distinct S/L pairs across the codebase).
Switching to white/grey didn't mean picking new colours by eye — it meant
mechanically desaturating every one of those 48 occurrences to `hsl(0 0%
<same lightness>)`, so every hover, border and tint keeps the exact contrast
relationship it had, just without the hue. Backgrounds and text tokens (which
carried a slight warm cast alongside the hue-driven colours) were re-picked as
true neutral greys the same way.

```css
--os-accent: hsl(0 0% 92%);
--os-bg: #09090b;
```

The tokens live on `:root` in `index.css`, not on `.desktop`: the boot screen
is a *sibling* of `.desktop`, not a child, so it could not inherit them.

Two deliberate exceptions, unrelated to the accent swap:

- **The status dot stays green.** It is semantic, not decorative — it means
  "open to roles", and a red (or white) status dot doesn't read the same way.
- **Terminal error lines stay a warm red/coral** (`.term-err`), for the same
  reason error states usually survive a move to monochrome — it is a semantic
  colour, not a brand accent.
- **The room's loading bar, scroll cue, and the desktop's own app-note callout
  stay amber.** The room/desktop split (warm physical half, cool digital half)
  is unrelated to the accent colour, and the app-note amber gives the
  otherwise-monochrome desktop one warm callout colour rather than a flat wash.

---

## Mobile / narrow-viewport

The cinematic room-to-monitor mechanic is a 16:9 composition driven by mouse
scroll — the brief for this project was explicit that forcing it into a phone
viewport would be worse than not having it at all, and to build a real
fallback later rather than trying to shrink a desk you can't see. Below
`MIN_WIDTH` (820px, checked in `App.jsx` via `matchMedia`) the whole
cinematic/desktop tree is swapped for `components/MobileSite.jsx`: a normal
single-page scrolling site, sourced from the same `data/portfolio.js` used by
every desktop app, so nothing is maintained twice.

It borrows the desktop's white-on-black identity and the hero's serif/sans
pairing directly off the `--os-*`/`--serif`/`--sans` tokens already on
`:root` — no separate palette. Sections: hero (name, tagline, social row),
about, experience + education timeline, a single-open projects accordion
(action buttons render as disabled dashed pills when a project has no
`github`/`demo` link, rather than being omitted), skills (two columns from
560px up), resume (gated on the same `useResumeAvailable()` HEAD-check the
desktop's Resume window uses, shared via `hooks/useResumeAvailable.js`), and
contact. Styling lives in `styles/mobile.css`.

---

## Leaving the desktop

Once the desktop is live it is genuinely self-contained: wheel events are
swallowed, and the scroll position is pinned so nothing — `scrollIntoView`,
focusing an input, find-in-page — can quietly eject the visitor.

There are four deliberate ways out, and reading never triggers any of them:

- **Sustained upward scroll on the desktop background.** A meter appears at the
  top and fills; ~620px of upward wheel travel leaves. Intent decays after
  700ms, so a stray flick does nothing.
- **The power button** in the taskbar tray.
- **The power button** in the Start menu footer.
- **`exit`** in the Terminal.

Scrolling inside a window never counts toward leaving — not even when that
window has nothing left to scroll.

---

## Project layout

```
src/
├── components/
│   ├── CinematicScene.jsx     pinned stage: two room stills + overlay
│   ├── Desktop.jsx            OS shell, authored at 640x384 and scaled to fit
│   ├── DesktopIcon.jsx  Window.jsx  Taskbar.jsx  StartMenu.jsx
│   ├── Wallpaper.jsx          photo wallpaper, SVG scene as fallback
│   ├── DesktopClock.jsx       top-centre date/time (Anurati)
│   ├── Icons.jsx              hand-rolled SVG icon set (no icon library)
│   ├── apps.jsx               application registry — add an app in one place
│   ├── AboutWindow.jsx  EducationWindow.jsx  ProjectsWindow.jsx
│   ├── SkillsWindow.jsx  ResumeWindow.jsx  ContactWindow.jsx
│   ├── TerminalWindow.jsx  NotesWindow.jsx  RecycleBinWindow.jsx
│   └── SmallScreenNotice.jsx  narrow-viewport stopgap
├── hooks/
│   ├── useCinematicScroll.js  the rAF scroll engine
│   └── useWindowManager.js    open / focus / minimise / z-order
├── data/portfolio.js          ALL content
├── styles/                    desktop.css, window.css, apps.css, clock.css
└── index.css                  tokens + the cinematic layer
```

### A deliberately compact OS

The desktop is authored at a fixed logical **640 × 384** (`OS_W`/`OS_H` in
`useCinematicScroll.js`) and scaled onto the monitor panel. On a 1440×900
viewport the panel is 608×365, so the desktop renders at roughly **1:1** —
which means it is genuinely crisp rather than a shrunken 1280-wide layout
squeezed to 47%.

Because the camera rests where the photograph frames the monitor, the screen
really is small, and the OS is built for it: a 28px taskbar, 62px icons, 22px
title bars, body copy at 10.5px and section labels at 8px. Windows default to
around 400×270. It reads as a compact machine, not as a scaled-down desktop.

If you later raise `FINAL_ZOOM`, the whole OS scales up with it and stays
sharp — no CSS changes needed.

### Terminal commands

`help`, `about`, `education`, `projects`, `skills`, `resume`, `contact`,
`notes`, `ls`, `whoami`, `stack`, `cat <section>`, `echo`, `date`, `clear`,
`exit`. The ones that name an app really launch it; ↑/↓ walk the history.

---

## Known limits

- **Mobile.** Below 820px the composition has no room to be readable, so phones
  get a plain content page (`SmallScreenNotice.jsx`) instead of a broken
  desktop. A real mobile version is a later pass.
- **Window dragging** works; resizing does not.
- **The contact form** has no backend — it acknowledges locally. Wire it to a
  form service or a `mailto:` link once your real address is in the data file.
