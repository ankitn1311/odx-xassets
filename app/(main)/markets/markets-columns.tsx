import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/app/(main)/markets/price-display';
import { PriceChangeDisplay } from './price-change-display';
import { SmallPriceChart } from '@/components/markets/small-price-chart';
import { Delta } from '@/components/markets/delta';
import { DemoAlert } from '@/components/common/demo-alert';
import { fmtCompactUsd, fmtUsd } from '@/lib/format';
import type { MarketRow } from '@/hooks/queries/use-market-rows';
import { useRouter } from 'nextjs-toploader/app';

export function useMarketsColumns(): ColumnDef<MarketRow>[] {
  const router = useRouter();

  return [
    {
      id: 'index',
      header: '#',
      meta: { className: 'w-12 text-muted-foreground' },
      cell: ({ row }) => <span className="tabular-nums">{row.index + 1}</span>,
    },
    {
      accessorKey: 'symbol',
      header: 'Asset',
      meta: { className: 'min-w-[200px]' },
      cell: ({ row }) => (
        <span className="flex items-center gap-3">
          <Image src={row.original.image} alt="" width={36} height={36} className="h-9 w-9" />
          <span className="flex flex-col leading-tight">
            <span className="text-[15px] font-medium">{row.original.symbol}</span>
            <span className="text-xs text-muted-foreground">{row.original.name}</span>
          </span>
        </span>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => <PriceDisplay tokenSymbol={row.original.symbol} className="!px-0 !py-0" />,
    },
    {
      accessorKey: 'changeUsd',
      header: '24h ($)',
      cell: ({ row }) =>
        row.original.changeUsd === undefined ? (
          <span className="text-muted-foreground">–</span>
        ) : (
          <Delta up={row.original.changeUsd >= 0}>{fmtUsd(Math.abs(row.original.changeUsd), 4)}</Delta>
        ),
    },
    {
      accessorKey: 'change',
      header: '24h (%)',
      cell: ({ row }) => <PriceChangeDisplay tokenSymbol={row.original.symbol} />,
    },
    {
      accessorKey: 'volumeUsd',
      header: 'Volume',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 tabular-nums">
          {fmtCompactUsd(row.original.volumeUsd)}
          {row.original.volumeIsDemo && <DemoAlert className="h-3 w-3" note="Volume is illustrative" />}
        </span>
      ),
    },
   
    {
      id: 'chart',
      header: '24h chart',
      meta: { className: 'w-32' },
      cell: ({ row }) => (
        <SmallPriceChart key={`${row.original.symbol}-chart`} tokenName={row.original.symbol} className="w-24" />
      ),
    },
    {
      id: 'trade',
      header: '',
      meta: { className: 'w-24 text-right' },
      cell: ({ row }) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={e => {
            e.stopPropagation();
            router.push(`/x-assets?selected-token=${row.original.address}`);
          }}
        >
          Trade
        </Button>
      ),
    },
  ];
}
