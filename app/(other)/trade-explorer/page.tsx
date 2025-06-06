'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AllTradesProvider } from '@/providers/all-trades-provider';
import { SearchResults } from './search-results';
import { TradesTable } from './trades-table';
import { useParams } from 'next/navigation';

export default function TradeExplorer() {
  const params = useParams();
  const type = params?.type as string;
  const query = params?.query as string;

  return (
    <AllTradesProvider>
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Trade Explorer</h1>
        </div>

        {/* Search Results */}
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <SearchResults initialType={type} initialQuery={query} />
          </CardContent>
        </Card>

        {/* Live Trades - Only show when not searching for a specific trade ID */}
        {!(type === 'trade-id' && query) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Live Trades</CardTitle>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-success text-success-foreground"
                >
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <TradesTable />
            </CardContent>
          </Card>
        )}
      </div>
    </AllTradesProvider>
  );
}
