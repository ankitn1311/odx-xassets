'use client';
import { useState } from 'react';
import { Leaderboard, type Period } from './data-table';
import { cn } from '@/lib/utils';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'all', label: 'All time' },
  { key: 'weekly', label: 'This week' },
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('all');

  return (
    <div className="flex h-full w-full max-w-6xl flex-col items-stretch gap-4 px-4 py-4 pb-[4.5rem] md:py-8 md:pb-8">
      <header className="flex flex-col gap-4 px-1 pt-2 md:flex-row md:items-end md:justify-between">
        <section className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium tracking-[-0.02em]">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">
            Top 100 traders by points. Rankings update every 30 minutes.
          </p>
        </section>
        <div className="flex rounded-lg bg-secondary p-1 text-sm">
          {PERIODS.map(p => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={cn(
                'rounded-md px-4 py-1.5 font-medium transition-colors',
                period === p.key ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>
      <Leaderboard period={period} />
    </div>
  );
}
