'use client';
import { Card } from '@/components/ui/card';
import { DataTable } from '../x-assets/data-table';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { useMemo } from 'react';
import { useMarketsColumns } from './markets-columns';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketsPage() {
  const { allTokens = [] } = useTokenSwapStore();
  const columns = useMarketsColumns();

  const tableData = useMemo(
    () =>
      allTokens?.map(tokenPair => ({
        tokenName: tokenPair.TokenB.Name,
        tokenSymbol: tokenPair.TokenB.Name,
        address: tokenPair.TokenB.Address,
        image: `/images/tokens/${tokenPair.TokenB.Name}.png`,
      })) || [],
    [allTokens]
  );

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-2 p-2 md:pt-12">
      <Card className="p-4">
        <section className="flex h-full flex-col justify-center gap-4">
          <h2 className="text-lg font-semibold">Markets</h2>
          <p className="text-sm text-muted-foreground">
            Explore available xAssets and start trading with ease.
          </p>
        </section>
      </Card>
      <Card className="py-4">
        <DataTable columns={columns} data={tableData} />
      </Card>
    </div>
  );
}
