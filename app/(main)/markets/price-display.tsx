import { Skeleton } from '@/components/ui/skeleton';
import { useTokenPriceWithFlash } from '@/hooks/mutations/use-trade-quote';

interface PriceDisplayProps {
  tokenSymbol: string;
  className?: string;
}

export function PriceDisplay({ tokenSymbol, className = '' }: PriceDisplayProps) {
  const { data, isLoading, error, flashState } = useTokenPriceWithFlash(tokenSymbol);

  if (error) return <span className={className}>-</span>;

  if (isLoading) return <Skeleton className="h-4 w-20" />;

  const flashClass =
    flashState === 'up'
      ? 'price-flash-up'
      : flashState === 'down'
        ? 'price-flash-down'
        : flashState === 'same'
          ? 'price-flash-same'
          : '';

  return (
    <span className={`rounded px-1 py-0.5 tabular-nums transition-colors ${flashClass} ${className}`}>
      ${data}
    </span>
  );
}
