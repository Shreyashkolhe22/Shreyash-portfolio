import { useCallback, useRef, useState } from 'react';

/**
 * Minimal window manager: an ordered list of open windows plus focus and
 * z-index bookkeeping. Windows are identified by their app id, so opening an
 * app twice focuses the existing window instead of duplicating it.
 *
 * The z counter is a ref, not state — nothing renders from the counter itself,
 * only from the z value stamped onto each window.
 */
export function useWindowManager() {
  const [windows, setWindows] = useState([]);
  const zCounter = useRef(10);
  const nextZ = () => (zCounter.current += 1);

  const focus = useCallback((id) => {
    const z = nextZ();
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)));
  }, []);

  const open = useCallback((id, props = {}) => {
    const z = nextZ();
    setWindows((ws) => {
      if (ws.some((w) => w.id === id)) {
        return ws.map((w) =>
          w.id === id ? { ...w, z, minimized: false, props: { ...w.props, ...props } } : w,
        );
      }
      // Cascade each new window a little so stacks stay readable.
      const offset = (ws.length % 5) * 12;
      return [...ws, { id, z, minimized: false, maximized: false, offset, props }];
    });
  }, []);

  const close = useCallback((id) => {
    setWindows((ws) => ws.filter((w) => w.id !== id));
  }, []);

  const minimize = useCallback((id) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  }, []);

  const toggleMaximize = useCallback((id) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)));
  }, []);

  const closeAll = useCallback(() => setWindows([]), []);

  // The focused window is the visible one with the highest z.
  const activeId = windows
    .filter((w) => !w.minimized)
    .reduce((best, w) => (!best || w.z > best.z ? w : best), null)?.id ?? null;

  return { windows, activeId, open, close, focus, minimize, toggleMaximize, closeAll };
}
