'use client';
import dynamic from 'next/dynamic';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { convertXUSDT } from '@/lib/utils';

// Dynamic imports with Next.js
const ReservesTable = dynamic(
  () => import('./reservers-table').then(mod => ({ default: mod.ReservesTable })),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false,
  }
);

const PoolCard = dynamic(
  () => import('@/app/components/x-assets/PoolCard').then(mod => ({ default: mod.PoolCard })),
  {
    loading: () => <Skeleton className="h-32 w-full" />,
    ssr: false,
  }
);

const TokenSwapCard = dynamic(
  () => import('@/components/x-assets/TokenSwapCard').then(mod => ({ default: mod.TokenSwapCard })),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  }
);

export default function XAssets() {
  const { setNumericBalance, allTokens } = useTokenSwapStore();

  useEffect(() => {
    // Replace with actual balance fetching logic
    setNumericBalance(0);
  }, [setNumericBalance]);

  // Transform token pairs into featured assets format
  // const featuredAssets =
  //   allTokensOverride?.map(tokenPair => ({
  //     icon: `/images/tokens/${tokenPair.TokenA.Name}.png`,
  //     name: tokenPair.TokenA.Name,
  //     symbol: tokenPair.TokenA.Name,
  //     price: 0, // These values would need to be fetched from price feed
  //     priceChange: 0,
  //     tokenPair: tokenPair,
  //   })) || [];

  // Transform token pairs into featured pools format
  const featuredPools =
    allTokens?.map(tokenPair => ({
      token1Icon: `/images/tokens/${tokenPair.TokenA.Name}.png`,
      token2Icon: `/images/tokens/${tokenPair.TokenB.Name}.png`,
      token1Symbol: tokenPair.TokenA.Name,
      token2Symbol: convertXUSDT(tokenPair.TokenB.Name),
      apr: 0, // These values would need to be fetched from pool data
      tvl: 0,
      tokenPair: tokenPair,
    })) || [];

  return (
    <div className="flex h-full w-full max-w-5xl flex-col items-stretch gap-2 p-2 md:py-12">
      <Card className="p-4">
        <section className="flex h-full flex-col justify-center">
          <h2 className="text-lg font-semibold">Reserves</h2>
          <p className="text-sm text-muted-foreground">
            Each xAsset is backed 1:1 with its underlying asset, and is securely custodied by
            Safeheron, ensuring full transparency and verifiable proof of reserves.
          </p>
        </section>
      </Card>
      <ReservesTable />
    </div>
  );

  return (
    <main className="ODX-X-Assets-Layout h-[calc(100vh-4rem)] w-full gap-1 overflow-y-auto bg-background px-2 pb-2 font-sans">
      {/* <UpgradeOverlay /> */}
      <Card className="Header">
        <section className="flex h-full flex-col justify-center">
          <h2 className="text-lg font-semibold">Trade any token from your onchain wallet</h2>
          <p className="text-sm text-muted-foreground">
            Connect your wallet and trade wrapped versions of any token, called xAssets, on any
            supported chain.
          </p>
        </section>
      </Card>

      <Card className="Featured flex flex-col gap-4">
        {/* <section className="flex flex-col gap-2">
          <div>
            <h2 className="text-lg font-semibold">Featured xAssets</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {featuredAssets.map(asset => (
              <AssetCard key={asset.symbol} {...asset} />
            ))}
          </div>
        </section> */}

        <section className="flex flex-col gap-2">
          <div>
            <h2 className="text-lg font-semibold">Featured Pools</h2>
          </div>
          <div className="flex gap-2">
            {featuredPools.map(pool => (
              <PoolCard key={`${pool.token1Symbol}-${convertXUSDT(pool.token2Symbol)}`} {...pool} />
            ))}
          </div>
        </section>
      </Card>
      <ReservesTable />

      <aside className="Trade">
        <TokenSwapCard />
      </aside>
    </main>
  );
}
