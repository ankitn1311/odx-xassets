'use client';
import { Card } from '@/components/ui/card';
import { LeaderboardTable, WeeklyLeaderboardTable } from './data-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function LeaderboardPage() {
  return (
    <div className="flex h-full w-full max-w-5xl flex-col items-stretch gap-2 p-2 md:py-12">
      <Card className="p-4">
        <section className="flex h-full flex-col justify-center">
          <h2 className="text-lg font-semibold">Leaderboard</h2>
          <p className="text-sm text-muted-foreground">
            See the top 100 users by points. Rankings are updated every 30 minutes.
          </p>
        </section>
      </Card>
      <Tabs defaultValue="overall" className="w-full">
        <TabsList variant="default" className="mb-2">
          <TabsTrigger value="overall">Overall Leaderboard</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Leaderboard</TabsTrigger>
        </TabsList>
        <TabsContent value="overall">
          <LeaderboardTable />
        </TabsContent>
        <TabsContent value="weekly">
          <WeeklyLeaderboardTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
