import Image from 'next/image';
import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '../x-assets/data-table';
import { reserveColumns, type ReserveRow } from './columns';
import { useTokensSupply } from '@/hooks/queries/use-token-supply';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { tokenConvert, tokenConvertForUI } from '@/hooks/mutations/use-trade-quote';
import { fmtCompactUsd, fmtUnits, timeAgo } from '@/lib/format';

const CUSTODIAN = 'Safeheron';

/** Builds one row per xAsset from on-chain supply, matched by symbol. */
function useReserveRows() {
  const { allTokens } = useTokenSwapStore();
  const { data: supply, isLoading, dataUpdatedAt } = useTokensSupply();

  const rows = useMemo<ReserveRow[]>(
    () =>
      allTokens.map(pair => {
        const symbol = pair.TokenB.Name;
        const s = supply?.find(x => x.symbol === symbol);
        const minted = Number(s?.totalSupply ?? 0);
        const mintedUsd = Number(s?.totalSupplyUSD ?? 0);
        // Reserve mirrors supply at a 1:1 ratio until the custody feed exists.
        return {
          symbol,
          name: tokenConvert[symbol as keyof typeof tokenConvert] ?? symbol,
          image: `/images/tokens/${symbol}.png`,
          minted,
          mintedUsd,
          inReserve: minted,
          inReserveUsd: mintedUsd,
          ratio: 1,
          custodian: CUSTODIAN,
          updatedAt: dataUpdatedAt || Date.now(),
        };
      }),
    [allTokens, supply, dataUpdatedAt]
  );

  return { rows, isLoading, updatedAt: dataUpdatedAt };
}

export function ReservesTable() {
  const { rows, isLoading, updatedAt } = useReserveRows();
  const totalMinted = rows.reduce((s, r) => s + r.mintedUsd, 0);

  return (
    <div className="flex flex-col gap-3">
      {/* One-line summary */}
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{rows.length} assets</span>
        <span>·</span>
        <span>
          <span className="font-mono text-foreground">{fmtCompactUsd(totalMinted)}</span> minted
        </span>
        {updatedAt > 0 && (
          <>
            <span>·</span>
            <span>Updated {timeAgo(updatedAt)}</span>
          </>
        )}
      </p>

      {/* Desktop table */}
      <Card className="hidden md:block">
        {isLoading && !rows.some(r => r.minted > 0) ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="py-2">
            <DataTable columns={reserveColumns} data={rows} />
          </div>
        )}
      </Card>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 pb-[4.5rem] md:hidden">
        {rows.map(r => (
          <Card key={r.symbol} className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image src={r.image} alt="" width={36} height={36} className="h-9 w-9" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[15px] font-medium">
                    {tokenConvertForUI[r.name as keyof typeof tokenConvertForUI] ?? r.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{r.symbol}</span>
                </div>
              </div>
              <span className="font-mono text-sm tabular-nums">{Math.round(r.ratio * 100)}%</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Total Supply of xAsset</span>
                <span className="font-mono tabular-nums">
                  {fmtUnits(r.minted)} <span className="font-sans text-xs text-muted-foreground">{r.symbol}</span>
                </span>
                <span className="text-xs text-muted-foreground">{fmtCompactUsd(r.mintedUsd)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Units in Reserve</span>
                <span className="font-mono tabular-nums">
                  {fmtUnits(r.inReserve)} <span className="font-sans text-xs text-muted-foreground">{r.name}</span>
                </span>
                <span className="text-xs text-muted-foreground">{fmtCompactUsd(r.inReserveUsd)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span>{r.custodian}</span>
              <span>{timeAgo(r.updatedAt)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
