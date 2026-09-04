import { useCallback, useEffect, useRef, useState } from 'react';
import CinematicScene from './components/CinematicScene';
import Desktop from './components/Desktop';
import HeroOverlay from './components/HeroOverlay';
import MagneticCursor from './components/MagneticCursor';
import { SCREEN_OFF_MS } from './components/power';
import { ensureAnurati } from './hooks/useAnurati';
import { useCinematicScroll } from './hooks/useCinematicScroll';
import './styles/desktop.css';
import './styles/window.css';
import './styles/apps.css';
import './styles/hero.css';
import './styles/power.css';
import './styles/clock.css';
import './styles/cursor.css';

/** Length of the cinematic scroll track. More = slower, more deliberate dolly. */
const TRACK_VH = 520;

/** Wheel distance (px) the visitor must push upward to leave the desktop. */
const EXIT_THRESHOLD = 620;

/** Intent decays if they stop pushing, so a stray flick never ejects them. */
const INTENT_DECAY_MS = 700;

/** Progress the camera pulls back to when leaving the computer. */
const EXIT_TO = 0.52;

/**
 * Below this, the hero and the desktop switch to compact layouts (hero.css /
 * desktop.css media queries at the same number) and the magnetic cursor —
 * a mouse-only flourish — turns off. The cinematic zoom and the desktop OS
 * itself run the same way above and below it: `useCinematicScroll` reads
 * `window.scrollY`, which a touch drag moves exactly like a wheel does, and
 * it caps how far the camera pushes in so the monitor never renders wider
 * than the viewport (see MAX_PANEL_VW in the hook) instead of clipping.
 */
const MIN_WIDTH = 820;

export default function App() {
  // Read once at mount and follow the media query; nothing here runs on scroll.
  const [isCompact, setIsCompact] = useState(
    () => typeof window !== 'undefined'
      && window.matchMedia(`(max-width: ${MIN_WIDTH - 1}px)`).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MIN_WIDTH - 1}px)`);
    const on = (e) => setIsCompact(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // Resolve the display face once; both the landing name and the desktop clock
  // key off the class it adds.
  useEffect(() => { ensureAnurati(); }, []);

  const trackRef = useRef(null);
  const sceneRef = useRef(null);
  const frameRef = useRef(null);
  const wideRef = useRef(null);
  const closeRef = useRef(null);
  const desktopRef = useRef(null);
  const intentRef = useRef(null);
  const overlayRef = useRef(null);

  const [mode, setMode] = useState('cinematic');
  const [exiting, setExiting] = useState(false);
  const exitingRef = useRef(false);

  const controls = useCinematicScroll({
    overlayRef, sceneRef, frameRef, wideRef, closeRef, trackRef,
    onPhaseChange: setMode,
  });

  const desktopLive = mode === 'desktop' && !exiting;

  /** The custom cursor only replaces the native one while it is actually on —
   *  and never on a compact/touch viewport, which has no real mouse to fake. */
  const cursorActive = !isCompact && !desktopLive;

  /**
   * An app the hero asked for. Bumping `n` re-fires the request even when the
   * same app is asked for twice, which a bare string could not express.
   */
  const [pendingApp, setPendingApp] = useState(null);

  /** Send the camera to the monitor. Used by the hero's calls to action. */
  const enterDesktop = useCallback((appId = null) => {
    if (appId) setPendingApp({ id: appId, n: Date.now() });
    controls.glideTo(1, 1500);
  }, [controls]);

  /** Paint the exit meter straight to the DOM — the gesture must not re-render. */
  const paintIntent = useCallback((v) => {
    const el = intentRef.current;
    if (!el) return;
    el.style.setProperty('--intent', v.toFixed(3));
    el.classList.toggle('is-visible', v > 0.04);
  }, []);

  /** Deliberate exit: darken the screen, then pull the camera back. */
  const exitToRoom = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setExiting(true);
    paintIntent(0);

    window.setTimeout(() => {
      // Automatic pull-back, but the visitor can take the camera back at any
      // moment — their own scroll cancels the glide rather than fighting it.
      const cancel = controls.glideTo(EXIT_TO, 1100);
      const handOver = () => cancel();
      // Wait out any trailing trackpad momentum from the gesture that got us here.
      const arm = window.setTimeout(() => {
        window.addEventListener('wheel', handOver, { once: true, passive: true });
        window.addEventListener('touchstart', handOver, { once: true, passive: true });
      }, 300);

      // `mode` falls back to 'cinematic' on its own as progress drops below the
      // threshold; clearing `exiting` afterwards re-arms re-entry.
      window.setTimeout(() => {
        window.clearTimeout(arm);
        window.removeEventListener('wheel', handOver);
        window.removeEventListener('touchstart', handOver);
        exitingRef.current = false;
        setExiting(false);
      }, 1250);
      // Hold until the screen has finished darkening. The desktop is clipped to
      // the resting panel rectangle, so moving the camera while it is still
      // even partly visible hangs a lit rectangle over the bezel and wall.
    }, SCREEN_OFF_MS);
  }, [controls, paintIntent]);

  /**
   * Scroll capture while the desktop is live.
   *
   * The page stays scrollable, but every wheel event over the desktop is
   * swallowed unless it lands on something that can genuinely scroll. That way
   * reading a long project window never nudges the visitor out of the machine,
   * and leaving takes a sustained upward push — or the taskbar power button,
   * the Start menu, or `exit` in the terminal.
   *
   * The accumulator lives in a ref, not state, so the gesture survives any
   * re-render that happens mid-push and costs no renders of its own.
   */
  const accRef = useRef(0);

  useEffect(() => {
    if (!desktopLive) return undefined;

    accRef.current = 0;
    let decay = 0;
    let touchY = 0;

    /** True when something under the cursor can really absorb this scroll. */
    const scrollableUnder = (target, deltaY) => {
      let el = target;
      while (el && el !== document.body) {
        if (el.scrollHeight - el.clientHeight > 2) {
          // `overflow: hidden` ancestors report a scrollHeight but are not
          // user-scrollable; only auto/scroll containers may consume the event.
          const oy = getComputedStyle(el).overflowY;
          if (oy === 'auto' || oy === 'scroll') {
            const atTop = el.scrollTop <= 0;
            const atBottom = el.scrollTop >= el.scrollHeight - el.clientHeight - 1;
            if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) return true;
          }
        }
        el = el.parentElement;
      }
      return false;
    };

    const bump = (delta) => {
      // Only upward movement counts toward leaving; downward bleeds it off.
      if (delta >= 0) accRef.current = Math.max(0, accRef.current - Math.abs(delta) * 0.5);
      else accRef.current += -delta;

      window.clearTimeout(decay);
      decay = window.setTimeout(() => {
        accRef.current = 0;
        paintIntent(0);
      }, INTENT_DECAY_MS);

      paintIntent(Math.min(1, accRef.current / EXIT_THRESHOLD));

      if (accRef.current >= EXIT_THRESHOLD) {
        accRef.current = 0;
        window.clearTimeout(decay);
        exitToRoom();
      }
    };

    /**
     * Exit intent is only ever collected from the desktop background — never
     * from inside an application. A visitor reading a project must not be
     * ejected just because that particular window had nothing left to scroll.
     */
    const isChrome = (target) => !!target.closest?.('.window, .start-menu');

    const onWheel = (e) => {
      if (scrollableUnder(e.target, e.deltaY)) return; // let the window scroll
      e.preventDefault();
      if (isChrome(e.target)) return; // swallowed, but never counts as leaving
      bump(e.deltaY);
    };

    const onTouchStart = (e) => { touchY = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      const y = e.touches[0].clientY;
      const delta = touchY - y; // positive = finger up = scrolling down
      touchY = y;
      if (scrollableUnder(e.target, delta)) return;
      e.preventDefault();
      if (isChrome(e.target)) return;
      bump(delta * 1.6);
    };

    const onKey = (e) => {
      if (e.target.closest('input, textarea')) return;
      const blocked = ['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', ' '];
      if (blocked.includes(e.key)) e.preventDefault();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(decay);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
      paintIntent(0);
    };
  }, [desktopLive, exitToRoom, paintIntent]);

  /**
   * Hard pin on the scroll position while the desktop is live.
   *
   * The wheel handler stops deliberate scrolling, but the browser also scrolls
   * the document on its own: focusing an input inside a scaled container,
   * `scrollIntoView` from any app, find-in-page, middle-click autoscroll. Any
   * of those would silently eject the visitor. Snapping back to the end of the
   * track is what makes the desktop genuinely self-contained.
   */
  useEffect(() => {
    if (!desktopLive) return undefined;
    const track = trackRef.current;
    if (!track) return undefined;
    const onScroll = () => {
      const max = track.offsetHeight - window.innerHeight;
      if (Math.abs(window.scrollY - max) > 1) window.scrollTo(0, max);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [desktopLive]);


  // Start every visit at the wide room, even on a refresh mid-page.
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* Landing-page flourish only: it switches itself off once the visitor
          is inside the desktop, where a real pointer matters more. */}
      <MagneticCursor active={cursorActive} />

      <div
        className={`track${cursorActive ? ' has-magnetic-cursor' : ''}`}
        ref={trackRef}
        style={{ height: `${TRACK_VH}vh` }}
      >
        <CinematicScene
          sceneRef={sceneRef}
          frameRef={frameRef}
          wideRef={wideRef}
          closeRef={closeRef}
          overlay={(
            <HeroOverlay
              overlayRef={overlayRef}
              onEnter={() => enterDesktop()}
              onContact={() => enterDesktop('contact')}
            />
          )}
        >
          <Desktop
            active={desktopLive}
            onExit={exitToRoom}
            rootRef={desktopRef}
            openRequest={pendingApp}
          />
        </CinematicScene>
      </div>


      {/* Exit-intent meter. Driven imperatively; never re-renders the app. */}
      <div className="exit-intent" ref={intentRef} aria-hidden="true">
        <span className="exit-intent-fill" />
        <span className="exit-intent-text">Keep scrolling up to leave the computer</span>
      </div>
    </>
  );
}
