'use client';
import { useState } from 'react';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { tradeColumns } from './columns';
import { TradeData } from '@/providers/trades-provider';
import { useTradesData } from '@/hooks/use-trades-data';
import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { tokenConvertReverse } from '@/hooks/mutations/use-trade-quote';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import ConnectWallet from '@/components/common/connect-wallet';
import { shortenAddress } from '@/utils/crypto';
import { useAccount } from 'wagmi';

interface TradesTableProps {
  pageSize?: number;
  type?: 'user' | 'explorer';
}

// Skeleton component for table rows
function TableSkeletonRow({ columns }: { columns: number }) {
  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, index) => (
        <TableCell key={index} className="py-2 first:pl-4 last:pr-4">
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  );
}

// Skeleton component for mobile view
function MobileSkeletonRow() {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-12 rounded" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="space-y-1 text-right">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function TradesTable({ pageSize = 20, type }: TradesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);
  const { address } = useAccount();

  const { data: tableData = [], isLoading: tradesDataLoading } = useTradesData(type, address);

  // Use trades from provider as the main data source

  const table = useReactTable({
    data: tableData,
    columns: tradeColumns as ColumnDef<TradeData, any>[],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualSorting: false,
    initialState: {
      pagination: {
        pageSize,
      },
      sorting: [{ id: 'timestamp', desc: true }],
    },
  });

  if (tradesDataLoading) {
    return (
      <>
        <Card className="hidden py-4 md:block">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="border-b-0 py-2 first:pl-4 last:pr-4">Token</TableHead>
                <TableHead className="border-b-0 py-2 first:pl-4 last:pr-4">Side</TableHead>
                <TableHead className="border-b-0 py-2 first:pl-4 last:pr-4">Quantity</TableHead>
                <TableHead className="border-b-0 py-2 first:pl-4 last:pr-4">USD Amount</TableHead>
                <TableHead className="border-b-0 py-2 first:pl-4 last:pr-4 last:text-right">
                  Transaction
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pageSize }).map((_, index) => (
                <TableSkeletonRow key={index} columns={5} />
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="py-4 md:hidden">
          {/* <div className="px-4 pb-4">
            <h2 className="text-lg font-semibold">Live Trades</h2>
          </div> */}
          <div className="space-y-6 px-4">
            {Array.from({ length: Math.min(10, pageSize) }).map((_, index) => (
              <MobileSkeletonRow key={index} />
            ))}
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card className="hidden py-4 md:block">
        {tableData.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-muted-foreground">
              <div className="mb-2 text-xl font-medium">No trades yet</div>
              <div className="text-sm">Trades will appear here as they happen on the platform</div>
            </div>
          </div>
        ) : (
          <Table className="w-full table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      className="border-b-0 py-2 first:pl-4 last:pr-4 last:text-right"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-2 first:pl-4 last:pr-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      <Card className="py-4 md:hidden">
        {/* <div className="px-4 pb-4">
          <h2 className="text-lg font-semibold">Live Trades</h2>
        </div> */}
        {tableData.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-muted-foreground">
              <div className="mb-2 text-lg font-medium">No trades yet</div>
              <div className="text-sm">Trades will appear here as they happen on the platform</div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 px-4">
            {table
              .getRowModel()
              .rows.slice(0, 10)
              .map(row => {
                const currency = row.getValue('currency') as string;
                const tokenName = tokenConvertReverse[currency as keyof typeof tokenConvertReverse];
                const side = row.getValue('side') as string;
                const quantity = row.getValue('quantity') as string;
                const usdAmount = row.getValue('usdAmount') as string;
                const txHash = row.getValue('txHash') as string;
                const explorerUrl = `https://sonicscan.org/tx/${txHash}`;

                return (
                  <div key={row.id} className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Image
                          src={`/images/tokens/${tokenName}.png`}
                          alt={tokenName}
                          width={24}
                          height={24}
                        />
                        <span className="font-mono text-sm font-medium">{tokenName}</span>
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            side === 'buy'
                              ? 'bg-success/10 text-success'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {side.toUpperCase()}
                        </span>
                      </div>
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary hover:underline"
                      >
                        {shortenAddress(txHash)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="text-sm font-medium">
                        <span className="font-mono">${usdAmount}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-mono">{quantity}</span>{' '}
                        <span className="font-sans text-muted-foreground/70">{tokenName}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </Card>
      {/* Pagination Controls */}
      <div className="z-50 mt-4 flex items-center justify-between gap-2 px-2">
        <button
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <span className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
    </>
  );
}
