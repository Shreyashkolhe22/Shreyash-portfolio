/**
 * Power-on configuration.
 *
 * Kept in a plain module rather than alongside the component: a file that
 * exports both a component and constants loses React Fast Refresh, which means
 * editing the copy below would force a full reload instead of hot-swapping.
 *
 * There is no power-off sequence. Leaving the computer simply darkens the
 * screen and the camera pulls back — the monitor going black IS the exit.
 */

/** Wording — edit here, it is not repeated anywhere else. */
export const COPY = {
  bootTitle: "You're in",
  bootBody: 'Please wait, the system is starting',
  wakeTitle: 'Welcome back',
  wakeBody: 'Resuming your session',
};

/** Full boot, first time the visitor reaches the monitor. Long enough to read. */
export const BOOT_MS = 2600;

/** Coming back is a resume, not a cold start — same screen, less waiting. */
export const BOOT_QUICK_MS = 1200;

/**
 * How long the camera waits after the desktop starts fading out.
 *
 * Must exceed the fade in styles/desktop.css. The desktop is clipped to the
 * panel's RESTING rectangle, so if the camera moves while it is still even
 * partly visible, a lit rectangle hangs over the bezel and the wall.
 */
export const SCREEN_OFF_MS = 300;
