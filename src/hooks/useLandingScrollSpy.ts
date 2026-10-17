'use client';

import { useEffect, useRef, useState } from 'react';

import { scheduleScrollWork } from '@/lib/throttle';

const PROGRESS_BAR_ID = 'landing-scroll-progress';

export function useLandingScrollSpy(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '');
  const sectionIdsKey = sectionIds.join('|');
  const rafPending = useRef(false);
  const lastProgress = useRef(-1);

  useEffect(() => {
    const ids = sectionIdsKey.split('|').filter(Boolean);

    const measure = () => {
      rafPending.current = false;
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop;
      const max = doc.scrollHeight - doc.clientHeight;
      const nextProgress = max > 0 ? Math.min(1, scrollTop / max) : 0;

      if (Math.abs(lastProgress.current - nextProgress) > 0.002) {
        lastProgress.current = nextProgress;
        const bar = document.getElementById(PROGRESS_BAR_ID);
        if (bar) bar.style.transform = `scaleX(${nextProgress})`;
      }

      const viewportCenter = scrollTop + window.innerHeight / 2;
      let current = ids[0] ?? '';
      let matched = false;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (viewportCenter >= top && viewportCenter < bottom) {
          current = id;
          matched = true;
          break;
        }
      }
      if (!matched) {
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.offsetTop + el.offsetHeight / 2 <= viewportCenter) current = id;
        }
      }

      setActiveId((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (rafPending.current) return;
      rafPending.current = true;
      scheduleScrollWork(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sectionIdsKey]);

  return { activeId };
}
