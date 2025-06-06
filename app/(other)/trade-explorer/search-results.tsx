'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useTradeSearch } from '@/hooks/queries/use-trade-search';
import { useCopyToClipboard } from 'usehooks-ts';
import { toast } from 'sonner';
import { debounce } from 'lodash';
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

const getExplorerUrl = (chain: string, txHash: string) => {
  const explorers: Record<string, string> = {
    SONIC: 'https://testnet.sonicscan.org/tx/',
    ethereum: 'https://etherscan.io/tx/',
    polygon: 'https://polygonscan.com/tx/',
    ARBI: 'https://sepolia.arbiscan.io/tx/',
    OP: 'https://sepolia-optimism.etherscan.io/tx/',
    BASE: 'https://sepolia.basescan.org/tx/',
    BSC: 'https://testnet.bscscan.com/tx/',
    fantom: 'https://ftmscan.com/tx/',
  };
  return explorers[chain] + txHash;
};

type SearchType = 'trade-id' | 'address' | 'token';

interface SearchResultsProps {
  initialType?: string;
  initialQuery?: string;
}

export function SearchResults({ initialType, initialQuery }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedEventType, setSelectedEventType] = useState<EventType | 'ALL'>('ALL');
  const [, copyToClipboard] = useCopyToClipboard();
  const [inputValue, setInputValue] = useState(initialQuery || '');

  const type = ((initialType || searchParams.get('type')) as SearchType) || 'trade-id';
  const query = initialQuery || searchParams.get('query') || '';

  const { data: trades = {}, isLoading } = useTradeSearch(type, query);

  const tradesList = Object.values(trades)
    .filter(trade => selectedEventType === 'ALL' || trade.EventType === selectedEventType)
    .sort((a, b) => {
      const dateA = new Date(a.Timestamp).getTime();
      const dateB = new Date(b.Timestamp).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  const totalPages = Math.ceil(tradesList.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTrades = tradesList.slice(startIndex, endIndex);

  const handleSearch = useCallback(
    (newType: string, newQuery: string) => {
      if (!newQuery) {
        router.push('/trade-explorer');
        return;
      }
      router.push(`/trade-explorer/${newType}/${newQuery}`);
    },
    [router]
  );

  const debouncedSearch = useCallback(
    debounce((newType: string, newQuery: string) => {
      handleSearch(newType, newQuery);
    }, 500),
    [handleSearch]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    debouncedSearch(type, newValue);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      debouncedSearch.cancel();
      handleSearch(type, inputValue);
    }
  };

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    toast.success('Copied!', {
      description: text,
    });
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select value={type} onValueChange={value => handleSearch(value, inputValue)}>
          <SelectTrigger className="w-[180px] bg-card">
            <SelectValue placeholder="Search Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trade-id">Trade ID</SelectItem>
            <SelectItem value="address">Address</SelectItem>
            <SelectItem value="token">Token</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="flex-1 bg-card"
          placeholder="Enter search query..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
        />
        <Button onClick={() => handleSearch(type, inputValue)} className="bg-primary">
          Search
        </Button>
      </div>

      {query && (
        <div className="space-y-4">
          {type === 'trade-id' ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Search Results</h2>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[300px]" />
                  <Skeleton className="h-4 w-[250px]" />
                </div>
              ) : tradesList.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-4 text-center text-muted-foreground">
                  No trade found with this ID.
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-card p-4">
                  {Object.values(trades).map(trade => (
                    <div key={trade.ID} className="space-y-4">
                      <div className="flex flex-col items-center justify-between gap-2 lg:flex-row">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Trade ID:</span>
                          <span
                            className="cursor-pointer font-mono text-sm hover:underline"
                            onClick={() => handleCopy(trade.ID)}
                            title={trade.ID}
                          >
                            {shortenAddress(trade.ID)}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(trade.Timestamp), 'MMM d, yyyy HH:mm:ss')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Address</span>
                            <Link
                              href={`/trade-explorer/address/${trade.UserAddress}`}
                              className="font-mono text-sm hover:underline"
                              title={trade.UserAddress}
                            >
                              {shortenAddress(trade.UserAddress)}
                            </Link>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Asset A</span>
                            <div className="flex items-center gap-2">
                              <span
                                className="cursor-pointer font-mono text-sm hover:underline"
                                onClick={() => handleCopy(trade.AssetA)}
                                title={trade.AssetA}
                              >
                                {shortenAddress(trade.AssetA)}
                              </span>
                              <span>({trade.AmountA})</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Asset B</span>
                            <div className="flex items-center gap-2">
                              <span
                                className="cursor-pointer font-mono text-sm hover:underline"
                                onClick={() => handleCopy(trade.AssetB)}
                                title={trade.AssetB}
                              >
                                {shortenAddress(trade.AssetB)}
                              </span>
                              <span>({trade.AmountB})</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Event Type</span>
                            <span>{trade.EventType}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Initiation Transaction
                            </span>
                            <a
                              href={getExplorerUrl('SONIC', trade.FirstTxHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer font-mono text-sm text-primary hover:underline"
                              title={trade.FirstTxHash}
                            >
                              {shortenAddress(trade.FirstTxHash, 8)}
                            </a>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Swap Transaction</span>
                            <a
                              href={getExplorerUrl(trade.Chain, trade.SwapTxHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer font-mono text-sm text-primary hover:underline"
                              title={trade.SwapTxHash}
                            >
                              {shortenAddress(trade.SwapTxHash, 8)}
                            </a>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Final Transaction</span>
                            <a
                              href={getExplorerUrl('SONIC', trade.LastTxHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer font-mono text-sm text-primary hover:underline"
                              title={trade.LastTxHash}
                            >
                              {shortenAddress(trade.LastTxHash, 8)}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
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
                  {/* <div className="flex items-center gap-2">
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
                  </div> */}
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
                      <TableHead>Asset A (Amount)</TableHead>
                      <TableHead>Asset B (Amount)</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead
                        className="cursor-pointer hover:underline"
                        onClick={() => setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                      >
                        Timestamp {sortDirection === 'asc' ? '↑' : '↓'}
                      </TableHead>
                      <TableHead>Transaction Hashes</TableHead>
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
                            <Skeleton className="h-4 w-[150px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[150px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[100px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[150px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[300px]" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : currentTrades.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No trades found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentTrades.map(trade => (
                        <TableRow key={trade.ID}>
                          <TableCell>
                            <span
                              className="cursor-pointer font-medium hover:underline"
                              onClick={() => handleCopy(trade.ID)}
                              title={trade.ID}
                            >
                              {shortenAddress(trade.ID)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className="cursor-pointer font-mono text-sm hover:underline"
                              onClick={() => handleCopy(trade.UserAddress)}
                              title={trade.UserAddress}
                            >
                              {shortenAddress(trade.UserAddress)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className="cursor-pointer font-mono text-sm hover:underline"
                                onClick={() => handleCopy(trade.AssetA)}
                                title={trade.AssetA}
                              >
                                {trade.AssetA}
                              </span>
                              <span>({trade.AmountA || '-'})</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className="cursor-pointer font-mono text-sm hover:underline"
                                onClick={() => handleCopy(trade.AssetB)}
                                title={trade.AssetB}
                              >
                                {trade.AssetB}
                              </span>
                              <span>({trade.AmountB || '-'})</span>
                            </div>
                          </TableCell>
                          <TableCell>{trade.EventType}</TableCell>
                          <TableCell>
                            {format(new Date(trade.Timestamp), 'MMM d, yyyy HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Init:</span>
                                <a
                                  href={getExplorerUrl('SONIC', trade.FirstTxHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="cursor-pointer font-mono text-sm text-primary hover:underline"
                                  title={trade.FirstTxHash}
                                >
                                  {shortenAddress(trade.FirstTxHash, 8)}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Swap:</span>
                                <a
                                  href={getExplorerUrl(trade.Chain, trade.SwapTxHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="cursor-pointer font-mono text-sm text-primary hover:underline"
                                  title={trade.SwapTxHash}
                                >
                                  {shortenAddress(trade.SwapTxHash, 8)}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Final:</span>
                                <a
                                  href={getExplorerUrl('SONIC', trade.LastTxHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="cursor-pointer font-mono text-sm text-primary hover:underline"
                                  title={trade.LastTxHash}
                                >
                                  {shortenAddress(trade.LastTxHash, 8)}
                                </a>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
