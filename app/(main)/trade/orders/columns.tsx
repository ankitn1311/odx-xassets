'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Order } from './orders';
import { cn } from '@/lib/utils';
import { ethers } from 'ethers';
import { ExternalLink } from 'lucide-react';
import { shortenAddressWithLength } from '@/utils/crypto';
import { toast } from 'sonner';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Order>[] = [
  // {
  //   id: 'amount',
  //   accessorKey: 'amount',
  //   header: 'Amount',
  //   cell: ({ row }) => {
  //     const amount = row.getValue('amount') as string;
  //     const amountUSD = Number(formatUnits(BigInt(amount), 6));
  //     const formatted = new Intl.NumberFormat('en-US', {
  //       style: 'currency',
  //       currency: 'USD',
  //     }).format(amountUSD);
  //
  //     return <div className="font-medium">{formatted}</div>;
  //   },
  // },
  {
    id: 'id',
    accessorKey: 'id',
    header: 'Trade ID',
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
          {/* <ExternalLink className="size-4 text-muted-foreground" /> */}
        </div>
      );
    },
  },

  {
    id: 'price',
    accessorKey: 'price',
    header: 'Value',
    cell: ({ row }) => {
      const price = row.getValue('price') as string;
      // const amount = Number(ethers.utils.formatUnits(price, 6));
      const amount = Number(price);
      // const type = row.getValue('type') as string;
      const type = row.original['type'];

      // const formatted = new Intl.NumberFormat('en-US', {
      //   style: 'currency',
      //   currency: 'USD',
      // }).format(amount);

      return (
        <div
          className={cn(
            'flex items-center gap-1 text-right font-medium',
            type === 'Buy' ? 'text-success' : 'text-destructive'
          )}
        >
          {type === 'Buy' ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="8"
              height="8"
              fill="none"
              viewBox="0 0 8 6"
            >
              <path
                fill="currentColor"
                d="M3.272.41a.85.85 0 0 1 1.456 0L7.36 4.617C7.732 5.214 7.319 6 6.632 6H1.368C.68 6 .268 5.214.64 4.618z"
              ></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="8"
              height="8"
              fill="none"
              className="rotate-180"
              viewBox="0 0 8 6"
            >
              <path
                fill="currentColor"
                d="M3.272.41a.85.85 0 0 1 1.456 0L7.36 4.617C7.732 5.214 7.319 6 6.632 6H1.368C.68 6 .268 5.214.64 4.618z"
              ></path>
            </svg>
          )}
          <p>{amount.toFixed(2)}</p>
        </div>
      );
    },
  },
  {
    id: 'trader',
    accessorKey: 'trader',
    header: 'Trader',
    cell: ({ row }) => {
      const trader = row.getValue('trader') as string;
      return (
        <div
          className="flex cursor-pointer items-center gap-2 font-medium hover:text-accent hover:underline"
          onClick={() => {
            navigator.clipboard.writeText(trader);
            toast.success('Copied to clipboard', {
              description: trader,
            });
          }}
        >
          {shortenAddressWithLength(trader, 3)}
          {/* <ExternalLink className="size-4 text-muted-foreground" /> */}
        </div>
      );
    },
  },
  // {
  //   accessorKey: "time",
  //   header: "Time",
  //   cell: ({ row }) => {
  //     const time: string = row.getValue("time");

  //     return (
  //       <div className="text-right font-medium flex items-center gap-1 hover:underline cursor-pointer">
  //         {time}
  //       </div>
  //     );
  //   },
  // },
  // {
  //   id: 'type',
  //   accessorKey: 'type',
  //   header: () => <div className="text-center">Type</div>,
  //   enableHiding: true,
  //   cell: ({ row }) => {
  //     const type = row.getValue('type') as string;
  //     return (
  //       <div
  //         className={cn(
  //           'flex items-center justify-center gap-1 text-center font-medium',
  //           type === 'Buy' ? 'text-success' : 'text-destructive'
  //         )}
  //       >
  //         {type === 'Buy' ? (
  //           <svg
  //             xmlns="http://www.w3.org/2000/svg"
  //             width="8"
  //             height="8"
  //             fill="none"
  //             viewBox="0 0 8 6"
  //           >
  //             <path
  //               fill="currentColor"
  //               d="M3.272.41a.85.85 0 0 1 1.456 0L7.36 4.617C7.732 5.214 7.319 6 6.632 6H1.368C.68 6 .268 5.214.64 4.618z"
  //             ></path>
  //           </svg>
  //         ) : (
  //           <svg
  //             xmlns="http://www.w3.org/2000/svg"
  //             width="8"
  //             height="8"
  //             fill="none"
  //             className="rotate-180"
  //             viewBox="0 0 8 6"
  //           >
  //             <path
  //               fill="currentColor"
  //               d="M3.272.41a.85.85 0 0 1 1.456 0L7.36 4.617C7.732 5.214 7.319 6 6.632 6H1.368C.68 6 .268 5.214.64 4.618z"
  //             ></path>
  //           </svg>
  //         )}
  //       </div>
  //     );
  //   },
  // },
  {
    id: 'external',
    accessorKey: 'time',
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="cursor-pointer text-right hover:underline"
        >
          Time
        </div>
      );
    },

    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end">
          {row.original.time && (
            <div className="mr-2 text-sm text-muted-foreground">
              {(() => {
                const now = new Date();
                const time = new Date(row.original.time);
                const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

                if (diff < 60) return `${diff}s ago`;
                if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                return `${Math.floor(diff / 86400)}d ago`;
              })()}
            </div>
          )}

          {row.original.txHash && (
            <ExternalLink
              className="h-3 w-3 cursor-pointer text-accent/90 hover:text-accent"
              onClick={() => {
                window.open(`https://testnet.sonicscan.org/tx/${row.original.txHash}`, '_blank');
              }}
            />
          )}
        </div>
      );
    },
  },
];
