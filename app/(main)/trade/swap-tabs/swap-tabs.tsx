import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rabbit } from 'lucide-react';
import Authenticated from '@/components/common/authenticated';
import { BuyTab } from './buy-tab';
import { SellTab } from './sell-tab';
import { useQueryClient } from '@tanstack/react-query';

export default function SwapTabs() {
  const queryClient = useQueryClient();
  return (
    // <Card className="Swap px-2 py-2 lg:py-0">
    <Card className="p-4">
      {/* <Tabs defaultValue="market" className="flex h-full w-full flex-col pt-0 lg:pt-2"> */}
      <Tabs defaultValue="market" className="flex h-full w-full flex-col">
        {/* <TabsList variant="underline" width="full">
          <TabsTrigger variant="underline" value="market">
            Market
          </TabsTrigger>
          <TabsTrigger variant="underline" value="limit">
            Limit
          </TabsTrigger>
          <TabsTrigger variant="underline" value="pro">
            Pro
          </TabsTrigger>
        </TabsList> */}
        {/* <TabsContent value="market" className="flex-1"> */}
        <Tabs defaultValue="buy" className="flex h-full w-full flex-col pt-2">
          <TabsList width="full">
            <TabsTrigger
              width="full"
              value="buy"
              className="data-[state=active]:bg-success data-[state=active]:text-success-foreground"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['token-balance'] });
              }}
            >
              Buy
            </TabsTrigger>
            <TabsTrigger
              width="full"
              value="sell"
              className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['token-balance'] });
              }}
            >
              Sell
            </TabsTrigger>
          </TabsList>
          <BuyTab />
          <SellTab />
        </Tabs>
        {/* </TabsContent> */}
        <TabsContent value="limit" className="flex-1">
          <Authenticated>
            <ComingSoon />
          </Authenticated>
        </TabsContent>
        <TabsContent value="pro" className="flex-1">
          <Authenticated>
            <ComingSoon />
          </Authenticated>
          {/* <Pro /> */}
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export const ComingSoon = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 py-44 lg:py-0">
      <Rabbit className="h-12 w-12 text-accent" />
      <p className="font-semibold text-muted-foreground">Coming soon</p>
    </div>
  );
};
