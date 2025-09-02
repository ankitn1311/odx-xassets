'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { leaderboardColumns, LeaderboardEntry } from './columns';
import { fetchLeaderboardPage, fetchWeeklyLeaderboardPage, LeaderboardApiResponse } from './api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink } from 'lucide-react';
import { useWalletProfile } from '@/hooks/queries/use-wallet-profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { shortenAddress } from '@/utils/crypto';
import { useAccount } from 'wagmi';
import { getWeekId } from '@/lib/utils';
interface LeaderboardTableProps {
  pageSize?: number;
}

export function LeaderboardTable({ pageSize = 100 }: LeaderboardTableProps) {
  const [page] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading, isError } = useQuery<LeaderboardApiResponse>({
    queryKey: ['leaderboard', page, pageSize],
    queryFn: () => fetchLeaderboardPage({ page, pageSize }),
  });

  const table = useReactTable({
    data: data?.leaderboard || [],
    columns: leaderboardColumns as ColumnDef<LeaderboardEntry, any>[],
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    manualSorting: false,
  });

  const { address } = useAccount();
  const { data: userData, isLoading: userLoading } = useWalletProfile(address);

  // Prepare a row-like object for the current user
  const userRow = userData
    ? {
        rank: userData?.current_rank ?? '-',
        address: userData?.address ?? '-',
        totalPoints: userData?.totalPoints ?? '-',
      }
    : null;

  let userRowTable = null;
  if (address && userRow) {
    const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userRow.address}`;
    const explorerUrl = `https://sonicscan.org/address/${userRow.address}`;
    userRowTable = (
      <TableRow>
        {/* Rank */}
        <TableCell className="bg-primary/5 py-2 first:pl-4 last:pr-4 last:text-right">
          <span className="font-mono text-base font-semibold">
            {userLoading ? <Skeleton className="h-6 w-20" /> : userRow.rank}
          </span>
        </TableCell>
        {/* Address */}
        <TableCell className="bg-primary/5 py-2 first:pl-4 last:pr-4 last:text-right">
          <span className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={avatarUrl} alt={userRow.address} />
              <AvatarFallback>{shortenAddress(userRow.address).slice(2, 4)}</AvatarFallback>
            </Avatar>
            <span className="font-mono text-xs text-muted-foreground">
              {userLoading ? <Skeleton className="h-6 w-20" /> : shortenAddress(userRow.address)}
            </span>
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
            </a>
          </span>
        </TableCell>
        {/* Points */}
        <TableCell className="bg-primary/5 py-2 first:pl-4 last:pr-4 last:text-right">
          <span className="font-mono text-base font-semibold">
            {userLoading ? <Skeleton className="h-6 w-20" /> : userRow.totalPoints}
          </span>
        </TableCell>
      </TableRow>
    );
  }

  if (isLoading) {
    return (
      <>
        <Card className="hidden py-4 md:block">
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
              {[...Array(100)].map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  {leaderboardColumns.map((col, colIdx) => (
                    <TableCell key={colIdx} className="py-2 first:pl-4 last:pr-4 last:text-right">
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* <div className="mt-4 flex items-center justify-between gap-2 px-2">
          <button className="rounded border px-3 py-1 text-sm disabled:opacity-50" disabled>
            Previous
          </button>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            Page <Skeleton className="h-5 w-5" /> of <Skeleton className="h-5 w-5" />
          </span>
          <button className="rounded border px-3 py-1 text-sm disabled:opacity-50" disabled>
            Next
          </button>
        </div> */}
      </>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 text-center text-destructive-foreground">
        Error loading leaderboard.{' '}
        {/* <button onClick={() => refetch()} className="underline">
          Retry
        </button> */}
      </Card>
    );
  }

  return (
    <>
      <Card className="py-4">
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
            {userRowTable}
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-2 first:pl-4 last:pr-4 last:text-right">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={leaderboardColumns.length}>No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      {/* Pagination Controls */}
      {/* <div className="z-50 mt-4 flex items-center justify-between gap-2 px-2">
        <button
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {data ? Math.ceil(data.count / pageSize) : 1}
        </span>
        <button
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => setPage(p => (data && p < Math.ceil(data.count / pageSize) ? p + 1 : p))}
          disabled={data ? page >= Math.ceil(data.count / pageSize) : true}
        >
          Next
        </button>
      </div> */}
    </>
  );
}

interface WeeklyLeaderboardTableProps {
  pageSize?: number;
}

export function WeeklyLeaderboardTable({ pageSize = 100 }: WeeklyLeaderboardTableProps) {
  const [page] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading, isError } = useQuery<LeaderboardApiResponse>({
    queryKey: ['weekly-leaderboard', page, pageSize],
    queryFn: () => fetchWeeklyLeaderboardPage({ page, pageSize }),
  });

  const table = useReactTable({
    data: data?.leaderboard || [],
    columns: leaderboardColumns as ColumnDef<LeaderboardEntry, any>[],
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    manualSorting: false,
  });

  const { address } = useAccount();
  const { data: userData, isLoading: userLoading } = useWalletProfile(address);

  const userRow = userData
    ? {
        ...userData,
        rank: userData?.current_rank ?? '-',
        address: userData?.address ?? '-',
        totalPoints: userData?.totalPoints ?? '-',
      }
    : null;
  let userRowTable = null;

  const weekId = getWeekId();
  const userWeekRankKey = `${weekId}_rank`;
  const weeklyRank = userRow?.[userWeekRankKey as keyof typeof userRow] || '-';

  if (address && userRow) {
    const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userRow.address}`;
    const explorerUrl = `https://sonicscan.org/address/${userRow.address}`;
    userRowTable = (
      <TableRow>
        {/* Rank */}
        <TableCell className="bg-primary/5 py-2 first:pl-4 last:pr-4 last:text-right">
          <span className="font-mono text-base font-semibold">
            {userLoading ? <Skeleton className="h-6 w-20" /> : (weeklyRank as string)}
          </span>
        </TableCell>
        {/* Address */}
        <TableCell className="bg-primary/5 py-2 first:pl-4 last:pr-4 last:text-right">
          <span className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={avatarUrl} alt={userRow.address} />
              <AvatarFallback>{shortenAddress(userRow.address).slice(2, 4)}</AvatarFallback>
            </Avatar>
            <span className="font-mono text-xs text-muted-foreground">
              {userLoading ? <Skeleton className="h-6 w-20" /> : shortenAddress(userRow.address)}
            </span>
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
            </a>
          </span>
        </TableCell>
        {/* Points */}
        <TableCell className="bg-primary/5 py-2 first:pl-4 last:pr-4 last:text-right">
          <span className="font-mono text-base font-semibold">
            {userLoading ? <Skeleton className="h-6 w-20" /> : userRow.weeklyPoints || '-'}
          </span>
        </TableCell>
      </TableRow>
    );
  }

  if (isLoading) {
    return (
      <>
        <Card className="hidden py-4 md:block">
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
              {[...Array(100)].map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  {leaderboardColumns.map((col, colIdx) => (
                    <TableCell key={colIdx} className="py-2 first:pl-4 last:pr-4 last:text-right">
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 text-center text-destructive-foreground">
        Error loading weekly leaderboard.
      </Card>
    );
  }

  return (
    <>
      <Card className="py-4">
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
            {userRowTable}
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-2 first:pl-4 last:pr-4 last:text-right">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={leaderboardColumns.length}>No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
