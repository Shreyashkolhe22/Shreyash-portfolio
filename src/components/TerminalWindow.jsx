import { useEffect, useRef, useState } from 'react';
import { contact, education, profile, projects, skills } from '../data/portfolio';

const BANNER = [
  { kind: 'out', text: `${profile.name} — ${profile.role}` },
  { kind: 'dim', text: "Type 'help' for available commands." },
];

/**
 * A real terminal, not a prop: commands run, and the ones that name an app
 * actually launch it through the window manager passed in as `openApp`.
 */
export default function TerminalWindow({ openApp, exitToRoom }) {
  const [lines, setLines] = useState(BANNER);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll the window's own body, never `scrollIntoView` — that walks up to the
  // document and would drag the page (and the visitor) out of the desktop.
  useEffect(() => {
    const pane = scrollRef.current?.closest('[data-scrollable]');
    if (pane) pane.scrollTop = pane.scrollHeight;
  }, [lines]);

  const push = (items) => setLines((l) => [...l, ...items]);

  const run = (raw) => {
    const cmd = raw.trim();
    push([{ kind: 'cmd', text: cmd }]);
    if (!cmd) return;

    setHistory((h) => [cmd, ...h].slice(0, 40));
    setHistIdx(-1);

    const [name, ...args] = cmd.toLowerCase().split(/\s+/);

    switch (name) {
      case 'help':
        push([
          { kind: 'out', text: 'Available commands:' },
          { kind: 'list', text: 'about       open the About Me window' },
          { kind: 'list', text: 'education   open the Education window' },
          { kind: 'list', text: 'skills      open the Skills window' },
          { kind: 'list', text: 'projects    open the Projects window' },
          { kind: 'list', text: 'resume      open the Resume window' },
          { kind: 'list', text: 'contact     open the Contact window' },
          { kind: 'list', text: 'notes       open the Notes window' },
          { kind: 'list', text: 'ls          list portfolio sections' },
          { kind: 'list', text: 'whoami      print the current user' },
          { kind: 'list', text: 'stack       summarise the tech stack' },
          { kind: 'list', text: 'exit        leave the computer, back to the room' },
          { kind: 'list', text: 'clear       clear the terminal' },
        ]);
        break;

      case 'about': case 'education': case 'skills':
      case 'projects': case 'resume': case 'contact': case 'notes':
        openApp(name);
        push([{ kind: 'dim', text: `opening ${name}…` }]);
        break;

      case 'whoami':
        push([{ kind: 'out', text: profile.name.split(' ')[0].toLowerCase() }]);
        break;

      case 'ls':
        push([{ kind: 'out', text: 'about  education  projects  skills  resume  contact  notes' }]);
        break;

      case 'stack': {
        const flat = skills.map((g) => `${g.category}: ${g.items.map((i) => i.name).join(', ')}`);
        push(flat.map((text) => ({ kind: 'out', text })));
        break;
      }

      case 'cat': {
        const target = args[0];
        if (target === 'about' || target === 'about.md') {
          push(profile.intro.map((text) => ({ kind: 'out', text })));
        } else if (target === 'contact' || target === 'contact.md') {
          push(contact.map((c) => ({ kind: 'out', text: `${c.label.padEnd(9)} ${c.value}` })));
        } else if (target === 'projects' || target === 'projects.md') {
          push(projects.map((p) => ({ kind: 'out', text: `${p.name} — ${p.summary}` })));
        } else if (target === 'education' || target === 'education.md') {
          push(education.map((e) => ({ kind: 'out', text: `${e.period}  ${e.credential} — ${e.institution}` })));
        } else {
          push([{ kind: 'err', text: `cat: ${target ?? ''}: no such file` }]);
        }
        break;
      }

      case 'echo':
        push([{ kind: 'out', text: cmd.slice(5) }]);
        break;

      case 'date':
        push([{ kind: 'out', text: new Date().toString() }]);
        break;

      case 'exit': case 'logout':
        push([{ kind: 'dim', text: 'leaving the desktop…' }]);
        setTimeout(() => exitToRoom(), 350);
        break;

      case 'clear':
        setLines([]);
        break;

      case 'sudo':
        push([{ kind: 'err', text: `${profile.name.split(' ')[0].toLowerCase()} is not in the sudoers file. This incident will be reported.` }]);
        break;

      default:
        push([{ kind: 'err', text: `command not found: ${name}` }, { kind: 'dim', text: "try 'help'" }]);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      if (next >= 0) { setHistIdx(next); setInput(history[next]); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = histIdx - 1;
      setHistIdx(next);
      setInput(next >= 0 ? history[next] : '');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div className="app app-terminal" onMouseDown={() => inputRef.current?.focus()}>
      <div className="term-scroll" ref={scrollRef}>
        {lines.map((l, i) => (
          <p key={i} className={`term-line term-${l.kind}`}>
            {l.kind === 'cmd' && <span className="term-prompt">$</span>}
            {l.text}
          </p>
        ))}
        <p className="term-line term-input-line">
          <span className="term-prompt">$</span>
          <input
            ref={inputRef}
            className="term-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck="false"
            autoComplete="off"
            aria-label="Terminal input"
          />
        </p>
      </div>
    </div>
  );
}
