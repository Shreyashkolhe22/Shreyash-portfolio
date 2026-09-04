import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Reusable application window.
 *
 * Coordinates are in the desktop's *logical* pixel space (see OS_W / OS_H in
 * Desktop.jsx), not screen pixels, so a window sits in the same place whatever
 * size the monitor is being rendered at.
 */
export default function Window({
  title,
  Icon,
  active,
  z,
  minimized,
  maximized,
  width = 404,
  height = 268,
  offset = 0,
  bounds,
  onClose,
  onMinimize,
  onToggleMaximize,
  onFocus,
  children,
}) {
  const [pos, setPos] = useState(() => ({
    x: Math.max(10, Math.round((bounds.w - width) / 2) + offset - 22),
    y: Math.max(8, Math.round((bounds.h - height) / 2) + offset - 16),
  }));
  const drag = useRef(null);
  const nodeRef = useRef(null);

  const onPointerDown = useCallback(
    (e) => {
      if (maximized) return;
      // Ignore drags that start on the window controls.
      if (e.target.closest('.win-btn')) return;
      const el = nodeRef.current;
      if (!el) return;
      // Convert screen movement into logical movement using the live scale.
      const rect = el.getBoundingClientRect();
      const scale = rect.width / el.offsetWidth || 1;
      drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, scale };
      e.currentTarget.setPointerCapture(e.pointerId);
      onFocus();
    },
    [maximized, pos.x, pos.y, onFocus],
  );

  const onPointerMove = useCallback(
    (e) => {
      const d = drag.current;
      if (!d) return;
      const nx = d.ox + (e.clientX - d.sx) / d.scale;
      const ny = d.oy + (e.clientY - d.sy) / d.scale;
      setPos({
        // Keep at least a strip of the title bar reachable at all times.
        x: Math.min(Math.max(nx, -width + 80), bounds.w - 80),
        y: Math.min(Math.max(ny, 0), bounds.h - 28),
      });
    },
    [bounds.h, bounds.w, width],
  );

  const endDrag = useCallback(() => { drag.current = null; }, []);

  // Esc closes the focused window.
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !e.target.closest('input, textarea')) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onClose]);

  const style = maximized
    ? { left: 0, top: 0, width: bounds.w, height: bounds.h, zIndex: z }
    : { left: pos.x, top: pos.y, width, height, zIndex: z };

  return (
    <section
      ref={nodeRef}
      className={[
        'window',
        active ? 'is-active' : 'is-inactive',
        minimized ? 'is-minimized' : '',
        maximized ? 'is-maximized' : '',
      ].join(' ').trim()}
      style={style}
      onPointerDown={onFocus}
      aria-hidden={minimized}
      aria-label={title}
    >
      <header
        className="win-bar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={onToggleMaximize}
      >
        <span className="win-bar-icon">{Icon ? <Icon width="14" height="14" /> : null}</span>
        <h2 className="win-title">{title}</h2>
        <div className="win-controls">
          <button type="button" className="win-btn" onClick={onMinimize} aria-label="Minimize">
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
              <path d="M2.5 6.5h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" className="win-btn" onClick={onToggleMaximize}
            aria-label={maximized ? 'Restore' : 'Maximize'}>
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
              <rect x="2.6" y="2.6" width="6.8" height="6.8" rx="1"
                stroke="currentColor" strokeWidth="1.2" fill="none" />
            </svg>
          </button>
          <button type="button" className="win-btn win-btn-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
              <path d="m3.2 3.2 5.6 5.6M8.8 3.2 3.2 8.8"
                stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <div className="win-body" data-scrollable="true">{children}</div>
    </section>
  );
}
