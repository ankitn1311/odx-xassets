import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import { Copy, ExternalLink, TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { shortenAddress, shortenAddressWithLength } from '@/utils/crypto';
import { fmtPrice, fmtUnits, fmtUsd } from '@/lib/format';
import { cn } from '@/lib/utils';

/** A trade row after normalisation in the table component. */
export type TradeRow = {
  id: string;
  symbol: string; // x2XRP
  name: string; // XRP
  image: string;
  side: 'buy' | 'sell';
  quantity: number;
  usdAmount: number;
  price: number;
  timestamp: number;
  txHash: string;
  orderId: string;
  swapper: string;
};

export const exact = (ts: number) =>
  new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const copy = async (text: string, what: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied`);
  } catch {
    toast.error(`Could not copy ${what.toLowerCase()}`);
  }
};

export const tradeColumns: ColumnDef<TradeRow>[] = [
  {
    id: 'index',
    header: '#',
    meta: { className: 'w-12 text-muted-foreground' },
    cell: ({ row }) => <span className="tabular-nums">{row.index + 1}</span>,
  },
  {
    accessorKey: 'symbol',
    header: 'Asset',
    meta: { className: 'min-w-[180px]' },
    cell: ({ row }) => (
      <span className="flex items-center gap-3">
        <Image src={row.original.image} alt="" width={40} height={40} className="h-10 w-10" />
        <span className="flex flex-col leading-tight">
          <span className="text-[15px] font-medium">{row.original.symbol}</span>
          <span className="text-xs text-muted-foreground">{row.original.name}</span>
        </span>
      </span>
    ),
  },
  {
    accessorKey: 'side',
    header: 'Type',
    meta: { className: 'w-28' },
    cell: ({ row }) => {
      const buy = row.original.side === 'buy';
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-medium',
            buy ? 'text-success' : 'text-destructive'
          )}
        >
          {buy ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {buy ? 'Buy' : 'Sell'}
        </span>
      );
    },
  },
  {
    accessorKey: 'usdAmount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className="flex flex-col leading-tight">
        <span className="text-[15px] font-medium tabular-nums">{fmtUsd(row.original.usdAmount)}</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {fmtUnits(row.original.quantity)} {row.original.symbol}
        </span>
      </span>
    ),
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.price > 0 ? fmtPrice(row.original.price) : '–'}</span>
    ),
  },
  {
    accessorKey: 'timestamp',
    header: 'Time',
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">{exact(row.original.timestamp)}</span>
    ),
  },
  {
    accessorKey: 'txHash',
    header: 'Transaction',
    cell: ({ row }) => (
      <a
        href={`https://sonicscan.org/tx/${row.original.txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground hover:underline"
      >
        {shortenAddress(row.original.txHash)}
        <ExternalLink className="h-3 w-3 text-muted-foreground" />
      </a>
    ),
  },
  {
    accessorKey: 'orderId',
    header: 'Order',
    meta: { className: 'w-28 text-right' },
    cell: ({ row }) => (
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          copy(row.original.orderId, 'Order ID');
        }}
        title="Copy order ID"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
      >
        {shortenAddressWithLength(row.original.orderId, 3)}
        <Copy className="h-3 w-3" />
      </button>
    ),
  },
];
