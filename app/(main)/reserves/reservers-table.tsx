import { Card } from '@/components/ui/card';
import { DataTable } from './data-table';
import { exploreColumn } from './columns';
import { Skeleton } from '@/components/ui/skeleton';
import { useTokenSupply } from '@/hooks/queries/use-token-supply';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { tokenConvert } from '@/hooks/mutations/use-trade-quote';

const xTokenToToken = tokenConvert;

export function ReservesTable() {
  const { allTokens } = useTokenSwapStore();
  const solToken = allTokens?.find(token => token.TokenB.Name === 'x1SOL');
  const xrpToken = allTokens?.find(token => token.TokenB.Name === 'x1XRP');
  const adaToken = allTokens?.find(token => token.TokenB.Name === 'x1ADA');
  const dogeToken = allTokens?.find(token => token.TokenB.Name === 'x1DOGE');
  const pepeToken = allTokens?.find(token => token.TokenB.Name === 'x1PEPE');
  const suiToken = allTokens?.find(token => token.TokenB.Name === 'x1SUI');

  const { data: tokenSupplyData, isLoading: isSupplyLoading } = useTokenSupply(
    solToken?.TokenA.Address,
    solToken?.TokenB.Address
  );
  const { data: xrpTokenSupplyData, isLoading: isXrpSupplyLoading } = useTokenSupply(
    xrpToken?.TokenA.Address,
    xrpToken?.TokenB.Address
  );
  const { data: adaTokenSupplyData, isLoading: isAdaSupplyLoading } = useTokenSupply(
    adaToken?.TokenA.Address,
    adaToken?.TokenB.Address
  );
  const { data: dogeTokenSupplyData, isLoading: isDogeSupplyLoading } = useTokenSupply(
    dogeToken?.TokenA.Address,
    dogeToken?.TokenB.Address
  );
  const { data: pepeTokenSupplyData, isLoading: isPepeSupplyLoading } = useTokenSupply(
    pepeToken?.TokenA.Address,
    pepeToken?.TokenB.Address
  );
  const { data: suiTokenSupplyData, isLoading: isSuiSupplyLoading } = useTokenSupply(
    suiToken?.TokenA.Address,
    suiToken?.TokenB.Address
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
        {
          tokenName: xTokenToToken[xrpToken?.TokenB.Name as keyof typeof xTokenToToken],
          tokenSymbol: xrpToken?.TokenB.Name || '',
          totalSupply: xrpTokenSupplyData?.totalSupply || '0',
          totalSupplyUSD: xrpTokenSupplyData?.totalSupplyUSD || '0',
          unitsInReserve: xrpTokenSupplyData?.totalSupply || '0',
          unitsInReserveUSD: xrpTokenSupplyData?.totalSupplyUSD || '0',
          ratio: '100%',
          price: 0,
          priceChange: 0,
          marketCap: 0,
          image: `/images/tokens/${xrpToken?.TokenB.Name}.png`,
        },
        {
          tokenName: xTokenToToken[adaToken?.TokenB.Name as keyof typeof xTokenToToken],
          tokenSymbol: adaToken?.TokenB.Name || '',
          totalSupply: adaTokenSupplyData?.totalSupply || '0',
          totalSupplyUSD: adaTokenSupplyData?.totalSupplyUSD || '0',
          unitsInReserve: adaTokenSupplyData?.totalSupply || '0',
          unitsInReserveUSD: adaTokenSupplyData?.totalSupplyUSD || '0',
          ratio: '100%',
          price: 0,
          priceChange: 0,
          marketCap: 0,
          image: `/images/tokens/${adaToken?.TokenB.Name}.png`,
        },
        {
          tokenName: xTokenToToken[dogeToken?.TokenB.Name as keyof typeof xTokenToToken],
          tokenSymbol: dogeToken?.TokenB.Name || '',
          totalSupply: dogeTokenSupplyData?.totalSupply || '0',
          totalSupplyUSD: dogeTokenSupplyData?.totalSupplyUSD || '0',
          unitsInReserve: dogeTokenSupplyData?.totalSupply || '0',
          unitsInReserveUSD: dogeTokenSupplyData?.totalSupplyUSD || '0',
          ratio: '100%',
          price: 0,
          priceChange: 0,
          marketCap: 0,
          image: `/images/tokens/${dogeToken?.TokenB.Name}.png`,
        },
        {
          tokenName: xTokenToToken[pepeToken?.TokenB.Name as keyof typeof xTokenToToken],
          tokenSymbol: pepeToken?.TokenB.Name || '',
          totalSupply: pepeTokenSupplyData?.totalSupply || '0',
          totalSupplyUSD: pepeTokenSupplyData?.totalSupplyUSD || '0',
          unitsInReserve: pepeTokenSupplyData?.totalSupply || '0',
          unitsInReserveUSD: pepeTokenSupplyData?.totalSupplyUSD || '0',
          ratio: '100%',
          price: 0,
          priceChange: 0,
          marketCap: 0,
          image: `/images/tokens/${pepeToken?.TokenB.Name}.png`,
        },
        {
          tokenName: xTokenToToken[suiToken?.TokenB.Name as keyof typeof xTokenToToken],
          tokenSymbol: suiToken?.TokenB.Name || '',
          totalSupply: suiTokenSupplyData?.totalSupply || '0',
          totalSupplyUSD: suiTokenSupplyData?.totalSupplyUSD || '0',
          unitsInReserve: suiTokenSupplyData?.totalSupply || '0',
          unitsInReserveUSD: suiTokenSupplyData?.totalSupplyUSD || '0',
          ratio: '100%',
          price: 0,
          priceChange: 0,
          marketCap: 0,
          image: `/images/tokens/${suiToken?.TokenB.Name}.png`,
        },
      ]
    : [];

  if (
    isSupplyLoading ||
    isXrpSupplyLoading ||
    isAdaSupplyLoading ||
    isDogeSupplyLoading ||
    isPepeSupplyLoading ||
    isSuiSupplyLoading
  ) {
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
