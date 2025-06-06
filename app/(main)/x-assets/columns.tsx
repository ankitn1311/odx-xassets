import Image from 'next/image';

const TokenName = ({ name, symbol, image }: { name: string; symbol: string; image: string }) => {
  return (
    <div className="flex items-center gap-4">
      <Image
        alt="Coin Image"
        src={image}
        width="40"
        height="40"
        loading="lazy"
        className="h-10 w-10 rounded-full"
      />
      <div className="flex flex-col">
        <div className="text-base">{name}</div>
        <div className="text-xs font-semibold text-muted-foreground">{symbol}</div>
      </div>
    </div>
  );
};

// columns.ts
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export type Available = {
  tokenName: string;
  tokenSymbol: string;
  price: number;
  priceChange: number;
  marketCap: number;
  image: string;
};

export const exploreColumn: ColumnDef<Available>[] = [
  {
    accessorKey: 'tokenName',
    header: ({ column }) => (
      <div
        className="flex items-center justify-start gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">Token Name</p>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
      const name: string = row.getValue('tokenName');
      const symbol: string = row.original.tokenSymbol;
      const image: string = row.original.image;
      return (
        <div className="flex items-center">
          <TokenName name={name} symbol={symbol} image={image} />
        </div>
      );
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <div
        className="flex items-center justify-start gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">Price</p>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('price'));
      // const formatted = new Intl.NumberFormat('en-US', {
      //   style: 'currency',
      //   currency: 'USD',
      // }).format(amount);
      return <div className="text-base font-normal">${amount.toFixed(5)}</div>;
      //<div className="text-start pl-30">{formatted}</div>;
    },
  },
  {
    accessorKey: 'priceChange',
    header: ({ column }) => (
      <div
        className="flex items-center justify-start gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">Price Change (1d)</p>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
      const priceChange = parseFloat(row.getValue('priceChange'));
      return (
        <div className="flex items-center gap-2">
          <p className="text-base font-normal">{priceChange}</p>
          {priceChange > 0 ? (
            <TrendingUp className="h-6 w-6 text-success" />
          ) : (
            <TrendingDown className="h-6 w-6 text-destructive" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'marketCap',
    header: ({ column }) => (
      <div
        className="flex items-center justify-end gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">Market Cap</p>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
      const marketCap = parseFloat(row.getValue('marketCap'));
      const formattedMarketCap = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(marketCap);
      return <p className="text-right text-base font-normal">{'N/A'}</p>;
    },
  },
];
