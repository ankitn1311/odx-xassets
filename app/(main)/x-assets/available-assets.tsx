import { Card } from '@/components/ui/card';
import { DataTable } from './data-table';
import { exploreColumn } from './columns';
import { TokenPair } from '@/hooks/queries/use-all-tokens';
import { useTokenSwapStore } from '@/stores/token-swap-store';

export function AvailableAssets() {
  return (
    <Card className="Available">
      <section className="flex flex-col gap-2">
        <div className="px-4 pt-4">
          <h2 className="text-lg font-semibold">Available</h2>
        </div>
        <AvailableAssetsTable />
      </section>
    </Card>
  );
}

const getPrice = (tokenPair: TokenPair) => {
  switch (tokenPair.TokenA.Name) {
    case 'RIFT.x':
      return 0.00034;
    case 'NADE.x':
      return 0.00003;
    case 'CULT.x':
      return 0.00003;
    case 'NOVA.x':
      return 0.00096;
    case 'WISH.x':
      return 0.00002;
    default:
      return 0;
  }
};

function AvailableAssetsTable() {
  const { allTokens } = useTokenSwapStore();

  // Transform token pairs into table data format
  const tableData =
    allTokens?.map(tokenPair => ({
      tokenName: tokenPair.TokenA.Name,
      tokenSymbol: 'USDT.x',
      price: getPrice(tokenPair), // These values would need to be fetched from price feed
      priceChange: 0,
      marketCap: 0,
      image: `/images/tokens/${tokenPair.TokenA.Name}.png`,
    })) || [];

  // if (isLoading) {
  //   return (
  //     <div className="flex flex-col gap-2 p-4">
  //       <Skeleton className="h-10 w-full" />
  //       <Skeleton className="h-10 w-full" />
  //       <Skeleton className="h-10 w-full" />
  //     </div>
  //   );
  // }

  return <DataTable columns={exploreColumn} data={tableData} />;
}
