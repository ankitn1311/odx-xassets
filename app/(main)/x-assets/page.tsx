'use client';
import { TokenChart } from '@/components/x-assets/TokenChart';
import { TokenSwapCard } from '@/components/x-assets/TokenSwapCard';

export default function XAssets() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 p-4 md:grid-cols-[1fr_400px] md:pt-12">
      <TokenChart />
      <TokenSwapCard />
    </div>
  );
}
