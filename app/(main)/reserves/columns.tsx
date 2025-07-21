import Image from 'next/image';

const changeToProperName = (name: string) => {
  switch (name) {
    case 'SOL':
      return 'Solana';
    default:
      return name;
  }
};

const TokenName = ({ name, symbol, image }: { name: string; symbol: string; image: string }) => {
  return (
    <div className="flex items-center gap-2">
      <Image
        alt="Coin Image"
        src={image}
        width="40"
        height="40"
        loading="lazy"
        className="h-10 w-10 rounded-full"
      />
      <div className="flex flex-col">
        <div className="text-base">{changeToProperName(name)}</div>
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
  totalSupply: string;
  totalSupplyUSD: string;
  unitsInReserve: string;
  unitsInReserveUSD: string;
  marketCap: number;
  image: string;
};

export const exploreColumn: ColumnDef<Available>[] = [
  {
    accessorKey: 'tokenName',
    header: ({ column }) => (
      <div
        className="group flex items-center justify-start gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">Token</p>
        <ArrowUpDown className="invisible h-4 w-4 group-hover:visible" />
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
    accessorKey: 'totalSupply',
    header: ({ column }) => (
      <div
        className="group flex items-center justify-start gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">Total Supply of xAsset</p>
        <ArrowUpDown className="invisible h-4 w-4 group-hover:visible" />
      </div>
    ),
    cell: ({ row }) => {
      const totalSupply = row.getValue('totalSupply') as string;
      const totalSupplyUSD = row.original.totalSupplyUSD;
      return (
        <div className="flex flex-col items-start">
          <p className="font-mono text-base font-normal text-foreground">
            {Number(totalSupply).toFixed(3)} x1SOL
          </p>
          <p className="text-md font-mono font-normal">
            ${parseFloat(totalSupplyUSD).toLocaleString()}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: 'unitsInReserve',
    header: ({ column }) => (
      <div
        className="group flex items-center justify-start gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">Units in Reserve</p>
        <ArrowUpDown className="invisible h-4 w-4 group-hover:visible" />
      </div>
    ),
    cell: ({ row }) => {
      const unitsInReserve = row.getValue('unitsInReserve') as string;
      const unitsInReserveUSD = row.original.unitsInReserveUSD;
      return (
        <div className="flex flex-col items-start">
          <p className="font-mono text-base font-normal text-foreground">
            {Number(unitsInReserve).toFixed(3)} SOL
          </p>
          <p className="text-md font-mono font-normal">
            ${parseFloat(unitsInReserveUSD).toLocaleString()}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: 'ratio',
    header: ({ column }) => (
      <div
        className="group flex items-center justify-end gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <ArrowUpDown className="invisible h-4 w-4 group-hover:visible" />
        <p className="select-none text-sm font-semibold">Ratio</p>
      </div>
    ),
    cell: ({ row }) => {
      const ratio = row.getValue('ratio') as string;
      return <p className="text-right font-mono text-base font-normal">{ratio}</p>;
    },
  },
];
