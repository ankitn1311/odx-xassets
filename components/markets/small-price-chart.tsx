import { useCryptoChart } from '@/hooks/queries/use-crypto-chart';
import { ChartContainer } from '@/components/ui/chart';
import * as RechartsPrimitive from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface SmallPriceChartProps {
  tokenName: string;
  className?: string;
}

// Generate a flat line placeholder chart for small charts
function getSmallChartData(length = 24, price = 1) {
  const now = Date.now();
  const interval = 60 * 60 * 1000; // 1 hour
  return Array.from({ length }, (_, i) => ({
    time: now - (length - i) * interval,
    price: price + (Math.random() - 0.5) * 0.1, // Small random variation
  }));
}

export function SmallPriceChart({ tokenName, className = '' }: SmallPriceChartProps) {
  const { data, isLoading, error } = useCryptoChart(tokenName, '1D');

  if (isLoading) {
    return <Skeleton className="h-8 w-16" />;
  }

  if (error) {
    return <span className="text-muted-foreground">-</span>;
  }

  // Use actual data or fallback to mock data
  const chartData = data && data.length > 0 ? data : getSmallChartData(24, 1);

  // Determine if price is going up or down for color
  const firstPrice = chartData[0]?.price || 1;
  const lastPrice = chartData[chartData.length - 1]?.price || 1;
  const isPositive = lastPrice >= firstPrice;
  const chartColor = isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))';

  return (
    <div className={`h-8 w-16 ${className}`}>
      <ChartContainer
        config={{
          price: { label: `${tokenName} Price`, color: chartColor },
        }}
        className="h-full w-full"
      >
        <RechartsPrimitive.AreaChart
          data={chartData}
          margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
        >
          <defs>
            <linearGradient id={`colorGradient-${tokenName}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <RechartsPrimitive.XAxis dataKey="time" hide={true} axisLine={false} tickLine={false} />
          <RechartsPrimitive.YAxis hide={true} axisLine={false} tickLine={false} />
          <RechartsPrimitive.Area
            type="linear"
            dataKey="price"
            stroke={chartColor}
            fill={`url(#colorGradient-${tokenName})`}
            strokeWidth={1}
            dot={false}
          />
        </RechartsPrimitive.AreaChart>
      </ChartContainer>
    </div>
  );
}
