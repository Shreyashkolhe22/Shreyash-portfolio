import { useEffect, useMemo, useRef } from 'react';

/**
 * Drives the room -> monitor -> desktop transition from the scroll position,
 * entirely outside React's render cycle.
 *
 * There is no video. The camera move is reproduced as a single continuous CSS
 * zoom across two high-resolution stills of the same room, one wide and one
 * close. Measuring both images showed their framings are related by a pure
 * zoom — every landmark (posters, speaker, clock, keyboard, plant) maps within
 * 0-2px under one scale anchored on the monitor panel — so a CSS transform
 * reproduces the original camera move exactly, and does it on the compositor
 * rather than in a video decoder.
 *
 *   progress 0 ─────────────────────────────────── 1
 *   |  wide room ── continuous push-in ── close   |  desktop wakes
 *                              [cross-fade to the close still]
 *
 * Nothing here calls setState on scroll: the rAF loop writes two transform
 * strings and one opacity straight to the DOM, and only invokes `onPhaseChange`
 * when we actually cross between cinematic and desktop mode.
 */

/* ---------------------------------------------------------------------------
   MEASURED GEOMETRY
   The monitor's black panel, located in each source image by edge detection
   and expressed as a fraction of that image. These eight numbers are the only
   calibration in the system; everything else is derived from them.

     start-room.png  3344 x 1880   panel x 1328..2094, y 724..1182
     end-room.png    3492 x 1972   panel x 1115..2447, y 545..1343
   --------------------------------------------------------------------------- */

export const START_PANEL = {
  left: 1328 / 3344,   // 0.397129
  top: 724 / 1880,     // 0.385106
  width: 767 / 3344,   // 0.229365
  height: 459 / 1880,  // 0.244149
};

export const END_PANEL = {
  left: 1115 / 3492,   // 0.319301
  top: 545 / 1972,     // 0.276370
  width: 1333 / 3492,  // 0.381729
  height: 799 / 1972,  // 0.405173
};

/**
 * How far past the close still the camera keeps pushing.
 *
 * 1 = stop exactly at end-room.png, with the monitor at the size that image
 * frames it (~38% of the picture width). Raise it to make the desktop bigger
 * and more readable at the cost of cropping more of the room — 1.4 puts the
 * monitor at roughly 53% of the viewport width, 1.8 at about 69%.
 */
export const FINAL_ZOOM = 1;

/**
 * Logical resolution the desktop is authored at.
 *
 * Deliberately small. FINAL_ZOOM is 1, so the panel is only ~608x365 CSS px on
 * a 1440x900 viewport; authoring at 640x384 means the desktop renders at very
 * close to 1:1 there rather than being squeezed down, which keeps text legible
 * and edges crisp. 640x384 is 5:3 — the measured aspect of the black panel.
 */
export const OS_W = 640;
export const OS_H = 384;

/** Progress at which the desktop is considered live. */
const ENTER_AT = 0.999;

/**
 * The window over which the close still cross-fades in, as a fraction of the
 * scroll. Progress is linear now, so these are literal scroll positions.
 *
 * It finishes at 0.98 rather than 1.0 on purpose: the camera then comes to rest
 * already settled on the sharp still, instead of still mid-blend at the exact
 * moment the desktop wakes. By 0.88 the two stills are within 6% of the same
 * scale, which keeps the feathered band narrow.
 */
const FADE_FROM = 0.88;
const FADE_TO = 0.98;

/**
 * Smoothing time constant, in milliseconds.
 *
 * Larger = the camera trails the scroll more softly; smaller = tighter and
 * more immediate. 95 reproduces the previous fixed 0.16-per-frame lerp exactly
 * at 60Hz, but unlike that lerp it behaves identically at 120 or 144Hz.
 */
const SMOOTH_TAU = 95;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const smoothstep = (t) => t * t * (3 - 2 * t);

const centreOf = (p) => ({ x: p.left + p.width / 2, y: p.top + p.height / 2 });

export function useCinematicScroll({
  overlayRef,
  sceneRef,
  frameRef,
  wideRef,
  closeRef,
  trackRef,
  onPhaseChange,
  enabled = true,
}) {
  const state = useRef({ target: 0, eased: 0, inDesktop: false, raf: 0 });

  // Kept in a ref so the rAF loop always calls the latest callback without
  // having to tear down and re-subscribe when the parent re-renders.
  const phaseCb = useRef(onPhaseChange);
  useEffect(() => { phaseCb.current = onPhaseChange; }, [onPhaseChange]);

  useEffect(() => {
    if (!enabled) return undefined;

    const s = state.current;
    const scene = sceneRef.current;
    const frame = frameRef.current;
    const wide = wideRef.current;
    const close = closeRef.current;
    const track = trackRef.current;
    if (!scene || !frame || !wide || !close || !track) return undefined;

    const sc = centreOf(START_PANEL);
    const ec = centreOf(END_PANEL);

    // Total zoom of the move, per axis. These come out at 1.664 and 1.659 —
    // agreeing to 0.3%, which is what confirms the move is a uniform zoom.
    const kx = (END_PANEL.width / START_PANEL.width) * FINAL_ZOOM;
    const ky = (END_PANEL.height / START_PANEL.height) * FINAL_ZOOM;

    let frameW = 0;
    let frameH = 0;
    let scrollSpan = 0;
    const measure = () => {
      frameW = frame.offsetWidth;
      frameH = frame.offsetHeight;
      // Cached here, never read inside the loop: touching offsetHeight per
      // frame forces a synchronous layout immediately after we have written
      // transforms, which is a read-after-write thrash and shows up as jank.
      scrollSpan = track.offsetHeight - window.innerHeight;
      if (!frameW || !frameH) return;
      // The desktop is authored at a fixed logical size and scaled onto the
      // panel. The panel only ever hosts it at the END of the move, so this is
      // computed from the final rect and only changes on resize — never during
      // the scroll.
      //
      // At rest the close still is scaled by FINAL_ZOOM about its own panel
      // centre, so the panel on screen grows with it while its centre stays
      // put. The overlay rectangle has to follow, or the desktop would spill
      // over the bezel as soon as FINAL_ZOOM leaves 1.
      const mw = END_PANEL.width * FINAL_ZOOM;
      const mh = END_PANEL.height * FINAL_ZOOM;
      scene.style.setProperty('--monitor-width', `${(mw * 100).toFixed(4)}%`);
      scene.style.setProperty('--monitor-height', `${(mh * 100).toFixed(4)}%`);
      scene.style.setProperty('--monitor-left', `${((ec.x - mw / 2) * 100).toFixed(4)}%`);
      scene.style.setProperty('--monitor-top', `${((ec.y - mh / 2) * 100).toFixed(4)}%`);

      const panelW = frameW * mw;
      const panelH = frameH * mh;
      scene.style.setProperty('--os-scale-x', (panelW / OS_W).toFixed(5));
      scene.style.setProperty('--os-scale-y', (panelH / OS_H).toFixed(5));
    };
    measure();

    // scrollY is a cheap read; scrollSpan is cached by measure().
    const readScroll = () => {
      s.target = scrollSpan > 0 ? clamp01(window.scrollY / scrollSpan) : 0;
    };
    readScroll();
    s.eased = s.target;

    /**
     * Place one still so that its own panel lands on the target panel rect.
     * Scaling happens about the element's centre, so we work out where the
     * panel ends up after the scale and translate the difference.
     */
    const place = (el, panel, centre, tW, tH, tcx, tcy) => {
      const sx = tW / panel.width;
      const sy = tH / panel.height;
      const px = 0.5 + (centre.x - 0.5) * sx;
      const py = 0.5 + (centre.y - 0.5) * sy;
      const dx = (tcx - px) * frameW;
      const dy = (tcy - py) * frameH;
      el.style.transform =
        `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) scale(${sx.toFixed(5)}, ${sy.toFixed(5)})`;
    };

    /**
     * Scroll-triggered reveals.
     *
     * Any element inside the overlay carrying data-from / data-to declares its
     * own slice of the scroll; it fades in, holds, and fades back out again.
     * Driven from this loop rather than its own rAF so there is exactly one
     * per-frame writer for the whole experience.
     *
     * `shown` is latched so the class toggle only happens on the crossing —
     * and that toggle matters: without it, a faded-out hero would still be
     * catching clicks on buttons nobody can see.
     */
    const reveals = (overlayRef?.current
      ? [...overlayRef.current.querySelectorAll('[data-from]')]
      : []).map((el) => ({
      el,
      from: parseFloat(el.dataset.from),
      to: parseFloat(el.dataset.to),
      // A hero that is already on screen at rest has no fade-in.
      fadeIn: el.dataset.in === undefined ? 0.05 : parseFloat(el.dataset.in),
      fadeOut: el.dataset.out === undefined ? 0.05 : parseFloat(el.dataset.out),
      rise: el.dataset.rise === undefined ? 16 : parseFloat(el.dataset.rise),
      shown: null,
      last: -1,
    }));

    // Latches whether the close still is on screen, so we can stop writing to
    // it entirely while it is invisible — which is most of the scroll.
    let closeShown = true;
    let lastT = performance.now();

    const tick = (now) => {
      s.raf = requestAnimationFrame(tick);
      readScroll();

      // Frame-rate independent smoothing.
      //
      // A fixed per-frame lerp (`eased += d * 0.16`) silently assumes 60Hz. On
      // a 120 or 144Hz laptop it converges twice as fast as intended, and when
      // frames drop it converges slower — so the camera speeds up and slows
      // down with the refresh rate instead of tracking the scroll. That reads
      // as judder even when no frame is actually late, which is why it does
      // not show up in frame-time numbers.
      //
      // Exponential decay over real elapsed time behaves identically at any
      // refresh rate. TAU is chosen to reproduce the old feel exactly at 60Hz:
      // exp(-16.67/95) = 0.84, the previous per-frame retention.
      const dt = Math.min(now - lastT, 64); // clamp so a stall cannot jump
      lastT = now;

      const d = s.target - s.eased;
      const k = 1 - Math.exp(-dt / SMOOTH_TAU);
      s.eased += Math.abs(d) < 0.0004 ? d : d * k;

      // Progress maps to the camera LINEARLY. It is tempting to run an
      // ease-in-out here, but the visitor is the one supplying the motion:
      // easing on top of their scroll means the camera moves 19x faster
      // through the middle of the track than at the ends. Scrolling near the
      // start or the end then feels stuck, and the middle feels like a lurch.
      //
      // The move still does not look mechanical, because the zoom below is
      // interpolated multiplicatively — that alone gives a constant *perceived*
      // zoom rate — and SMOOTH_TAU absorbs the discrete steps of a mouse wheel.
      // Easing belongs in glideTo(), which is a real automatic animation.
      const e = s.eased;

      // Zoom compounds, so interpolate it multiplicatively: the move then has
      // a constant perceived rate rather than decelerating on its own.
      const tW = START_PANEL.width * kx ** e;
      const tH = START_PANEL.height * ky ** e;
      const tcx = sc.x + (ec.x - sc.x) * e;
      const tcy = sc.y + (ec.y - sc.y) * e;

      place(wide, START_PANEL, sc, tW, tH, tcx, tcy);

      // Both stills show an identical framing at every point, so the hand-off
      // is invisible: where the close still does not yet reach the frame edge,
      // the wide one behind it is showing exactly the same picture.
      const fade = smoothstep(clamp01((e - FADE_FROM) / (FADE_TO - FADE_FROM)));

      // The close still is invisible for the first ~78% of the scroll. Writing
      // a transform to it anyway invalidates its style every frame and keeps a
      // full-frame layer alive for the compositor to raster. Skip it entirely
      // while it cannot be seen, and flip `visibility` only when crossing the
      // threshold rather than every frame.
      const showClose = fade > 0.0005;
      if (showClose) {
        place(close, END_PANEL, ec, tW, tH, tcx, tcy);
        close.style.opacity = fade.toFixed(4);
      } else if (closeShown) {
        // One write on the crossing, then nothing until it is needed again.
        // Deliberately NOT `visibility: hidden` — that would tear down and
        // rebuild a full-frame compositor layer right as the blend starts.
        close.style.opacity = '0';
      }
      closeShown = showClose;

      // --- scroll-triggered reveals ---------------------------------------
      for (const r of reveals) {
        const tIn = r.fadeIn > 0 ? (e - r.from) / r.fadeIn : (e >= r.from ? 1 : 0);
        const tOut = r.fadeOut > 0 ? (r.to - e) / r.fadeOut : (e <= r.to ? 1 : 0);
        const t = clamp01(Math.min(tIn, tOut));

        if (Math.abs(t - r.last) > 0.002) {
          r.last = t;
          r.el.style.opacity = t.toFixed(3);
          // Drift up as it arrives, keep drifting as it leaves — the text
          // travels one way rather than bouncing back.
          r.el.style.transform = `translate3d(0, ${((1 - t) * r.rise).toFixed(2)}px, 0)`;
        }

        const on = t > 0.01;
        if (on !== r.shown) {
          r.shown = on;
          // Only an on-screen reveal may take pointer events.
          r.el.classList.toggle('is-gone', !on);
        }
      }

      // Gate on the EASED value, not the raw target.
      //
      // `s.target` snaps to 1 the instant scrollY reaches the bottom, but the
      // camera is still travelling — on a fast scroll the picture is only ~70%
      // of its final size at that moment. The monitor overlay is positioned at
      // the RESTING panel rectangle, so handing over early paints the boot
      // screen across the bezel, the wall and the desk until the room catches
      // up. `s.eased` is where the camera actually is.
      const shouldBeDesktop = s.eased >= ENTER_AT;
      if (shouldBeDesktop !== s.inDesktop) {
        s.inDesktop = shouldBeDesktop;
        phaseCb.current?.(shouldBeDesktop ? 'desktop' : 'cinematic');
      }
    };

    s.raf = requestAnimationFrame(tick);

    const onResize = () => { measure(); readScroll(); };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(s.raf);
      window.removeEventListener('resize', onResize);
    };
  }, [enabled, overlayRef, sceneRef, frameRef, wideRef, closeRef, trackRef]);

  /** Imperative helpers used by the exit gesture. Stable identity: consumers
   *  put these in effect dependency lists. */
  return useMemo(() => ({
    /** Scroll instantly to a given progress (0..1) on the cinematic track. */
    jumpTo(p) {
      const track = trackRef.current;
      if (!track) return;
      const total = track.offsetHeight - window.innerHeight;
      window.scrollTo({ top: total * p, behavior: 'instant' });
    },
    /** Animated pull-back used when leaving the desktop. */
    glideTo(p, ms = 900) {
      const track = trackRef.current;
      if (!track) return () => {};
      const total = track.offsetHeight - window.innerHeight;
      const from = window.scrollY;
      const to = total * p;
      const start = performance.now();
      let cancelled = false;
      const step = (now) => {
        if (cancelled) return;
        const t = clamp01((now - start) / ms);
        window.scrollTo(0, from + (to - from) * easeInOut(t));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      return () => { cancelled = true; };
    },
  }), [trackRef]);
}
