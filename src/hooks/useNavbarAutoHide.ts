'use client';

import { useEffect, useRef, useState } from 'react';

const TOP_ALWAYS_VISIBLE = 72;
const MIN_DELTA = 8;
/** After a section jump, ignore scroll-up reveal while smooth scroll runs. */
const NAV_JUMP_SUPPRESS_MS = 1200;

export function useNavbarAutoHide(forceVisible = false) {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const ticking = useRef(false);
  const suppressRevealUntil = useRef(0);

  useEffect(() => {
    if (forceVisible) return;

    lastY.current = window.scrollY;

    const update = () => {
      ticking.current = false;
      const y = window.scrollY;
      const delta = y - lastY.current;
      const suppressReveal = performance.now() < suppressRevealUntil.current;

      if (y <= TOP_ALWAYS_VISIBLE) {
        setVisible(true);
      } else if (delta > MIN_DELTA) {
        setVisible(false);
      } else if (delta < -MIN_DELTA && !suppressReveal) {
        setVisible(true);
      }

      lastY.current = y;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(update);
      }
    };

    const onHideRequest = () => {
      setVisible(false);
      lastY.current = window.scrollY;
      suppressRevealUntil.current = performance.now() + NAV_JUMP_SUPPRESS_MS;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('landing:navbar-hide', onHideRequest);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('landing:navbar-hide', onHideRequest);
    };
  }, [forceVisible]);

  return forceVisible || visible;
}
