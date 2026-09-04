import { useState } from 'react';
import { contact } from '../data/portfolio';
import { IconContact, IconGithub, IconLink } from './Icons';

const GLYPH = { email: IconContact, github: IconGithub, linkedin: IconLink };

export default function ContactWindow() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', from: '', body: '' });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="app app-contact">
      <ul className="contact-list">
        {contact.map((row) => {
          const Glyph = GLYPH[row.id] ?? IconLink;
          return (
            <li key={row.id} className="contact-row">
              <span className="contact-glyph"><Glyph width="16" height="16" /></span>
              <span className="contact-label">{row.label}</span>
              {row.href ? (
                <a className="contact-value" href={row.href} target="_blank" rel="noreferrer noopener">
                  {row.value}
                </a>
              ) : (
                <span className="contact-value is-placeholder">{row.value}</span>
              )}
            </li>
          );
        })}
      </ul>

      <section className="app-section">
        <h4 className="app-section-title">Compose</h4>
        {sent ? (
          <p className="app-note">
            Draft saved locally. This form has no backend yet — wire it to a form service
            or a <code>mailto:</code> link once your real address is in{' '}
            <code>src/data/portfolio.js</code>.
          </p>
        ) : (
          <form
            className="contact-form"
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          >
            <label>
              <span>Name</span>
              <input value={form.name} onChange={set('name')} placeholder="Your name" required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={form.from} onChange={set('from')}
                placeholder="you@company.com" required />
            </label>
            <label className="is-wide">
              <span>Message</span>
              <textarea value={form.body} onChange={set('body')} rows={3}
                placeholder="Say hello…" required />
            </label>
            <button type="submit" className="action-btn is-primary">Send</button>
          </form>
        )}
      </section>
    </div>
  );
}
