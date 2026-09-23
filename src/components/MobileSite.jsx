import { useEffect, useRef, useState } from 'react';
import {
  coreTech, contact, education, experience, hero,
  profile, projects, resume,
} from '../data/portfolio';
import { useResumeAvailable } from '../hooks/useResumeAvailable';
import { IconGithub, IconLink } from './Icons';

/**
 * The mobile / narrow-viewport site.
 *
 * The cinematic room-to-monitor mechanic is a 16:9, mouse-and-scroll-wheel
 * composition — forcing it into a phone viewport is worse than not having it
 * at all, so this is a real, separately-designed fallback rather than a
 * shrunken version of the desktop. Same content, same data file.
 *
 * The layout and type system here follow an editorial dark-portfolio
 * reference the visitor asked to match: a stacked meta row, a justified
 * intro paragraph, a big name/role block with triangle bullets, section
 * labels with a trailing arrow, a flowing skills line, and full-bleed
 * project cards. Colours stay on the site's own --os-* tokens rather than
 * the reference's exact grey, so the mobile site and the desktop OS still
 * read as one identity.
 */
export default function MobileSite() {
  return (
    <div className="mobile-site m2">
      <LaptopNotice />
      <TopBar />
      <Hero />
      <About />
      <Identity />
      <SkillsFlow />
      <Experience />
      <Education />
      <Highlights />
      <Projects />
      <ResumeCta />
      <ContactCard />
      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const LAPTOP_NOTICE_KEY = 'sk-laptop-notice-dismissed';

/**
 * The room-to-monitor mechanic and the desktop OS inside it only exist on a
 * laptop — this is the one place that says so, before anything else on the
 * page is usable. A translucent card over a blurred backdrop, not a full
 * takeover: "Continue on mobile" sits right alongside the suggestion to
 * switch, because the mobile site is a real fallback, not an apology.
 */
function LaptopNotice() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(LAPTOP_NOTICE_KEY) === '1'; } catch { return false; }
  });

  useEffect(() => {
    if (dismissed) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [dismissed]);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(LAPTOP_NOTICE_KEY, '1'); } catch { /* private mode */ }
  };

  return (
    <div className="m-laptop-overlay" role="dialog" aria-modal="true" aria-label="Best viewed on a laptop">
      <div className="m-laptop-card">
        <p className="m-laptop-title">Switch to a laptop</p>
        <p className="m-laptop-body">
          This portfolio is built around an interactive desktop that only
          fits a laptop-sized screen — scroll in, and the whole thing wakes
          up inside a monitor. On mobile you get the plain version below.
        </p>
        <button type="button" className="m-btn m-btn-primary m-btn-block" onClick={dismiss}>
          Continue on mobile
        </button>
      </div>
    </div>
  );
}

function TopBar() {
  const available = useResumeAvailable();
  return (
    <header className="m2-topbar">
      <span className="m2-mark" aria-hidden="true">{hero.brandMark}</span>
      <nav className="m2-topnav">
        <a href="#projects">Work</a>
        {available ? (
          <a href={resume.file} download={resume.fileName}>Résumé</a>
        ) : (
          <a href="#resume">Résumé</a>
        )}
        <a href="#contact">Email me</a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="m2-hero">
      <div className="m2-meta-row">
        <span>{profile.status.replace('Open to ', '').replace(' roles', '')}</span>
        <span>{profile.location.split(',')[0]}</span>
      </div>

      <p className="m2-intro">{profile.intro[0]}</p>

      <div className="m2-name-block">
        <h1 className="m2-name">{profile.name}</h1>
        <p className="m2-role"><i>▴</i>{profile.role}<i>▴</i></p>
      </div>

      <SocialRow />
      <ScrollHint />
    </section>
  );
}

function SocialRow() {
  const rows = contact.filter((c) => c.href);
  if (!rows.length) return null;
  return (
    <nav className="m2-social-row">
      {rows.map((c) => (
        <a key={c.id} href={c.href} target="_blank" rel="noreferrer noopener">{c.label}</a>
      ))}
    </nav>
  );
}

/** Decorative scroll indicator — a thin track that fills with page progress. */
function ScrollHint() {
  const fillRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="m2-scroll-hint" aria-hidden="true">
      <span className="m2-scroll-hint-fill" ref={fillRef} />
    </div>
  );
}

function SectionLabel({ children }) {
  return <p className="m2-label">{children} <i>▸</i></p>;
}

function About() {
  return (
    <section className="m2-section" id="about">
      <SectionLabel>About</SectionLabel>
      {profile.intro.slice(1).map((para, i) => <p key={`about-${i}`} className="m2-justify">{para}</p>)}
      <ul className="m2-tags">
        {coreTech.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </section>
  );
}

/** Stands in for a portrait: no photo asset exists, so a monogram panel
 *  carries the same weight and rhythm in the layout without faking one. */
function Identity() {
  return (
    <div className="m2-identity" aria-hidden="true">
      <span>{hero.brandMark}</span>
    </div>
  );
}

function SkillsFlow() {
  const line = [...new Set(coreTech)].join(' — ');
  return (
    <section className="m2-section" id="skills">
      <SectionLabel>Skills</SectionLabel>
      <p className="m2-flow">{line}.</p>
    </section>
  );
}

function Experience() {
  if (!experience.length) return null;
  return (
    <section className="m2-section" id="experience">
      <SectionLabel>Experience</SectionLabel>
      <ol className="m2-timeline">
        {experience.map((e) => (
          <li key={e.id}>
            <p className="m2-tl-period">{e.period}</p>
            <p className="m2-tl-title">{e.role}</p>
            <p className="m2-tl-org">{e.org}</p>
            {e.detail?.length > 0 && (
              <ul className="m2-tl-detail">
                {e.detail.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Education() {
  return (
    <section className="m2-section" id="education">
      <SectionLabel>Education</SectionLabel>
      <ol className="m2-timeline">
        {education.map((e) => (
          <li key={e.id}>
            <p className="m2-tl-period">{e.period}</p>
            <p className="m2-tl-title">{e.credential}</p>
            <p className="m2-tl-org">{e.institution}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Highlights() {
  return (
    <section className="m2-section" id="highlights">
      <SectionLabel>Highlights</SectionLabel>
      <ul className="m2-highlights">
        {resume.highlights.map((h, i) => {
          const split = h.split(' — ');
          const lead = split.length > 1 ? split[0] : h;
          const rest = split.length > 1 ? split.slice(1).join(' — ') : null;
          return (
            <li key={i}>
              <p className="m2-hl-lead">{lead}</p>
              {rest && <p className="m2-hl-rest">{rest}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** A different gradient per card, derived from the project id rather than
 *  invented per-project art — there is no screenshot asset to show instead. */
const CARD_GRADIENTS = [
  'linear-gradient(155deg, #3a2a1f 0%, #14100c 70%)',
  'linear-gradient(155deg, #1f2a30 0%, #0c1012 70%)',
  'linear-gradient(155deg, #2a2418 0%, #100e0a 70%)',
  'linear-gradient(155deg, #241f2e 0%, #0d0b12 70%)',
  'linear-gradient(155deg, #1f2e26 0%, #0b120d 70%)',
];

function Projects() {
  const [openId, setOpenId] = useState(null);
  return (
    <section className="m2-section" id="projects">
      <SectionLabel>Projects</SectionLabel>
      <ul className="m2-project-list">
        {projects.map((p, i) => {
          const open = openId === p.id;
          return (
            <li key={p.id} className={`m2-project-card${open ? ' is-open' : ''}`}>
              <button
                type="button"
                className="m2-project-thumb"
                style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
                onClick={() => setOpenId(open ? null : p.id)}
                aria-expanded={open}
              >
                <span className="m2-project-meta">
                  <span>{`PROJECT /${String(i + 1).padStart(2, '0')}`}</span>
                  <span>{p.kind}</span>
                </span>
              </button>
              <button
                type="button"
                className="m2-project-head"
                onClick={() => setOpenId(open ? null : p.id)}
                aria-expanded={open}
              >
                <span className="m2-project-name">{p.name.split(' — ')[0]}</span>
                <i>{open ? '−' : '→'}</i>
              </button>
              <p className="m2-project-summary">{p.summary}</p>

              {open && (
                <div className="m2-project-body">
                  <p className="m2-justify">{p.description}</p>
                  <ul className="m2-tags">
                    {p.stack.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                  {p.features?.length > 0 && (
                    <ul className="m2-tl-detail">
                      {p.features.map((f, i2) => <li key={i2}>{f}</li>)}
                    </ul>
                  )}
                  <div className="m2-project-actions">
                    {p.github ? (
                      <a className="m-btn m-btn-sm" href={p.github} target="_blank" rel="noreferrer noopener">
                        <IconGithub width="14" height="14" /> Source
                      </a>
                    ) : (
                      <span className="m-btn m-btn-sm is-disabled"><IconGithub width="14" height="14" /> Source not linked</span>
                    )}
                    {p.demo ? (
                      <a className="m-btn m-btn-sm" href={p.demo} target="_blank" rel="noreferrer noopener">
                        <IconLink width="14" height="14" /> Live demo
                      </a>
                    ) : (
                      <span className="m-btn m-btn-sm is-disabled"><IconLink width="14" height="14" /> Demo not linked</span>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ResumeCta() {
  const available = useResumeAvailable();
  return (
    <section className="m2-section" id="resume">
      <SectionLabel>Résumé</SectionLabel>
      <p className="m2-justify">{resume.fileName} · updated {resume.updated}.</p>
      {available ? (
        <a className="m-btn m-btn-primary m-btn-block" href={resume.file} download={resume.fileName}>
          Download résumé
        </a>
      ) : (
        <span className="m-btn m-btn-block is-disabled">
          {available === null ? 'Checking…' : 'PDF not added yet'}
        </span>
      )}
    </section>
  );
}

const fmtIST = () => new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true,
}).format(new Date());

function LocalTime() {
  const [text, setText] = useState(fmtIST);
  useEffect(() => {
    const id = window.setInterval(() => setText(fmtIST()), 30000);
    return () => window.clearInterval(id);
  }, []);
  return <span>{text}</span>;
}

function ContactCard() {
  const email = contact.find((c) => c.id === 'email');
  return (
    <section className="m2-section" id="contact">
      <div className="m2-contact-card">
        <p className="m2-contact-title">Let's build something great together.</p>
        <p className="m2-contact-sub">
          {profile.location} — {profile.status.toLowerCase()}
        </p>

        {email?.href && (
          <a className="m2-contact-cta" href={email.href}>
            <i>→</i> Send me an email
          </a>
        )}

        <p className="m2-contact-time">Local time <i>▸</i> <LocalTime /></p>

        <SocialRow />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="m2-footer">
      <span className="m2-mark" aria-hidden="true">{hero.brandMark}</span>
      <p>© {new Date().getFullYear()} {profile.name}</p>
      <p>Built by hand with React &amp; CSS.</p>
    </footer>
  );
}
