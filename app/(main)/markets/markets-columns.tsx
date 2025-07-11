import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/app/(main)/markets/price-display';
import { ColumnDef, Row } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

export function useMarketsColumns(): ColumnDef<any>[] {
  const router = useRouter();

  return [
    {
      accessorKey: 'tokenName',
      header: 'Token',
      cell: ({ row }: { row: Row<any> }) => (
        <div className="flex items-center gap-2">
          <img
            src={row.original.image}
            alt={row.original.tokenSymbol}
            className="h-8 w-8 rounded-full"
          />
          <span>{row.original.tokenName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'tokenSymbol',
      header: 'Symbol',
      cell: ({ row }: { row: Row<any> }) => <span>{row.original.tokenSymbol}</span>,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }: { row: Row<any> }) => <PriceDisplay tokenSymbol={row.original.tokenSymbol} />,
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
