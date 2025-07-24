import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/app/(main)/markets/price-display';
import { SmallPriceChart } from '@/components/markets/small-price-chart';
import { ColumnDef, Row } from '@tanstack/react-table';
import { useRouter } from 'nextjs-toploader/app';
import { PriceChangeDisplay } from './price-change-display';
import { TokenName } from '../reserves/columns';

export function useMarketsColumns(): ColumnDef<any>[] {
  const router = useRouter();

  return [
    {
      accessorKey: 'tokenName',
      header: 'Token',
      cell: ({ row }: { row: Row<any> }) => (
        <div className="flex items-center gap-2">
          <TokenName
            name={row.original.tokenName}
            symbol={row.original.tokenSymbol}
            image={row.original.image}
          />
          {/* <img
            src={row.original.image}
            alt={row.original.tokenSymbol}
            className="h-8 w-8 rounded-full"
          />
          <span>{row.original.tokenName}</span> */}
        </div>
      ),
    },
    {
      accessorKey: 'priceChart',
      header: 'Chart',
      cell: ({ row }: { row: Row<any> }) => <SmallPriceChart tokenName={row.original.tokenName} />,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }: { row: Row<any> }) => <PriceDisplay tokenSymbol={row.original.tokenSymbol} />,
    },
    {
      accessorKey: 'priceChange',
      header: 'Daily Change',
      cell: ({ row }: { row: Row<any> }) => (
        <PriceChangeDisplay tokenSymbol={row.original.tokenSymbol} />
      ),
    },
    {
      id: 'trade',
      header: 'Trade',
      cell: ({ row }: { row: Row<any> }) => (
        <Button onClick={() => router.push(`/x-assets?selected-token=${row.original.address}`)}>
          Trade
        </Button>
      ),
    },
  ];
}
