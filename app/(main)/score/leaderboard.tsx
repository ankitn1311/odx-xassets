import { LeaderboardType } from '@/hooks/queries/use-leaderboard';
import { Card, CardContent } from '@/components/ui/card';
import Authenticated from '@/components/common/authenticated';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OriginsDataTable } from './origins-data-table';
import { EtherealDataTable } from './ethereal-data-table';
import { WeeklyDataTable } from './weekly-data-table';

export const Leaderboard = ({ type }: { type: LeaderboardType }) => {
  if (type === 'weekly') {
    return (
      <Card className="p-0">
        <CardContent className="p-0 pb-2">
          <Authenticated padding>
            <WeeklyDataTable />
          </Authenticated>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <CardContent className="p-0 pb-2">
        <Authenticated padding>
          <Tabs defaultValue="origins" className="w-full">
            <TabsList variant="underline" className="grid w-full grid-cols-2">
              <TabsTrigger variant="underline" value="origins">
                Origins
              </TabsTrigger>
              <TabsTrigger variant="underline" value="ethereal">
                Ascension
              </TabsTrigger>
            </TabsList>
            <TabsContent value="origins">
              <OriginsDataTable />
            </TabsContent>
            <TabsContent value="ethereal">
              <EtherealDataTable />
            </TabsContent>
          </Tabs>
        </Authenticated>
      </CardContent>
    </Card>
  );
};
