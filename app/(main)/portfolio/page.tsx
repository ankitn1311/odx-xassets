'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount, useWatchAsset } from 'wagmi';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ConnectWallet from '@/components/common/connect-wallet';
import { DemoAlert } from '@/components/common/demo-alert';
import { Delta } from '@/components/markets/delta';
import { PendingQueue } from '@/components/redeem/pending-queue';
import { AnalyticsCard } from '../markets/analytics-card';
import { usePortfolio } from '@/hooks/queries/use-portfolio';
import { useMarketRows } from '@/hooks/queries/use-market-rows';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { fmtPct, fmtPrice, fmtUnits, fmtUsd } from '@/lib/format';
import { XCASH } from '@/config/placeholders';

export default function PortfolioPage() {
  const { isConnected } = useAccount();
  const { holdings, isLoading } = usePortfolio();
  const { rows } = useMarketRows();
  const { allTokens } = useTokenSwapStore();
  const { watchAssetAsync, isPending } = useWatchAsset();

  const addToWallet = async (symbol: string) => {
    const token = allTokens.find(t => t.TokenB.Name === symbol)?.TokenB;
    if (!token) return;
    try {
      await watchAssetAsync({ type: 'ERC20', options: { address: token.Address, symbol: token.Name, decimals: token.Decimals } });
      toast.success(`${symbol} added to wallet`);
    } catch {
      toast.error('Could not add token to wallet');
    }
  };

  const wraps = holdings.filter(h => h.symbol !== 'USDC');
  const usdc = holdings.find(h => h.symbol === 'USDC');

  return (
    <div className="flex h-full w-full max-w-6xl flex-col items-stretch gap-4 px-4 py-4 pb-[4.5rem] md:py-8 md:pb-8">
      <section className="flex flex-col gap-1 px-1 pt-2">
        <h1 className="text-2xl font-medium tracking-[-0.02em]">Portfolio</h1>
        <p className="text-sm text-muted-foreground">Everything this wallet holds or has in flight.</p>
      </section>

      {!isConnected ? (
        <Card className="flex flex-col items-center gap-3 px-5 py-14 text-center">
          <p className="text-lg font-medium">Connect a wallet</p>
          <p className="max-w-[420px] text-sm text-muted-foreground">
            Your xAssets, xCASH and pending mints or redeems appear here once a wallet is connected.
          </p>
          <ConnectWallet />
        </Card>
      ) : (
        <>
          <AnalyticsCard />

          {/* Wraps */}
          <Card>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-medium">
                Wraps
                <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">{wraps.length}</span>
              </h2>
              <Link href="/x-assets" className="text-sm hover:underline">Mint more ›</Link>
            </div>
            {isLoading ? (
              <div className="space-y-3 p-5">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : wraps.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-lg font-medium">No xAssets yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Mint XRP on this chain to get started.</p>
                <Button asChild className="mt-4"><Link href="/x-assets">Mint</Link></Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {wraps.map(h => {
                  const row = rows.find(r => r.symbol === h.symbol);
                  return (
                    <li key={h.symbol} className="grid items-center gap-4 px-5 py-4 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
                      <span className="flex items-center gap-3">
                        <Image src={`/images/tokens/${h.symbol}.png`} alt="" width={36} height={36} className="h-9 w-9" />
                        <span className="flex flex-col leading-tight">
                          <span className="text-[15px] font-medium">{h.symbol}</span>
                          <span className="text-xs text-muted-foreground">{row?.name ?? ''}</span>
                        </span>
                      </span>
                      <Cell label="Balance" value={`${fmtUnits(h.balance)} ${h.symbol}`} mono />
                      <Cell label="Price" value={h.price ? fmtPrice(h.price) : '–'} sub={row?.change !== undefined ? <Delta up={row.change >= 0}>{fmtPct(row.change)}</Delta> : undefined} />
                      <Cell label="Value" value={fmtUsd(h.value)} strong />
                      <span className="flex gap-2 md:justify-end">
                        <Button variant="secondary" size="sm" onClick={() => addToWallet(h.symbol)} disabled={isPending}>Add to wallet</Button>
                        <Button size="sm" asChild><Link href={`/redeem`}>Redeem</Link></Button>
                      </span>
                    </li>
                  );
                })}
                {usdc && usdc.balance > 0 && (
                  <li className="grid items-center gap-4 px-5 py-4 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
                    <span className="flex items-center gap-3">
                      <Image src="/images/tokens/USDC.png" alt="" width={36} height={36} className="h-9 w-9" />
                      <span className="flex flex-col leading-tight">
                        <span className="text-[15px] font-medium">USDC.e</span>
                        <span className="text-xs text-muted-foreground">Stablecoin</span>
                      </span>
                    </span>
                    <Cell label="Balance" value={fmtUnits(usdc.balance)} mono />
                    <Cell label="Price" value="$1.00" />
                    <Cell label="Value" value={fmtUsd(usdc.value)} strong />
                    <span className="flex md:justify-end"><Button size="sm" asChild><Link href="/x-assets">Mint</Link></Button></span>
                  </li>
                )}
              </ul>
            )}
          </Card>

          {/* xCASH */}
          <Card className="grid gap-4 px-5 py-4 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-center">
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EBF0E7] text-xs font-semibold text-[#1DA66A]">x$</span>
              <span className="flex flex-col leading-tight">
                <span className="flex items-center gap-1.5 text-[15px] font-medium">
                  xCASH <DemoAlert className="h-3 w-3" note="xCASH figures are illustrative until the vault endpoint exists" />
                </span>
                <span className="text-xs text-muted-foreground">USYC + buffer · priced at NAV</span>
              </span>
            </span>
            <Cell label="Shares" value={fmtUnits(XCASH.shares)} mono />
            <Cell label="NAV" value={fmtUsd(XCASH.nav, 3)} sub={<span className="text-xs text-success">est. {fmtPct(XCASH.apy30d)} APY</span>} />
            <Cell label="Value" value={fmtUsd(XCASH.shares * XCASH.nav)} strong />
            <span className="flex md:justify-end"><Button size="sm" variant="secondary" disabled>Subscribe</Button></span>
          </Card>

          <PendingQueue title="Pending mints and redeems" />
        </>
      )}
    </div>
  );
}

function Cell({ label, value, sub, mono, strong }: { label: string; value: string; sub?: React.ReactNode; mono?: boolean; strong?: boolean }) {
  return (
    <span className="flex flex-col leading-tight">
      <span className="text-[11px] text-muted-foreground md:hidden">{label}</span>
      <span className={`${mono ? 'font-mono ' : ''}${strong ? 'font-medium ' : ''}text-[15px] tabular-nums`}>{value}</span>
      {sub}
    </span>
  );
}
