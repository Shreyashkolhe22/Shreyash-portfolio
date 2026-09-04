import { useCallback, useEffect, useRef, useState } from 'react';
import { APPS, DESKTOP_ORDER } from './apps';
import DesktopClock from './DesktopClock';
import DesktopIcon from './DesktopIcon';
import PowerSequence from './PowerSequence';
import { BOOT_MS, BOOT_QUICK_MS } from './power';
import StartMenu from './StartMenu';
import Taskbar from './Taskbar';
import Wallpaper from './Wallpaper';
import Window from './Window';
import { useWindowManager } from '../hooks/useWindowManager';
import { OS_H, OS_W } from '../hooks/useCinematicScroll';

/**
 * The desktop is authored at a fixed *logical* resolution (OS_W x OS_H, defined
 * alongside the camera geometry in useCinematicScroll) and scaled onto the
 * monitor panel. Every measurement in the OS is therefore a plain pixel value
 * on a small screen: this is a compact desktop by design, because the camera
 * comes to rest where the photograph frames the monitor rather than pushing
 * further in.
 */
export { OS_H, OS_W };

export default function Desktop({ active, onExit, rootRef, openRequest }) {
  const wm = useWindowManager();
  const [startOpen, setStartOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  /**
   * Power state: 'off' -> 'boot' -> 'on' -> 'off'.
   *
   * Driven entirely by `active`, which App flips when the camera arrives at or
   * leaves the monitor. The desktop is only interactive at 'on', so a click can
   * never land during the boot animation. Leaving goes straight back to 'off';
   * the fade in desktop.css is the whole exit.
   */
  const [power, setPower] = useState('off');
  const bootedOnce = useRef(false);
  const timer = useRef(0);

  useEffect(() => {
    window.clearTimeout(timer.current);
    if (active) {
      // Second visit is a wake-from-sleep, not another cold boot — the full
      // self-test is charming once and tiresome on every re-entry.
      const ms = bootedOnce.current ? BOOT_QUICK_MS : BOOT_MS;
      setPower('boot');
      timer.current = window.setTimeout(() => {
        bootedOnce.current = true;
        setPower('on');
      }, ms);
    } else {
      setPower('off');
    }
    return () => window.clearTimeout(timer.current);
    // `power` is deliberately not a dependency: this reacts to `active` only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const live = power === 'on';

  // An app asked for from the landing page opens once the machine has finished
  // booting — never before, or it would appear behind the boot screen.
  const servedRequest = useRef(null);
  useEffect(() => {
    if (!live || !openRequest || servedRequest.current === openRequest.n) return;
    servedRequest.current = openRequest.n;
    if (APPS[openRequest.id]) wm.open(openRequest.id);
  }, [live, openRequest, wm]);
  // The desktop is authored at OS_W x OS_H and scaled onto the monitor panel.
  // The scroll hook writes --os-scale-x/y whenever the viewport resizes, so
  // there is no observer here and nothing recomputes during the scroll.

  const launch = useCallback((id) => {
    if (!APPS[id]) return;
    wm.open(id);
  }, [wm]);

  // Derived, not stored: leaving the desktop hides the menu without an effect,
  // and remounting it on the next open resets its search box for free.
  const showStart = startOpen && live;

  const onSurfaceDown = (e) => {
    if (e.target.closest('.desktop-icon, .window, .taskbar, .start-menu')) return;
    setSelected(null);
    setStartOpen(false);
  };

  return (
    <div
      className="monitor-screen"
      // Inert until the machine has actually finished booting, so a click can
      // never land on a desktop that is still powering up.
      style={{ pointerEvents: live ? 'auto' : 'none' }}
    >
      <div
        className={`desktop${power !== 'off' ? ' is-live' : ''}`}
        ref={rootRef}
        style={{ width: OS_W, height: OS_H }}
        onPointerDown={onSurfaceDown}
      >
        <Wallpaper />

        <div className="desktop-surface">
          <DesktopClock />

          <ul className="icon-grid">
            {DESKTOP_ORDER.map((id) => {
              const app = APPS[id];
              if (!app) return null;
              return (
                <li key={id}>
                  <DesktopIcon
                    id={id}
                    label={app.label}
                    Icon={app.Icon}
                    selected={selected === id}
                    onSelect={setSelected}
                    onOpen={launch}
                  />
                </li>
              );
            })}
          </ul>

          {wm.windows.map((w) => {
            const app = APPS[w.id];
            if (!app) return null;
            const Body = app.Component;
            return (
              <Window
                key={w.id}
                title={app.label}
                Icon={app.Icon}
                active={wm.activeId === w.id}
                z={w.z}
                minimized={w.minimized}
                maximized={w.maximized}
                width={app.width}
                height={app.height}
                offset={w.offset}
                bounds={{ w: OS_W, h: OS_H - 28 }}
                onClose={() => wm.close(w.id)}
                onMinimize={() => wm.minimize(w.id)}
                onToggleMaximize={() => wm.toggleMaximize(w.id)}
                onFocus={() => wm.focus(w.id)}
              >
                <Body openApp={launch} exitToRoom={onExit} />
              </Window>
            );
          })}
        </div>

        {showStart && (
          <StartMenu
            onClose={() => setStartOpen(false)}
            onLaunch={launch}
            onExit={onExit}
          />
        )}

        <Taskbar
          windows={wm.windows}
          activeId={wm.activeId}
          startOpen={showStart}
          onToggleStart={() => setStartOpen((v) => !v)}
          onLaunch={launch}
          onFocus={wm.focus}
          onMinimize={wm.minimize}
          onExit={onExit}
        />
      </div>

      <PowerSequence phase={power} quick={bootedOnce.current} />
    </div>
  );
}
