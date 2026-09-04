import { useState } from 'react';
import { projects } from '../data/portfolio';
import { IconBack, IconGithub, IconLink, IconProjects } from './Icons';

/**
 * Projects behaves like a small file browser: a list of project "files", and a
 * detail view that replaces it in place. Nothing navigates away from the OS.
 */
export default function ProjectsWindow() {
  const [openId, setOpenId] = useState(null);
  const project = projects.find((p) => p.id === openId) ?? null;

  if (project) {
    return (
      <div className="app app-project-detail">
        <div className="detail-bar">
          <button type="button" className="ghost-btn" onClick={() => setOpenId(null)}>
            <IconBack width="14" height="14" />
            All projects
          </button>
          <span className="detail-year">{project.year}</span>
        </div>

        <h3 className="detail-title">{project.name}</h3>
        <p className="detail-kind">{project.kind}</p>
        <p className="app-para">{project.description}</p>

        <section className="app-section">
          <h4 className="app-section-title">Stack</h4>
          <ul className="chips">
            {project.stack.map((t) => <li key={t} className="chip">{t}</li>)}
          </ul>
        </section>

        {project.features?.length > 0 && (
          <section className="app-section">
            <h4 className="app-section-title">Features</h4>
            <ul className="bullets">
              {project.features.map((f, i) => <li key={`${project.id}-f${i}`}>{f}</li>)}
            </ul>
          </section>
        )}

        <div className="detail-actions">
          {project.github ? (
            <a className="action-btn" href={project.github} target="_blank" rel="noreferrer noopener">
              <IconGithub width="15" height="15" /> Source
            </a>
          ) : (
            <span className="action-btn is-disabled" title="Add a `github` URL in src/data/portfolio.js">
              <IconGithub width="15" height="15" /> Source not linked
            </span>
          )}
          {project.demo ? (
            <a className="action-btn" href={project.demo} target="_blank" rel="noreferrer noopener">
              <IconLink width="15" height="15" /> Live demo
            </a>
          ) : (
            <span className="action-btn is-disabled" title="Add a `demo` URL in src/data/portfolio.js">
              <IconLink width="15" height="15" /> Demo not linked
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app app-projects">
      <p className="app-hint">{projects.length} items · double-click to open</p>
      <ul className="project-grid">
        {projects.map((p) => (
          <li key={p.id}>
            <button type="button" className="project-card" onClick={() => setOpenId(p.id)}>
              <span className="project-card-icon"><IconProjects width="20" height="20" /></span>
              <span className="project-card-body">
                <span className="project-card-name">{p.name}</span>
                <span className="project-card-summary">{p.summary}</span>
                <span className="project-card-stack">
                  {p.stack.slice(0, 4).map((t) => <em key={t}>{t}</em>)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
