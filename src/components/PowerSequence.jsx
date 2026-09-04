/**
 * Power-on screen for the monitor.
 *
 * Deliberately plain: a spinning ring and a line of text, held long enough to
 * actually read. No scan lines, no flash, no fake OS branding.
 *
 * There is no counterpart on the way out — leaving just darkens the screen.
 *
 * Durations and copy live in ./power.js so this file exports a component and
 * nothing else, which is what React Fast Refresh needs.
 */

import { COPY } from './power';

export default function PowerSequence({ phase, quick }) {
  // Only 'boot' paints. 'off' would sit on a panel that is already black in the
  // photograph, and 'on' needs no overlay at all.
  if (phase !== 'boot') return null;

  return (
    <div className={`power is-boot${quick ? ' is-quick' : ''}`} role="status" aria-live="polite">
      <div className="power-screen">
        <span className="power-ring" aria-hidden="true" />
        <span className="power-title">{quick ? COPY.wakeTitle : COPY.bootTitle}</span>
        <span className="power-body">{quick ? COPY.wakeBody : COPY.bootBody}</span>
      </div>
    </div>
  );
}
