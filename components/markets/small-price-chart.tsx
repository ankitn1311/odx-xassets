import { useCryptoChart } from '@/hooks/queries/use-crypto-chart';
import { ChartContainer } from '@/components/ui/chart';
import * as RechartsPrimitive from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface SmallPriceChartProps {
  tokenName: string;
  className?: string;
}

/** 24h sparkline from hourly candles; green if the day closed up, red if down. */
export function SmallPriceChart({ tokenName, className = '' }: SmallPriceChartProps) {
  const { data, isLoading, error } = useCryptoChart(tokenName, '1D');

  if (isLoading) {
    return <Skeleton className={`h-8 w-16 ${className}`} />;
  }

  if (error || !data || data.length < 2) {
    return <span className="text-muted-foreground">–</span>;
  }

  const isPositive = data[data.length - 1].price >= data[0].price;
  const chartColor = isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))';

  return (
    <div className={`h-8 w-16 ${className}`}>
      <ChartContainer
        config={{
          price: { label: `${tokenName} Price`, color: chartColor },
        }}
        className="h-full w-full"
      >
        <RechartsPrimitive.AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`colorGradient-${tokenName}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <RechartsPrimitive.XAxis dataKey="time" hide={true} axisLine={false} tickLine={false} />
          <RechartsPrimitive.YAxis hide={true} axisLine={false} tickLine={false} domain={['dataMin', 'dataMax']} />
          <RechartsPrimitive.Area
            type="linear"
            dataKey="price"
            stroke={chartColor}
            fill={`url(#colorGradient-${tokenName})`}
            strokeWidth={1}
            dot={false}
            isAnimationActive={false}
          />
        </RechartsPrimitive.AreaChart>
      </ChartContainer>
    </div>
  );
}
