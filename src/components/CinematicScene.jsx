import { forwardRef, useEffect, useState } from 'react';

/**
 * The pinned camera. A sticky, viewport-filling stage holding the two room
 * stills and — inside the same coordinate system — the monitor overlay passed
 * as children.
 *
 * `.scene-frame` is sized to the close still's exact aspect, so the frame the
 * move comes to rest on is the picture at its natural size, and the monitor
 * overlay's percentages land on the right part of it at any viewport shape.
 */
const CinematicScene = forwardRef(function CinematicScene(
  { sceneRef, frameRef, wideRef, closeRef, children, overlay },
  ref,
) {
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState(false);
  const ready = loaded >= 1; // the wide still is enough to start

  useEffect(() => {
    // Warm the close still immediately; it is needed by the end of the scroll
    // and we would rather pay for it now than mid-move.
    const img = new Image();
    img.src = '/assets/end-room.webp';
  }, []);

  return (
    <div className="cinematic" ref={ref}>
      <div className="scene" ref={sceneRef}>
        <div className="scene-frame" ref={frameRef}>
          {/* Wide room: the camera's starting position. */}
          <img
            ref={wideRef}
            className="scene-still scene-wide"
            src="/assets/start-room.webp"
            alt="A warm, softly lit developer workspace: a wide desk, a large monitor, shelves, plants and lamps."
            fetchPriority="high"
            decoding="async"
            onLoad={() => setLoaded((n) => n + 1)}
            onError={() => setFailed(true)}
          />

          {/*
            Close room: the same scene from further in. It carries the final
            framing at full resolution and cross-fades in over the last stretch
            of the move, where both stills already show an identical picture.
          */}
          <img
            ref={closeRef}
            className="scene-still scene-close"
            src="/assets/end-room.webp"
            alt=""
            aria-hidden="true"
            decoding="async"
          />

          {children}
        </div>
      </div>

      {/*
        Rendered HERE, not inside .scene-frame.

        That frame is sized to the photograph — max(100vw, 100vh * ar) wide — so
        on any window that is not 16:9 it is bigger than the viewport. Measured
        at 1813px wide in a 1280x1024 window, which pushed the landing page's
        top-right button 227px off screen.

        `children` line up with the PICTURE (the desktop must track the monitor).
        `overlay` lines up with the WINDOW.
      */}
      {overlay}

      {!ready && !failed && (
        <div className="scene-loading">
          <span className="scene-loading-bar" />
          <span className="scene-loading-text">Loading the room…</span>
        </div>
      )}
      {failed && (
        <div className="scene-loading">
          <span className="scene-loading-text">
            The room image could not load. Check /assets/start-room.webp
          </span>
        </div>
      )}
    </div>
  );
});

export default CinematicScene;
