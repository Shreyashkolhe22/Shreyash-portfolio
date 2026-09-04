import { useEffect, useRef, useState } from 'react';

/**
 * The date/time display that sits at the top centre of the desktop, styled
 * after the reference poster: a wide-tracked day name over the date and time.
 *
 *     S U N D A Y
 *   02 NOVEMBER, 2025.
 *      - 7:40 PM -
 *
 * The day name is set in Anurati when that face is available — see
 * hooks/useAnurati.js, which resolves it once for the whole app and puts
 * `anurati-ready` on the root element.
 */
export default function DesktopClock() {
  const [now, setNow] = useState(() => new Date());
  const timer = useRef(0);

  // Tick on the minute, not on an arbitrary offset from mount.
  useEffect(() => {
    let cancelled = false;
    const schedule = () => {
      const d = new Date();
      const msToNextMinute = 60000 - (d.getSeconds() * 1000 + d.getMilliseconds());
      timer.current = window.setTimeout(() => {
        if (cancelled) return;
        setNow(new Date());
        schedule();
      }, msToNextMinute + 20);
    };
    schedule();
    return () => { cancelled = true; window.clearTimeout(timer.current); };
  }, []);


  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dd = String(now.getDate()).padStart(2, '0');
  const month = now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const year = now.getFullYear();

  let hours = now.getHours();
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return (
    <div className="clock" aria-hidden="true">
      <p className="clock-day">{day}</p>
      <p className="clock-date">{`${dd} ${month}, ${year}.`}</p>
      <p className="clock-time">{`- ${hours}:${minutes} ${meridiem} -`}</p>
    </div>
  );
}
