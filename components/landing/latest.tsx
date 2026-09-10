'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Words } from './reveal';
import { LaunchGate } from './launch-gate';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 6000;

const NOTES = [
  {
    tag: 'Mint',
    title: 'One screen to mint wraps and cash',
    body: 'Pay with USDC.e or USDT and pick the asset. The quote shows units out, the spread in basis points and when it settles: instant, T+0 or T+1.',
    image: 'https://picsum.photos/id/1067/1200/800',
  },
  {
    tag: 'Reserves',
    title: 'The reserves page ships with mint',
    body: 'Public and open without a wallet: units minted against units in custody for every asset, the custodian named, and a link to the attestation.',
    image: 'https://picsum.photos/id/1076/1200/800',
  },
  {
    tag: 'Redeem',
    title: 'Redeem anytime, route chosen for you',
    body: 'Instant from the buffer, or a queue with your position and ETA. You receive USDC.e, with the fee and haircut shown before you burn.',
    image: 'https://picsum.photos/id/1080/1200/800',
  },
];

/**
 * Accordion carousel: the active card takes the row, the others collapse into grey
 * columns at the sides. Autoplays with a progress ring; any card can be clicked.
 */
export function Latest() {
  const [active, setActive] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      setActive(a => (a + 1) % NOTES.length);
      setTick(n => n + 1);
    }, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [active, tick]);

  const select = (i: number) => {
    setActive(i);
    setTick(n => n + 1);
  };

  return (
    <section className="mx-auto max-w-[1600px] px-5 pb-20 pt-12 md:px-10 md:pb-32">
      <Words
        text="What's new"
        muted="at ODX"
        className="text-center text-[36px] font-medium leading-[1.05] tracking-[-0.03em] md:text-[48px]"
      />

      <div className="mt-12 flex h-[560px] gap-4 md:h-[440px]">
        {NOTES.map((n, i) => {
          const isActive = i === active;
          return (
            <div
              key={n.title}
              role="button"
              tabIndex={isActive ? -1 : 0}
              onClick={() => select(i)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') select(i);
              }}
              aria-label={isActive ? undefined : `Show: ${n.title}`}
              aria-current={isActive}
              className={cn(
                'relative min-w-0 overflow-hidden rounded-3xl text-left transition-[flex-basis,background-color] duration-700 [transition-timing-function:cubic-bezier(.45,0,.25,1)]',
                isActive ? 'flex-1 basis-full bg-[var(--l-hero)] text-white' : 'flex-none basis-10 bg-[var(--l-surface)] md:basis-16'
              )}
            >
              <div
                className={cn(
                  'grid h-full w-[min(100%,1400px)] gap-6 p-4 transition-opacity duration-500 md:grid-cols-[1fr_1.1fr] md:p-6',
                  isActive ? 'opacity-100 delay-300' : 'opacity-0'
                )}
              >
                <div className="relative h-48 overflow-hidden rounded-2xl md:h-full">
                  <Image
                    src={n.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col py-2 md:py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">{n.tag}</span>
                    {isActive && <ProgressRing key={tick} />}
                  </div>
                  <h3 className="mt-4 text-[28px] font-medium leading-[1.1] tracking-[-0.02em] md:text-[40px]">
                    {n.title}
                  </h3>
                  <p className="mt-4 max-w-[560px] font-display text-base leading-[1.5] text-white/70 md:text-[18px]">
                    {n.body}
                  </p>
                  <div className="mt-auto pt-6">
                    <LaunchGate variant="light" className="pointer-events-auto">
                      Open the app
                    </LaunchGate>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {NOTES.map((n, i) => (
          <button
            key={n.title}
            type="button"
            aria-label={`Go to ${i + 1}`}
            onClick={() => select(i)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === active ? 'w-8 bg-[var(--l-ink)]' : 'w-3 bg-[var(--l-line)]'
            )}
          />
        ))}
      </div>
      <span className="sr-only">
        <ArrowRight className="size-4" />
      </span>
    </section>
  );
}

/** Small ring that fills over the autoplay interval. */
function ProgressRing() {
  const r = 6;
  const c = 2 * Math.PI * r;
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="-rotate-90">
      <circle cx="9" cy="9" r={r} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="2" />
      <circle
        cx="9"
        cy="9"
        r={r}
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeDasharray={c}
        style={{ animation: `ring-fill ${AUTOPLAY_MS}ms linear forwards` }}
      />
      <style>{`@keyframes ring-fill{from{stroke-dashoffset:${c}}to{stroke-dashoffset:0}}`}</style>
    </svg>
  );
}
