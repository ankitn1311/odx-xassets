'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trade, EventType } from '@/hooks/queries/use-trades';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useCopyToClipboard } from 'usehooks-ts';
import { toast } from 'sonner';
import Link from 'next/link';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const EVENT_TYPE_OPTIONS: { value: EventType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Events' },
  { value: 'USER_DEPOSIT', label: 'User Deposit' },
  { value: 'NATIVE_SWAP_COMPLETE', label: 'Native Swap' },
  { value: 'XASSET_MINT_COMPLETE', label: 'XAsset Mint' },
  { value: 'USER_XASSET_BURN', label: 'XAsset Burn' },
  { value: 'WITHDRAWAL_COMPLETE', label: 'Withdrawal' },
];

// Utility function to shorten addresses
const shortenAddress = (address: string, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

// Generate initial mock data
const generateInitialMockTrades = (): Record<string, Trade> => {
  const mockTrades: Record<string, Trade> = {};
  const count = 10; // Generate 10 initial mock trades

  for (let i = 0; i < count; i++) {
    const id = crypto.randomUUID();
    const eventTypes: EventType[] = [
      'XASSET_MINT_COMPLETE',
      'WITHDRAWAL_COMPLETE',
      'USER_DEPOSIT',
      'NATIVE_SWAP_COMPLETE',
      'USER_XASSET_BURN',
    ];
    const assets = ['USDT.x', 'RIFT.x', 'CULT.x', 'NADE.x', 'NOVA.x', 'WISH.x'];
    const chains = ['ethereum', 'sui', 'solana'];
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString();

    mockTrades[id] = {
      PKID: Math.floor(Math.random() * 1000),
      ID: id,
      UserAddress: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 40)}`,
      AssetA: assets[Math.floor(Math.random() * assets.length)],
      AssetB: assets[Math.floor(Math.random() * assets.length)],
      AmountUSD: (Math.random() * 1000).toFixed(2),
      LastTxHash: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 64)}`,
      FinalTxIndex: Math.floor(Math.random() * 100),
      Chain: chains[Math.floor(Math.random() * chains.length)],
      Timestamp: timestamp,
      CreatedAt: timestamp,
      UpdatedAt: timestamp,
      DeletedAt: null,
      EventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      ValidatorAddress: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 40)}`,
      Fee: (Math.random() * 10).toFixed(4),
      AmountA: (Math.random() * 1000).toFixed(2),
      AmountB: (Math.random() * 1000).toFixed(2),
      FirstTxHash: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 64)}`,
      SwapTxHash: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 64)}`,
    };
  }

  return mockTrades;
};

export function TradesTable() {
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedEventType, setSelectedEventType] = useState<EventType | 'ALL'>('ALL');
  const [, copyToClipboard] = useCopyToClipboard();

  const { data: trades = generateInitialMockTrades(), isLoading } = useQuery<Record<string, Trade>>(
    {
      queryKey: ['all-trades'],
      queryFn: () => ({}),
    }
  );

  const tradesList = Object.values(trades).filter(
    trade => selectedEventType === 'ALL' || trade.EventType === selectedEventType
  );
  const totalPages = Math.ceil(tradesList.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTrades = tradesList.slice(startIndex, endIndex);

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    toast.success('Copied!', {
      description: text,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={pageSize.toString()}
              onValueChange={value => {
                setPageSize(Number(value));
                setCurrentPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Event Type</span>
            <Select
              value={selectedEventType}
              onValueChange={(value: EventType | 'ALL') => {
                setSelectedEventType(value);
                setCurrentPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User Address</TableHead>
              <TableHead>Asset A</TableHead>
              <TableHead>Asset B</TableHead>
              <TableHead>Amount A</TableHead>
              <TableHead>Amount B</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Transaction Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : currentTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No trades found.
                </TableCell>
              </TableRow>
            ) : (
              currentTrades.map(trade => (
                <TableRow key={trade.ID}>
                  <TableCell>
                    <Link
                      href={`/trade-explorer/trade-id/${trade.ID}`}
                      className="cursor-pointer font-medium hover:underline"
                      title={trade.ID}
                    >
                      {shortenAddress(trade.ID)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/trade-explorer/address/${trade.UserAddress}`}
                      className="cursor-pointer font-mono text-sm text-primary hover:underline"
                      title={trade.UserAddress}
                    >
                      {shortenAddress(trade.UserAddress)}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-sm" title={trade.AssetA}>
                    {trade.AssetA}
                  </TableCell>
                  <TableCell className="font-mono text-sm" title={trade.AssetB}>
                    {trade.AssetB}
                  </TableCell>
                  <TableCell>{trade.AmountA}</TableCell>
                  <TableCell>{trade.AmountB}</TableCell>
                  <TableCell>{trade.EventType}</TableCell>
                  <TableCell>{format(new Date(trade.Timestamp), 'MMM d, yyyy HH:mm:ss')}</TableCell>
                  <TableCell className="font-mono text-sm">
                    <a
                      href={`https://testnet.sonicscan.org/tx/${trade.LastTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      title={trade.LastTxHash}
                    >
                      {shortenAddress(trade.LastTxHash, 8)}
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
