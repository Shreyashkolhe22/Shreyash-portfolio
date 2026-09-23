import { useState } from 'react';
import {
  coreTech, contact, education, experience, hero,
  profile, projects, resume, skills,
} from '../data/portfolio';
import { useResumeAvailable } from '../hooks/useResumeAvailable';
import {
  IconAbout, IconContact, IconDownload, IconEducation,
  IconGithub, IconLink, IconProjects, IconSkills,
} from './Icons';

/**
 * The mobile / narrow-viewport site.
 *
 * The cinematic room-to-monitor mechanic is a 16:9, mouse-and-scroll-wheel
 * composition — the brief that shaped it was explicit that forcing it into a
 * phone viewport is worse than not having it, and to build a real fallback as
 * a later pass rather than trying to replicate a desk you can't see. This is
 * that pass: the same content, same data file, as a normal single-page
 * mobile site instead of a "come back on a laptop" placeholder.
 *
 * Visually it borrows the desktop's white-on-black identity (the mobile
 * visitor never sees the warm physical room at all, so there is no
 * warm/cool split to preserve here) with the same serif/sans pairing the
 * desktop hero already uses.
 */
export default function MobileSite() {
  return (
    <div className="mobile-site">
      <LaptopNotice />
      <TopBar />
      <Hero />
      <About />
      <ExperienceEducation />
      <Projects />
      <Skills />
      <Resume />
      <Contact />
      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const LAPTOP_NOTICE_KEY = 'sk-laptop-notice-dismissed';

/**
 * The room-to-monitor mechanic and the desktop OS inside it only exist on a
 * laptop — this is the one place that says so, once, before anything else on
 * the page. Dismissal is remembered so a visitor who already knows doesn't
 * see it again on a later visit.
 */
function LaptopNotice() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(LAPTOP_NOTICE_KEY) === '1'; } catch { return false; }
  });
  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(LAPTOP_NOTICE_KEY, '1'); } catch { /* private mode */ }
  };

  return (
    <div className="m-laptop-notice" role="note">
      <p>
        For the full experience, switch to a laptop — that's where you can
        walk into my interactive desktop. This is the plain version.
      </p>
      <button type="button" className="m-laptop-notice-dismiss" onClick={dismiss} aria-label="Dismiss">
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
          <path d="m3.2 3.2 5.6 5.6M8.8 3.2 3.2 8.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function TopBar() {
  const available = useResumeAvailable();
  return (
    <header className="m-topbar">
      <span className="m-brand">
        <span>{hero.brandMark}</span>
        <i aria-hidden="true" />
        <span>{hero.brandWord}</span>
      </span>
      {available && (
        <a className="m-topbar-resume" href={resume.file} download={resume.fileName} aria-label="Download resume">
          <IconDownload width="16" height="16" />
        </a>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="m-hero">
      <p className="m-eyebrow">{hero.greeting}</p>
      <h1 className="m-name">{profile.name}</h1>
      <p className="m-role">{profile.role}</p>
      <p className="m-tagline">{profile.tagline}</p>

      <div className="m-cta-row">
        <a className="m-btn m-btn-primary" href="#contact">{hero.navCta}</a>
        <a className="m-btn" href="#resume">Resume</a>
      </div>

      <SocialRow />
    </section>
  );
}

function SocialRow() {
  const rows = contact.filter((c) => c.href);
  if (!rows.length) return null;
  const icon = { github: IconGithub, linkedin: IconLink, email: IconContact };
  return (
    <div className="m-social-row">
      {rows.map((c) => {
        const Icon = icon[c.id] ?? IconLink;
        return (
          <a key={c.id} className="m-social" href={c.href} target="_blank" rel="noreferrer noopener" aria-label={c.label}>
            <Icon width="18" height="18" />
          </a>
        );
      })}
    </div>
  );
}

function About() {
  return (
    <section className="m-section" id="about">
      <SectionHead icon={IconAbout} title="About" />
      {profile.intro.map((para, i) => <p key={`intro-${i}`} className="m-para">{para}</p>)}
      <ul className="m-chips">
        {coreTech.map((t) => <li key={t} className="m-chip">{t}</li>)}
      </ul>
    </section>
  );
}

function ExperienceEducation() {
  return (
    <section className="m-section" id="experience">
      {experience.length > 0 && (
        <>
          <SectionHead icon={IconEducation} title="Experience" />
          <ol className="m-timeline">
            {experience.map((e) => (
              <li key={e.id} className="m-timeline-item">
                <span className="m-timeline-dot" aria-hidden="true" />
                <p className="m-timeline-period">{e.period}</p>
                <h3 className="m-timeline-title">{e.role}</h3>
                <p className="m-timeline-org">{e.org}</p>
                {e.detail?.length > 0 && (
                  <ul className="m-bullets">
                    {e.detail.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </>
      )}

      <SectionHead icon={IconEducation} title="Education" />
      <ol className="m-timeline">
        {education.map((e) => (
          <li key={e.id} className="m-timeline-item">
            <span className="m-timeline-dot" aria-hidden="true" />
            <p className="m-timeline-period">{e.period}</p>
            <h3 className="m-timeline-title">{e.credential}</h3>
            <p className="m-timeline-org">{e.institution}</p>
            {e.detail?.length > 0 && (
              <ul className="m-bullets">
                {e.detail.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Projects() {
  const [openId, setOpenId] = useState(projects[0]?.id ?? null);
  return (
    <section className="m-section" id="projects">
      <SectionHead icon={IconProjects} title="Projects" />
      <ul className="m-project-list">
        {projects.map((p) => {
          const open = openId === p.id;
          return (
            <li key={p.id} className={`m-project${open ? ' is-open' : ''}`}>
              <button
                type="button"
                className="m-project-head"
                onClick={() => setOpenId(open ? null : p.id)}
                aria-expanded={open}
              >
                <span>
                  <span className="m-project-name">{p.name}</span>
                  <span className="m-project-summary">{p.summary}</span>
                </span>
                <span className="m-project-chevron" aria-hidden="true">{open ? '−' : '+'}</span>
              </button>

              {open && (
                <div className="m-project-body">
                  <p className="m-para">{p.description}</p>
                  <ul className="m-chips">
                    {p.stack.map((t) => <li key={t} className="m-chip">{t}</li>)}
                  </ul>
                  {p.features?.length > 0 && (
                    <ul className="m-bullets">
                      {p.features.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  )}
                  <div className="m-project-actions">
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

function Skills() {
  return (
    <section className="m-section" id="skills">
      <SectionHead icon={IconSkills} title="Skills" />
      <div className="m-skill-groups">
        {skills.map((g) => (
          <div key={g.category} className="m-skill-group">
            <p className="m-skill-category">{g.category}</p>
            <ul className="m-chips">
              {g.items.map((it) => (
                <li key={it.name} className={`m-chip${it.level === 'core' ? ' is-core' : ''}`}>{it.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Resume() {
  const available = useResumeAvailable();
  return (
    <section className="m-section" id="resume">
      <SectionHead icon={IconDownload} title="Resume" />
      <p className="m-hint">{resume.fileName} · updated {resume.updated}</p>
      <ul className="m-bullets">
        {resume.highlights.map((h, i) => <li key={i}>{h}</li>)}
      </ul>
      {available ? (
        <a className="m-btn m-btn-primary m-btn-block" href={resume.file} download={resume.fileName}>
          <IconDownload width="16" height="16" /> Download résumé
        </a>
      ) : (
        <span className="m-btn m-btn-block is-disabled">
          <IconDownload width="16" height="16" /> {available === null ? 'Checking…' : 'PDF not added yet'}
        </span>
      )}
    </section>
  );
}

function Contact() {
  return (
    <section className="m-section" id="contact">
      <SectionHead icon={IconContact} title="Contact" />
      <ul className="m-contact-list">
        {contact.map((c) => (
          <li key={c.id}>
            {c.href ? (
              <a href={c.href} target="_blank" rel="noreferrer noopener">
                <span className="m-contact-label">{c.label}</span>
                <span className="m-contact-value">{c.value}</span>
              </a>
            ) : (
              <span className="is-placeholder">
                <span className="m-contact-label">{c.label}</span>
                <span className="m-contact-value">{c.value}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Footer() {
  return (
    <footer className="m-footer">
      <a href="#top" className="m-back-top">Back to top</a>
      <p>{profile.status}</p>
    </footer>
  );
}

function SectionHead({ icon: Icon, title }) {
  return (
    <div className="m-section-head">
      <span className="m-section-icon"><Icon width="16" height="16" /></span>
      <h2>{title}</h2>
    </div>
  );
}
