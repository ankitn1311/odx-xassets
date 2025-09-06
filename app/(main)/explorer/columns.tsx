import { shortenAddress, shortenAddressWithLength } from '@/utils/crypto';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, TrendingUp, TrendingDown, Copy } from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import { TradeData } from '@/providers/trades-provider';
import { tokenConvertReverse, tokenConvertReverseV1 } from '@/hooks/mutations/use-trade-quote';
import Image from 'next/image';
import { removeTrailingZeros } from '@/lib/utils';
import { toast } from 'sonner';

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

const V2_LAUNCH_DATE = 1754831928367;

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
      const timestamp = row.getValue('timestamp') as string | number;
      const isV1 = Number(new Date(timestamp)) < V2_LAUNCH_DATE;
      const tokenName = isV1
        ? tokenConvertReverseV1[currency as keyof typeof tokenConvertReverse]
        : tokenConvertReverse[currency as keyof typeof tokenConvertReverse];
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
      const timestamp = row.getValue('timestamp') as string | number;
      const isV1 = Number(new Date(timestamp)) < V2_LAUNCH_DATE;
      const tokenName = isV1
        ? tokenConvertReverseV1[row.original.currency as keyof typeof tokenConvertReverse]
        : tokenConvertReverse[row.original.currency as keyof typeof tokenConvertReverse];
      return (
        <span className="text-md font-mono text-muted-foreground">
          {removeTrailingZeros(quantity, 6)} {tokenName}
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
          ${removeTrailingZeros(usdAmount, 6)}
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
  {
    accessorKey: 'orderId',
    header: ({ column }) => (
      <div
        className="group flex items-center justify-start gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">Order Id</p>
        <ArrowUpDown className="invisible h-4 w-4 group-hover:visible" />
      </div>
    ),
    cell: ({ row }) => {
      const orderId = row.getValue('orderId') as string;
      const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(orderId);
          toast.success('Order ID copied to clipboard');
        } catch (err) {
          console.error('Failed to copy order ID:', err);
        }
      };
      return (
        <div
          className="flex cursor-pointer items-center gap-2 transition-colors hover:text-primary"
          onClick={handleCopy}
          title="Click to copy order ID"
        >
          <span className="text-md font-mono text-muted-foreground">
            {shortenAddressWithLength(orderId, 3)}
          </span>
          <Copy className="h-3 w-3 text-muted-foreground transition-colors hover:text-primary" />
        </div>
      );
    },
  },
];
