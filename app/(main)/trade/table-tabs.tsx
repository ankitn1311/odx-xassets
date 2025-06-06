import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from './data-table';
import { Asset, columns } from './columns';
import Authenticated from '@/components/common/authenticated';
import { useCurrentTradeUpdateWS } from '@/hooks/use-current-trade-update-ws';
import { useSelectedToken } from '@/hooks/queries/use-selected-token';

export default function TableTabs() {
  const { trades, tradesLoading } = useCurrentTradeUpdateWS('user');

  const userTrades = Object.values(trades || {});
  const { data: selectedToken } = useSelectedToken();
  const data: Asset[] =
    userTrades?.map((trade: any) => {
      if (trade.tokenIn === selectedToken?.TokenA.Address) {
        const size = trade.amountOut || '0';
        const formattedSize = size;
        const ticker = trade.tokenIn;
        const tradeValue = trade.amountIn || '0';
        const formattedTradeValue = tradeValue;

        return {
          id: trade.transactionHash,
          ticker,
          time: trade.timestamp,
          type: 'Sell',
          price: formattedTradeValue,
          txHash: trade.transactionHash,
          size: formattedSize,
          tradeValue: formattedTradeValue,
          fee: trade.Fee || '0',
        };
      } else {
        const size = trade.amountIn || '0';
        const formattedSize = size;
        const ticker = trade.tokenOut;
        const tradeValue = trade.amountOut || '0';
        const formattedTradeValue = tradeValue;

        return {
          id: trade.transactionHash,
          ticker,
          time: trade.timestamp,
          type: 'Buy',
          price: formattedTradeValue,
          txHash: trade.transactionHash,
          size: formattedSize,
          tradeValue: formattedTradeValue,
          fee: trade.Fee || '0',
        };
      }
    }) || [];

  return (
    <Card className="Table-Tabs max-h-[calc(100vh-30rem)] overflow-auto px-2 md:px-0">
      <Tabs
        defaultValue="history"
        className="flex h-full w-full flex-col overflow-auto"
        orientation="horizontal"
      >
        <div className="flex items-center justify-between">
          <TabsList variant="underline" width="full">
            {/*
            <TabsTrigger variant="underline" value="assets">
              Assets
            </TabsTrigger>
            <TabsTrigger variant="underline" value="trades">
              Trades
            </TabsTrigger>
            <TabsTrigger variant="underline" value="order">
              Order
            </TabsTrigger>
*/}
            <TabsTrigger variant="underline" value="history">
              History
            </TabsTrigger>
          </TabsList>
          {/* <div className="flex h-full gap-2 border-b border-secondary">
            <div className="flex items-center gap-1">
              <Switch id="usd-values" />
              <label htmlFor="usd-values" className="whitespace-nowrap text-xs">
                USD Values
              </label>
            </div>
            <div className="flex items-center gap-1">
              <Switch id="hide-negative-pnl" />
              <label htmlFor="hide-negative-pnl" className="whitespace-nowrap text-xs">
                Hide negative P&L
              </label>
            </div>
            <div className="flex items-center gap-1">
              <Switch id="hide-low-values" />
              <label htmlFor="hide-low-values" className="whitespace-nowrap text-xs">
                Hide low values
              </label>
            </div>
          </div> */}
        </div>
        <TabsContent value="history" className="flex-1">
          <Authenticated>
            {/* <ComingSoon /> */}
            <DataTable isLoading={tradesLoading} columns={columns} data={data} />
          </Authenticated>
        </TabsContent>
        {/*
        <TabsContent value="trades" className="flex-1">
          <div className="items-center justify-center w-full flex h-full gap-1">
            Please{" "}
            <span className="text-accent inline-block font-bold">login</span> or{" "}
            <span className="font-bold text-accent inline-block">sign up</span>{" "}
            first
          </div>
        </TabsContent>
        <TabsContent value="order"></TabsContent>
        <TabsContent value="assets"></TabsContent>
*/}
      </Tabs>
    </Card>
  );
}
