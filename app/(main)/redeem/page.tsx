'use client';
import dynamic from 'next/dynamic';
import { QuoteTimerProvider } from '@/components/x-assets/QuoteTimerContext';
import { Skeleton } from '@/components/ui/skeleton';
import { PendingQueue } from '@/components/redeem/pending-queue';
import { BufferBoard } from '@/components/redeem/buffer-board';

const TokenSwapCard = dynamic(
  () => import('@/components/x-assets/TokenSwapCard').then(mod => ({ default: mod.TokenSwapCard })),
  { loading: () => <Skeleton className="h-[520px] w-full rounded-2xl" />, ssr: false }
);

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
            <BufferBoard />
            <PendingQueue title="Pending redeems" />
          </div>
          <TokenSwapCard mode="redeem" />
        </div>
      </div>
    </QuoteTimerProvider>
  );
}
