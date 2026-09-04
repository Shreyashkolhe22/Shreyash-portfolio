import { useEffect, useState } from 'react';
import { resume } from '../data/portfolio';

/**
 * Whether the real resume PDF exists at `resume.file`, checked once via HEAD.
 * Shared by the desktop's ResumeWindow and the mobile site so a recruiter
 * never gets a 404 from either: both read the same answer, checked the same
 * way (a dev server can answer 200 with an HTML fallback page for an unknown
 * path, so a bare `res.ok` is not enough — the content-type has to be checked
 * too).
 *
 * Returns `null` while still checking, then a boolean.
 */
export function useResumeAvailable() {
  const [available, setAvailable] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch(resume.file, { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') ?? '';
        if (alive) setAvailable(r.ok && !type.includes('text/html'));
      })
      .catch(() => { if (alive) setAvailable(false); });
    return () => { alive = false; };
  }, []);

  return available;
}
