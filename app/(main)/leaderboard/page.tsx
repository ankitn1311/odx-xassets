'use client';
import { Card } from '@/components/ui/card';
import { LeaderboardTable } from './data-table';
import { useAccount } from 'wagmi';
import { useWalletProfile } from '@/hooks/queries/use-wallet-profile';
import { shortenAddress } from '@/utils/crypto';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ExternalLink } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardPage() {
  const { address } = useAccount();
  const { data, isLoading } = useWalletProfile(address);

  // Prepare a row-like object for the current user
  const userRow = data
    ? {
        rank: data.current_rank ?? '-',
        address: data.address,
        totalPoints: data.totalPoints,
      }
    : null;

  let userRowTable = null;
  if (address && userRow) {
    const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userRow.address}`;
    const explorerUrl = `https://sonicscan.org/address/${userRow.address}`;
    userRowTable = (
      <Card className="bg-accent/20 p-2 text-foreground">
        <Table className="w-full table-fixed">
          <TableBody>
            <TableRow>
              {/* Rank */}
              <TableCell className="py-2 first:pl-4 last:pr-4 last:text-right">
                <span className="font-mono text-base font-semibold">
                  {isLoading ? <Skeleton className="h-6 w-20" /> : userRow.rank}
                </span>
              </TableCell>
              {/* Address */}
              <TableCell className="py-2 first:pl-4 last:pr-4 last:text-right">
                <span className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={avatarUrl} alt={userRow.address} />
                    <AvatarFallback>{shortenAddress(userRow.address).slice(2, 4)}</AvatarFallback>
                  </Avatar>
                  <span className="font-mono text-xs text-muted-foreground">
                    {isLoading ? (
                      <Skeleton className="h-6 w-20" />
                    ) : (
                      shortenAddress(userRow.address)
                    )}
                  </span>
                  <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
                  </a>
                </span>
              </TableCell>
              {/* Points */}
              <TableCell className="py-2 first:pl-4 last:pr-4 last:text-right">
                <span className="font-mono text-base font-semibold">
                  {isLoading ? <Skeleton className="h-6 w-20" /> : userRow.totalPoints}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    );
  }

  return (
    <div className="flex h-full w-full max-w-4xl flex-col items-stretch gap-2 p-2 md:py-12">
      {userRowTable}
      <Card className="p-4">
        <section className="flex h-full flex-col justify-center">
          <h2 className="text-lg font-semibold">Leaderboard</h2>
          <p className="text-sm text-muted-foreground">
            See the top users by points. Rankings are updated every 30 minutes.
          </p>
        </section>
      </Card>
      <LeaderboardTable />
    </div>
  );
}
