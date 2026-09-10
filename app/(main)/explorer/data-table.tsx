'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Search, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '../x-assets/data-table';
import { tradeColumns, type TradeRow } from './columns';
import { useTradesData } from '@/hooks/use-trades-data';
import {
  tokenConvert,
  tokenConvertReverse,
  tokenConvertReverseV1,
} from '@/hooks/mutations/use-trade-quote';
import { fmtUnits, fmtUsd, timeAgo } from '@/lib/format';
import { shortenAddress } from '@/utils/crypto';
import { cn } from '@/lib/utils';

const V2_LAUNCH_DATE = 1754831928367;
const SIDES = ['All', 'Buys', 'Sells'] as const;
const SORTS = {
  newest: { label: 'Newest', fn: (a: TradeRow, b: TradeRow) => b.timestamp - a.timestamp },
  largest: { label: 'Largest', fn: (a: TradeRow, b: TradeRow) => b.usdAmount - a.usdAmount },
} as const;

interface TradesTableProps {
  pageSize?: number;
  type?: 'user' | 'explorer';
}

/**
 * Trades table in the style of the reference app's asset list: header with count,
 * filter chips, search and sort, tall rows, and pagination. `type="explorer"` is the
 * protocol-wide feed; `type="user"` is the connected wallet's own history.
 */
export function TradesTable({ pageSize = 20, type = 'explorer' }: TradesTableProps) {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: raw = [], isLoading, isFetching } = useTradesData(type, address);

  const [side, setSide] = useState<(typeof SIDES)[number]>('All');
  const [asset, setAsset] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<keyof typeof SORTS>('newest');
  const [page, setPage] = useState(0);

  const rows = useMemo<TradeRow[]>(
    () =>
      raw.map(t => {
        const ts = t.timestamp ? Number(new Date(t.timestamp)) : 0;
        const isV1 = ts < V2_LAUNCH_DATE;
        const symbol =
          (isV1
            ? tokenConvertReverseV1[t.currency as keyof typeof tokenConvertReverseV1]
            : tokenConvertReverse[t.currency as keyof typeof tokenConvertReverse]) ?? t.currency;
        const quantity = Number(t.quantity);
        const usdAmount = Number(t.usdAmount);
        const row: TradeRow = {
          id: t.tradeId ?? t.orderId ?? t.txHash,
          symbol,
          name: tokenConvert[symbol as keyof typeof tokenConvert] ?? t.currency,
          image: `/images/tokens/${symbol}.png`,
          side: t.side.toLowerCase() === 'buy' ? 'buy' : 'sell',
          quantity,
          usdAmount,
          price: quantity > 0 ? usdAmount / quantity : 0,
          timestamp: ts,
          txHash: t.txHash,
          orderId: t.orderId ?? '',
          swapper: t.swapper ?? '',
        };
        return row;
      }),
    [raw]
  );

  const assets = useMemo(() => ['All', ...Array.from(new Set(rows.map(r => r.symbol))).sort()], [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter(r => side === 'All' || (side === 'Buys' ? r.side === 'buy' : r.side === 'sell'))
      .filter(r => asset === 'All' || r.symbol === asset)
      .filter(
        r =>
          !q ||
          r.txHash.toLowerCase().includes(q) ||
          r.orderId.toLowerCase().includes(q) ||
          r.swapper?.toLowerCase().includes(q) ||
          r.symbol.toLowerCase().includes(q)
      )
      .sort(SORTS[sort].fn);
  }, [rows, side, asset, query, sort]);

  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const pageRows = visible.slice(current * pageSize, current * pageSize + pageSize);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['trades', type] });
  const select = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0);
  };

  if (type === 'user' && !address) return null;

  return (
    <Card className="mb-[4.5rem] md:mb-0">
      {/* Header: tab-style title with count, live state, refresh */}
      <div className="flex items-center justify-between border-b border-border px-5">
        <div className="flex items-center gap-2 border-b-2 border-foreground py-4">
          <h2 className="text-base font-medium">{type === 'user' ? 'Your trades' : 'Trades'}</h2>
          <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {rows.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded bg-secondary px-2.5 py-1 text-xs text-success sm:inline-flex">
            <span className={cn('h-1.5 w-1.5 rounded-full bg-success', isFetching && 'animate-pulse')} />
            Live
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={refresh} aria-label="Refresh">
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Filters, search, sort */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-3">
        {SIDES.map(s => (
          <Chip key={s} active={side === s} onClick={() => select(setSide)(s)}>
            {s}
          </Chip>
        ))}
        {assets.length > 2 && <span className="mx-1 h-5 w-px bg-border" />}
        {assets.length > 2 &&
          assets.map(a => (
            <Chip key={a} active={asset === a} onClick={() => select(setAsset)(a)}>
              {a === 'All' ? 'All assets' : a}
            </Chip>
          ))}
        <div className="ml-auto flex items-center gap-2">
          <label className="flex h-9 items-center gap-2 rounded-lg bg-secondary px-3 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={e => select(setQuery)(e.target.value)}
              placeholder="Tx, order or address"
              className="w-36 bg-transparent placeholder:text-muted-foreground focus:outline-none md:w-44"
            />
          </label>
          <Select value={sort} onValueChange={v => select(setSort)(v as keyof typeof SORTS)}>
            <SelectTrigger aria-label="Sort" className="h-9 w-auto gap-2 rounded-lg border-0 bg-secondary px-3 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {Object.entries(SORTS).map(([k, s]) => (
                <SelectItem key={k} value={k} className="rounded-lg">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        {isLoading ? (
          <div className="space-y-3 px-5 py-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <Empty type={type} />
        ) : (
          <DataTable columns={tradeColumns} data={pageRows} />
        )}
      </div>

      {/* Mobile list */}
      <ul className="divide-y divide-border md:hidden">
        {pageRows.map(r => (
          <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="flex items-center gap-3">
              <Image src={r.image} alt="" width={36} height={36} className="h-9 w-9" />
              <span className="flex flex-col leading-tight">
                <span className="flex items-center gap-2 text-[15px] font-medium">
                  {r.symbol}
                  <span className={cn('text-[11px] font-medium', r.side === 'buy' ? 'text-success' : 'text-destructive')}>
                    {r.side === 'buy' ? 'Buy' : 'Sell'}
                  </span>
                </span>
                <a
                  href={`https://sonicscan.org/tx/${r.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-muted-foreground"
                >
                  {shortenAddress(r.txHash)}
                </a>
              </span>
            </span>
            <span className="flex flex-col items-end leading-tight">
              <span className="font-medium tabular-nums">{fmtUsd(r.usdAmount)}</span>
              <span className="text-xs text-muted-foreground">
                {fmtUnits(r.quantity)} {r.symbol} · {timeAgo(r.timestamp)}
              </span>
            </span>
          </li>
        ))}
        {!isLoading && rows.length === 0 && <Empty type={type} />}
      </ul>

      {/* Pagination */}
      {visible.length > pageSize && (
        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm text-muted-foreground">
          <span>
            Showing {current * pageSize + 1}–{Math.min(visible.length, (current + 1) * pageSize)} of{' '}
            {visible.length}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={current === 0}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
              disabled={current >= pageCount - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-1.5 text-sm transition-colors',
        active ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

function Empty({ type }: { type: 'user' | 'explorer' }) {
  return (
    <div className="px-5 py-14 text-center">
      <p className="text-lg font-medium">No trades yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {type === 'user'
          ? 'Your trades will show up here once you buy or sell an xAsset.'
          : 'Trades will appear here as they happen on the platform.'}
      </p>
    </div>
  );
}
