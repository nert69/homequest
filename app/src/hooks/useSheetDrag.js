import { useEffect, useRef } from 'react';

// Swipe a bottom sheet down to dismiss it. The drag only starts when the sheet
// is scrolled to its top and the finger is moving mostly downwards, so normal
// scrolling inside a long sheet is untouched. The sheet follows the finger;
// letting go past a quarter of its height (or with a quick flick) closes it,
// and its slide-out animation carries on from wherever it was let go.
// Otherwise it springs back.
export default function useSheetDrag(sheetRef, enabled, onClose) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!enabled || !sheet) return undefined;
    let start = null;

    const set = (y, transition) => {
      sheet.style.transition = transition || 'none';
      sheet.style.transform = y ? `translateY(${y}px)` : '';
    };

    const onStart = (e) => {
      if (e.touches.length !== 1) { start = null; return; }
      const t = e.touches[0];
      const now = performance.now();
      start = { x: t.clientX, y: t.clientY, lock: null, dy: 0, last: { dy: 0, t: now }, prev: { dy: 0, t: now } };
    };

    const onMove = (e) => {
      if (!start) return;
      const t = e.touches[0];
      const dx = t.clientX - start.x, dy = t.clientY - start.y;
      if (!start.lock) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        start.lock = dy > 0 && Math.abs(dy) > Math.abs(dx) && sheet.scrollTop <= 0 ? 'y' : 'none';
        if (start.lock === 'y') {
          // Stop the entrance spring so it can't fight the finger.
          sheet.getAnimations().forEach((a) => a.cancel());
          if (document.activeElement instanceof HTMLElement && sheet.contains(document.activeElement)) document.activeElement.blur();
        }
      }
      if (start.lock !== 'y') return;
      e.preventDefault();
      start.dy = Math.max(0, dy);
      const now = performance.now();
      if (now - start.last.t > 50) { start.prev = start.last; start.last = { dy: start.dy, t: now }; }
      set(start.dy);
    };

    const onEnd = () => {
      if (!start || start.lock !== 'y') { start = null; return; }
      const { dy, prev } = start;
      start = null;
      const speed = (dy - prev.dy) / Math.max(1, performance.now() - prev.t);
      if (dy > sheet.offsetHeight / 4 || (speed > 0.5 && dy > 30)) {
        sheet.style.transition = 'none'; // keep the transform; the leave animation starts from it
        onCloseRef.current();
      } else {
        set(0, 'transform .38s cubic-bezier(.2,1.1,.4,1)');
      }
    };

    sheet.addEventListener('touchstart', onStart, { passive: true });
    sheet.addEventListener('touchmove', onMove, { passive: false });
    sheet.addEventListener('touchend', onEnd, { passive: true });
    sheet.addEventListener('touchcancel', onEnd, { passive: true });
    return () => {
      sheet.removeEventListener('touchstart', onStart);
      sheet.removeEventListener('touchmove', onMove);
      sheet.removeEventListener('touchend', onEnd);
      sheet.removeEventListener('touchcancel', onEnd);
    };
  }, [enabled, sheetRef]);
}
