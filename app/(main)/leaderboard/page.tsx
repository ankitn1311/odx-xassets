'use client';
import { Card } from '@/components/ui/card';
import { LeaderboardTable } from './data-table';

export default function LeaderboardPage() {
  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-2 p-2 md:pt-12">
      <Card className="p-4">
        <section className="flex h-full flex-col justify-center gap-2">
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
