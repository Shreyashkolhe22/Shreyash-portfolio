import { contact, profile } from '../data/portfolio';

/**
 * Stopgap for narrow viewports.
 *
 * The cinematic monitor is a 16:9 composition; below roughly a small laptop the
 * desktop inside it scales down past readability. Rather than ship a broken
 * experience, phones get the essentials in plain HTML. A proper mobile version
 * is a later pass — see README.
 */
export default function SmallScreenNotice() {
  return (
    <main className="small-screen">
      <p className="small-eyebrow">{profile.role}</p>
      <h1 className="small-name">{profile.name}</h1>
      <p className="small-tagline">{profile.tagline}</p>

      <ul className="small-contact">
        {contact.map((row) => (
          <li key={row.id}>
            <span>{row.label}</span>
            {row.href
              ? <a href={row.href} target="_blank" rel="noreferrer noopener">{row.value}</a>
              : <em>{row.value}</em>}
          </li>
        ))}
      </ul>

      <p className="small-note">
        This portfolio is built as a cinematic desktop you walk into.
        Open it on a laptop to see the whole thing.
      </p>
    </main>
  );
}
