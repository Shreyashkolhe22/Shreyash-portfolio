import { education, experience } from '../data/portfolio';

/**
 * Experience and Education share the same shape (period / title / org /
 * detail), so they share the same timeline markup — just fed from two
 * different arrays and given their own section heading. That is also why
 * this stays one window rather than growing a second icon: the resume splits
 * them into two headings, not two documents.
 */
function Timeline({ items, titleKey, orgKey }) {
  return (
    <ol className="timeline">
      {items.map((item) => (
        <li key={item.id} className="timeline-item">
          <span className="timeline-marker" aria-hidden="true" />
          <div className="timeline-body">
            <p className="timeline-period">{item.period}</p>
            <h3 className="timeline-title">{item[titleKey]}</h3>
            <p className="timeline-org">{item[orgKey]}</p>
            {item.detail?.length > 0 && (
              <ul className="timeline-detail">
                {item.detail.map((d, i) => <li key={`${item.id}-d${i}`}>{d}</li>)}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function EducationWindow() {
  return (
    <div className="app app-education">
      {experience.length > 0 && (
        <section className="app-section" style={{ marginTop: 0 }}>
          <h4 className="app-section-title">Experience</h4>
          <Timeline items={experience} titleKey="role" orgKey="org" />
        </section>
      )}

      <section className="app-section">
        <h4 className="app-section-title">Education</h4>
        <Timeline items={education} titleKey="credential" orgKey="institution" />
      </section>
    </div>
  );
}
