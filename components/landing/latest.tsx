'use client';
import { useEffect, useState } from 'react';
import { Words } from './reveal';
import { LaunchGate } from './launch-gate';
import { DiagramTile, Marker } from './blueprint';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 6000;

const NOTES = [
  {
    tag: 'Mint',
    kind: 'mint' as const,
    title: 'One screen to mint wraps and cash',
    body: 'Pay with USDC.e or USDT and pick the asset. The quote shows units out, the spread in basis points and when it settles: instant, T+0 or T+1.',
  },
  {
    tag: 'Reserves',
    kind: 'reserves' as const,
    title: 'The reserves page ships with mint',
    body: 'Public and open without a wallet: units minted against units in custody for every asset, the custodian named, and a link to the attestation.',
  },
  {
    tag: 'Redeem',
    kind: 'redeem' as const,
    title: 'Redeem anytime, route chosen for you',
    body: 'Instant from the buffer, or a queue with your position and ETA. You receive USDC.e, with the fee and haircut shown before you burn.',
  },
];

/**
 * Accordion carousel: the active card takes the row, the others collapse into narrow
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
      <p className="mb-3 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[var(--l-muted)]">
        <Marker /> Product notes
      </p>
      <Words
        text="What's new"
        muted="at ODX"
        className="text-center text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[48px]"
      />

      {/* Phones: the side columns are hidden, so a tab strip picks the note instead. */}
      <div role="tablist" aria-label="Product notes" className="mt-8 flex gap-1 overflow-x-auto md:hidden">
        {NOTES.map((n, i) => (
          <button
            key={n.title}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => select(i)}
            className={cn(
              'flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors',
              i === active
                ? 'border-[var(--l-blue)] text-[var(--l-ink)]'
                : 'border-transparent text-[var(--l-muted)] hover:text-[var(--l-ink)]'
            )}
          >
            <span className={cn('tabular-nums', i === active ? 'text-[var(--l-blue)]' : 'text-[var(--l-muted-2)]')}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {n.tag}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-3 md:mt-12 md:h-[440px]">
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
                'group relative min-w-0 overflow-hidden rounded-lg text-left transition-[flex-basis,background-color] duration-700 [transition-timing-function:cubic-bezier(.45,0,.25,1)]',
                isActive
                  ? 'flex-1 basis-full bg-[var(--l-hero)] text-white'
                  : 'hidden flex-none basis-16 cursor-pointer border border-[var(--l-line)] bg-white hover:border-[var(--l-blue)] md:block'
              )}
            >
              {/* Collapsed: a vertical tab, numbered and named, so the column reads as something to open. */}
              <div
                className={cn(
                  'absolute inset-0 flex flex-col items-center justify-between py-5 transition-opacity duration-300',
                  isActive ? 'pointer-events-none opacity-0' : 'opacity-100 delay-300'
                )}
              >
                <Marker className="group-hover:bg-[var(--l-blue)]" />
                <span className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--l-muted)] [writing-mode:vertical-rl] group-hover:text-[var(--l-ink)]">
                  <span>{n.tag}</span>
                </span>
                <span className="font-mono text-[11px] text-[var(--l-muted-2)]">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div
                className={cn(
                  'grid h-full w-[min(100%,1400px)] gap-6 p-4 transition-opacity duration-500 md:grid-cols-[1fr_1.1fr] md:p-5',
                  isActive ? 'opacity-100 delay-300' : 'opacity-0'
                )}
              >
                <div className="relative h-48 overflow-hidden rounded-md border border-white/10 md:h-full">
                  <DiagramTile kind={n.kind} />
                </div>
                <div className="flex flex-col py-2 md:py-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[#63A0F8]">
                      <Marker /> {n.tag}
                    </span>
                    {isActive && <ProgressRing key={tick} />}
                  </div>
                  <h3 className="mt-4 text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[38px]">
                    {n.title}
                  </h3>
                  <p className="mt-4 max-w-[560px] text-base leading-[1.55] text-white/70">
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

      <div className="mt-6 hidden justify-center gap-2 md:flex">
        {NOTES.map((n, i) => (
          <button
            key={n.title}
            type="button"
            aria-label={`Go to ${i + 1}`}
            onClick={() => select(i)}
            className={cn('h-1.5 transition-all', i === active ? 'w-8 bg-[var(--l-blue)]' : 'w-3 bg-[var(--l-line)]')}
          />
        ))}
      </div>
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
        stroke="#63A0F8"
        strokeWidth="2"
        strokeDasharray={c}
        style={{ animation: `ring-fill ${AUTOPLAY_MS}ms linear forwards` }}
      />
      <style>{`@keyframes ring-fill{from{stroke-dashoffset:${c}}to{stroke-dashoffset:0}}`}</style>
    </svg>
  );
}
