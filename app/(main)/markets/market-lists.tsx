import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Delta } from '@/components/markets/delta';
import { SmallPriceChart } from '@/components/markets/small-price-chart';
import { fmtCompactUsd, fmtDate, fmtPct, fmtPrice } from '@/lib/format';
import type { MarketRow } from '@/hooks/queries/use-market-rows';
import { DemoAlert } from '@/components/common/demo-alert';
import { cn } from '@/lib/utils';

const tradeHref = (row: MarketRow) => `/x-assets?selected-token=${row.address}`;

/** Percentage points between two 24h changes, e.g. 2.08% vs 1.96% → "0.12 pts". */
const pts = (a: number, b: number) => `${(Math.abs(a - b) * 100).toFixed(2)} pts`;

const daysSince = (iso: string) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));

/**
 * Three quick lists: top gainers, most traded, recently listed. Each card puts its
 * leader in a spotlight (bigger price, 24h sparkline, and a fact derived from the
 * gap to the runner-up) with #2 and #3 in compact rows underneath.
 */
export function MarketLists({ rows, isLoading }: { rows: MarketRow[]; isLoading: boolean }) {
  const withChange = rows.filter(r => r.change !== undefined);
  const gainers = [...withChange].sort((a, b) => (b.change ?? 0) - (a.change ?? 0)).slice(0, 3);
  const traded = [...rows].sort((a, b) => b.volumeUsd - a.volumeUsd).slice(0, 3);
  const listed = [...rows]
    .filter(r => r.listedAt)
    .sort((a, b) => (b.listedAt! > a.listedAt! ? 1 : -1))
    .slice(0, 3);
  const totalVolume = rows.reduce((s, r) => s + r.volumeUsd, 0);

  const [g1, g2] = gainers;
  const [t1, t2] = traded;
  const [l1] = listed;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <ListCard title="Top gainers" tag="24H" loading={isLoading} empty={!g1}>
        {g1 && (
          <Spotlight
            row={g1}
            stat={<Delta up={(g1.change ?? 0) >= 0}>{fmtPct(g1.change ?? 0)}</Delta>}
            fact={
              g2
                ? `${pts(g1.change ?? 0, g2.change ?? 0)} ahead of ${g2.symbol}`
                : (g1.change ?? 0) >= 0
                  ? 'Only asset up today'
                  : 'Only asset with a 24h change'
            }
          />
        )}
        {gainers.slice(1).map((r, i) => (
          <Row
            key={r.symbol}
            index={i + 2}
            row={r}
            right={<Delta up={(r.change ?? 0) >= 0}>{fmtPct(r.change ?? 0)}</Delta>}
          />
        ))}
      </ListCard>

      <ListCard title="Most traded" tag="Volume" loading={isLoading} empty={!t1}>
        {t1 && (
          <Spotlight
            row={t1}
            stat={
              <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground tabular-nums">
                {fmtCompactUsd(t1.volumeUsd)}
                {t1.volumeIsDemo && <DemoAlert className="h-3 w-3" note="Volume is illustrative" />}
              </span>
            }
            fact={
              totalVolume > 0
                ? `${Math.round((t1.volumeUsd / totalVolume) * 100)}% of today's volume${
                    t2 && t2.volumeUsd > 0 ? ` · ${(t1.volumeUsd / t2.volumeUsd).toFixed(1)}× ${t2.symbol}` : ''
                  }`
                : 'No volume yet today'
            }
          />
        )}
        {traded.slice(1).map((r, i) => (
          <Row
            key={r.symbol}
            index={i + 2}
            row={r}
            right={
              <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground tabular-nums">
                {fmtCompactUsd(r.volumeUsd)}
                {r.volumeIsDemo && <DemoAlert className="h-3 w-3" note="Volume is illustrative" />}
              </span>
            }
          />
        ))}
      </ListCard>

      <ListCard
        title="Recently listed"
        loading={isLoading}
        empty={!l1}
        alert={<DemoAlert note="Listing dates are illustrative" />}
      >
        {l1 && (
          <Spotlight
            row={l1}
            stat={<span className="font-mono text-xs text-muted-foreground">{fmtDate(l1.listedAt!)}</span>}
            fact={`Newest of ${rows.length} · listed ${daysSince(l1.listedAt!)} days ago`}
          />
        )}
        {listed.slice(1).map((r, i) => (
          <Row
            key={r.symbol}
            index={i + 2}
            row={r}
            right={<span className="font-mono text-xs text-muted-foreground">{fmtDate(r.listedAt!)}</span>}
          />
        ))}
      </ListCard>
    </div>
  );
}

function ListCard({
  title,
  tag,
  loading,
  empty,
  alert,
  children,
}: {
  title: string;
  tag?: string;
  loading: boolean;
  empty: boolean;
  alert?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-medium">{title}</h3>
        {tag && (
          <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {tag}
          </span>
        )}
        {alert}
      </div>
      {loading ? (
        <div className="mt-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="ml-auto h-6 w-20" />
          </div>
          <Skeleton className="mt-3 h-3 w-40" />
          <div className="mt-4 space-y-3 border-t border-border pt-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ) : empty ? (
        <p className="py-6 text-sm text-muted-foreground">Nothing to show yet.</p>
      ) : (
        <ul className="mt-2 flex flex-1 flex-col">{children}</ul>
      )}
    </Card>
  );
}

/** The leader: larger price, its 24h sparkline, and one derived fact under the name. */
function Spotlight({ row, stat, fact }: { row: MarketRow; stat: React.ReactNode; fact: string }) {
  return (
    <li className="border-b border-border pb-3">
      <Link href={tradeHref(row)} className="-mx-2 flex flex-col gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60">
        <span className="flex items-center gap-3">
          <Image src={row.image} alt="" width={44} height={44} className="h-11 w-11" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-[15px] font-medium">{row.symbol}</span>
            <span className="text-xs text-muted-foreground">{row.name}</span>
          </span>
          <span className="ml-auto flex flex-col items-end leading-tight">
            <span className="text-[20px] font-medium tracking-[-0.02em] tabular-nums">
              {row.price !== undefined ? fmtPrice(row.price) : '–'}
            </span>
            {stat}
          </span>
        </span>
        <span className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{fact}</span>
          <SmallPriceChart tokenName={row.symbol} className="h-7 w-20 shrink-0" />
        </span>
      </Link>
    </li>
  );
}

/** Runner-up rows: rank, symbol, and the one figure this list is about. */
function Row({ index, row, right }: { index: number; row: MarketRow; right: React.ReactNode }) {
  return (
    <li>
      <Link
        href={tradeHref(row)}
        className={cn(
          '-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60'
        )}
      >
        <span className="w-5 font-mono text-[11px] text-muted-foreground tabular-nums">
          {String(index).padStart(2, '0')}
        </span>
        <Image src={row.image} alt="" width={28} height={28} className="h-7 w-7" />
        <span className="text-sm font-medium">{row.symbol}</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="text-sm tabular-nums">{row.price !== undefined ? fmtPrice(row.price) : '–'}</span>
          {right}
        </span>
      </Link>
    </li>
  );
}
