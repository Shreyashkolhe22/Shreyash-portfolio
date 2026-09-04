import { useState } from 'react';

/**
 * TO CHANGE THE WALLPAPER: drop an image at
 *     src/assets/wallpaper<anything>.{jpg,jpeg,png,webp}
 * and that is the whole job — `wallpaper.jpg`, `wallpaper1.jpg`,
 * `wallpaper-batmobile.png` all work. Vite finds it below, hashes it and
 * bundles it: no copying into public/, no code change.
 *
 * If several match, the last by filename wins, so dropping in `wallpaper2.jpg`
 * supersedes `wallpaper1.jpg` without deleting anything. A file in
 * public/assets/wallpaper.jpg still works as a fallback, and if nothing at all
 * is found the SVG scene below is drawn, so the desktop is never bare.
 */
const bundled = import.meta.glob('../assets/wallpaper*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const WALLPAPER_SRC =
  Object.keys(bundled).sort().map((k) => bundled[k]).pop() ?? '/assets/wallpaper.jpg';

/**
 * The fallback is a dark, rainy landscape with a lone cloaked traveller and
 * distant Japanese architecture — layered SVG, so it costs nothing to ship and
 * scales to any monitor size without artefacts.
 */
export default function Wallpaper() {
  // 'pending' shows the SVG while the photo loads, then hands over to it.
  // 'photo' drops the SVG entirely; 'svg' is the no-photo fallback.
  const [source, setSource] = useState('pending');

  return (
    <div className="wallpaper">
      {source !== 'photo' && (
      <svg
        className="wallpaper-art"
        viewBox="0 0 1280 768"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wp-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1622" />
            <stop offset="42%" stopColor="#1b2c3e" />
            <stop offset="74%" stopColor="#33495d" />
            <stop offset="100%" stopColor="#4a6076" />
          </linearGradient>
          <linearGradient id="wp-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d5266" />
            <stop offset="55%" stopColor="#1d2a37" />
            <stop offset="100%" stopColor="#111a24" />
          </linearGradient>
          <radialGradient id="wp-glow" cx="0.62" cy="0.62" r="0.42">
            <stop offset="0%" stopColor="#8fb3cc" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#8fb3cc" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wp-vignette" cx="0.5" cy="0.46" r="0.78">
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.62" />
          </radialGradient>
          <filter id="wp-soft" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="26" />
          </filter>
          <filter id="wp-haze" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <pattern id="wp-rain" width="46" height="120" patternUnits="userSpaceOnUse"
            patternTransform="rotate(13)">
            <line x1="6" y1="0" x2="6" y2="46" stroke="#cfe2f2" strokeWidth="0.9" strokeOpacity="0.16" />
            <line x1="25" y1="58" x2="25" y2="96" stroke="#cfe2f2" strokeWidth="0.8" strokeOpacity="0.11" />
            <line x1="38" y1="18" x2="38" y2="52" stroke="#cfe2f2" strokeWidth="0.7" strokeOpacity="0.09" />
          </pattern>
        </defs>

        {/* sky */}
        <rect width="1280" height="768" fill="url(#wp-sky)" />

        {/* heavy cloud banks */}
        <g filter="url(#wp-soft)" opacity="0.85">
          <ellipse cx="230" cy="118" rx="330" ry="86" fill="#0a121c" opacity="0.75" />
          <ellipse cx="700" cy="72" rx="420" ry="78" fill="#0b1420" opacity="0.7" />
          <ellipse cx="1120" cy="150" rx="330" ry="92" fill="#0a121c" opacity="0.66" />
          <ellipse cx="520" cy="214" rx="380" ry="62" fill="#22384c" opacity="0.5" />
          <ellipse cx="980" cy="252" rx="340" ry="54" fill="#2b465c" opacity="0.42" />
        </g>

        {/* break in the clouds behind the ridge */}
        <ellipse cx="795" cy="470" rx="430" ry="240" fill="url(#wp-glow)" />

        {/* far mountain range */}
        <path
          d="M0 452 L118 392 L196 424 L288 356 L372 414 L470 352 L560 410 L648 366 L742 418 L836 372 L940 424 L1046 380 L1160 428 L1280 392 L1280 500 L0 500 Z"
          fill="#2a3f53" opacity="0.55" filter="url(#wp-haze)"
        />

        {/* mid ridge */}
        <path
          d="M0 496 L142 452 L268 486 L392 440 L512 484 L640 448 L768 490 L900 452 L1030 492 L1160 460 L1280 494 L1280 560 L0 560 Z"
          fill="#1e2f40" opacity="0.9"
        />

        {/* distant Japanese architecture on the ridge */}
        <g fill="#16232f" opacity="0.95">
          {/* pagoda, three tiers */}
          <g transform="translate(968 384)">
            <path d="M-34 20 L0 4 L34 20 L26 24 L-26 24 Z" />
            <rect x="-15" y="24" width="30" height="18" />
            <path d="M-42 46 L0 30 L42 46 L32 50 L-32 50 Z" />
            <rect x="-18" y="50" width="36" height="20" />
            <path d="M-50 74 L0 56 L50 74 L38 78 L-38 78 Z" />
            <rect x="-21" y="78" width="42" height="24" />
            <rect x="-4" y="-14" width="2.6" height="18" />
            <circle cx="-2.7" cy="-16" r="3.2" />
          </g>
          {/* low temple hall */}
          <g transform="translate(838 436)">
            <path d="M-46 16 L0 0 L46 16 L34 21 L-34 21 Z" />
            <rect x="-30" y="21" width="60" height="24" />
          </g>
          {/* torii gate, closer and smaller */}
          <g transform="translate(1108 452)" opacity="0.8">
            <rect x="-22" y="-2" width="44" height="3.4" />
            <rect x="-18" y="6" width="36" height="2.6" />
            <rect x="-14" y="-2" width="3.4" height="30" />
            <rect x="10.6" y="-2" width="3.4" height="30" />
          </g>
        </g>

        {/* wet ground */}
        <path d="M0 520 L1280 500 L1280 768 L0 768 Z" fill="url(#wp-ground)" />

        {/* haze along the horizon so the ground meets the ridge softly */}
        <path
          d="M0 496 L1280 476 L1280 556 L0 576 Z"
          fill="#4a6076" opacity="0.5" filter="url(#wp-haze)"
        />

        {/* wet sheen on the ground — long, flat, barely there */}
        <g opacity="0.10" filter="url(#wp-haze)">
          <ellipse cx="330" cy="716" rx="240" ry="8" fill="#a8c6dd" />
          <ellipse cx="980" cy="664" rx="200" ry="6" fill="#a8c6dd" />
          <ellipse cx="700" cy="752" rx="300" ry="9" fill="#a8c6dd" />
        </g>

        {/* lone cloaked traveller */}
        <g transform="translate(508 556)" fill="#0b1219">
          {/* cloak silhouette */}
          <path d="M0 0 C -7 3 -12 12 -14 24 L-19 66 C -20 72 -17 76 -11 76 L11 76 C 17 76 20 72 19 66 L14 24 C 12 12 7 3 0 0 Z" />
          {/* hood */}
          <path d="M0 -14 C -7 -14 -11 -8 -11 -1 C -11 4 -7 7 0 7 C 7 7 11 4 11 -1 C 11 -8 7 -14 0 -14 Z" />
          {/* trailing hem caught by the wind */}
          <path d="M11 60 C 20 64 27 70 30 78 L14 76 Z" />
          {/* staff */}
          <rect x="17" y="-22" width="2.2" height="100" rx="1" transform="rotate(6 18 28)" />
        </g>
        {/* faint rim light on the traveller's left side */}
        <path
          d="M508 542 C 501 542 497 548 497 555 L492 622"
          stroke="#b9d4e8" strokeOpacity="0.30" strokeWidth="1.8" fill="none"
        />

        {/* birds */}
        <g stroke="#0d1720" strokeWidth="1.9" fill="none" strokeLinecap="round" opacity="0.72">
          <path d="M232 214 q7 -6 13 0 q6 -6 13 0" />
          <path d="M300 176 q5.5 -5 10 0 q4.5 -5 10 0" />
          <path d="M368 226 q4.5 -4 8 0 q3.5 -4 8 0" />
          <path d="M1006 196 q6 -5 11 0 q5 -5 11 0" />
          <path d="M1064 236 q4 -3.5 7.5 0 q3 -3.5 7.5 0" />
          <path d="M172 268 q4 -3.5 7.5 0 q3 -3.5 7.5 0" opacity="0.6" />
        </g>

        {/* rain */}
        <rect width="1280" height="768" fill="url(#wp-rain)" />

        {/* atmosphere + vignette */}
        <rect width="1280" height="768" fill="#16283a" opacity="0.2" />
        <rect width="1280" height="768" fill="url(#wp-vignette)" />
      </svg>
      )}

      {source !== 'svg' && (
        <img
          className="wallpaper-photo"
          src={WALLPAPER_SRC}
          alt=""
          aria-hidden="true"
          onLoad={() => setSource('photo')}
          onError={() => setSource('svg')}
        />
      )}
    </div>
  );
}
