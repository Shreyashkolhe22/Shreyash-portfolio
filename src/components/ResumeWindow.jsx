import { profile, resume } from '../data/portfolio';
import { useResumeAvailable } from '../hooks/useResumeAvailable';
import { IconDownload } from './Icons';

/**
 * The download button is wired up already; it enables itself the moment the
 * real PDF exists at `resume.file`. Until then it says so plainly rather than
 * handing a recruiter a 404. The availability check itself is shared with the
 * mobile site — see useResumeAvailable.
 */
export default function ResumeWindow() {
  const available = useResumeAvailable();

  return (
    <div className="app app-resume">
      <div className="resume-toolbar">
        <div>
          <p className="resume-file">{resume.fileName}</p>
          <p className="app-hint">Updated {resume.updated}</p>
        </div>
        {available ? (
          <a className="action-btn is-primary" href={resume.file} download={resume.fileName}>
            <IconDownload width="15" height="15" /> Download
          </a>
        ) : (
          <span
            className="action-btn is-disabled"
            title={`Place the PDF at public${resume.file} to activate this button`}
          >
            <IconDownload width="15" height="15" />
            {available === null ? 'Checking…' : 'PDF not added yet'}
          </span>
        )}
      </div>

      <div className="resume-page">
        <header className="resume-page-head">
          <h3>{profile.name}</h3>
          <p>{profile.role}</p>
        </header>
        <div className="resume-rule" />
        <h4 className="app-section-title">Highlights</h4>
        <ul className="bullets">
          {resume.highlights.map((h, i) => <li key={`hl-${i}`}>{h}</li>)}
        </ul>
        <div className="resume-skeleton" aria-hidden="true">
          {[92, 78, 86, 64, 88, 71, 80, 55].map((w, i) => (
            <span key={`${w}-${i}`} style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>

      {available === false && (
        <p className="app-note">
          Drop your PDF at <code>public{resume.file}</code> — the button turns on by itself.
        </p>
      )}
    </div>
  );
}
