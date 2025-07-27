'use client';
import { TokenChart } from '@/components/x-assets/TokenChart';
import { TokenSwapCard } from '@/components/x-assets/TokenSwapCard';
import { TradesTable } from '../explorer/data-table';

export default function XAssets() {
  return (
    <div className="flex h-full w-full max-w-7xl flex-col items-stretch gap-4 p-2 md:py-12">
      <div className="mx-auto grid w-full gap-4 md:grid-cols-[1fr_400px]">
        <TokenChart />
        <TokenSwapCard />
      </div>
      <TradesTable pageSize={5} />
    </div>
  );
}
