import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Delta } from '@/components/markets/delta';
import { fmtCompactUsd, fmtDate, fmtPct, fmtPrice } from '@/lib/format';
import type { MarketRow } from '@/hooks/queries/use-market-rows';
import { DemoAlert } from '@/components/common/demo-alert';

/** Three quick lists: top gainers, most traded, recently listed. */
export function MarketLists({ rows, isLoading }: { rows: MarketRow[]; isLoading: boolean }) {
  const withChange = rows.filter(r => r.change !== undefined);
  const gainers = [...withChange].sort((a, b) => (b.change ?? 0) - (a.change ?? 0)).slice(0, 3);
  const traded = [...rows].sort((a, b) => b.volumeUsd - a.volumeUsd).slice(0, 3);
  const listed = [...rows]
    .filter(r => r.listedAt)
    .sort((a, b) => (b.listedAt! > a.listedAt! ? 1 : -1))
    .slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <ListCard title="Top gainers" tag="24H" loading={isLoading}>
        {gainers.map(r => (
          <Row
            key={r.symbol}
            row={r}
            right={
              <>
                <span className="font-medium tabular-nums">{r.price !== undefined ? fmtPrice(r.price) : '–'}</span>
                <Delta up={(r.change ?? 0) >= 0}>{fmtPct(r.change ?? 0)}</Delta>
              </>
            }
          />
        ))}
      </ListCard>

      <ListCard title="Most traded" tag="Volume" loading={isLoading}>
        {traded.map(r => (
          <Row
            key={r.symbol}
            row={r}
            right={
              <>
                <span className="font-medium tabular-nums">{r.price !== undefined ? fmtPrice(r.price) : '–'}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                  {fmtCompactUsd(r.volumeUsd)}
                  {r.volumeIsDemo && <DemoAlert className="h-3 w-3" note="Volume is illustrative" />}
                </span>
              </>
            }
          />
        ))}
      </ListCard>

      <ListCard
        title="Recently listed"
        loading={isLoading}
        alert={<DemoAlert note="Listing dates are illustrative" />}
      >
        {listed.map(r => (
          <Row
            key={r.symbol}
            row={r}
            right={
              <>
                <span className="font-medium tabular-nums">{r.price !== undefined ? fmtPrice(r.price) : '–'}</span>
                <span className="text-xs text-muted-foreground">{fmtDate(r.listedAt!)}</span>
              </>
            }
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
  alert,
  children,
}: {
  title: string;
  tag?: string;
  loading: boolean;
  alert?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-medium">{title}</h3>
        {tag && (
          <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {tag}
          </span>
        )}
        {alert}
      </div>
      <ul className="mt-2 divide-y divide-border">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </li>
            ))
          : children}
      </ul>
    </Card>
  );
}

function Row({ row, right }: { row: MarketRow; right: React.ReactNode }) {
  return (
    <li>
      <Link
        href={`/x-assets?selected-token=${row.address}`}
        className="-mx-2 flex items-center justify-between rounded-lg px-2 py-3 transition-colors hover:bg-muted/60"
      >
        <span className="flex items-center gap-3">
          <Image src={row.image} alt="" width={36} height={36} className="h-9 w-9" />
          <span className="flex flex-col leading-tight">
            <span className="text-[15px] font-medium">{row.symbol}</span>
            <span className="text-xs text-muted-foreground">{row.name}</span>
          </span>
        </span>
        <span className="flex flex-col items-end leading-tight">{right}</span>
      </Link>
    </li>
  );
}
