import { Card } from '@/components/ui/card';
import { useTotalAnalytics } from '@/hooks/queries/use-all-token-analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccount } from 'wagmi';
import { useWalletProfile } from '@/hooks/queries/use-wallet-profile';

export function AnalyticsCard() {
  const { address } = useAccount();
  const { totalTVL, isLoading } = useTotalAnalytics();
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
          {/* Volume */}
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col items-start gap-2">
              <span className="text-xs text-muted-foreground">Volume (30D)</span>
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
          </div>
        </div>
      </section>
    </Card>
  );
}
