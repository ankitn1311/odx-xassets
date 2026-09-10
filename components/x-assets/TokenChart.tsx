import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { useCryptoChart } from '@/hooks/queries/use-crypto-chart';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Card } from '@/components/ui/card';
import { useRouter } from 'nextjs-toploader/app';
import { ArrowLeft, Copy, Verified } from 'lucide-react';
import * as RechartsPrimitive from 'recharts';
import { PriceDisplay } from '@/app/(main)/markets/price-display';
import { PriceChangeDisplay } from '@/app/(main)/markets/price-change-display';
import { useCopyToClipboard } from 'usehooks-ts';
import { toast } from 'sonner';

const DURATIONS = [
  { label: '1D', value: '1D' },
  { label: '7D', value: '7D' },
  { label: '1M', value: '1M' },
];

export const TokenChart = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTokenAddress = searchParams.get('selected-token');
  const { allTokens } = useTokenSwapStore();
  const [duration, setDuration] = useState<'1D' | '7D' | '1M'>('1D');
  const [, copyToClipboard] = useCopyToClipboard();

  // Find the selected token (default to first if not found)
  const selectedToken =
    allTokens.find(t => t.TokenB.Address === selectedTokenAddress)?.TokenB || allTokens[0]?.TokenB;

  const { data } = useCryptoChart(selectedToken?.Name, duration);

  return (
    <div className="flex w-full flex-col">
      <Card className="flex h-full flex-col justify-between gap-6 border-0 bg-[#EEF2F9] p-6">
        {/* Top section: Token info and price */}
        <div className="flex items-center gap-2">
          {/* <button
            type="button"
            onClick={() => {
            router.replace('/markets');
            }}
            className="mr-2 rounded p-1 hover:bg-muted"
            aria-label="Back"
            >
            <ArrowLeft className="h-5 w-5" />
            </button> */}
          {/* Token icon */}
          {selectedToken?.Name && (
            <img
              src={`/images/tokens/${selectedToken.Name}.png`}
              alt={selectedToken.Name}
              className="h-12 w-12"
            />
          )}
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <span className="truncate text-2xl font-semibold">
                {selectedToken?.Name || 'Token'}
              </span>
              <Verified className="text-muted-foreground" />
            </div>
            {selectedToken?.Address && (
              <div className="mt-1 flex items-center gap-1">
                <a
                  href={`https://sonicscan.org/address/${selectedToken.Address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-mono text-xs text-muted-foreground hover:underline"
                >
                  {selectedToken.Address.slice(0, 6)}...{selectedToken.Address.slice(-4)}
                </a>
                <Copy
                  className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-primary-foreground"
                  strokeWidth={1}
                  onClick={() => {
                    copyToClipboard(selectedToken.Address);
                    toast.success('Copied!', { description: selectedToken.Address });
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col items-start gap-2">
            <PriceDisplay
              tokenSymbol={selectedToken?.Name || ''}
              className="block !px-0 !py-0 text-[40px] font-medium leading-none tracking-[-0.02em]"
            />
            <div className="flex items-center gap-2">
              <PriceChangeDisplay tokenSymbol={selectedToken?.Name || ''} className="text-base" />
              <span className="text-xs text-muted-foreground">Last 24 hours</span>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-white/70 p-1">
            {DURATIONS.map(d => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDuration(d.value as any)}
                className={
                  duration === d.value
                    ? 'rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background'
                    : 'rounded-md px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground'
                }
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <ChartContainer
            config={{
              price: { label: `${selectedToken?.Name} Price`, color: 'var(--chart-1)' },
            }}
            className="h-full w-full"
          >
            <RechartsPrimitive.AreaChart
              data={data}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorGradient-price" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.7} />
                  <stop offset="25%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                  <stop offset="75%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <RechartsPrimitive.XAxis
                dataKey="time"
                tickFormatter={t => {
                  const date = new Date(t);
                  if (duration === '1D') {
                    return date.toLocaleTimeString([], {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  }
                  if (duration === '7D') {
                    return date.toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                    });
                  }
                  if (duration === '1M') {
                    return date.toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }
                  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }}
                minTickGap={20}
                tickLine={false}
                axisLine={false}
              />
              {/* Scale to the data's own range so small moves are visible. */}
              <RechartsPrimitive.YAxis hide domain={['dataMin', 'dataMax']} />
              <RechartsPrimitive.Tooltip
                content={<ChartTooltipContent />}
                formatter={(value, name) => {
                  return [value, `${selectedToken?.Name} Price`];
                }}
              />
              <RechartsPrimitive.Area
                type="linear"
                dataKey="price"
                stroke="hsl(var(--chart-1))"
                fill="url(#colorGradient-price)"
                strokeWidth={1}
                dot={false}
              />
            </RechartsPrimitive.AreaChart>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
};
