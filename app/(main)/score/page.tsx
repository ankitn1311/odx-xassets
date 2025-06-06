'use client';
import { useRouter } from 'nextjs-toploader/app';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useUserInfo } from '@/hooks/queries/use-user';
import Accolade from '@/components/common/accolade';
import { useSearchParams } from 'next/navigation';
import { Leaderboard } from './leaderboard';
import { Scorecard } from './scorecard';
import Guide from './guide';
import { Perks } from './perks';
import CountdownTimer from '@/components/common/countdown-timer';

export default function Score() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tab = searchParams.get('tab') || 'scorecard';
  const { data: userInfo } = useUserInfo();

  const capDate = userInfo?.PointsCheckpointTime
    ? new Date(userInfo?.PointsCheckpointTime).getTime() + 24 * 60 * 60 * 1000
    : 0;
  const currentTime = new Date().getTime();

  const hideTimer = !userInfo?.PointsCheckpointTime || currentTime > capDate;

  return (
    <Tabs
      defaultValue={tab}
      value={tab}
      className={cn('flex w-full flex-col gap-1 px-2 pb-4')}
      onValueChange={value => {
        router.push(`/score?tab=${value}`);
      }}
    >
      <TabsList className="font-poppins flex-col items-stretch justify-start md:flex-row">
        <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
        <TabsTrigger value="perks">Perks</TabsTrigger>
        <TabsTrigger value="guide">Guide</TabsTrigger>
        <TabsTrigger value="accolade">Accolades</TabsTrigger>
        {!hideTimer && (
          <TabsTrigger value="points-cap" disabled className="flex flex-1 md:justify-end">
            <CountdownTimer startTime={userInfo?.PointsCheckpointTime} />
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="leaderboard" className="mt-[0.3rem]">
        <Leaderboard type="overall" />
      </TabsContent>
      <TabsContent value="scorecard" className="mt-[0.3rem]">
        <Scorecard />
      </TabsContent>
      <TabsContent value="perks" className="mt-[0.3rem]">
        <Perks />
      </TabsContent>
      <TabsContent value="guide" className="mt-[0.3rem]">
        <Guide />
      </TabsContent>
      <TabsContent value="accolade" className="mt-[0.3rem]">
        <Accolade />
      </TabsContent>
    </Tabs>
  );
}
