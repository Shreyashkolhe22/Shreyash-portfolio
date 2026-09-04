/**
 * Anurati availability, resolved once for the whole app.
 *
 * Two places want this face — the landing page's name and the desktop clock's
 * day — and both need *different* metrics depending on whether it actually
 * loaded. Anurati is drawn to be set far wider than a normal typeface, so a
 * single letter-spacing cannot serve both it and the fallback.
 *
 * Rather than have each component run its own detection (and race the other
 * for the same font), this resolves once and puts `anurati-ready` on the root
 * element, so the answer is available to plain CSS.
 *
 * NOTE: the face is UPPERCASE-ONLY — 38 glyphs covering A-Z, space and
 * `! & + / ~`. No digits, no lowercase, no punctuation. Only ever apply it to
 * text you know is pure A-Z, or it will fall back per character and render as
 * two mixed typefaces.
 */

const READY_CLASS = 'anurati-ready';
let started = false;

export function ensureAnurati() {
  if (started || typeof document === 'undefined' || !document.fonts?.load) return;
  started = true;

  document.fonts
    .load('16px Anurati')
    .then((faces) => {
      // An empty array means the @font-face matched nothing loadable — the
      // file is missing. A rejection means the same. Either way the fallback
      // metrics stay in force.
      if (faces.length > 0) document.documentElement.classList.add(READY_CLASS);
    })
    .catch(() => { /* not installed; fallback styling stands */ });
}
