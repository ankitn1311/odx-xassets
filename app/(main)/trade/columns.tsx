'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ColumnDef } from '@tanstack/react-table';
import { useSingleToken } from '@/hooks/queries/use-single-token';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import { formatUnits } from 'viem';
import { shortenAddressWithLength } from '@/utils/crypto';
import { toast } from 'sonner';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Asset = {
  id: string;
  ticker: string;
  time: string;
  type: string;
  price: string;
  size: string;
  tradeValue: string;
  txHash: string;
};

export const columns: ColumnDef<Asset>[] = [
  {
    accessorKey: 'time',
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex cursor-pointer items-center gap-2 hover:underline"
        >
          Time
        </div>
      );
    },
    cell: ({ row }) => {
      const time = row.getValue('time') as string;
      // const formatted = time;
      const formatted = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date(time));
      return (
        <div className="flex items-center gap-2 font-medium">
          <p className="whitespace-nowrap">{formatted}</p>
          {row.original.txHash && (
            <ExternalLink
              className="h-3 w-3 flex-shrink-0 cursor-pointer text-accent/90 hover:text-accent"
              onClick={() => {
                window.open(`https://testnet.sonicscan.org/tx/${row.original.txHash}`, '_blank');
              }}
            />
          )}
        </div>
      );
    },
  },
  {
    id: 'id',
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      const id = row.getValue('id') as string;
      return (
        <div
          className="flex cursor-pointer items-center gap-2 font-medium hover:text-accent hover:underline"
          onClick={() => {
            navigator.clipboard.writeText(id);
            toast.success('Copied to clipboard', {
              description: id,
            });
          }}
        >
          {shortenAddressWithLength(id, 3)}
        </div>
      );
    },
  },
  {
    accessorKey: 'ticker',
    header: 'Ticker',
    cell: ({ row }) => {
      const ticker = row.getValue('ticker') as string;
      return <TokenFromAddress address={ticker} />;
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <div className={`font-medium ${type === 'Buy' ? 'text-success' : 'text-destructive'}`}>
          {type}
        </div>
      );
    },
  },

  // {
  //   accessorKey: 'price',
  //   header: 'Price',
  //   cell: ({ row }) => {
  //     const price = row.getValue('price') as string;
  //     const amount = Number(formatUnits(BigInt(price), 6));
  //     const formatted = new Intl.NumberFormat('en-US', {
  //       style: 'currency',
  //       currency: 'USD',
  //       minimumFractionDigits: 2,
  //       maximumFractionDigits: 6,
  //     }).format(amount);
  //
  //     return <div className="font-medium">{formatted}</div>;
  //   },
  // },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ row }) => {
      const size = row.getValue('size') as string;
      const ticker = row.getValue('ticker') as string;
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(size));
      return <SizeCell size={formatted} ticker={ticker} />;
    },
  },
  {
    accessorKey: 'fee',
    header: 'Fee',
    cell: ({ row }) => {
      const fee = row.getValue('fee') as string;
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(fee));

      return <div className="font-medium">{formatted}&nbsp;S</div>;
    },
  },
  {
    accessorKey: 'tradeValue',
    header: 'Trade Value',
    cell: ({ row }) => {
      const tradeValue = row.getValue('tradeValue') as string;
      // const formatted = new Intl.NumberFormat('en-US', {
      //   style: 'currency',
      //   currency: 'USD',
      //   minimumFractionDigits: 2,
      //   maximumFractionDigits: 2,
      // }).format(Number(tradeValue));

      return <div className="text-right font-medium">{Number(tradeValue).toFixed(2)}</div>;
    },
  },
];

const TokenFromAddress = ({ address }: { address: string }) => {
  const { data: token } = useSingleToken(address);
  return (
    <div className="flex items-center gap-1">
      {/* <Avatar className="h-6 w-6">
        <AvatarImage src={`/images/tokens/${token?.BaseSymbol}.png`} />
        <AvatarFallback>{token?.BaseSymbol.slice(0, 2)}</AvatarFallback>
      </Avatar> */}
      {token?.Name}
    </div>
  );
};

export const SizeCell = ({ size, ticker }: { size: string; ticker: string }) => {
  const { data: token } = useSingleToken(ticker);

  return (
    <div className="font-medium">
      {size}&nbsp;{token?.Name.split('/')[1]}
    </div>
  );
};
