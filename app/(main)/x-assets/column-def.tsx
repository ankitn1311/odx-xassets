import Image from 'next/image';

const TokenName = () => {
  return (
    <div className="flex gap-2">
      <Image alt="Coin Image" src="/images/UA-XRP.svg" width="40" height="40" loading="lazy" />
      <div>
        <p className="font-medium">1inch</p>
        <p className="text-muted-foreground">U1Inch</p>
      </div>
    </div>
  );
};

// columns.ts
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export type Available = {
  tokenName: string;
  price: number;
  priceChange: number;
  marketCap: string;
  button: any;
};

export const fullColumns: ColumnDef<Available>[] = [
  {
    accessorKey: 'tokenName',
    header: ({ column }) => (
      <div className="flex items-center justify-start gap-2">
        <p className="text-sm font-semibold">Token Name</p>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
      const name: string = row.getValue('tokenName');
      return (
        <div className="flex items-center">
          <TokenName />
        </div>
      );
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <div className="flex items-center gap-2 text-start">
        <p className="text-sm font-semibold">Price</p>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="pl-30 text-start">{formatted}</div>;
    },
  },
  {
    accessorKey: 'priceChange',
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold">Price Change (1d)</p>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
      const priceChange = parseFloat(row.getValue('priceChange'));
      return <div className="text-left">{priceChange}%</div>;
    },
  },
  {
    accessorKey: 'marketCap',
    header: ({ column }) => (
      <div className="flex items-center justify-end gap-2">
        <p className="text-sm font-semibold">Market Cap</p>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
      const marketCap = parseFloat(row.getValue('marketCap'));
      const formattedMarketCap = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
      }).format(marketCap);
      return <div className="text-right">{formattedMarketCap}</div>;
    },
  },
];
