import { useRef } from 'react';

/**
 * A single desktop icon. Single click selects, double click (or Enter) opens —
 * the behaviour people already expect from a desktop.
 */
export default function DesktopIcon({ id, label, Icon, selected, onSelect, onOpen }) {
  const lastClick = useRef(0);

  const handleClick = () => {
    onSelect(id);
    const now = Date.now();
    if (now - lastClick.current < 400) {
      lastClick.current = 0;
      onOpen(id);
    } else {
      lastClick.current = now;
    }
  };

  return (
    <button
      type="button"
      className={`desktop-icon${selected ? ' is-selected' : ''}`}
      onClick={handleClick}
      onDoubleClick={() => onOpen(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(id);
        }
      }}
      aria-label={`Open ${label}`}
    >
      <span className="desktop-icon-glyph">
        <Icon width="26" height="26" />
      </span>
      <span className="desktop-icon-label">{label}</span>
    </button>
  );
}
