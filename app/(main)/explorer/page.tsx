'use client';
import { TradesTable } from './data-table';

export default function ExplorerPage() {
  return (
    <div className="flex h-full w-full max-w-6xl flex-col items-stretch gap-4 px-4 py-4 md:py-8">
      <section className="flex flex-col gap-1 px-1 pt-2">
        <h1 className="text-2xl font-medium tracking-[-0.02em]">Explorer</h1>
        <p className="text-sm text-muted-foreground">
          Every mint and redeem on ODX, as it settles on Sonic.
        </p>
      </section>
      <TradesTable type="explorer" />
    </div>
  );
}
