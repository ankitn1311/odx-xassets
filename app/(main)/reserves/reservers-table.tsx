import { Card } from '@/components/ui/card';
import { DataTable } from './data-table';
import { exploreColumn } from './columns';
import { Skeleton } from '@/components/ui/skeleton';
import { useTokenSupply } from '@/hooks/queries/use-token-supply';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { tokenConvert } from '@/hooks/mutations/use-trade-quote';
import { useIsMobile } from '@/hooks/use-mobile';
import Image from 'next/image';

const xTokenToToken = tokenConvert;

export function ReservesTable() {
  const { allTokens } = useTokenSwapStore();
  const isMobile = useIsMobile();
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
    if (isMobile) {
      // Mobile skeleton: match new card layout
      return (
        <div className="flex flex-col gap-2 md:hidden">
          {[...Array(3)].map((_, idx) => (
            <Card key={idx} className="flex flex-col gap-2 p-4">
              <div className="mb-2 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-1 flex-col">
                  <Skeleton className="mb-1 h-4 w-24" />
                  <div className="flex items-start gap-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0">
                <div className="flex flex-col">
                  <Skeleton className="mb-1 h-3 w-20" />
                  <Skeleton className="mb-1 h-5 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex flex-col">
                  <Skeleton className="mb-1 h-3 w-20" />
                  <Skeleton className="mb-1 h-5 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      );
    }
    // Desktop skeleton (unchanged)
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

  if (isMobile) {
    // Mobile: Render compact cards with headings and grid details, ratio next to symbol
    return (
      <div className="flex flex-col gap-2 md:hidden">
        {tableData.length ? (
          tableData.map((row, idx) => (
            <Card key={row.tokenSymbol || idx} className="flex flex-col gap-2 p-4">
              <div className="mb-2 flex items-center gap-3">
                <Image
                  src={row.image}
                  alt={row.tokenSymbol}
                  className="h-10 w-10 rounded-full"
                  width={40}
                  height={40}
                />
                <div className="flex flex-col">
                  <span className="text-base font-semibold">{row.tokenName}</span>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground">{row.tokenSymbol}</span>
                    <span className="font-mono text-xs font-semibold text-primary">
                      {row.ratio}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Total Supply of xAsset</span>
                  <span className="mt-1 font-mono text-lg font-semibold">
                    {Number(row.totalSupply).toFixed(3)} {row.tokenSymbol}
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">
                    ${parseFloat(row.totalSupplyUSD).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Units in Reserve</span>
                  <span className="mt-1 font-mono text-lg font-semibold">
                    {Number(row.unitsInReserve).toFixed(3)} {row.tokenSymbol.replace('x1', '')}
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">
                    ${parseFloat(row.unitsInReserveUSD).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground">No results.</div>
        )}
      </div>
    );
  }

  // Desktop: Render DataTable as before
  return (
    <Card className="hidden py-4 md:block">
      <DataTable columns={exploreColumn} data={tableData} />
    </Card>
  );
}
