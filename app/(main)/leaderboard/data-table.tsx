'use client';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable } from '../x-assets/data-table';
import { avatarUrl, leaderboardColumns, RankBadge, type LeaderboardRow } from './columns';
import { fetchLeaderboardPage, fetchWeeklyLeaderboardPage, LeaderboardApiResponse } from './api';
import { useWalletProfile } from '@/hooks/queries/use-wallet-profile';
import { shortenAddress } from '@/utils/crypto';
import { getWeekId } from '@/lib/utils';
import { cn } from '@/lib/utils';

export type Period = 'all' | 'weekly';

/** Leaderboard for one period: podium for the top three, the connected wallet's standing, then the full table. */
export function Leaderboard({ period, pageSize = 100 }: { period: Period; pageSize?: number }) {
  const { address } = useAccount();
  const [query, setQuery] = useState('');

  const { data, isLoading, isError } = useQuery<LeaderboardApiResponse>({
    queryKey: [period === 'all' ? 'leaderboard' : 'weekly-leaderboard', 1, pageSize],
    queryFn: () =>
      period === 'all'
        ? fetchLeaderboardPage({ page: 1, pageSize })
        : fetchWeeklyLeaderboardPage({ page: 1, pageSize }),
  });
  const { data: me, isLoading: meLoading } = useWalletProfile(address);

  const rows = useMemo<LeaderboardRow[]>(() => {
    const list = data?.leaderboard ?? [];
    const top = list[0]?.totalPoints || 1;
    return list.map(e => ({
      ...e,
      share: e.totalPoints / top,
      isYou: !!address && e.address.toLowerCase() === address.toLowerCase(),
    }));
  }, [data, address]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter(r => r.address.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  const [leader, ...chasers] = rows.slice(0, 3);

  // The connected wallet's standing for this period.
  const weekKey = `${getWeekId()}_rank`;
  const myRank =
    period === 'all' ? me?.current_rank : (me?.[weekKey as keyof typeof me] as number | undefined);
  const myPoints = (period === 'all' ? me?.totalPoints : me?.weeklyPoints) ?? 0;
  const leaderPoints = rows[0]?.totalPoints || 0;
  const myShare = leaderPoints > 0 ? Math.min(1, myPoints / leaderPoints) : 0;

  if (isError) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        Could not load the leaderboard. Try again in a moment.
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Leader spotlight with the chasers and their gaps */}
      {isLoading ? (
        <Skeleton className="h-56 rounded-2xl" />
      ) : (
        leader && (
          <div className="grid gap-4 md:grid-cols-[1.35fr_1fr]">
            <section className="relative overflow-hidden rounded-2xl bg-[#0B1F3A] p-6 text-white md:p-7">
              <div className="relative z-10 flex flex-col gap-5">
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#8CB1ED]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8CB1ED]" />
                  {period === 'all' ? 'Leader, all time' : 'Leader this week'}
                </span>
                <div className="flex items-center gap-4">
                  <Avatar className="h-[72px] w-[72px] rounded-full bg-white/10 ring-4 ring-white/10">
                    <AvatarImage src={avatarUrl(leader.address)} alt="" />
                    <AvatarFallback>{leader.address.slice(2, 4)}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col leading-tight">
                    <span className="font-mono text-base">{shortenAddress(leader.address)}</span>
                    <a
                      href={`https://sonicscan.org/address/${leader.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#8CB1ED] hover:underline"
                    >
                      View on Sonicscan ↗
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <span className="text-[44px] font-medium leading-none tracking-[-0.03em] tabular-nums">
                    {leader.totalPoints.toLocaleString()}
                    <span className="ml-2 text-sm font-normal tracking-normal text-[#8CB1ED]">pts</span>
                  </span>
                  {chasers[0] && (
                    <span className="text-sm text-[#8CB1ED]">
                      Leads by{' '}
                      <span className="font-mono text-white tabular-nums">
                        {(leader.totalPoints - chasers[0].totalPoints).toLocaleString()}
                      </span>{' '}
                      · {(leader.totalPoints / Math.max(1, chasers[0].totalPoints)).toFixed(2)}× the runner-up
                    </span>
                  )}
                </div>
              </div>
              {/* Rings, echoing the markets banner. */}
              <svg aria-hidden="true" viewBox="0 0 400 200" preserveAspectRatio="xMaxYMid slice" className="pointer-events-none absolute inset-0 h-full w-full">
                <circle cx="330" cy="100" r="130" fill="none" stroke="#5A86CC" strokeOpacity="0.25" />
                <circle cx="330" cy="100" r="80" fill="none" stroke="#5A86CC" strokeOpacity="0.15" />
              </svg>
            </section>

            <Card className="flex flex-col divide-y divide-border">
              {chasers.map(p => (
                <div key={p.address} className={cn('flex flex-1 items-center gap-4 px-5 py-4', p.isYou && 'bg-muted/60')}>
                  <RankBadge rank={p.rank} size="lg" />
                  <Avatar className="h-10 w-10 rounded-full bg-secondary">
                    <AvatarImage src={avatarUrl(p.address)} alt="" />
                    <AvatarFallback>{p.address.slice(2, 4)}</AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="font-mono text-sm">{shortenAddress(p.address)}</span>
                    <span className="text-xs text-muted-foreground">
                      {(leader.totalPoints - p.totalPoints).toLocaleString()} behind the leader
                    </span>
                  </span>
                  <span className="flex flex-col items-end leading-tight">
                    <span className="text-[22px] font-medium tracking-[-0.02em] tabular-nums">{p.totalPoints.toLocaleString()}</span>
                    <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{Math.round(p.share * 100)}% of leader</span>
                  </span>
                </div>
              ))}
            </Card>
          </div>
        )
      )}

      {/* Your standing */}
      {address && (
        <Card className="grid gap-4 px-5 py-4 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-6">
          <span className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-full bg-secondary">
              <AvatarImage src={avatarUrl(address)} alt="" />
              <AvatarFallback>{address.slice(2, 4)}</AvatarFallback>
            </Avatar>
            <span className="flex flex-col leading-tight">
              <span className="text-[13px] text-muted-foreground">Your standing</span>
              <span className="font-mono text-sm">{shortenAddress(address)}</span>
            </span>
          </span>

          <dl className="flex divide-x divide-border">
            <Stat label="Rank" value={meLoading ? null : myRank ? `#${myRank}` : 'Unranked'} />
            <Stat label={period === 'all' ? 'Points' : 'Points this week'} value={meLoading ? null : myPoints.toLocaleString()} />
            <Stat label="Trades" value={meLoading ? null : (me?.tradeCount ?? 0).toLocaleString()} />
          </dl>

          <div className="flex flex-col gap-1 md:w-56">
            <span className="flex justify-between text-[11px] text-muted-foreground">
              <span>Share of leader</span>
              <span className="font-mono tabular-nums">{Math.round(myShare * 100)}%</span>
            </span>
            <ShareBar share={myShare} />
            {!meLoading && !myRank && (
              <span className="text-[11px] text-muted-foreground">Make a trade to get on the board.</span>
            )}
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-medium">Rankings</h2>
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {data?.count ?? rows.length}
            </span>
          </div>
          <label className="flex h-9 items-center gap-2 rounded-lg bg-secondary px-3 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search address"
              className="w-36 bg-transparent placeholder:text-muted-foreground focus:outline-none md:w-44"
            />
          </label>
        </div>
        {isLoading ? (
          <div className="space-y-3 px-5 py-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="py-2">
            <DataTable
              columns={leaderboardColumns}
              data={visible}
              rowClassName={r => (r.isYou ? 'bg-muted/60 hover:bg-muted/60' : undefined)}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 px-5 first:pl-0 last:pr-0">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="font-mono text-[15px] font-medium tabular-nums">
        {value === null ? <Skeleton className="h-5 w-12" /> : value}
      </dd>
    </div>
  );
}

/** Thin bar showing points as a share of the leader's. */
function ShareBar({ share, className }: { share: number; className?: string }) {
  return (
    <span className={cn('block h-1.5 overflow-hidden rounded-full bg-muted', className)}>
      <span
        className="block h-full rounded-full bg-foreground"
        style={{ width: `${Math.max(2, Math.round(share * 100))}%` }}
      />
    </span>
  );
}
