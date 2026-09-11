'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const GroundContext = createContext(false);

/** True once the reader has scrolled: the hero has collapsed and the ground is white. */
export const useLandingExpanded = () => useContext(GroundContext);

// Where the page parks while the hero morphs. Small enough that the pinned hero stays
// fully in view, large enough that the state doesn't flip back by accident.
const HOLD = 120;
const MORPH_MS = 1150;

/**
 * Owns the page state that the hero, the header and the ground colour all share.
 *
 * The first wheel notch doesn't scroll: it plays the collapse and parks the page at
 * HOLD until the morph has finished, so the reader sees the collapsed hero at rest.
 * A wheel-up at the park point plays it in reverse. Scrollbar drags, touch and anchor
 * jumps still work: a plain scroll listener keeps the state in sync for those.
 */
export function LandingGround({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let current = false;
    let locked = false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const play = (next: boolean) => {
      current = next;
      setExpanded(next);
      window.scrollTo({ top: next ? HOLD : 0, behavior: 'auto' });
      if (reduce) return;
      locked = true;
      window.setTimeout(() => {
        locked = false;
      }, MORPH_MS);
    };

    const onWheel = (e: WheelEvent) => {
      if (locked) {
        e.preventDefault();
        return;
      }
      const y = window.scrollY;
      if (!current && e.deltaY > 0 && y < HOLD) {
        e.preventDefault();
        play(true);
      } else if (current && e.deltaY < 0 && y <= HOLD + 2) {
        e.preventDefault();
        play(false);
      }
    };

    const onScroll = () => {
      if (locked) return;
      const y = window.scrollY;
      const next = current ? y > 8 : y > 40;
      if (next !== current) {
        current = next;
        setExpanded(next);
      }
    };

    onScroll();
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <GroundContext.Provider value={expanded}>
      <div className={cn('landing-ground relative z-10 min-h-dvh', expanded && 'is-expanded')}>
        {children}
      </div>
    </GroundContext.Provider>
  );
}
