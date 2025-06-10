import { Card } from '@/components/ui/card';
import { DataTable } from './data-table';
import { exploreColumn } from './columns';
import { useAllTokens } from '@/hooks/queries/use-all-tokens';
import { Skeleton } from '@/components/ui/skeleton';
import { useTokenSupply } from '@/hooks/queries/use-token-supply';

const xTokenToToken = {
  xSOL: 'SOL',
};

export function ReservesTable() {
  const { data: allTokens, isLoading } = useAllTokens();
  const solToken = allTokens?.find(token => token.TokenB.Name === 'xSOL');
  console.log('ALL TOKEN', allTokens, solToken);

  const { data: tokenSupplyData, isLoading: isSupplyLoading } = useTokenSupply(
    solToken?.TokenA.Address,
    solToken?.TokenB.Address
  );

  const tableData = solToken
    ? [
        {
          tokenName: xTokenToToken[solToken.TokenB.Name as keyof typeof xTokenToToken],
          tokenSymbol: solToken.TokenB.Name,
          totalSupply: tokenSupplyData?.totalSupply || '0',
          totalSupplyUSD: tokenSupplyData?.totalSupplyUSD || '0',
          unitsInReserve: tokenSupplyData?.totalSupply || '0',
          unitsInReserveUSD: tokenSupplyData?.totalSupplyUSD || '0',
          ratio: '100%',
          price: 0,
          priceChange: 0,
          marketCap: 0,
          image: `/images/tokens/${solToken.TokenB.Name}.png`,
        },
      ]
    : [];

  if (isLoading || isSupplyLoading) {
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
