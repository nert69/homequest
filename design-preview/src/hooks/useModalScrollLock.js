import { useEffect, useRef } from 'react';

// iOS can hand a touch gesture from a modal to the page underneath when the
// modal reaches the top or bottom of its own scroll area. CSS touch-action and
// overscroll-behavior are not reliable enough in an installed Safari PWA, so
// cancel only the gestures that would escape the active modal.
export default function useModalScrollLock(scrollableSelector = null) {
  const lastTouchY = useRef(0);

  useEffect(() => {
    const scrollableFor = (target) => {
      if (!scrollableSelector || !(target instanceof Element)) return null;
      return target.closest(scrollableSelector);
    };

    const wouldEscape = (panel, delta) => {
      if (!panel || panel.scrollHeight <= panel.clientHeight + 1) return true;
      const atTop = panel.scrollTop <= 0;
      const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
      return (delta > 0 && atTop) || (delta < 0 && atBottom);
    };

    const onTouchStart = (event) => {
      lastTouchY.current = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event) => {
      const currentY = event.touches[0]?.clientY ?? lastTouchY.current;
      const delta = currentY - lastTouchY.current;
      const panel = scrollableFor(event.target);
      if (wouldEscape(panel, delta)) event.preventDefault();
      lastTouchY.current = currentY;
    };

    const onWheel = (event) => {
      const panel = scrollableFor(event.target);
      if (wouldEscape(panel, -event.deltaY)) event.preventDefault();
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    document.addEventListener('wheel', onWheel, { passive: false, capture: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart, { capture: true });
      document.removeEventListener('touchmove', onTouchMove, { capture: true });
      document.removeEventListener('wheel', onWheel, { capture: true });
    };
  }, [scrollableSelector]);
}
