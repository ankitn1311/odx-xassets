'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Words } from './reveal';
import { Marker } from './blueprint';
import { cn } from '@/lib/utils';

const CARDS = [
  {
    title: 'Custodied, not pooled',
    body: 'Underlying assets are held by a regulated custodian. Wraps are receipts for what is held, not claims on a shared pot.',
    foot: 'Safeheron',
  },
  {
    title: 'Public proof of reserves',
    body: 'Minted versus in-custody figures for every asset, with the custodian named and an attestation linked.',
    foot: 'Reserves page',
  },
  {
    title: 'KYC only where required',
    body: 'Trading a wrap does not force identity checks. A gate applies only to a series that needs it, such as fund shares.',
    foot: 'Per series',
  },
  {
    title: 'Plain terms',
    body: 'You accept the terms once, per wallet. They say what the token is: a receipt, not the underlying.',
    foot: 'Terms of Service',
  },
  {
    title: 'Status you can see',
    body: 'If minting is paused, an oracle is stale or the buffer is low, a banner says so before you place an order.',
    foot: 'Status',
  },
];

/** Dark blueprint section; one card is lit at a time, the rest wait as outlines. */
export function Principles() {
  const [active, setActive] = useState(0);
  const step = (d: number) => setActive(a => (a + d + CARDS.length) % CARDS.length);

  return (
    <section className="blueprint-grid-dark relative overflow-hidden bg-[var(--l-hero)] text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--l-hero)]" />
      {/* Corner markers, like registration marks on a drawing. */}
      <span aria-hidden="true" className="absolute left-10 top-10 hidden h-3 w-3 bg-[#63A0F8] md:block" />
      <span aria-hidden="true" className="absolute right-10 top-10 hidden h-3 w-3 border border-[#63A0F8] md:block" />

      <div className="relative mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-32">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-white/60">
          <Marker /> Trust and transparency
        </p>
        <Words
          text="Institutional grade in all we do"
          className="mt-3 max-w-[560px] text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[56px]"
        />

        <div className="mt-14 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
          {CARDS.map((c, i) => {
            const on = i === active;
            return (
              <button
                key={c.title}
                type="button"
                onClick={() => setActive(i)}
                aria-current={on}
                className={cn(
                  'flex h-[260px] shrink-0 flex-col rounded-md p-6 text-left transition-[width,background-color,color] duration-700 [transition-timing-function:cubic-bezier(.45,0,.25,1)]',
                  on
                    ? 'w-[min(88vw,460px)] bg-white text-[var(--l-ink)]'
                    : 'w-[min(60vw,230px)] border border-white/15 bg-white/[0.04] text-white'
                )}
              >
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded border font-mono text-[11px]',
                    on ? 'border-[var(--l-line)]' : 'border-white/25'
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="mt-auto">
                  <span className="block text-lg font-medium leading-snug">{c.title}</span>
                  {on && (
                    <>
                      <span className="mt-2 block text-base leading-[1.5] text-[var(--l-ink-2)]">
                        {c.body}
                      </span>
                      <span className="mt-4 block border-t border-[var(--l-line)] pt-3 text-xs font-medium text-[var(--l-muted)]">
                        {c.foot}
                      </span>
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex gap-2">
          <button type="button" aria-label="Previous" onClick={() => step(-1)} className="flex size-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" aria-label="Next" onClick={() => step(1)} className="flex size-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
