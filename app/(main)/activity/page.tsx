'use client';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import ConnectWallet from '@/components/common/connect-wallet';
import { DemoAlert } from '@/components/common/demo-alert';
import { TradesTable } from '../explorer/data-table';

const EVENTS = [
  { name: 'Mint', live: true },
  { name: 'Redeem', live: true },
  { name: 'Queue filled', live: false },
  { name: 'Failed quote', live: false },
];

export default function ActivityPage() {
  const { isConnected } = useAccount();

  return (
    <div className="flex h-full w-full max-w-6xl flex-col items-stretch gap-4 px-4 py-4 pb-[4.5rem] md:py-8 md:pb-8">
      <header className="flex flex-col gap-3 px-1 pt-2 md:flex-row md:items-end md:justify-between">
        <section className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium tracking-[-0.02em]">Activity</h1>
          <p className="text-sm text-muted-foreground">Your mints and redeems, with a link to each transaction.</p>
        </section>
        <ul className="flex flex-wrap gap-2">
          {EVENTS.map(e => (
            <li
              key={e.name}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs ${e.live ? 'bg-secondary' : 'border border-dashed border-border text-muted-foreground'}`}
            >
              {e.name}
              {!e.live && <DemoAlert className="h-3 w-3" note="This event type arrives with the activity endpoint" />}
            </li>
          ))}
        </ul>
      </header>

      {isConnected ? (
        <TradesTable type="user" />
      ) : (
        <Card className="flex flex-col items-center gap-3 px-5 py-14 text-center">
          <p className="text-lg font-medium">Connect a wallet</p>
          <p className="max-w-[420px] text-sm text-muted-foreground">Your activity appears here once a wallet is connected.</p>
          <ConnectWallet />
        </Card>
      )}
    </div>
  );
}
