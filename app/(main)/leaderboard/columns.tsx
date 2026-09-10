import { ColumnDef } from '@tanstack/react-table';
import { ExternalLink } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { shortenAddress } from '@/utils/crypto';
import { cn } from '@/lib/utils';

export type LeaderboardEntry = {
  rank: number;
  address: string;
  totalPoints: number;
};

/** A leaderboard row plus what the table derives from it. */
export type LeaderboardRow = LeaderboardEntry & {
  /** points as a fraction of the leader's points */
  share: number;
  isYou: boolean;
};

export const avatarUrl = (address: string) =>
  `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`;

/** Rank badge: the top three get a tinted disc, everyone else a plain number. */
export function RankBadge({ rank, size = 'sm' }: { rank: number; size?: 'sm' | 'lg' }) {
  const tint =
    rank === 1
      ? 'bg-[#F5E6B8] text-[#7A5A00]'
      : rank === 2
        ? 'bg-[#E8E8E8] text-[#4A4A4A]'
        : rank === 3
          ? 'bg-[#F0D9C4] text-[#7A4A1A]'
          : '';
  if (!tint) {
    return <span className="font-mono text-sm text-muted-foreground tabular-nums">{rank}</span>;
  }
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-mono font-medium tabular-nums',
        size === 'lg' ? 'h-9 w-9 text-sm' : 'h-7 w-7 text-xs',
        tint
      )}
    >
      {rank}
    </span>
  );
}

export function Trader({ address, isYou }: { address: string; isYou?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <Avatar className="h-9 w-9 rounded-full bg-secondary">
        <AvatarImage src={avatarUrl(address)} alt="" />
        <AvatarFallback>{address.slice(2, 4)}</AvatarFallback>
      </Avatar>
      <span className="flex flex-col leading-tight">
        <span className="flex items-center gap-2 font-mono text-[15px]">
          {shortenAddress(address)}
          {isYou && (
            <span className="rounded bg-foreground px-1.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide text-background">
              You
            </span>
          )}
        </span>
        <a
          href={`https://sonicscan.org/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          View on Sonicscan <ExternalLink className="h-3 w-3" />
        </a>
      </span>
    </span>
  );
}

export const leaderboardColumns: ColumnDef<LeaderboardRow>[] = [
  {
    accessorKey: 'rank',
    header: '#',
    meta: { className: 'w-16' },
    cell: ({ row }) => <RankBadge rank={row.original.rank} />,
  },
  {
    accessorKey: 'address',
    header: 'Trader',
    meta: { className: 'min-w-[240px]' },
    cell: ({ row }) => <Trader address={row.original.address} isYou={row.original.isYou} />,
  },
  {
    accessorKey: 'share',
    header: 'Share of leader',
    meta: { className: 'w-56' },
    cell: ({ row }) => (
      <span className="flex items-center gap-3">
        <span className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
          <span
            className="block h-full rounded-full bg-foreground"
            style={{ width: `${Math.max(2, Math.round(row.original.share * 100))}%` }}
          />
        </span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {Math.round(row.original.share * 100)}%
        </span>
      </span>
    ),
  },
  {
    accessorKey: 'totalPoints',
    header: 'Points',
    meta: { className: 'w-32 text-right' },
    cell: ({ row }) => (
      <span className="font-mono text-[15px] font-medium tabular-nums">
        {row.original.totalPoints.toLocaleString()}
      </span>
    ),
  },
];
