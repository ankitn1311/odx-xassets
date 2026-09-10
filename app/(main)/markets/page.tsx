'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '../x-assets/data-table';
import { useMarketsColumns } from './markets-columns';
import { AnalyticsCard } from './analytics-card';
import { PromoBanner } from './promo-banner';
import { MarketLists } from './market-lists';
import { useMarketRows, type MarketRow } from '@/hooks/queries/use-market-rows';
import { PriceDisplay } from './price-display';
import { PriceChangeDisplay } from './price-change-display';
import { cn } from '@/lib/utils';
import { DemoAlert } from '@/components/common/demo-alert';

const FILTERS = ['All assets', 'Layer 1', 'Payments', 'Meme'] as const;
const SORTS = {
  traded: { label: 'Most traded', fn: (a: MarketRow, b: MarketRow) => b.volumeUsd - a.volumeUsd },
  gainers: { label: 'Top gainers', fn: (a: MarketRow, b: MarketRow) => (b.change ?? 0) - (a.change ?? 0) },
  name: { label: 'Name', fn: (a: MarketRow, b: MarketRow) => a.symbol.localeCompare(b.symbol) },
} as const;

export default function MarketsPage() {
  const router = useRouter();
  const { rows, isLoading } = useMarketRows();
  const columns = useMarketsColumns();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All assets');
  const [sort, setSort] = useState<keyof typeof SORTS>('traded');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter(r => filter === 'All assets' || r.category === filter)
      .filter(r => !q || r.symbol.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
      .sort(SORTS[sort].fn);
  }, [rows, filter, sort, query]);

  const goTrade = (row: MarketRow) => router.push(`/x-assets?selected-token=${row.address}`);

  return (
    <div className="flex h-full w-full max-w-6xl flex-col items-stretch gap-4 px-4 py-4 md:py-8">
      <AnalyticsCard />
      <PromoBanner />
      <MarketLists rows={rows} isLoading={isLoading} />

      <Card className="mb-[4.5rem] md:mb-0">
        {/* Card header: title, count, market state */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-medium">xAssets</h2>
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {rows.length}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Market open
            <span className="text-muted-foreground">(24/7)</span>
            <DemoAlert className="h-3 w-3" note="Market status is a constant" />
          </span>
        </div>

        {/* Filters, search, sort */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3">
          <DemoAlert note="Categories are a hardcoded mapping" />
          {FILTERS.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm transition-colors',
                filter === f ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <label className="flex h-9 items-center gap-2 rounded-lg bg-secondary px-3 text-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search assets"
                className="w-32 bg-transparent placeholder:text-muted-foreground focus:outline-none md:w-40"
              />
            </label>
            <Select value={sort} onValueChange={v => setSort(v as keyof typeof SORTS)}>
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
        <div className="hidden pb-2 md:block">
          {isLoading && rows.length === 0 ? (
            <div className="space-y-3 px-5 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <DataTable columns={columns} data={visible} onRowClick={goTrade} />
          )}
        </div>

        {/* Mobile list */}
        <ul className="divide-y divide-border md:hidden">
          {visible.map(row => (
            <li key={row.symbol} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex items-center gap-3">
                <Image src={row.image} alt="" width={36} height={36} className="h-9 w-9" />
                <span className="flex flex-col leading-tight">
                  <span className="text-[15px] font-medium">{row.symbol}</span>
                  <span className="text-xs text-muted-foreground">{row.name}</span>
                </span>
              </span>
              <span className="flex flex-col items-end leading-tight">
                <PriceDisplay tokenSymbol={row.symbol} className="!px-0 !py-0 font-medium" />
                <PriceChangeDisplay tokenSymbol={row.symbol} />
              </span>
              <Button variant="secondary" size="sm" onClick={() => goTrade(row)}>
                Trade
              </Button>
            </li>
          ))}
          {!visible.length && (
            <li className="px-4 py-8 text-center text-muted-foreground">No results.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
