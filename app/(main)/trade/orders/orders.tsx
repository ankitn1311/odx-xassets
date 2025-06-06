'use client';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from './data-table';
import { columns } from './columns';
import { useCurrentTradeUpdateWS } from '@/hooks/use-current-trade-update-ws';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { useSelectedToken } from '@/hooks/queries/use-selected-token';

export type Order = {
  id: string;
  amount: number;
  price: number;
  type: 'Buy' | 'Sell';
  txHash: string;
  time: number;
};

export default function Orders() {
  const { trades, tradesLoading } = useCurrentTradeUpdateWS('token');

  const currentTrades = Object.values(trades || {});
  const { data: selectedToken } = useSelectedToken();

  const data =
    currentTrades?.map(trade => {
      try {
        if (trade.tokenIn === selectedToken?.TokenA.Address) {
          const amount = Number(trade.amountOut || '0');
          const price = Number(trade.amountIn || '0');
          return {
            id: trade.transactionHash,
            amount,
            price,
            type: 'Sell',
            txHash: trade.transactionHash,
            time: trade.timestamp,
            trader: trade.user,
          };
        } else {
          const amount = Number(trade.amountIn || '0');
          const price = Number(trade.amountOut || '0');
          return {
            id: trade.transactionHash,
            amount,
            price,
            type: 'Buy',
            txHash: trade.transactionHash,
            time: trade.timestamp,
            trader: trade.user,
          };
        }
      } catch (error) {
        console.log('ERROR', error);
        return {
          id: trade.transactionHash,
          amount: 0,
          price: 0,
          type: 'Buy',
          txHash: trade.transactionHash,
          time: trade.timestamp,
          trader: trade.user,
        };
      }
    }) || [];

  if (tradesLoading) {
    return <TradesSkeleton />;
  }

  return (
    <Card
      className={cn(
        'h-[calc(100vh-30rem)]'
        // isBannerVisible ? 'h-[calc(100vh-34.5rem)]' : 'h-[calc(100vh-30rem)]'
      )}
    >
      {/* <h1 className="mb-4 text-xl font-bold">Live Trade Updates</h1>
      <p className="mb-2">
        Connection Status:{' '}
        <span className={readyState === 1 ? 'text-green-500' : 'text-red-500'}>
          {readyState === 1 ? 'Connected' : 'Disconnected'}
        </span>
      </p> */}

      <CardContent className="h-full overflow-hidden p-0">
        <DataTable columns={columns} data={data as Order[]} />
      </CardContent>
    </Card>
  );
}

const TradesSkeleton = () => {
  return (
    <Card className={cn('h-[calc(100vh-30rem)]')}>
      <CardContent className="h-full p-0">
        <DataTable
          isLoading
          columns={columns}
          data={
            [
              {
                amount: 0,
                price: 0,
                type: 'Buy',
              },
              {
                amount: 0,
                price: 0,
                type: 'Buy',
              },
            ] as Order[]
          }
        />
      </CardContent>
    </Card>
  );
};
