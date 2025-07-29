'use client';
import { Card } from '@/components/ui/card';
import { DataTable } from '../x-assets/data-table';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { useMemo } from 'react';
import { useMarketsColumns } from './markets-columns';
import { useRouter } from 'nextjs-toploader/app';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from './price-display';
import { PriceChangeDisplay } from './price-change-display';
import Image from 'next/image';
import { AnalyticsCard } from './analytics-card';
import { tokenConvert } from '@/hooks/mutations/use-trade-quote';

export default function MarketsPage() {
  const { allTokens = [] } = useTokenSwapStore();
  const columns = useMarketsColumns();

  const router = useRouter();

  const tableData = useMemo(
    () =>
      allTokens?.map(tokenPair => ({
        tokenName: tokenConvert[tokenPair.TokenB.Name as keyof typeof tokenConvert],
        tokenSymbol: tokenPair.TokenB.Name,
        address: tokenPair.TokenB.Address,
        image: `/images/tokens/${tokenPair.TokenB.Name}.png`,
      })) || [],
    [allTokens]
  );

  return (
    <div className="flex h-full w-full max-w-5xl flex-col items-stretch gap-2 p-2 md:py-12">
      <AnalyticsCard />

      <Card className="p-4">
        <section className="flex h-full flex-col justify-center">
          <h2 className="text-lg font-semibold">Markets</h2>
          <p className="text-sm text-muted-foreground">
            Explore available xAssets and start trading with ease.
          </p>
        </section>
      </Card>
      <div className="flex flex-col gap-2 pb-[4.5rem] md:hidden">
        {tableData.length ? (
          tableData.map((row, idx) => (
            <Card key={row.address || idx} className="flex flex-col gap-2 p-4">
              <div className="flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={row.image}
                    alt={row.tokenSymbol}
                    className="h-10 w-10 rounded-full"
                    width={40}
                    height={40}
                  />
                  <div className="flex flex-col">
                    <span className="text-base font-semibold">{row.tokenName}</span>
                    <span className="text-xs text-muted-foreground">{row.tokenSymbol}</span>
                  </div>
                </div>
                {/* <div className="mt-2 flex items-center gap-2">
                    <SmallPriceChart tokenName={row.tokenName} />
                  </div> */}
                <div className="flex flex-col items-end gap-1">
                  <PriceDisplay tokenSymbol={row.tokenSymbol} className="text-base font-semibold" />
                  <PriceChangeDisplay tokenSymbol={row.tokenSymbol} className="text-xs" />
                </div>
              </div>

              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => router.push(`/x-assets?selected-token=${row.address}`)}
              >
                Trade
              </Button>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground">No results.</div>
        )}
      </div>
      <Card className="hidden py-4 md:block">
        <DataTable columns={columns} data={tableData} />
      </Card>
    </div>
  );
}
