import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Delta } from '@/components/markets/delta';
import { DemoAlert } from '@/components/common/demo-alert';
import { usePortfolio } from '@/hooks/queries/use-portfolio';
import { fmtPct, fmtUsd } from '@/lib/format';
import { DEMO_PORTFOLIO_CHANGE } from './demo-data';

/**
 * Portfolio bar, like the reference app: total value of the connected wallet, then
 * 24H / 1W / 1M changes on one line, then a link to the portfolio.
 */
export function AnalyticsCard() {
  const { isConnected, isLoading, value, change24hPct } = usePortfolio();

  // Nothing to show without a wallet; the page starts at the banner instead.
  if (!isConnected) return null;

  const periods: { label: string; change: number | null; demo?: boolean }[] = [
    { label: '24H', change: change24hPct },
    { label: '1W', change: DEMO_PORTFOLIO_CHANGE['1W'], demo: true },
    { label: '1M', change: DEMO_PORTFOLIO_CHANGE['1M'], demo: true },
  ];

  return (
    <Card className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center">
      <div className="flex flex-1 flex-col gap-1.5">
        <p className="text-[13px] text-muted-foreground">Total Portfolio Value</p>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
          {isLoading ? (
            <Skeleton className="h-9 w-32" />
          ) : (
            <p className="text-[32px] font-medium leading-none tracking-[-0.02em] tabular-nums">
              {fmtUsd(value)}
            </p>
          )}
          <dl className="flex items-end gap-6 pb-0.5">
            {periods.map(p => (
              <div key={p.label} className="flex flex-col gap-1">
                <dt className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  {p.label}
                  {p.demo && <DemoAlert className="h-3 w-3" note="No portfolio history yet; illustrative" />}
                </dt>
                <dd>
                  {p.change === null ? (
                    <span className="font-mono text-xs text-muted-foreground">–</span>
                  ) : p.change === 0 ? (
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">0.00%</span>
                  ) : (
                    <Delta up={p.change > 0}>{fmtPct(p.change)}</Delta>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="hidden h-10 w-px bg-border md:block" />

      <Link
        href="/portfolio"
        className="inline-flex items-center gap-0.5 self-start text-sm text-foreground hover:underline md:self-auto"
      >
        View Portfolio <ChevronRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
