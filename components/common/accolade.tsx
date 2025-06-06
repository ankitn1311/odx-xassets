import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserInfoType } from '../../apis/users';
import { isAchievementEquiped } from '../../utils/helper';
import { Lock } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useUserInfo } from '@/hooks/queries/use-user';
import { Card, CardContent } from '../ui/card';

export type LabelType =
  | 'Legacy Leader'
  | 'Blitz Through'
  | 'Kino der toten'
  | 'Shadow Hunter'
  | 'Swap Specialist'
  | 'Faucet Fury'
  | 'Wingman'
  | 'Pool Party'
  | 'Tranzit'
  | 'Stake-a-holic'
  | 'Invite Shark'
  | 'Highroller'
  | 'Points Party'
  | 'Stakeout'
  | 'Provider'
  | 'Tap Machine'
  | 'Token Tactician'
  | 'Sailing the SUI'
  | 'Payday'
  | 'Ascend';

export type Achivement = {
  label: LabelType;
  value: string;
  comingsoon: boolean;
};

export const achievements: Achivement[] = [
  {
    label: 'Legacy Leader',
    value: 'Earn the OG role in the ODX Discord',
    comingsoon: false,
  },
  {
    label: 'Blitz Through',
    value: 'Earn the Blitz role in the ODX Discord',
    comingsoon: false,
  },
  {
    label: 'Kino der toten',
    value: 'Earn the Kino role in the ODX Discord',
    comingsoon: false,
  },
  {
    label: 'Shadow Hunter',
    value: 'Earn the Eclipse role in the ODX Discord',
    comingsoon: false,
  },
  {
    label: 'Ascend',
    value: 'Earn the Ascend role in the ODX Discord',
    comingsoon: false,
  },
  { label: 'Swap Specialist', value: 'Do 500 Swaps in Epoch 3', comingsoon: false },
  {
    label: 'Faucet Fury',
    value:
      'Request the faucet 21 times and perform at least one swap or stake action with the tokens received',
    comingsoon: false,
  },
  { label: 'Wingman', value: 'Have 7 successful referrals', comingsoon: false },
  {
    label: 'Stake-a-holic',
    value: 'Stake a minimum of 100 tokens for a continuous 20 days without withdrawing',
    comingsoon: false,
  },
  { label: 'Invite Shark', value: 'Have 14 successful referrals', comingsoon: false },
  {
    label: 'Highroller',
    value: 'Earn a total of 250,000 points',
    comingsoon: false,
  },
  {
    label: 'Tap Machine',
    value: 'Earn 25,000 points through tapping.',
    comingsoon: false,
  },
  {
    label: 'Points Party',
    value: 'Earn 10,000 points using referral kickbacks',
    comingsoon: false,
  },
  {
    label: 'Sailing the SUI',
    value: 'Bind your SUI wallet',
    comingsoon: false,
  },
  {
    label: 'Payday',
    value: 'Withdraw a token into your wallet',
    comingsoon: false,
  },
  { label: 'Pool Party', value: 'Add Liquidity For 5 Unique Pools', comingsoon: true },
  {
    label: 'Stakeout',
    value: 'Stake tokens in three different pools simultaneously for 25 days straight',
    comingsoon: true,
  },
  {
    label: 'Provider',
    value:
      'Rank among the top 100 liquidity providers in at least 3 different pools by the end of the season',
    comingsoon: true,
  },

  {
    label: 'Token Tactician',
    value:
      'No single token should make up more than 30% of your overall staked and liquid assets by the end of epoch 3',
    comingsoon: true,
  },
  {
    label: 'Tranzit',
    value: 'Earn the Tranzit role in the ODX Discord',
    comingsoon: false,
  },
];

const Accolade = () => {
  const [selectedAchievement, setSelectedAchievement] = useState(achievements[0]);
  const { data: userInfo, isLoading: userInfoLoading } = useUserInfo();

  const renderContent = () => {
    if (selectedAchievement.comingsoon) {
      return <div>Coming soon...</div>;
    }
    return (
      <div className="flex flex-col gap-20">
        <div className="">{selectedAchievement.value}</div>
        <div className="font-poppins">
          <AchievementStatus achievementLabel={selectedAchievement.label} userInfo={userInfo!} />
        </div>
      </div>
    );
  };

  if (userInfoLoading) {
    return <>Loading...</>;
  }

  return (
    <Card className="p-4">
      <CardContent>
        <div className="hidden flex-col gap-16 sm:flex lg:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <h2 className="font-poppins text-lg text-muted-foreground">calling cards</h2>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map(achievement => {
                const image = `/calling-cards/${achievement.label.toLowerCase().split(' ').join('-')}.gif`;
                return (
                  <div
                    key={achievement.label}
                    onClick={() => setSelectedAchievement(achievement)}
                    className={cn(
                      'font-raleway relative aspect-[4/1] cursor-pointer rounded-md border border-transparent bg-muted hover:bg-muted/80',
                      achievement.label === selectedAchievement.label &&
                        'overflow-hidden border-border'
                    )}
                  >
                    {!achievement.comingsoon &&
                    isAchievementEquiped({
                      achievementLabel: achievement.label,
                      userInfo: userInfo!,
                    }) ? (
                      <div>
                        <Image
                          src={image}
                          alt={achievement.label}
                          className="absolute left-0 top-0 aspect-[4/1] w-full rounded-md object-cover"
                          width={512}
                          height={128}
                        />
                        <p>{achievement.label}</p>
                      </div>
                    ) : (
                      <div className="relative flex h-full items-center justify-center">
                        <Image
                          src={image}
                          alt={achievement.label}
                          className="absolute left-0 top-0 aspect-[4/1] w-full rounded-md object-cover opacity-30 saturate-0"
                          width={512}
                          height={128}
                        />
                        <div className="z-10 flex items-center gap-2 text-foreground">
                          <Lock className="size-4" />
                          <p className="font-semibold">{achievement.label}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="hidden flex-1 flex-col gap-2 md:flex">
            <h2 className="font-poppins text-lg text-muted-foreground">preview</h2>
            <div className="flex flex-col gap-8 rounded-md bg-muted p-4">
              <h4 className="font-poppins text-2xl font-extrabold uppercase italic text-primary">
                {selectedAchievement.label}
              </h4>
              {renderContent()}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:hidden">
          <div className="font-poppins text-lg text-muted-foreground">calling cards</div>
          <Dialog>
            {achievements.map(achievement => (
              <DialogTrigger key={achievement.label} asChild>
                <div
                  onClick={() => setSelectedAchievement(achievement)}
                  className={cn(
                    'font-raleway relative aspect-[4/1] cursor-pointer rounded-md border border-transparent bg-card',
                    achievement.label === selectedAchievement.label && 'border-border'
                  )}
                >
                  {!achievement.comingsoon &&
                  isAchievementEquiped({
                    achievementLabel: achievement.label,
                    userInfo: userInfo!,
                  }) ? (
                    <div>
                      <Image
                        src={`/calling-cards/${achievement.label.toLowerCase().split(' ').join('-')}.gif`}
                        alt={achievement.label}
                        width={512}
                        height={128}
                        className="absolute left-0 top-0 aspect-[4/1] w-full rounded-md object-cover"
                      />
                      <p>{achievement.label}</p>
                    </div>
                  ) : (
                    <p className="flex h-full items-center justify-center">{achievement.label}</p>
                  )}
                </div>
              </DialogTrigger>
            ))}
            <DialogContent>
              <DialogHeader>
                {/* <DialogTitle>Preview</DialogTitle> */}
                <DialogDescription>
                  <div className="flex flex-col gap-8 rounded-md p-4">
                    <h4 className="font-poppins text-2xl font-extrabold uppercase italic text-primary">
                      {selectedAchievement.label}
                    </h4>
                    {renderContent()}
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

const AchievementStatus = (props: { achievementLabel: LabelType; userInfo: UserInfoType }) => {
  // if (isAchievementEquiped(props)) return <div className='text-green-400'>Equiped</div>;
  if (isAchievementEquiped(props)) return null;
  return (
    <div className="flex gap-2">
      <Lock size={20} className="text-muted-foreground" />
      <div className="text-muted-foreground">Locked</div>
    </div>
  );
};

export default Accolade;
