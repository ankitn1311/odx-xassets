'use client';
import { Card } from '@/components/ui/card';
import { DemoAlert } from '@/components/common/demo-alert';
import { useProtocolStatus } from '@/hooks/use-protocol-status';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function StatusPage() {
  const { checks, healthy, updatedAt, isPlaceholder } = useProtocolStatus();

  return (
    <div className="flex h-full w-full max-w-3xl flex-col items-stretch gap-4 px-4 py-4 pb-[4.5rem] md:py-8 md:pb-8">
      <section className="flex flex-col gap-1 px-1 pt-2">
        <h1 className="text-2xl font-medium tracking-[-0.02em]">Status</h1>
        <p className="text-sm text-muted-foreground">Minting, redeems, the price feed and the instant buffer.</p>
      </section>

      <Card>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className={cn('inline-flex items-center gap-2 text-sm font-medium', healthy ? 'text-success' : 'text-warning-foreground')}>
            <span className={cn('h-2 w-2 rounded-full', healthy ? 'bg-success' : 'bg-warning')} />
            {healthy ? 'All systems operational' : 'Some systems degraded'}
            {isPlaceholder && <DemoAlert note="Status is a placeholder until the /status endpoint exists" />}
          </span>
          <span className="text-xs text-muted-foreground">Updated {timeAgo(Number(new Date(updatedAt)))}</span>
        </div>
        <ul className="divide-y divide-border">
          {checks.map(c => (
            <li key={c.key} className="flex items-center justify-between px-5 py-3 text-sm">
              <span>{c.label}</span>
              <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', c.ok ? 'bg-success/10 text-success' : 'bg-warning/15 text-warning-foreground')}>
                <span className={cn('h-1.5 w-1.5 rounded-full', c.ok ? 'bg-success' : 'bg-warning')} />
                {c.ok ? 'Operational' : 'Degraded'}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
