'use client';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DemoAlert } from '@/components/common/demo-alert';
import { PENDING_ITEMS, type PendingItem } from '@/config/placeholders';
import { fmtUnits, fmtUsd, timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

const STATUS: Record<PendingItem['status'], { label: string; className: string }> = {
  queued: { label: 'Queued', className: 'bg-warning/15 text-warning-foreground' },
  processing: { label: 'Processing', className: 'bg-secondary text-muted-foreground' },
  claimable: { label: 'Ready to claim', className: 'bg-success/10 text-success' },
};

/** Pending mints and redeems. Shown on Redeem and Portfolio; items are placeholders until the queue API exists. */
export function PendingQueue({ title = 'Pending', className }: { title?: string; className?: string }) {
  const items = PENDING_ITEMS;

  return (
    <Card className={className}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-medium">
          {title}
          <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">{items.length}</span>
          <DemoAlert note="Queue items are illustrative until the redeem queue endpoint exists" />
        </h2>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">Nothing pending.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map(item => (
            <li key={item.id} className="flex items-center gap-4 px-5 py-4">
              <Image src={`/images/tokens/${item.symbol}.png`} alt="" width={36} height={36} className="h-9 w-9" />
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="text-[15px] font-medium">
                  {item.kind === 'redeem' ? 'Redeem' : 'Mint'} {fmtUnits(item.amount)} {item.symbol}
                </span>
                <span className="text-xs text-muted-foreground">
                  {fmtUsd(item.usd, 0)}
                  {item.position !== undefined && ` · position ${item.position}`}
                  {item.eta && ` · ${item.eta}`}
                  {` · ${timeAgo(Number(new Date(item.createdAt)))}`}
                </span>
              </span>
              <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', STATUS[item.status].className)}>
                {STATUS[item.status].label}
              </span>
              <Button variant="secondary" size="sm" disabled={item.status !== 'claimable'}>
                Claim
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
