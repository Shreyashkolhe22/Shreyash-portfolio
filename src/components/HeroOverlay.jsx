import { contact, hero, profile, scrollGuide, statements } from '../data/portfolio';

/**
 * The landing view — the first thing a visitor sees, laid over the wide room —
 * plus the statements that reveal as the camera moves toward the monitor.
 *
 * Nothing here animates itself. Every block carries data-from / data-to, and
 * the cinematic scroll loop drives its opacity and drift from one place. That
 * keeps a single per-frame writer for the whole experience.
 *
 *   0 ──── hero ────┐                                             1
 *                   └── statement 1 ──┐
 *                                     └── statement 2 ──┐
 *                                                       └── desktop
 */
export default function HeroOverlay({ overlayRef, onEnter, onContact }) {
  return (
    <div className="hero-layer" ref={overlayRef}>

      {/* ---- landing --------------------------------------------------- */}
      <div className="hero" data-from="0" data-to="0.14" data-in="0" data-out="0.07" data-rise="0">

        <header className="hero-nav">
          <span className="hero-brand" data-magnetic>
            <span>{hero.brandMark}</span>
            <i aria-hidden="true" />
            <span>{hero.brandWord}</span>
          </span>
          <span className="hero-rule" aria-hidden="true" />

          <nav className="hero-links">
            {hero.nav.map((item) => {
              const row = contact.find((c) => c.id === item.id);
              // A real URL opens outward; anything still unset routes into the
              // desktop's Contact app rather than being a dead link.
              return row?.href ? (
                <a key={item.id} data-magnetic href={row.href} target="_blank" rel="noreferrer noopener">
                  {item.label}
                </a>
              ) : (
                <button key={item.id} data-magnetic type="button" onClick={onContact}>{item.label}</button>
              );
            })}
          </nav>

          <button data-magnetic type="button" className="hero-cta" onClick={onContact}>
            {hero.navCta}
            <span className="hero-cta-dot" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12h15" /><path d="m13 6 6 6-6 6" />
              </svg>
            </span>
          </button>
        </header>

        <div className="hero-intro">
          <p className="hero-greeting"><span className="hero-tick" aria-hidden="true" />{hero.greeting}</p>
          <h1 className="hero-name">
            {profile.name.split(' ').map((w) => <span key={w}>{w}</span>)}
          </h1>
          <div className="hero-sub">
            <p className="hero-headline">{hero.headline}</p>
            <p className="hero-tagline">{profile.tagline}</p>
          </div>
        </div>

        {/* Right-edge line + pulsing dots — unchanged from the original.
            Only the "Scroll to Workspace" text came out of this block; it
            now lives in the bottom-centre cue below instead. */}
        <div className="hero-scroll" aria-hidden="true">
          <span className="hero-scroll-dots"><i /><i /><i /></span>
          <span className="hero-scroll-line" />
        </div>

        {/* Bottom-centre scroll cue: the label that used to sit on the right
            edge, now paired with a bobbing down-arrow in the conventional
            "scroll to continue" spot. */}
        <div className="hero-scroll-cue" aria-hidden="true">
          <span className="hero-scroll-cue-label">Scroll</span>
          <span className="hero-scroll-cue-arrow">
            <svg viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="m2 2 8 8 8-8" />
            </svg>
          </span>
        </div>

        <div className="hero-role">
          <h2 className="hero-role-title">{profile.role}</h2>
          <p className="hero-role-kicker">{hero.roleKicker}</p>
          <p className="hero-role-body">{profile.summary}</p>
          <button data-magnetic type="button" className="hero-enter" onClick={onEnter}>{hero.cta}</button>
        </div>
      </div>

      {/* ---- scroll statements ----------------------------------------- */}
      {statements.map((s) => (
        <div
          key={s.id}
          className="statement"
          data-from={s.from}
          data-to={s.to}
          data-in="0.07"
          data-out="0.07"
          data-rise="22"
        >
          <p className="statement-kicker">{s.kicker}</p>
          <p className="statement-line">{s.line}</p>
        </div>
      ))}

      {/*
        ---- scroll guide -------------------------------------------------
        Covers the long quiet stretch after the last statement, where the
        room is still closing in but nothing on screen says so. A small
        bottom-anchored pill rather than a full statement — it is a nudge,
        not a headline, and must stay clear of the monitor growing toward
        the centre of the frame.
      */}
      {scrollGuide.map((g) => (
        <div
          key={g.id}
          className="scroll-guide"
          data-from={g.from}
          data-to={g.to}
          data-in="0.03"
          data-out="0.02"
          data-rise="10"
        >
          {/* One shared pill, not two siblings — .scroll-guide-pill is what
              carries the background/border/animation, so the chevron and the
              text render as a single row instead of stacking as two separate
              pills (that was the bug: .scroll-guide > * previously matched
              BOTH children independently). */}
          <span className="scroll-guide-pill">
            <span className="scroll-guide-chevron" aria-hidden="true">
              <svg viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="m2 2 8 8 8-8" />
              </svg>
            </span>
            <span className="scroll-guide-text">
              <strong>{g.text}</strong>
              <em>{g.sub}</em>
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
