import { shortenAddress } from '@/utils/crypto';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import { TradeData } from '@/providers/trades-provider';
import { tokenConvertReverse } from '@/hooks/mutations/use-trade-quote';
import Image from 'next/image';
import { removeTrailingZeros, truncateToFixed } from '@/lib/utils';

// Helper function to format timestamp
const formatTimestamp = (timestamp: string | number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const tradeColumns: ColumnDef<TradeData>[] = [
  {
    accessorKey: 'currency',
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
      const currency = row.getValue('currency') as string;
      const tokenName = tokenConvertReverse[currency as keyof typeof tokenConvertReverse];
      return (
        <div className="flex items-center gap-2">
          <Image src={`/images/tokens/${tokenName}.png`} alt={tokenName} width={24} height={24} />
          <span className="text-md font-mono font-medium text-foreground">{tokenName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'side',
    header: ({ column }) => (
      <div
        className="group flex items-center justify-start gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">Type</p>
        <ArrowUpDown className="invisible h-4 w-4 group-hover:visible" />
      </div>
    ),
    cell: ({ row }) => {
      const side = row.getValue('side') as string;
      const isBuy = side.toLowerCase() === 'buy';
      return (
        <span
          className={`text-md flex items-center gap-1 font-medium ${isBuy ? 'text-success' : 'text-destructive'}`}
        >
          {isBuy ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {side.toUpperCase()}
        </span>
      );
    },
  },
  {
    accessorKey: 'timestamp',
    header: ({ column }) => (
      <div
        className="group flex items-center justify-start gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">Time</p>
        <ArrowUpDown className="invisible h-4 w-4 group-hover:visible" />
      </div>
    ),
    cell: ({ row }) => {
      const timestamp = row.getValue('timestamp') as string | number;
      return <span className="text-md text-muted-foreground">{formatTimestamp(timestamp)}</span>;
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue('timestamp') as number;
      const b = rowB.getValue('timestamp') as number;
      return a - b;
    },
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => (
      <div
        className="group flex items-center justify-start gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">Quantity</p>
        <ArrowUpDown className="invisible h-4 w-4 group-hover:visible" />
      </div>
    ),
    cell: ({ row }) => {
      const quantity = row.getValue('quantity') as string;
      return (
        <span className="text-md font-mono text-muted-foreground">
          {removeTrailingZeros(truncateToFixed(Number(quantity), 6))}{' '}
          {tokenConvertReverse[row.original.currency as keyof typeof tokenConvertReverse]}
        </span>
      );
    },
  },
  {
    accessorKey: 'usdAmount',
    header: ({ column }) => (
      <div
        className="group flex items-center justify-start gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">USDC Amount</p>
        <ArrowUpDown className="invisible h-4 w-4 group-hover:visible" />
      </div>
    ),
    cell: ({ row }) => {
      const usdAmount = row.getValue('usdAmount') as string;
      return (
        <span className="text-md font-mono text-muted-foreground">
          ${removeTrailingZeros(truncateToFixed(Number(usdAmount), 6))}
        </span>
      );
    },
  },
  {
    accessorKey: 'txHash',
    header: ({ column }) => (
      <div
        className="group flex items-center justify-start gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">Transaction</p>
        <ArrowUpDown className="invisible h-4 w-4 group-hover:visible" />
      </div>
    ),
    cell: ({ row }) => {
      const txHash = row.getValue('txHash') as string;
      const explorerUrl = `https://sonicscan.org/tx/${txHash}`;
      return (
        <span className="flex items-center gap-2">
          <span className="text-md font-mono text-muted-foreground">{shortenAddress(txHash)}</span>
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3 text-muted-foreground transition-colors hover:text-primary" />
          </a>
        </span>
      );
    },
  },
];
