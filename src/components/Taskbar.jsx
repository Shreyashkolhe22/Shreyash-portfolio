import { useEffect, useState } from 'react';
import { APPS } from './apps';
import { IconNotes, IconPower, IconSound, IconStart, IconTerminal, IconWifi } from './Icons';

export default function Taskbar({
  windows, activeId, startOpen, onToggleStart, onLaunch, onFocus, onMinimize, onExit,
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Tick on the minute, not the second — no need to re-render 60x more often.
    const id = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString([], { day: '2-digit', month: 'short' });

  return (
    <footer className="taskbar">
      <button
        type="button"
        className={`start-btn${startOpen ? ' is-open' : ''}`}
        onClick={onToggleStart}
        aria-expanded={startOpen}
      >
        <IconStart width="16" height="16" />
        <span>Start</span>
      </button>

      <div className="taskbar-quick">
        <button type="button" className="quick-btn" onClick={() => onLaunch('terminal')}
          title="Terminal">
          <IconTerminal width="16" height="16" />
          <span>Terminal</span>
        </button>
        <button type="button" className="quick-btn" onClick={() => onLaunch('notes')} title="Notes">
          <IconNotes width="16" height="16" />
          <span>Notes</span>
        </button>
      </div>

      <div className="taskbar-windows">
        {windows.map((w) => {
          const app = APPS[w.id];
          if (!app) return null;
          const isActive = w.id === activeId && !w.minimized;
          return (
            <button
              key={w.id}
              type="button"
              className={`task-item${isActive ? ' is-active' : ''}${w.minimized ? ' is-minimized' : ''}`}
              onClick={() => (isActive ? onMinimize(w.id) : onFocus(w.id))}
              title={app.label}
            >
              <app.Icon width="14" height="14" />
              <span>{app.label}</span>
            </button>
          );
        })}
      </div>

      <div className="taskbar-tray">
        <span className="tray-item" title="Network: connected"><IconWifi width="15" height="15" /></span>
        <span className="tray-item" title="Volume"><IconSound width="15" height="15" /></span>
        <span className="tray-clock">
          <strong>{time}</strong>
          <em>{date}</em>
        </span>
        <button
          type="button"
          className="tray-item tray-exit"
          onClick={onExit}
          title="Leave the computer — back to the room"
          aria-label="Leave the computer"
        >
          <IconPower width="15" height="15" />
        </button>
      </div>
    </footer>
  );
}
