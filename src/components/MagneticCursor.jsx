import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { vec2 } from 'vecteur';

/**
 * A physics-driven cursor: it trails the pointer, stretches along its velocity,
 * and snaps to the shape of anything marked `data-magnetic` — which is also
 * pulled toward the pointer while hovered.
 *
 * Ported from the TypeScript/Tailwind original to this project's stack (plain
 * JSX, hand-written CSS). The component never needed either: its styling is
 * inline, and only the demo used Tailwind classes.
 *
 * Three things were changed for this app specifically:
 *
 *  1. MAGNETIC TARGETS ARE FOUND BY DELEGATION, not a one-off querySelectorAll
 *     on mount. Windows, menus and the landing page come and go here, so a
 *     fixed list would silently miss everything created later — and leak
 *     listeners on everything destroyed.
 *
 *  2. THE TEXT-HOVER STRETCH IS LATCHED. The original starts a fresh 0.3s tween
 *     on every single pointermove over text, which is a lot of tween churn for
 *     one visual state.
 *
 *  3. IT TURNS ITSELF OFF INSIDE THE DESKTOP (`active`). A blend-mode cursor is
 *     a nice flourish over the room, but the desktop has text fields, a
 *     terminal and draggable windows — the visitor needs a real pointer there,
 *     and a simulated OS reading as an ordinary computer is the whole point.
 */
/** Keeps the disc legible on both the graded corners and the lit lampshade. */
const DROP = '0 0 0 rgba(0,0,0,0)';
const ring = (w, colour) => `inset 0 0 0 ${w}px ${colour}, ${DROP}`;

export default function MagneticCursor({
  active = true,
  lerpAmount = 0.14,
  magneticFactor = 0.3,
  hoverPadding = 10,
  hoverAttribute = 'data-magnetic',
  cursorSize = 64,
  cursorColor = '#ffffff',
  /**
   * 'difference' is what makes white text under the cursor read as black.
   *
   * On its own it also turns the cursor blue: inverting the warm room (about
   * R200 G170 B130) gives roughly (55, 85, 125). `desaturateBackdrop` fixes
   * that — see below.
   */
  blendMode = 'difference',
  /**
   * Greyscales the backdrop BEFORE the blend, so inverting it can only ever
   * produce a grey. Measured over the lit wall: difference alone gives
   * rgb(55,85,125); with this, rgb(82,82,82). The text still inverts either way.
   *
   * The consequence to know: with any inverting blend the disc is not a fixed
   * white — it is the inverse of what is behind it. White over the dark graded
   * areas where all the copy sits, darker over the lit wall. That is the price
   * of having text turn black underneath, and no blend can avoid it.
   */
  desaturateBackdrop = true,
  shape = 'circle',
  disableOnTouch = true,
  speedMultiplier = 0.02,
  maxScaleX = 1,
  maxScaleY = 0.3,
  /**
   * Boosts contrast behind the cursor before blending. Costs a backdrop root,
   * which is sampled and filtered every frame it moves — measurably expensive
   * over the scaled room stills. Off by default here; `exclusion` alone reads
   * fine against both the warm room and the dark desktop.
   */
  contrastBoost = 1,
}) {
  const cursorRef = useRef(null);
  const stateRef = useRef(null);

  // Read once at mount rather than in an effect: it cannot change for the life
  // of the page, and setting state from an effect would cost a second render.
  const [isTouch] = useState(
    () => typeof window !== 'undefined'
      && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
  );

  // Live config, so changing a prop never tears down the ticker. Written in an
  // effect, not during render — the loop reads it, and a render that React
  // later discards must not be able to change what the loop sees.
  const cfg = useRef({
    magneticFactor, speedMultiplier, maxScaleX, maxScaleY,
    cursorSize, lerpAmount, hoverPadding, cursorColor, shape,
  });
  useEffect(() => {
    cfg.current = {
      magneticFactor, speedMultiplier, maxScaleX, maxScaleY,
      cursorSize, lerpAmount, hoverPadding, cursorColor, shape,
    };
  }, [magneticFactor, speedMultiplier, maxScaleX, maxScaleY,
    cursorSize, lerpAmount, hoverPadding, cursorColor, shape]);

  const off = (disableOnTouch && isTouch) || !active;

  useEffect(() => {
    if (off) return undefined;
    const el = cursorRef.current;
    if (!el) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const detachDuration = reduced ? 0.1 : 0.35;

    gsap.set(el, { xPercent: -50, yPercent: -50 });

    if (!stateRef.current) {
      stateRef.current = {
        pos: { current: vec2(-100, -100), target: vec2(-100, -100), previous: vec2(-100, -100) },
        hovered: false,
        detaching: false,
        stretched: false,
        settled: false,
        magnet: null,
      };
    }
    const s = stateRef.current;

    /**
     * Put the element back to its resting geometry.
     *
     * The per-frame loop only ever writes x/y/rotate/scale — width, height,
     * border-radius, colour and the ring are written solely by enter()/leave().
     * So if the effect is torn down while snapped (which is exactly what
     * happens when you click "Enter my desktop", since the cursor switches off
     * the moment the desktop goes live), the element keeps the button's shape.
     * The next pointer move then makes it visible again as a big stuck
     * rectangle, and nothing in the loop can ever put it right.
     */
    const restingRadius = () => {
      const sh = cfg.current.shape;
      return sh === 'circle' ? '50%' : sh === 'square' ? '0' : '8px';
    };
    const resetGeometry = (extra) => gsap.set(el, {
      width: cfg.current.cursorSize,
      height: cfg.current.cursorSize,
      borderRadius: restingRadius(),
      backgroundColor: cfg.current.cursorColor,
      boxShadow: ring(0, 'rgba(255,255,255,0)'),
      scaleX: 1,
      scaleY: 1,
      rotate: 0,
      ...extra,
    });

    // The element may still carry state from a previous mount.
    resetGeometry();

    /* ---- the trailing / stretching loop --------------------------------- */
    const update = () => {
      if (s.hovered) return; // the snap tween owns the cursor while hovering

      const { speedMultiplier: sm, maxScaleX: mx, maxScaleY: my, lerpAmount: la } = cfg.current;

      // Idle early-out. This runs on gsap's ticker, i.e. every frame for the
      // life of the page — including while the visitor is scrolling with the
      // pointer held still, on top of the cinematic loop. Once the cursor has
      // caught up there is nothing to write, so don't.
      if (
        !s.detaching
        && Math.abs(s.pos.target.x - s.pos.current.x) < 0.05
        && Math.abs(s.pos.target.y - s.pos.current.y) < 0.05
        && s.settled
      ) return;

      s.pos.current.lerp(s.pos.target, reduced ? 1 : la);
      const d = s.pos.current.clone().sub(s.pos.previous);
      s.pos.previous.copy(s.pos.current);

      // One last write to land it cleanly at rest, then go quiet.
      s.settled = Math.abs(d.x) < 0.05 && Math.abs(d.y) < 0.05;

      if (s.detaching) {
        gsap.set(el, {
          x: s.pos.current.x, y: s.pos.current.y,
          scaleX: 1, scaleY: 1, rotate: 0, overwrite: 'auto',
        });
        return;
      }

      const speed = Math.hypot(d.x, d.y) * sm;
      gsap.set(el, {
        x: s.pos.current.x,
        y: s.pos.current.y,
        rotate: (Math.atan2(d.y, d.x) * 180) / Math.PI,
        scaleX: 1 + Math.min(speed, mx),
        scaleY: 1 - Math.min(speed, my),
        overwrite: 'auto',
      });
    };

    /* ---- magnetic snap, by delegation ----------------------------------- */
    const quick = new WeakMap();
    const pullFor = (node) => {
      let q = quick.get(node);
      if (!q) {
        q = {
          x: gsap.quickTo(node, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' }),
          y: gsap.quickTo(node, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' }),
        };
        quick.set(node, q);
      }
      return q;
    };

    const enter = (node) => {
      s.magnet = node;
      s.hovered = true;
      s.detaching = false;
      s.stretched = false;

      const b = node.getBoundingClientRect();
      const pad = cfg.current.hoverPadding * (1 + cfg.current.magneticFactor);
      gsap.killTweensOf(el);
      gsap.to(el, {
        x: b.left + b.width / 2,
        y: b.top + b.height / 2,
        width: b.width + pad * 2,
        height: b.height + pad * 2,
        borderRadius: getComputedStyle(node).borderRadius,
        backgroundColor: node.getAttribute('data-magnetic-color') || cfg.current.cursorColor,
        boxShadow: ring(0, 'rgba(255,255,255,0)'),
        scaleX: 1, scaleY: 1, rotate: 0,
        duration: 0.3, ease: 'power3.out', overwrite: 'all',
      });
    };

    const leave = () => {
      const node = s.magnet;
      s.magnet = null;
      if (node) { const q = pullFor(node); q.x(0); q.y(0); }

      const cx = gsap.getProperty(el, 'x');
      const cy = gsap.getProperty(el, 'y');
      s.pos.current.x = cx; s.pos.previous.x = cx;
      s.pos.current.y = cy; s.pos.previous.y = cy;
      s.hovered = false;
      s.detaching = true;

      const { cursorSize: cs, shape: sh, cursorColor: cc } = cfg.current;
      gsap.killTweensOf(el);
      gsap.to(el, {
        width: cs,
        height: cs,
        borderRadius: sh === 'circle' ? '50%' : sh === 'square' ? '0' : '8px',
        backgroundColor: cc,
        boxShadow: ring(0, 'rgba(255,255,255,0)'),
        scaleX: 1, scaleY: 1,
        duration: detachDuration, ease: 'power3.out', overwrite: 'all',
        onComplete: () => { s.detaching = false; },
      });
    };

    /* ---- pointer ---------------------------------------------------------- */
    let raf = 0;
    const onMove = (e) => {
      s.pos.target.x = e.clientX;
      s.pos.target.y = e.clientY;
      s.settled = false; // wake the ticker


      // Delegation: the target set is read from the live DOM every move, so
      // elements mounted after this effect ran still work.
      const node = e.target.closest?.(`[${hoverAttribute}]`) ?? null;
      if (node !== s.magnet) {
        if (s.magnet) leave();
        if (node) enter(node);
      }

      if (s.magnet) {
        if (!raf) {
          raf = requestAnimationFrame(() => {
            raf = 0;
            if (!s.magnet) return;
            const b = s.magnet.getBoundingClientRect();
            const q = pullFor(s.magnet);
            const f = cfg.current.magneticFactor;
            q.x((e.clientX - (b.left + b.width / 2)) * f);
            q.y((e.clientY - (b.top + b.height / 2)) * f);
          });
        }
        return;
      }

      // Latched, not re-tweened on every move.
      const t = e.target;
      const isText = t
        && (['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(t.tagName)
          || getComputedStyle(t).cursor === 'text');
      if (isText !== s.stretched && !s.detaching) {
        s.stretched = isText;
        gsap.to(el, {
          scaleX: isText ? 0.45 : 1,
          scaleY: isText ? 1.6 : 1,
          duration: 0.3,
          overwrite: 'auto',
        });
      }
    };

    const show = () => gsap.to(el, { opacity: 1, duration: 0.25, overwrite: 'auto' });
    const hide = () => gsap.to(el, { opacity: 0, duration: 0.25, overwrite: 'auto' });
    const prime = (e) => {
      const { clientX: x, clientY: y } = e;
      s.pos.current.x = x; s.pos.target.x = x; s.pos.previous.x = x;
      s.pos.current.y = y; s.pos.target.y = y; s.pos.previous.y = y;
      gsap.set(el, { x, y, opacity: 1 });
    };

    gsap.ticker.add(update);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointermove', prime, { once: true, passive: true });
    document.addEventListener('mouseleave', hide);
    document.addEventListener('mouseenter', show);

    return () => {
      gsap.ticker.remove(update);
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointermove', prime);
      document.removeEventListener('mouseleave', hide);
      document.removeEventListener('mouseenter', show);
      if (s.magnet) { const q = pullFor(s.magnet); q.x(0); q.y(0); s.magnet = null; }
      s.hovered = false;
      s.detaching = false;
      s.stretched = false;
      s.settled = false;
      gsap.killTweensOf(el);
      // Geometry too, not just opacity — see resetGeometry above.
      resetGeometry({ opacity: 0 });
    };
  }, [off, hoverAttribute]);

  // One filter string for both vendor properties.
  const filters = [
    desaturateBackdrop ? 'grayscale(1)' : null,
    contrastBoost !== 1 ? `contrast(${contrastBoost})` : null,
  ].filter(Boolean);
  const backdrop = filters.length ? filters.join(' ') : undefined;

  if (disableOnTouch && isTouch) return null;

  return (
    <div
      ref={cursorRef}
      className={`magnetic-cursor${off ? ' is-off' : ''}`}
      aria-hidden="true"
      style={{
        width: cursorSize,
        height: cursorSize,
        backgroundColor: cursorColor,
        borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '0' : '8px',
        mixBlendMode: blendMode,
        backdropFilter: backdrop,
        WebkitBackdropFilter: backdrop,
      }}
    />
  );
}
