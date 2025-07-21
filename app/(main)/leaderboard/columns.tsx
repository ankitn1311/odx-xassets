import { shortenAddress } from '@/utils/crypto';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ExternalLink } from 'lucide-react';

export type LeaderboardEntry = {
  rank: number;
  address: string;
  totalPoints: number;
};

export const leaderboardColumns: ColumnDef<LeaderboardEntry>[] = [
  {
    accessorKey: 'rank',
    header: ({ column }) => (
      <div
        className="group flex items-center justify-start gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">Rank</p>
        <ArrowUpDown className="invisible h-4 w-4 group-hover:visible" />
      </div>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-base font-semibold">{row.getValue('rank')}</span>
    ),
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <div
        className="group flex items-center justify-start gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <p className="select-none text-sm font-semibold">Wallet Address</p>
        <ArrowUpDown className="invisible h-4 w-4 group-hover:visible" />
      </div>
    ),
    cell: ({ row }) => {
      const wallet = row.getValue('address') as string;
      // Use a random avatar image based on wallet address (for demo)
      const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${wallet}`;
      const explorerUrl = `https://etherscan.io/address/${wallet}`;
      return (
        <span className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={avatarUrl} alt={wallet} />
            <AvatarFallback>{shortenAddress(wallet).slice(2, 4)}</AvatarFallback>
          </Avatar>
          <span className="font-mono text-xs text-muted-foreground">{shortenAddress(wallet)}</span>
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
          </a>
        </span>
      );
    },
  },
  {
    accessorKey: 'totalPoints',
    header: ({ column }) => (
      <div
        className="group flex items-center justify-end gap-2 hover:cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <ArrowUpDown className="invisible h-4 w-4 group-hover:visible" />
        <p className="select-none text-sm font-semibold">Points</p>
      </div>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-base font-semibold">{row.getValue('totalPoints')}</span>
    ),
  },
];
