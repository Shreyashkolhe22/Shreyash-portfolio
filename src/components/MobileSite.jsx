import { useEffect, useRef, useState } from 'react';
import {
  contact, education, experience, profile, projects, resume,
} from '../data/portfolio';
import { useResumeAvailable } from '../hooks/useResumeAvailable';

/**
 * The mobile / narrow-viewport site.
 *
 * The cinematic room-to-monitor mechanic is a 16:9, mouse-and-scroll-wheel
 * composition — forcing it into a phone viewport is worse than not having it
 * at all, so this is a separately designed fallback. Same content, same data
 * file.
 *
 * Layout and type follow an editorial dark-portfolio reference: a light
 * uppercase serif for the name and the skills line, a semibold grotesk for
 * the role and links, and small monospace for every label and paragraph.
 * Two column widths do the work — labels, links and cards sit at the wide
 * inset, running text at a much narrower one — and the vertical spacing is
 * deliberately generous.
 */

/* Loaded from here rather than index.html so the desktop never pays for them. */
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1'
  + '&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap';

/** Short discipline phrases, all drawn from the skills data. */
const SKILL_LINE = [
  'Java & Spring Boot',
  'REST APIs & Microservices',
  'Kafka & Redis',
  'LangChain & RAG',
  'AWS & Docker',
];

export default function MobileSite() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONTS_HREF;
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  return (
    <div className="mobile-site m3">
      <LaptopNotice />
      <Hero />
      <About />
      <Identity />
      <Skills />
      <Experience />
      <Education />
      <Highlights />
      <Projects />
      <EndCard />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * The room-to-monitor mechanic and the desktop OS inside it only exist on a
 * laptop — this is the one place that says so, before anything else on the
 * page is usable. A translucent card over a blurred backdrop, not a full
 * takeover: "Continue on mobile" sits right alongside the suggestion to
 * switch, because the mobile site is a real fallback, not an apology.
 *
 * Deliberately NOT remembered: it appears on every visit and every reload, so
 * a returning visitor is told again rather than silently dropped into the
 * plain version.
 */
function LaptopNotice() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [dismissed]);

  if (dismissed) return null;

  const dismiss = () => setDismissed(true);

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

/** A long, thin arrow — the reference never uses a chunky one. */
function Arrow() {
  return (
    <svg className="m3-arrow" viewBox="0 0 30 10" width="30" height="10" aria-hidden="true">
      <path d="M0 5h28.5M24.5 1.2 28.6 5l-4.1 3.8" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function Emphasis({ text, phrase }) {
  const i = text.indexOf(phrase);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <b>{phrase}</b>
      {text.slice(i + phrase.length)}
    </>
  );
}

function Mark() {
  return (
    <img
      className="m3-mark"
      src="/assets/logo-mark.png"
      alt=""
      width="168"
      height="128"
      decoding="async"
    />
  );
}

function Hero() {
  const available = useResumeAvailable();
  const parts = profile.location.split(',').map((s) => s.trim());
  const place = `${parts[0]}, ${parts[parts.length - 1]}`;

  return (
    <section className="m3-hero">
      <header className="m3-topbar">
        <Mark />
        <nav className="m3-topnav">
          <a href="#projects">Work<sup>{String(projects.length).padStart(2, '0')}</sup></a>
          {available && <a href={resume.file} download={resume.fileName}>Résumé</a>}
          <a href="#contact">Email me</a>
        </nav>
      </header>

      <div className="m3-meta">
        <span>Open to roles</span>
        <span>{place}</span>
      </div>

      <p className="m3-copy m3-narrow">
        <Emphasis text={profile.intro[0]} phrase="Java/Spring Boot" />
      </p>

      <h1 className="m3-name">
        <span className="m3-name-serif">{profile.name}</span>
        <span className="m3-name-role"><i>▲</i>{profile.role}<i>▲</i></span>
      </h1>

      <div>
        <SocialRow />
        <ScrollRule />
      </div>
    </section>
  );
}

function SocialRow() {
  const rows = contact.filter((c) => c.href);
  if (!rows.length) return null;
  return (
    <nav className="m3-social">
      {rows.map((c) => (
        <a key={c.id} href={c.href} target="_blank" rel="noreferrer noopener">{c.label}</a>
      ))}
    </nav>
  );
}

/** A thin rule with arrowheads at both ends whose fill tracks page progress. */
function ScrollRule() {
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
    <div className="m3-rule" aria-hidden="true">
      <span className="m3-rule-track"><span className="m3-rule-fill" ref={fillRef} /></span>
    </div>
  );
}

function Label({ children }) {
  return <p className="m3-label">{children}<i>▸</i></p>;
}

function About() {
  return (
    <section className="m3-section" id="about">
      <Label>About</Label>
      <p className="m3-copy m3-narrow">
        <Emphasis text={profile.intro[1]} phrase="readable code" />
      </p>
    </section>
  );
}

function Identity() {
  return (
    <div className="m3-section m3-section-tight">
      <div className="m3-identity m3-narrow">
        <img
          src="/assets/profile.webp"
          alt={`Portrait of ${profile.name}`}
          width="820"
          height="994"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}

function Skills() {
  return (
    <section className="m3-section" id="skills">
      <Label>Skills</Label>
      <p className="m3-flow m3-narrow">
        {SKILL_LINE.map((s, i) => (
          <span key={s}>
            {i > 0 && <i className="m3-dash" aria-hidden="true" />}
            {s}
          </span>
        ))}
        .
      </p>
    </section>
  );
}

function Experience() {
  if (!experience.length) return null;
  return (
    <section className="m3-section" id="experience">
      <Label>Experience</Label>
      <ol className="m3-list">
        {experience.map((e) => (
          <li key={e.id}>
            <p className="m3-list-when">{e.period}</p>
            <p className="m3-list-title">{e.role}</p>
            <p className="m3-list-sub">{e.org}</p>
            {e.detail?.length > 0 && (
              <ul className="m3-list-detail">
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
    <section className="m3-section" id="education">
      <Label>Education</Label>
      <ol className="m3-list">
        {education.map((e) => (
          <li key={e.id}>
            <p className="m3-list-when">{e.period}</p>
            <p className="m3-list-title">{e.credential}</p>
            <p className="m3-list-sub">{e.institution}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Splits a highlight into a bold lead and a dim continuation at the first
 *  natural break, so each reads like the reference's two-line entries. */
function splitHighlight(text) {
  const breaks = [' — ', ' that ', ' with '];
  let at = -1;
  let len = 0;
  for (const b of breaks) {
    const i = text.indexOf(b);
    if (i > 0 && (at < 0 || i < at)) { at = i; len = b.length; }
  }
  if (at < 0) return [text, ''];
  const keep = text.slice(at, at + len).trim();
  const rest = keep === '—' ? text.slice(at + len) : text.slice(at + 1);
  return [`${text.slice(0, at)} —`, rest];
}

function Highlights() {
  return (
    <section className="m3-section" id="highlights">
      <Label>Highlights</Label>
      <ul className="m3-list m3-list-counted">
        {resume.highlights.map((h, i) => {
          const [lead, rest] = splitHighlight(h);
          return (
            <li key={i}>
              <div>
                <p className="m3-list-title">{lead}</p>
                {rest && <p className="m3-list-sub">{rest}</p>}
              </div>
              <span className="m3-count">{String(i + 1).padStart(2, '0')}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Projects() {
  const [openId, setOpenId] = useState(null);
  return (
    <section className="m3-section" id="projects">
      <Label>Projects</Label>
      <ul className="m3-projects">
        {projects.map((p, i) => {
          const open = openId === p.id;
          const toggle = () => setOpenId(open ? null : p.id);
          return (
            <li key={p.id} className={`m3-project${open ? ' is-open' : ''}`}>
              <div className="m3-project-meta">
                <span>Project /{String(i + 1).padStart(2, '0')}</span>
                <span>{p.kind}</span>
              </div>

              <button type="button" className="m3-project-title" onClick={toggle} aria-expanded={open}>
                <span>{p.name.split(' — ')[0]}</span>
                <Arrow />
              </button>

              {open && (
                <div className="m3-project-body">
                  <p className="m3-body">{p.description}</p>
                  <p className="m3-stack">{p.stack.join(' / ')}</p>
                  {p.features?.length > 0 && (
                    <ul className="m3-list-detail">
                      {p.features.map((f, k) => <li key={k}>{f}</li>)}
                    </ul>
                  )}
                  <div className="m3-links">
                    {p.github
                      ? <a href={p.github} target="_blank" rel="noreferrer noopener"><Arrow /> Source</a>
                      : <span className="is-off">Source not linked</span>}
                    {p.demo
                      ? <a href={p.demo} target="_blank" rel="noreferrer noopener"><Arrow /> Live demo</a>
                      : <span className="is-off">Demo not linked</span>}
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

const timeParts = () => new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true,
}).formatToParts(new Date());

function LocalTime() {
  const [parts, setParts] = useState(timeParts);
  useEffect(() => {
    const id = window.setInterval(() => setParts(timeParts()), 15000);
    return () => window.clearInterval(id);
  }, []);
  const get = (t) => parts.find((p) => p.type === t)?.value ?? '';
  return (
    <span className="m3-time-value">
      {get('hour')}<b className="m3-colon">:</b>{get('minute')} {get('dayPeriod')}
    </span>
  );
}

function EndCard() {
  const available = useResumeAvailable();
  const email = contact.find((c) => c.id === 'email');
  const city = profile.location.split(',')[0].trim();

  return (
    <section className="m3-section m3-section-end" id="contact">
      <div className="m3-card">
        <h2 className="m3-card-title">
          Let&rsquo;s build<br />something great<br />together <i>▲</i>
        </h2>
        <p className="m3-mono-sm">Based in {city} — open to roles</p>

        {email?.href && (
          <a className="m3-cta" href={email.href}><Arrow /> Send me an email</a>
        )}
        {available && (
          <a className="m3-cta m3-cta-quiet" href={resume.file} download={resume.fileName}>
            <Arrow /> Download résumé
          </a>
        )}

        <p className="m3-time"><span>Local time</span><LocalTime /></p>

        <hr className="m3-hr" />
        <SocialRow />

        <div className="m3-card-foot">
          <Mark />
          <p>
            © {new Date().getFullYear()} {profile.name}
            <br />Made with <span aria-label="love">♥</span> by {profile.name}.
          </p>
        </div>
      </div>
    </section>
  );
}
