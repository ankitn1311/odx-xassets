'use client';
import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';

import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
} from '../../../../public/static/charting_library/charting_library';
import { Card, CardContent } from '@/components/ui/card';
import { useSelectedToken } from '@/hooks/queries/use-selected-token';

const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
  symbol: 'RIFT.x/wS',
  interval: '15' as ResolutionString,
  library_path: '/static/charting_library/',
  locale: 'en',
  charts_storage_url: 'https://saveload.tradingview.com',
  charts_storage_api_version: '1.1',
  client_id: 'tradingview.com',
  user_id: 'public_user_id',
  fullscreen: false,
  theme: 'dark',
  autosize: true,
};

const TVChartContainer = dynamic(
  () => import('@/components/tv-chart-container').then(mod => mod.TVChartContainer),
  { ssr: false }
);

function Charts() {
  const [isScriptReady, setIsScriptReady] = useState(false);
  const selectedToken = useSelectedToken();

  // Memoize the symbol to prevent unnecessary re-renders
  const selectedTokenSymbol = useMemo(() => {
    return `${selectedToken.data?.TokenA.Name}/${selectedToken.data?.TokenB.Name}`;
  }, [selectedToken.data?.TokenA.Name, selectedToken.data?.TokenB.Name]);

  // Memoize the chart props to prevent unnecessary re-renders
  const chartProps = useMemo(
    () => ({
      ...defaultWidgetProps,
      symbol: selectedTokenSymbol,
    }),
    [selectedTokenSymbol]
  );

  return (
    <Card className="Chart h-full">
      <CardContent className="h-full p-0">
        <Script
          src="/static/datafeeds/udf/dist/bundle.js"
          strategy="lazyOnload"
          onReady={() => {
            setIsScriptReady(true);
          }}
        />
        {isScriptReady && <TVChartContainer {...chartProps} />}
      </CardContent>
    </Card>
  );
}

export default Charts;
