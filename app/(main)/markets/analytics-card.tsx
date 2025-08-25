import { Card } from '@/components/ui/card';
import { useTotalAnalytics } from '@/hooks/queries/use-all-token-analytics';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccount } from 'wagmi';
import { useWalletProfile } from '@/hooks/queries/use-wallet-profile';

export function AnalyticsCard() {
  const { address } = useAccount();
  const [tvlDuration, setTvlDuration] = useState<'7D' | '30D' | '90D' | '180D'>('30D');
  const [volumeDuration, setVolumeDuration] = useState<'7D' | '30D' | '90D' | '180D'>('30D');
  const { totalTVL, isLoading } = useTotalAnalytics(tvlDuration);
  const { data: walletProfile, isLoading: isWalletProfileLoading } = useWalletProfile(address);

  const volumeData = walletProfile?.volumeData.find(v => v.id === 'PROTOCOL_TOTAL')?.totalVolumeUSD;

  const totalVolume = (volumeData ?? 0) * 2;

  return (
    <Card className="p-6">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">xAssets Overview</h2>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
          {/* TVL */}
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-row items-start justify-between">
              <div className="flex flex-col items-start gap-2">
                <span className="text-xs text-muted-foreground">TVL (Total Value Locked)</span>
                <span className="font-mono text-3xl font-semibold">
                  {isLoading ? (
                    <Skeleton className="h-9 w-32" />
                  ) : (
                    `$${totalTVL.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  )}
                </span>
              </div>
            </div>
          </div>
          {/* Volume */}
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-row items-start justify-between">
              <div className="flex flex-col items-start gap-2">
                <span className="text-xs text-muted-foreground">Volume ({volumeDuration})</span>
                <span className="font-mono text-3xl font-semibold">
                  {isWalletProfileLoading ? (
                    <Skeleton className="h-9 w-32" />
                  ) : totalVolume === 0 ? (
                    '-'
                  ) : (
                    `$${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  )}
                </span>
              </div>
              {/* <div className="flex gap-2">
                {['7D', '30D', '90D', '180D'].map(d => (
                  <button
                    key={d}
                    className={`rounded px-2 py-1 font-mono text-xs font-medium ${volumeDuration === d ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
                    onClick={() => setVolumeDuration(d as any)}
                  >
                    {d}
                  </button>
                ))}
              </div> */}
            </div>
            {/* <div className="mt-2 h-32 w-full">
              {!isConnected ? (
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-muted-foreground">Connect your wallet to view volume chart</p>
                </div>
              ) : (
                <ChartContainer
                  config={{ volume: { label: 'Volume', color: 'var(--chart-2)' } }}
                  className="h-full w-full"
                >
                  <RechartsPrimitive.AreaChart
                    data={isLoading || isConnecting ? [] : volumeChart}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorGradient-volume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <RechartsPrimitive.XAxis
                      dataKey="time"
                      hide
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsPrimitive.YAxis hide axisLine={false} tickLine={false} />
                    <RechartsPrimitive.Area
                      type="linear"
                      dataKey="value"
                      stroke="hsl(var(--chart-2))"
                      fill="url(#colorGradient-volume)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </RechartsPrimitive.AreaChart>
                </ChartContainer>
              )}
            </div> */}
          </div>
        </div>
      </section>
    </Card>
  );
}
