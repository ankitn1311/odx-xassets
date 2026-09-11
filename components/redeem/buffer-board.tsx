'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { DemoAlert } from '@/components/common/demo-alert';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { QUEUE_ESTIMATE, REDEEM_BUFFER_USD, REDEEM_FEE_BPS, REDEEM_HAIRCUT_BPS } from '@/config/placeholders';
import { fmtUsd } from '@/lib/format';
import { cn } from '@/lib/utils';

const EASE = [0.45, 0, 0.25, 1] as const;

/**
 * How a redeem is routed, drawn instead of explained. One bar per asset shows how much
 * can be paid instantly from its buffer; anything above that joins the queue. The asset
 * picked in the form is lit and carries the two routes written on its bar.
 */
export function BufferBoard() {
  const selected = useTokenSwapStore(s => s.selectedXAsset?.Name ?? null);
  const assets = Object.entries(REDEEM_BUFFER_USD)
    .map(([symbol, usd]) => ({ symbol, usd }))
    .sort((a, b) => b.usd - a.usd);
  const max = assets[0]?.usd ?? 1;
  const current = assets.find(a => a.symbol === selected) ?? null;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-medium">
          Instant buffers
          <DemoAlert note="Buffers, queue position and ETA are illustrative until the redeem API exists" />
        </h2>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Within buffer <span className="text-success">· instant</span>
          <span className="mx-2 text-border">|</span>
          Above it <span className="text-warning-foreground">· queue</span>
          <span className="text-muted-foreground/70">
            {' '}
            (pos {QUEUE_ESTIMATE.position} · {QUEUE_ESTIMATE.eta})
          </span>
        </p>
      </div>

      <ul className="px-5 py-3">
        {assets.map((a, i) => {
          const on = a.symbol === selected;
          const width = Math.max(4, (a.usd / max) * 100);
          return (
            <li
              key={a.symbol}
              className={cn(
                'grid grid-cols-[minmax(0,140px)_1fr_auto] items-center gap-4 rounded-lg px-2 py-2.5',
                on && 'bg-secondary pb-6'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Image src={`/images/tokens/${a.symbol}.png`} alt="" width={28} height={28} className="h-7 w-7" />
                <span className={cn('text-sm', on ? 'font-medium' : 'text-muted-foreground')}>{a.symbol}</span>
              </span>

              {/* The bar: instant share drawn to scale, the queue as a hairline beyond it. */}
              <span className="relative h-5">
                <span className="absolute inset-y-1/2 left-0 right-0 h-px -translate-y-1/2 bg-border" />
                <motion.span
                  className={cn('absolute inset-y-0 left-0 rounded-sm', on ? 'bg-primary' : 'bg-primary/25')}
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.05 * i }}
                />
                {on && (
                  <>
                    <span
                      className="absolute -top-0.5 h-6 w-0.5 bg-foreground"
                      style={{ left: `${width}%` }}
                      aria-hidden
                    />
                    <span
                      className="absolute top-full mt-1 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                      style={{ left: `${Math.min(width, 88)}%` }}
                    >
                      instant · up to here · then queue
                    </span>
                  </>
                )}
              </span>

              <span className={cn('font-mono text-xs tabular-nums', on ? 'text-foreground' : 'text-muted-foreground')}>
                {fmtUsd(a.usd, 0)}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
        {current ? (
          <>
            <span className="font-medium text-foreground">{current.symbol}</span>: up to{' '}
            <span className="font-mono tabular-nums">{fmtUsd(current.usd, 0)}</span> pays out now; above that you take
            position {QUEUE_ESTIMATE.position} in the queue and claim on {QUEUE_ESTIMATE.eta}.
          </>
        ) : (
          <>Pick an asset in the form to see its route.</>
        )}{' '}
        Fee {REDEEM_FEE_BPS} bps · haircut {REDEEM_HAIRCUT_BPS} bps · nothing burns until you sign.
      </p>
    </Card>
  );
}
