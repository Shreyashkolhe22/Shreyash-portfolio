import { useEffect, useMemo, useRef, useState } from 'react';
import { profile } from '../data/portfolio';
import { APPS, START_ORDER } from './apps';
import { IconPower, IconSearch, IconSettings } from './Icons';

/** Mounted only while open, so its search box resets on every open for free. */
export default function StartMenu({ onClose, onLaunch, onExit }) {
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    // Focus after the open animation starts, not before it paints.
    const t = setTimeout(() => searchRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (!ref.current?.contains(e.target) && !e.target.closest('.start-btn')) onClose();
    };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const ids = START_ORDER.filter((id) => APPS[id]);
    if (!q) return ids;
    return ids.filter((id) => APPS[id].label.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="start-menu" ref={ref} role="menu">
      <div className="start-search">
        <IconSearch width="15" height="15" />
        <input
          ref={searchRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) { onLaunch(results[0]); onClose(); }
          }}
          placeholder="Search applications"
          aria-label="Search applications"
          spellCheck="false"
        />
      </div>

      <p className="start-heading">Applications</p>
      <ul className="start-list">
        {results.map((id) => {
          const app = APPS[id];
          return (
            <li key={id}>
              <button
                type="button"
                className="start-item"
                role="menuitem"
                onClick={() => { onLaunch(id); onClose(); }}
              >
                <app.Icon width="17" height="17" />
                <span>{app.label}</span>
              </button>
            </li>
          );
        })}
        {results.length === 0 && <li className="start-empty">No matches</li>}
      </ul>

      <div className="start-foot">
        <div className="start-user">
          <span className="start-avatar" aria-hidden="true">
            {profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
          </span>
          <span className="start-user-name">{profile.name}</span>
        </div>
        <div className="start-foot-actions">
          <button
            type="button"
            className="start-icon-btn"
            title="Settings — not implemented in v1"
            aria-label="Settings"
            onClick={() => {}}
          >
            <IconSettings width="16" height="16" />
          </button>
          <button
            type="button"
            className="start-icon-btn"
            title="Leave the computer"
            aria-label="Leave the computer"
            onClick={() => { onClose(); onExit(); }}
          >
            <IconPower width="16" height="16" />
          </button>
        </div>
      </div>
    </div>
  );
}
