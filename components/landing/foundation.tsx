'use client';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Words } from './reveal';

const ROWS = [
  { value: '1:1', label: 'Backing per wrap' },
  { value: '2', label: 'Chains: Sonic and Whitechain' },
  { value: '24/7', label: 'Mint and redeem' },
];

/** Big figures that roll into place like an odometer as they scroll into view. */
export function Foundation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' });

  return (
    <section id="reserves" className="mx-auto max-w-[1600px] scroll-mt-24 px-5 py-20 md:px-10 md:py-32">
      <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
        <div>
          <Words
            text="ODX is building the rails for"
            muted="backed onchain assets."
            className="text-[32px] font-medium leading-[1.1] tracking-[-0.02em] md:text-[44px]"
          />
          <p className="mt-6 max-w-[440px] font-display text-lg text-[var(--l-ink-2)]">
            Every wrap is a receipt for an asset held in custody. The reserves page lists each one
            with units minted, units in custody, the custodian, and when the figures were last
            updated, and links to the attestation.
          </p>
        </div>

        <div ref={ref} className="flex flex-col">
          {ROWS.map((row, r) => (
            <div
              key={row.label}
              className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-[var(--l-line)] py-8 first:pt-0 md:py-10"
            >
              <span className="font-landing text-[clamp(72px,11vw,150px)] font-medium leading-none tracking-[-0.04em] tabular-nums">
                {row.value.split('').map((ch, i) => (
                  <Odometer key={i} char={ch} go={inView} delay={r * 0.15 + i * 0.08} />
                ))}
              </span>
              <span className="max-w-[220px] font-display text-lg leading-snug text-[var(--l-muted)]">
                {row.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Odometer({ char, go, delay }: { char: string; go: boolean; delay: number }) {
  if (!/\d/.test(char)) return <span>{char}</span>;
  const d = Number(char);
  return (
    <span className="odo" aria-label={char}>
      <span
        style={{
          transform: go ? `translateY(-${d}em)` : 'translateY(0)',
          transitionDelay: `${delay}s`,
        }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="block h-[1em]" aria-hidden={i !== d}>
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}
