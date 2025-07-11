import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTokenPriceWithFlash } from '@/hooks/mutations/use-trade-quote';
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
      cell: ({ row }: { row: Row<any> }) => {
        const { data, isLoading, error, flashState } = useTokenPriceWithFlash(
          row.original.tokenSymbol
        );

        if (error) return <span>-</span>;

        if (isLoading) return <Skeleton className="h-4 w-20" />;

        const flashClass =
          flashState === 'up'
            ? 'price-flash-up'
            : flashState === 'down'
              ? 'price-flash-down'
              : flashState === 'same'
                ? 'price-flash-same'
                : '';

        return <span className={`rounded px-2 py-1 transition-colors ${flashClass}`}>${data}</span>;
      },
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
