import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { useCryptoChart } from '@/hooks/queries/use-crypto-chart';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartTooltip as Tooltip,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'nextjs-toploader/app';
import { ArrowLeft } from 'lucide-react';
import * as RechartsPrimitive from 'recharts';

const DURATIONS = [
  { label: '1D', value: '1D' },
  { label: '7D', value: '7D' },
  { label: '1M', value: '1M' },
];

// Generate a flat line placeholder chart
function getFlatLineData(length = 40, price = 1) {
  const now = Date.now();
  const interval = 60 * 60 * 1000; // 1 hour
  return Array.from({ length }, (_, i) => ({
    time: now - (length - i) * interval,
    price,
  }));
}

export const TokenChart = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTokenAddress = searchParams.get('selected-token');
  const { allTokens } = useTokenSwapStore();
  const [duration, setDuration] = useState<'1D' | '7D' | '1M'>('1D');

  // Find the selected token (default to first if not found)
  const selectedToken =
    allTokens.find(t => t.TokenB.Address === selectedTokenAddress)?.TokenB || allTokens[0]?.TokenB;

  const { data } = useCryptoChart(selectedToken?.Name, duration);

  // For loading/error, use a flat line at the last known price or 1
  const flatPrice = data && data.length > 0 ? data[data.length - 1].price : 1;
  const placeholderData = getFlatLineData(40, flatPrice);

  return (
    <div className="flex w-full flex-col">
      <Card className="flex h-full flex-col justify-between bg-card">
        <div className="flex h-full flex-col px-8 pb-8 pt-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  router.replace('/markets');
                }}
                className="mr-2 rounded p-1 hover:bg-muted"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold">
                {selectedToken?.Name ? `${selectedToken.Name} Chart` : 'Token Chart'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {DURATIONS.map(d => (
                <Button
                  key={d.value}
                  variant={duration === d.value ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setDuration(d.value as any)}
                >
                  {d.label}
                </Button>
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
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorGradient-price" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.7} />
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
                <RechartsPrimitive.Tooltip content={<ChartTooltipContent />} />
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
        </div>
      </Card>
    </div>
  );
};
