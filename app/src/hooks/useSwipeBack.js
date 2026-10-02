import { useEffect, useRef } from 'react';

// Swipe right to go back. The current screen's layer follows the finger and
// home (already mounted, normally hidden) is revealed underneath at its
// remembered scroll position, easing in from the left like iOS. Letting go
// past a third of the width (or with a quick flick) slides the layer off and
// calls onBack; otherwise it springs back and home is hidden again.
// Horizontal intent is locked in after ~10px so vertical scrolling is never
// hijacked. In Safari's browser UI the left-edge swipe belongs to Safari
// (its own back, which reaches the app as a history pop), so touches starting
// at the edge are left alone there; an installed home-screen app has no such
// gesture, so it gets the edge too.
const standalone = () => window.navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches;
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const PARALLAX = 0.3; // home starts this fraction of the width off to the left

export default function useSwipeBack(layerRef, underRef, enabled, onBack, underScroll) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  const scrollRef = useRef(underScroll);
  scrollRef.current = underScroll;

  useEffect(() => {
    if (!enabled) return undefined;
    let start = null;
    let revealed = false;

    const setLayer = (x, transition) => {
      const node = layerRef.current;
      if (!node) return;
      node.style.transition = transition || 'none';
      node.style.transform = x ? `translateX(${x}px)` : '';
      node.style.boxShadow = x ? '-14px 0 28px -18px rgba(17,17,17,.35)' : '';
    };
    // Pin home behind the layer exactly where it sits when shown normally.
    const reveal = () => {
      const under = underRef.current;
      if (!under || revealed) return;
      const box = under.parentElement.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(under.parentElement).paddingLeft) || 0;
      Object.assign(under.style, { position: 'fixed', zIndex: 0, top: `${-(scrollRef.current?.() || 0)}px`, left: `${box.left + pad}px`, width: `${box.width - pad * 2}px`, pointerEvents: 'none' });
      under.hidden = false;
      revealed = true;
    };
    const setUnder = (x, transition) => {
      const under = underRef.current;
      if (!under || !revealed) return;
      const width = window.innerWidth;
      under.style.transition = transition || 'none';
      under.style.transform = `translateX(${-PARALLAX * (width - x)}px)`;
    };
    const conceal = () => {
      const under = underRef.current;
      if (!under || !revealed) return;
      under.hidden = true;
      for (const k of ['position', 'zIndex', 'top', 'left', 'width', 'pointerEvents', 'transform', 'transition']) under.style[k] = '';
      revealed = false;
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
        if (start.lock === 'x') reveal();
      }
      if (start.lock !== 'x') return;
      e.preventDefault();
      start.dx = Math.max(0, dx);
      // Keep a sample from ~50ms ago so a flick is judged by its final speed.
      const now = performance.now();
      if (now - start.last.t > 50) { start.prev = start.last; start.last = { dx: start.dx, t: now }; }
      setLayer(start.dx);
      setUnder(start.dx);
    };

    const onEnd = () => {
      if (!start || start.lock !== 'x') { start = null; return; }
      const { dx, prev } = start;
      start = null;
      const width = window.innerWidth;
      const speed = (dx - prev.dx) / Math.max(1, performance.now() - prev.t);
      if (dx > width / 3 || (speed > 0.4 && dx > 40)) {
        if (reduceMotion()) { setLayer(0); conceal(); onBackRef.current(); return; }
        const ease = 'transform .22s cubic-bezier(.3,.6,.4,1)';
        setLayer(width, ease);
        setUnder(width, ease);
        // Home is already in place underneath; once the layer is off, switch
        // screens. The pinned styles come off in this effect's cleanup, after
        // home is shown normally at the same scroll position, so nothing moves.
        setTimeout(() => onBackRef.current(), 210);
      } else {
        const ease = 'transform .32s cubic-bezier(.2,.8,.2,1), box-shadow .32s';
        setLayer(0, ease);
        setUnder(0, ease);
        setTimeout(() => { if (!start) conceal(); }, 330);
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
      // Leaving the screen: home is now shown by React, so just drop the pin.
      const under = underRef.current;
      if (under && revealed) for (const k of ['position', 'zIndex', 'top', 'left', 'width', 'pointerEvents', 'transform', 'transition']) under.style[k] = '';
      setLayer(0);
    };
  }, [enabled, layerRef, underRef]);
}
