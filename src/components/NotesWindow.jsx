import { useState } from 'react';
import { notes } from '../data/portfolio';

export default function NotesWindow() {
  const [text, setText] = useState(notes);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="app app-notes">
      <textarea
        className="notes-area"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck="false"
        aria-label="Notes"
      />
      <footer className="notes-status">
        <span>{text.split('\n').length} lines</span>
        <span>{words} words</span>
        <span className="notes-hint">edits are session-only</span>
      </footer>
    </div>
  );
}
