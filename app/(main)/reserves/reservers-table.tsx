import { Card } from '@/components/ui/card';
import { DataTable } from './data-table';
import { exploreColumn } from './columns';
import { useAllTokens } from '@/hooks/queries/use-all-tokens';
import { Skeleton } from '@/components/ui/skeleton';

export function ReservesTable() {
  const { data: allTokens, isLoading } = useAllTokens();

  // Transform token pairs into table data format
  const tableData =
    allTokens?.map(tokenPair => ({
      tokenName: tokenPair.TokenA.Name,
      tokenSymbol: tokenPair.TokenA.Name,
      totalSupply: '2,133',
      totalSupplyUSD: '$133,133',
      unitsInReserve: '2,233',
      unitsInReserveUSD: '$145,133',
      ratio: '110.04%',
      price: 0,
      priceChange: 0,
      marketCap: 0,
      image: `/images/tokens/${tokenPair.TokenA.Name}.png`,
    })) || [];

  if (isLoading) {
    return (
      <Card>
        <div className="flex flex-col gap-2 p-4 pb-0">
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex flex-col gap-2 p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    );
  }
  return (
    <Card className="py-4">
      <DataTable columns={exploreColumn} data={tableData} />
    </Card>
  );
}
