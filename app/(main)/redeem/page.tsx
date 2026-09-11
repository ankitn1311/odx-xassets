'use client';
import dynamic from 'next/dynamic';
import { QuoteTimerProvider } from '@/components/x-assets/QuoteTimerContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { PendingQueue } from '@/components/redeem/pending-queue';

const TokenSwapCard = dynamic(
  () => import('@/components/x-assets/TokenSwapCard').then(mod => ({ default: mod.TokenSwapCard })),
  { loading: () => <Skeleton className="h-[520px] w-full rounded-2xl" />, ssr: false }
);

const ROUTES = [
  { name: 'Instant', body: 'Paid from the buffer straight away. Available while the amount is within the instant buffer for that asset.' },
  { name: 'Queue', body: 'Above the buffer, the redeem joins a queue. You see your position and an ETA, and claim USDC.e when it fills.' },
];

export default function RedeemPage() {
  return (
    <QuoteTimerProvider>
      <div className="flex h-full w-full max-w-6xl flex-col items-stretch gap-4 px-4 py-4 pb-[4.5rem] md:py-8 md:pb-8">
        <section className="flex flex-col gap-1 px-1 pt-2">
          <h1 className="text-2xl font-medium tracking-[-0.02em]">Redeem</h1>
          <p className="text-sm text-muted-foreground">
            Burn an xAsset and receive USDC.e. The route is chosen for you from the amount.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-[1fr_420px]">
          <div className="flex flex-col gap-4">
            <Card className="p-5">
              <h2 className="text-base font-medium">How a redeem is routed</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {ROUTES.map(r => (
                  <div key={r.name} className="rounded-xl bg-secondary p-4">
                    <dt className="text-[15px] font-medium">{r.name}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.body}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                The fee and any haircut are shown before you confirm. Nothing is burned until you sign.
              </p>
            </Card>
            <PendingQueue title="Pending redeems" />
          </div>
          <TokenSwapCard mode="redeem" />
        </div>
      </div>
    </QuoteTimerProvider>
  );
}
