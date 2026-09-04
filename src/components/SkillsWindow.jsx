import { skills } from '../data/portfolio';

/**
 * No invented percentages. Skills carry an honest keyword instead, rendered as
 * a three-step indicator so the grouping is scannable without pretending to a
 * precision nobody has.
 */
const LEVELS = {
  core: { steps: 3, text: 'Daily driver' },
  working: { steps: 2, text: 'Shipped with it' },
  familiar: { steps: 1, text: 'Used it' },
};

export default function SkillsWindow() {
  return (
    <div className="app app-skills">
      <ul className="legend">
        {Object.entries(LEVELS).map(([key, v]) => (
          <li key={key}>
            <Meter steps={v.steps} />
            <span>{v.text}</span>
          </li>
        ))}
      </ul>

      <div className="skill-groups">
        {skills.map((group) => (
          <section key={group.category} className="skill-group">
            <h4 className="app-section-title">{group.category}</h4>
            <ul className="skill-list">
              {group.items.map((item) => (
                <li key={item.name} className={`skill-row level-${item.level}`}>
                  <span className="skill-name">{item.name}</span>
                  <Meter steps={LEVELS[item.level]?.steps ?? 1} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function Meter({ steps }) {
  return (
    <span className="meter" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <span key={i} className={`meter-step${i <= steps ? ' is-on' : ''}`} />
      ))}
    </span>
  );
}
