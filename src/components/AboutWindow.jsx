import { coreTech, profile } from '../data/portfolio';

export default function AboutWindow() {
  return (
    <div className="app app-about">
      <div className="about-head">
        <div className="about-avatar" aria-hidden="true">
          {profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
        </div>
        <div>
          <h3 className="about-name">{profile.name}</h3>
          <p className="about-role">{profile.role}</p>
          <p className="about-tagline">{profile.tagline}</p>
        </div>
      </div>

      <dl className="about-meta">
        <div><dt>Location</dt><dd>{profile.location}</dd></div>
        <div><dt>Status</dt><dd><span className="status-dot" />{profile.status}</dd></div>
      </dl>

      <section className="app-section">
        <h4 className="app-section-title">Introduction</h4>
        {profile.intro.map((para, i) => <p key={`intro-${i}`} className="app-para">{para}</p>)}
      </section>

      <section className="app-section">
        <h4 className="app-section-title">Technologies</h4>
        <ul className="chips">
          {coreTech.map((t) => <li key={t} className="chip">{t}</li>)}
        </ul>
      </section>
    </div>
  );
}
