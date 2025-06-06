import { FaDiscord, FaDollarSign } from 'react-icons/fa';
import { Box, Star, TestTube } from 'lucide-react';
import { remainingTimeUntilNextISOWeek } from '@/utils/helper';
import { useUserInfo } from '@/hooks/queries/use-user';
import Polygon from '@/components/icons/polygon';
import { baseURL } from '@/utils/axiosConfig';
import Image from 'next/image';
import { Leaderboard } from './leaderboard';
import PerksDiscord from './perks-discord';
import { cn } from '@/lib/utils';

const perks = [
  {
    title: 'ODX•VIALS',
    description: '0',
    type: 'coins',
    Icon: TestTube,
    BackgroundSVG: Polygon,
    available: true,
  },
  {
    title: 'Discord',
    description: '0% BOOST/BLITZ',
    Icon: FaDiscord,
    BackgroundSVG: Star,
    available: true,
    type: 'discord',
  },
  {
    title: 'Staking',
    description: '0% BOOST',
    Icon: FaDollarSign,
    BackgroundSVG: Box,
    available: false,
    type: 'liquidity',
  },
];

export const Perks = () => {
  const remainingTime = remainingTimeUntilNextISOWeek();
  const { data: userInfo } = useUserInfo();
  return (
    <div className="font-poppins flex flex-col gap-8">
      <div className="flex flex-col gap-2 md:flex-row">
        {perks.map(perk => {
          const { Icon, description, title, available, type } = perk;

          const isDiscordCard = title === 'Discord';
          return (
            <div
              className={cn(
                'relative flex flex-1 flex-col gap-3 overflow-hidden rounded-l p-6 transition-all duration-500',
                'bg-card text-card-foreground shadow-sm',
                'hover:shadow-md',
                !available && 'opacity-75'
              )}
              key={title}
            >
              {isDiscordCard && userInfo?.DiscordImage && userInfo?.DiscordUserName ? (
                <div
                  className="group/discord flex cursor-pointer items-end gap-3"
                  onClick={() => {
                    window.open(`${baseURL}/auth/discord`, '_self');
                  }}
                >
                  <div className="relative w-12">
                    <div className="h-12 w-12 overflow-hidden rounded-full border border-transparent transition-colors group-hover/discord:border-primary">
                      <img
                        src={userInfo?.DiscordImage}
                        alt="Discord Avatar"
                        // width={48}
                        // height={48}
                        //
                        className="h-12 w-12 object-cover"
                      />
                    </div>
                    <div className="absolute -right-1 -top-1 rounded-full bg-primary p-1.5">
                      <FaDiscord className="text-primary-foreground" size={12} />
                    </div>
                  </div>
                  <div className="text-base text-muted-foreground transition-colors group-hover/discord:text-foreground">
                    {userInfo?.DiscordUserName}
                  </div>
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted p-2 text-muted-foreground">
                  {<Icon className="h-6 w-6 shrink-0" />}
                </div>
              )}
              <div className="flex flex-col items-start gap-2">
                <div className="text-sm font-medium text-muted-foreground">{title}</div>
                {available ? (
                  isDiscordCard ? (
                    <PerksDiscord />
                  ) : (
                    <div className="text-2xl font-extrabold italic text-foreground">
                      {type === 'coins' ? userInfo?.VileCount || 0 : description}
                    </div>
                  )
                ) : (
                  <div className="text-xl font-extrabold italic text-muted-foreground">
                    coming soon
                  </div>
                )}
              </div>

              {/* <BackgroundSVG className="absolute right-0 top-0 text-accent transition-transform group-hover:scale-110" /> */}
            </div>
          );
        })}
      </div>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold text-foreground">Weekly Rank</div>
          <div className="text-sm text-muted-foreground">Next Reset in: {remainingTime}</div>
        </div>
        <Leaderboard type="weekly" />
      </div>
    </div>
  );
};

export const PerkItem = () => {
  return <div></div>;
};
