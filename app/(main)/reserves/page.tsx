'use client';
import { TokenSwapCard } from '@/components/x-assets/TokenSwapCard';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useAllTokens } from '@/hooks/queries/use-all-tokens';
import { UpgradeOverlay } from '@/app/components/x-assets/UpgradeOverlay';

import { ReservesTable } from './reservers-table';
import { AssetCard } from '@/app/components/x-assets/AssetCard';
import { PoolCard } from '@/app/components/x-assets/PoolCard';
import { convertXUSDT } from '@/lib/utils';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';

export default function XAssets() {
  const { setNumericBalance } = useTokenSwapStore();
  const { data: allTokens } = useAllTokens();
  const { data: allTokensOverride } = useAllTokens(true);

  useEffect(() => {
    // Replace with actual balance fetching logic
    setNumericBalance(0);
  }, [setNumericBalance]);

  // Transform token pairs into featured assets format
  const featuredAssets =
    allTokensOverride?.map(tokenPair => ({
      icon: `/images/tokens/${tokenPair.TokenA.Name}.png`,
      name: tokenPair.TokenA.Name,
      symbol: tokenPair.TokenA.Name,
      price: 0, // These values would need to be fetched from price feed
      priceChange: 0,
      tokenPair: tokenPair,
    })) || [];

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
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-2 p-2">
      <Card className="p-4">
        <section className="flex h-full flex-col justify-center gap-4">
          <h2 className="text-lg font-semibold">Reserves</h2>
          <p className="text-sm text-muted-foreground">
            Each xAsset maintains a minimum one to one backing ratio with its underlying asset, and
            reserves are securely custodied by Safeheron, ensuring full transparency and verifiable
            proof of reserves.
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
        <section className="flex flex-col gap-2">
          <div>
            <h2 className="text-lg font-semibold">Featured xAssets</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {featuredAssets.map(asset => (
              <AssetCard key={asset.symbol} {...asset} />
            ))}
          </div>
        </section>

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
