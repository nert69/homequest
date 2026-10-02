import { useEffect, useRef } from 'react';

// Swipe right to go back. The page follows the finger; letting go past a
// third of the width (or with a quick flick) slides it off and calls onBack,
// otherwise it springs back. Horizontal intent is locked in after the first
// ~10px so vertical scrolling is never hijacked. In Safari's browser UI the
// left-edge swipe belongs to Safari (its own back, which reaches the app as
// a history pop), so touches starting at the edge are left alone there; an
// installed home-screen app has no such gesture, so it gets the edge too.
const standalone = () => window.navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches;
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function useSwipeBack(targetRef, enabled, onBack) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (!enabled) return undefined;
    let start = null; // { x, y, t, lock }

    const el = () => targetRef.current;
    const setX = (x, transition) => {
      const node = el();
      if (!node) return;
      node.style.transition = transition || 'none';
      node.style.transform = x ? `translateX(${x}px)` : '';
      node.style.boxShadow = x ? '-14px 0 28px -18px rgba(17,17,17,.35)' : '';
    };

    const onStart = (e) => {
      if (e.touches.length !== 1) { start = null; return; }
      const t = e.touches[0];
      if (!standalone() && t.clientX < 24) { start = null; return; }
      if (e.target.closest?.('input, textarea, select, [role="dialog"], .hq-sheet')) { start = null; return; }
      const now = performance.now();
      start = { x: t.clientX, y: t.clientY, lock: null, dx: 0, last: { dx: 0, t: now }, prev: { dx: 0, t: now } };
    };

    const onMove = (e) => {
      if (!start) return;
      const t = e.touches[0];
      const dx = t.clientX - start.x, dy = t.clientY - start.y;
      if (!start.lock) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        start.lock = dx > 0 && Math.abs(dx) > Math.abs(dy) * 1.4 ? 'x' : 'none';
      }
      if (start.lock !== 'x') return;
      e.preventDefault();
      start.dx = Math.max(0, dx);
      // Keep a sample from ~50ms ago so a flick is judged by its final speed.
      const now = performance.now();
      if (now - start.last.t > 50) { start.prev = start.last; start.last = { dx: start.dx, t: now }; }
      setX(start.dx);
    };

    const onEnd = () => {
      if (!start || start.lock !== 'x') { start = null; return; }
      const { dx, prev } = start;
      start = null;
      const width = window.innerWidth;
      const speed = (dx - prev.dx) / Math.max(1, performance.now() - prev.t);
      if (dx > width / 3 || (speed > 0.4 && dx > 40)) {
        if (reduceMotion()) { setX(0); onBackRef.current(); return; }
        setX(width, 'transform .2s cubic-bezier(.3,.6,.4,1)');
        setTimeout(() => { onBackRef.current(); requestAnimationFrame(() => setX(0)); }, 190);
      } else {
        setX(0, 'transform .32s cubic-bezier(.2,.8,.2,1), box-shadow .32s');
      }
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: true });
    window.addEventListener('touchcancel', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
      setX(0);
    };
  }, [enabled, targetRef]);
}
