'use client';
import TableTabs from './table-tabs';
import SwapTabs from './swap-tabs/swap-tabs';
import Orders from './orders/orders';
import TokenDetails from './token-details/token-details';
import Quickbar from './quickbar/quickbar';
import Charts from './charts/charts';
import Faucet from './faucet/faucet';
import { LeftFooter } from './footer/left-footer';
import { RightFooter } from './footer/right-footer';
import { useMediaQuery } from 'usehooks-ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';

export default function Trade() {
  const isMobile = useMediaQuery('(max-width: 1024px)');

  if (false) {
    return (
      <main className="flex w-full flex-col gap-2 bg-background px-2 pb-2 font-sans">
        <Quickbar />
        <Tabs defaultValue="trade" className="flex h-full w-full flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="trade">Trade</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="flex-1 pt-2">
            <div className="flex flex-col gap-2">
              <TokenDetails />
              <div className="h-[calc(100vh-20rem)]">
                <Charts />
              </div>
              <Orders />
              <LeftFooter />
              <RightFooter />
            </div>
          </TabsContent>

          <TabsContent value="trade" className="flex-1 pt-2">
            <div className="flex flex-col gap-2">
              <TokenDetails />
              <SwapTabs />
              <LeftFooter />
              <RightFooter />
            </div>
          </TabsContent>

          <TabsContent value="manage" className="flex-1 pt-2">
            <div className="flex flex-col gap-2">
              <TokenDetails />
              <TableTabs />
              {/* <Faucet /> */}
              <LeftFooter />
              <RightFooter />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    );
  }

  return (
    <BackgroundGradientAnimation>
      <div className="absolute inset-0 z-50 flex items-center justify-center px-4">
        <div className="z-10 mx-auto flex w-full max-w-2xl flex-col gap-2 p-2">
          <TokenDetails />
          {/* <Orders />
          <Charts /> */}
          <SwapTabs />
        </div>
      </div>
    </BackgroundGradientAnimation>
  );

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-background">
      <div
        className={cn(
          'absolute inset-0',
          '[background-size:20px_20px]',
          '[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]',
          'dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]'
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      <div className="z-10 mx-auto flex w-full max-w-2xl flex-col gap-2 p-2">
        <TokenDetails />
        {/* <Orders />
          <Charts /> */}
        <SwapTabs />
      </div>
    </div>
  );

  return (
    // <AuroraBackground>
    <main
      className={cn(
        // 'ODX-Main-Layout h-[calc(100vh-4rem)] w-full gap-1 bg-background px-2 pb-2 font-sans'
        'flex h-[calc(100vh-4rem)] w-full flex-col gap-2 p-2 font-sans'
        // isBannerVisible ? 'h-[calc(100vh-9rem)]' : 'h-[calc(100vh-4rem)]'
      )}
    >
      {/* <Quickbar /> */}
      <div className="z-10 mx-auto flex w-full max-w-2xl flex-col gap-2">
        <TokenDetails />
        {/* <Orders />
      <Charts /> */}
        <SwapTabs />
      </div>
      {/* <TableTabs />
      <LeftFooter />
      <RightFooter /> */}
    </main>
    // </AuroraBackground>
  );
}
