import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useQuote } from '@/hooks/queries/use-quote';
import { TokenPair } from '@/hooks/queries/use-all-tokens';

interface AssetCardProps {
  icon: string;
  name: string;
  symbol: string;
  price: number;
  priceChange: number;
  className?: string;
  tokenPair: TokenPair;
}

export function AssetCard({
  icon,
  name,
  symbol,
  price,
  priceChange,
  className,
  tokenPair,
}: AssetCardProps) {
  const isPositive = priceChange >= 0;
  const priceChangeColor = isPositive ? 'text-success' : 'text-destructive';
  const { data: quote, isLoading: isQuoteLoading } = useQuote({
    assetIn: tokenPair.TokenA.Address || '',
    assetOut: tokenPair.TokenB.Address || '',
    amount: 1,
    enabled: !!tokenPair.TokenA.Address && !!tokenPair.TokenB.Address,
  });

  return (
    <Card
      className={cn(
        'cursor-pointer bg-secondary/40 p-4 transition-colors hover:bg-secondary/50',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative h-8 w-8">
          <Image src={icon} alt={`${name} icon`} fill className="object-cover" />
          <div className="absolute -bottom-1 -right-1 rounded-full border border-border bg-background p-0.5">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-white to-black" />
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="text-sm text-muted-foreground">{symbol}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold">${quote?.toFixed(5)}</span>
            <span className={cn('text-sm', priceChangeColor)}>
              {isPositive ? '+' : ''}
              {priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
