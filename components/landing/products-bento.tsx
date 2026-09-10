'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { DemoAlert } from '@/components/common/demo-alert';
import { Words, Reveal } from './reveal';
import { LaunchGate } from './launch-gate';
import { Bars, DottedLine, IconGrid, MiniTable } from './charts';
import { cn } from '@/lib/utils';

type Tile = { label: string; value: string; note?: string; chart: React.ReactNode };
type Product = {
  key: string;
  tag: string;
  name: string;
  body: string;
  note?: string;
  icons: string[];
  cta: React.ReactNode;
  tiles: [Tile, Tile, Tile];
};

// Illustrative shapes only: minting grows in steps and custody keeps pace with it.
const growth = Array.from({ length: 22 }, (_, i) => 100 + Math.pow(i, 1.6) * 4 + (i % 3 === 0 ? 6 : 0));
const nav = Array.from({ length: 22 }, (_, i) => 1 + i * 0.0006 + (i % 4 === 0 ? 0.0002 : 0));

const PRODUCTS: Product[] = [
  {
    key: 'xassets',
    tag: 'Wraps',
    name: 'xAssets',
    body: 'Wrapped XRP, BTC, DOGE and more. Every unit is backed 1:1 by the underlying asset held in custody, and can be added to your wallet or used in pools.',
    note: 'Not a yield vault',
    icons: ['x2XRP', 'x2BTC', 'x2DOGE', 'x2SOL'],
    cta: <LaunchGate>Mint</LaunchGate>,
    tiles: [
      {
        label: 'Units minted vs in custody',
        value: '1 : 1',
        note: 'Custody keeps pace with every mint',
        chart: <DottedLine series={growth} secondary={growth} color="#8C64B0" badge="100%" />,
      },
      {
        label: 'Assets',
        value: '8',
        chart: <IconGrid icons={['x2XRP', 'x2BTC', 'x2DOGE', 'x2SOL', 'x2ETH', 'x2ADA', 'x2SUI', 'x2PEPE']} />,
      },
      {
        label: 'Settlement',
        value: 'Instant',
        note: 'Quote shows instant, T+0 or T+1',
        chart: (
          <Bars
            color="#5A86CC"
            badge="ETA"
            values={[
              { label: 'Instant', value: 100 },
              { label: 'T+0', value: 55 },
              { label: 'T+1', value: 30 },
            ]}
          />
        ),
      },
    ],
  },
  {
    key: 'xcash',
    tag: 'Earn',
    name: 'xCASH',
    body: 'A cash token backed by short-term US Treasuries (USYC) plus a liquidity buffer. Priced at NAV, with instant redemption up to the buffer and a queue beyond it.',
    note: 'KYC where the series requires it',
    icons: ['USDC'],
    cta: <LaunchGate>Subscribe</LaunchGate>,
    tiles: [
      {
        label: 'NAV',
        value: '$1.012',
        note: 'Priced at net asset value',
        chart: <DottedLine series={nav} color="#1DA66A" badge="$1.012" />,
      },
      {
        label: 'Allocation',
        value: 'USYC + buffer',
        chart: (
          <Bars
            color="#1DA66A"
            badge="60%"
            values={[
              { label: 'USYC', value: 60 },
              { label: 'Buffer', value: 15 },
              { label: 'Syrup', value: 0 },
            ]}
          />
        ),
      },
      {
        label: 'Redeem',
        value: 'T+0 / T+1',
        note: 'Instant up to the buffer, then a queue',
        chart: (
          <Bars
            color="#5A86CC"
            values={[
              { label: 'Buffer', value: 100 },
              { label: 'Queue', value: 45 },
            ]}
          />
        ),
      },
    ],
  },
  {
    key: 'reserves',
    tag: 'Trust',
    name: 'Reserves',
    body: 'Public, no wallet required. Units minted against units in custody for every asset, the custodian named, when it was last updated, and a link to the attestation.',
    icons: [],
    cta: (
      <a
        href="#reserves"
        className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--l-ink)] px-5 text-[15px] font-medium text-white transition-colors hover:bg-[var(--l-ink-2)]"
      >
        How reserves work
      </a>
    ),
    tiles: [
      {
        label: 'Minted vs in custody',
        value: 'Matched',
        note: 'Both series overlap when fully backed',
        chart: <DottedLine series={growth} secondary={growth} color="#5A86CC" badge="1 : 1" />,
      },
      {
        label: 'Custodian',
        value: 'Safeheron',
        chart: (
          <MiniTable
            rows={[
              ['xXRP', 'minted', 'held'],
              ['xBTC', 'minted', 'held'],
              ['xDOGE', 'minted', 'held'],
            ]}
          />
        ),
      },
      {
        label: 'Access',
        value: 'Public',
        note: 'No wallet needed to read it',
        chart: (
          <Bars
            color="#8C64B0"
            values={[
              { label: 'Anyone', value: 100 },
              { label: 'Wallet', value: 100 },
              { label: 'KYC', value: 100 },
            ]}
          />
        ),
      },
    ],
  },
];

/**
 * Sticky bento: the section is three screens tall, the inner panel is pinned, and the
 * scroll position picks which product is expanded. Clicking a product also works.
 */
export function ProductsBento() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const set = () => setPinned(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', v => {
    if (!pinned) return;
    // Switch a little ahead of the even thirds so the next product appears before
    // the reader has scrolled a full segment.
    setActive(Math.min(PRODUCTS.length - 1, Math.floor(v * (PRODUCTS.length + 0.6))));
  });

  const p = PRODUCTS[active];

  return (
    <section id="products" className="scroll-mt-24">
      <div className="mx-auto max-w-[1600px] px-5 pt-10 text-center md:px-10">
        <p className="text-sm text-[var(--l-muted)]">Our products</p>
        <Words
          text="A new standard"
          muted="for backed onchain assets."
          className="mx-auto mt-4 max-w-[900px] text-[36px] font-medium leading-[1.05] tracking-[-0.03em] md:text-[56px]"
        />
        <Reveal delay={0.2}>
          <p className="mx-auto mt-5 max-w-[560px] font-display text-lg text-[var(--l-ink-2)]">
            Wraps you can mint and redeem, a cash token that earns, and a reserves page that
            shows the backing behind both.
          </p>
        </Reveal>
      </div>

      <div ref={ref} className={cn(pinned ? 'h-[300vh]' : 'h-auto')}>
        {/* Pinned just below the floating header, sized to the viewport like the reference. */}
        <div
          className={cn(
            'mx-auto max-w-[1600px] px-5 py-10 md:px-10',
            pinned && 'sticky top-0 flex h-screen items-stretch pb-5 pt-[92px]'
          )}
        >
          <div
            className={cn(
              'grid w-full min-h-0 gap-3 rounded-[28px] bg-[var(--l-surface)] p-3 md:grid-cols-[1fr_1.35fr]',
              pinned && 'h-full'
            )}
          >
            {/* Product accordion */}
            <div className="flex min-h-0 flex-col gap-3">
              {PRODUCTS.map((item, i) => {
                const on = i === active;
                return (
                  <div
                    key={item.key}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActive(i)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') setActive(i);
                    }}
                    aria-expanded={on}
                    className={cn(
                      'flex flex-col overflow-hidden rounded-2xl bg-white p-6 text-left transition-[flex-grow] duration-700 [transition-timing-function:cubic-bezier(.45,0,.25,1)]',
                      on ? 'min-h-0 flex-1' : 'flex-none'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      {on ? (
                        <span className="flex size-12 items-center justify-center rounded-xl bg-[var(--l-ink)] text-white">
                          {item.icons[0] ? (
                            <Image src={`/images/tokens/${item.icons[0]}.png`} alt="" width={32} height={32} className="size-8" />
                          ) : (
                            <ShieldCheck className="size-6" />
                          )}
                        </span>
                      ) : (
                        <span className="text-[26px] font-medium tracking-[-0.02em]">{item.name}</span>
                      )}
                      <span className="rounded-full bg-[var(--l-surface)] px-3 py-1 text-xs font-medium text-[var(--l-muted)]">
                        {item.tag}
                      </span>
                    </div>
                    {on && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        className="mt-auto flex flex-col gap-4 pt-10"
                      >
                        <span className="text-[30px] font-medium tracking-[-0.02em]">{item.name}</span>
                        <p className="max-w-[440px] font-display text-base leading-[1.5] text-[var(--l-ink-2)] md:text-[18px]">
                          {item.body}
                        </p>
                        {item.note && (
                          <span className="w-fit rounded-full bg-[var(--l-surface)] px-3 py-1 text-xs text-[var(--l-muted)]">
                            {item.note}
                          </span>
                        )}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex -space-x-1.5">
                            {item.icons.map(icon => (
                              <Image
                                key={icon}
                                src={`/images/tokens/${icon}.png`}
                                alt=""
                                width={32}
                                height={32}
                                className="size-9"
                              />
                            ))}
                          </div>
                          <span onClick={e => e.stopPropagation()}>{item.cta}</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stat tiles, re-drawn for each product */}
            <div key={p.key} className="grid min-h-0 gap-3 md:grid-rows-[minmax(0,0.9fr)_minmax(0,1fr)]">
              <TileCard tile={p.tiles[0]} />
              <div className="grid min-h-0 gap-3 sm:grid-cols-2">
                <TileCard tile={p.tiles[1]} />
                <TileCard tile={p.tiles[2]} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TileCard({ tile }: { tile: Tile }) {
  return (
    <div className="flex min-h-0 flex-col rounded-2xl bg-white p-5">
      <p className="text-xs text-[var(--l-muted)]">{tile.label}</p>
      <p className="mt-1 font-display text-[30px] leading-none tracking-[-0.01em]">{tile.value}</p>
      {tile.note && <p className="mt-1.5 font-mono text-[11px] text-[var(--l-muted)]">{tile.note}</p>}
      <div className="mt-4 min-h-0 flex-1">{tile.chart}</div>
      <p className="mt-3 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[var(--l-muted-2)]">
        Illustrative <DemoAlert className="h-3 w-3" />
      </p>
    </div>
  );
}
