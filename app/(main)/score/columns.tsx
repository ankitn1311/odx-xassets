'use client';

import { ColumnDef } from '@tanstack/react-table';
import millify from 'millify';
import { cn } from '@/lib/utils';

export type LeaderboardItem = {
  Name: string;
  Nickname: string;
  Points: number;
  Rank: number;
  Username: string;
  Email?: string;
};

export const columns: ColumnDef<LeaderboardItem>[] = [
  {
    accessorKey: 'Rank',
    header: 'Rank',
    cell: ({ row }) => {
      return <div className="w-[100px] font-medium">#{row.getValue('Rank')}</div>;
    },
  },
  {
    accessorKey: 'Name',
    header: 'Twitter handle',
    cell: ({ row }) => {
      return <div className="">{row.getValue('Name')}</div>;
    },
  },
  {
    accessorKey: 'Nickname',
    header: 'Name',
    cell: ({ row }) => {
      return <div className="">{row.getValue('Nickname')}</div>;
    },
  },
  {
    accessorKey: 'Points',
    header: () => <div className="text-right">Points</div>,
    cell: ({ row }) => {
      const points = row.getValue('Points') as number;
      return (
        <div className="text-right">
          {millify(points, {
            precision: 2,
          })}
        </div>
      );
    },
  },
];

export const etherealColumns: ColumnDef<LeaderboardItem>[] = [
  {
    accessorKey: 'Rank',
    header: 'Rank',
    cell: ({ row }) => {
      return <div className="w-[100px] font-medium">#{row.getValue('Rank')}</div>;
    },
  },
  {
    accessorKey: 'Email',
    header: 'Wallet Address',
    cell: ({ row }) => {
      return <div className="">{row.original?.Name}</div>;
    },
  },

  {
    accessorKey: 'Points',
    header: () => <div className="text-right">Points</div>,
    cell: ({ row }) => {
      const points = row.getValue('Points') as number;
      return (
        <div className="text-right">
          {millify(points, {
            precision: 2,
          })}
        </div>
      );
    },
  },
];
