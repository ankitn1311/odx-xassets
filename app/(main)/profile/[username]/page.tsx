'use client';
import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { Lock } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import React, { ReactNode } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { getRandomNumber, isAchievementEquiped } from '@/utils/helper';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWallet } from '@suiet/wallet-kit';
import { useUserInfo } from '@/hooks/queries/use-user';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useWalletStore } from '@/stores/wallet-store';
import { useLeaderboard } from '@/hooks/queries/use-leaderboard';
import { achievements } from '@/components/common/accolade';
import useIsValidImage from '@/hooks/use-valid-image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Profile() {
  const router = useRouter();
  const params = useParams();
  const username: string = params.username as string;
  const { data: userInfo, isLoading: userInfoLoading } = useUserInfo(username);
  const { data: myInfo, isLoading: myInfoLoading } = useUserInfo('me');
  const { data: leaderboardData, isLoading: leaderboardLoading } = useLeaderboard('overall');
  const queryClient = useQueryClient();
  const { disconnectWallet, connectedWallet } = useWalletStore();
  const [tonConnect] = useTonConnectUI();
  const suiwallet = useWallet();
  const tonWalletAddress = useTonAddress();
  const { address: evmAddress } = useAccount();
  const { disconnect: disconnectEvm } = useDisconnect();

  const logoutHandler = () => {
    queryClient.clear();
    Cookies.remove('auth_token');
    localStorage.removeItem('auth_token');
    disconnectWallet();
    try {
      console.log('Trying to disconnect EVM wallet', evmAddress);
      if (evmAddress) {
        console.log('Disconnecting EVM wallet', evmAddress);
        disconnectEvm();
      }
    } catch (error) {}
    try {
      console.log('Trying to disconnect SUI wallet', suiwallet?.address);
      if (suiwallet.connected) {
        suiwallet?.disconnect();
      }
    } catch (error) {}
    try {
      console.log('Trying to disconnect TON wallet', tonWalletAddress);
      if (tonWalletAddress) {
        console.log('Disconnecting TON wallet', tonWalletAddress);
        tonConnect.disconnect();
      }
    } catch (error) {
      console.log('Error disconnecting TON wallet', error);
    }
    router.push('/');
  };

  const { showDefaultImage } = useIsValidImage(userInfo?.ImgUrl ?? '');

  const hasOgRole = userInfo?.IsOGBoostEnabled;
  const hasKinoRole = userInfo?.IsKinoBoostEnabled;
  const hasBlitzRole = userInfo?.IsBlitzBoostEnabled;
  const hasEclipseRole = userInfo?.IsEclipseBoostEnabled;
  const hasAscendRole = userInfo?.IsAscendBoostEnabled;
  const hasTranzitRole = userInfo?.IsTranzitBoostEnabled;
  const myData = leaderboardData?.find(item => {
    return item.Name === userInfo?.TwitterHandle;
  });

  const completedAchievements = achievements.filter(achievement =>
    isAchievementEquiped({ achievementLabel: achievement.label, userInfo: userInfo! })
  );
  const threeRandomCompletedAchievements = completedAchievements.reverse().slice(0, 3);

  const role = hasOgRole
    ? 'OG'
    : hasBlitzRole
      ? 'Blitz'
      : hasTranzitRole
        ? 'Tranzit'
        : hasKinoRole
          ? 'Kino'
          : hasEclipseRole
            ? 'Eclipse'
            : hasAscendRole
              ? 'Ascend'
              : '-';

  const successfulInvitesV1 = userInfo?.Invites.filter(
    invite => invite.IsUsed && invite.IsActive
  )?.length;
  const successfulGodCodeInvites = userInfo?.InvitesV2.reduce((acc, invite) => {
    return acc + (invite.UsageCount || 0);
  }, 0);
  const successfulInvites = (successfulInvitesV1 || 0) + (successfulGodCodeInvites || 0);

  // const timeUntilNextFaucet = getReadableTimeRemainingForNext12Hours();
  const tier = userInfo?.Tier;

  const randomNumber = getRandomNumber(0, completedAchievements.length - 1);
  const randomAchievement = completedAchievements[randomNumber];
  const randomAchievementImage = `/calling-cards/${randomAchievement?.label?.toLowerCase?.()?.split?.(' ')?.join('-')}.gif`;
  const dailyCap = 10000 + (userInfo?.TapDailyCap ?? 0);

  const isMyAccount = username === 'me' || username === myInfo?.Username;

  return (
    <div className="px-2 pb-4">
      <Card className="mx-auto w-full bg-card text-card-foreground">
        <CardHeader className="pb-6">
          <div className="font-poppins flex flex-col justify-between gap-4 lg:flex-row">
            <div
              key={randomAchievement?.label}
              className={cn(
                'font-raleway relative flex aspect-[4/1] w-full max-w-md cursor-pointer items-center justify-center overflow-hidden rounded-md border border-white/10'
              )}
            >
              {randomAchievement ? (
                <Image
                  src={randomAchievementImage}
                  alt="Achievement background"
                  width={512}
                  height={128}
                  className="absolute left-0 top-0 aspect-[4/1] w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 h-full w-full bg-black/60" />
              <div className="absolute flex w-full items-center justify-between gap-4 px-2 lg:px-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={
                        !showDefaultImage && userInfo?.ImgUrl
                          ? userInfo?.ImgUrl
                          : '/default-profile.png'
                      }
                      alt="Profile picture"
                    />
                    <AvatarFallback>
                      <Image
                        src="/default-profile.png"
                        width={64}
                        height={64}
                        alt="Profile picture"
                      />
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-bold text-white">{userInfo?.TwitterHandle}</p>
                </div>
              </div>
            </div>
            {isMyAccount && (
              <div className="flex items-center">
                <div>
                  <p className="font-drukwide text-4xl leading-[1] text-primary lg:text-right lg:text-6xl lg:leading-[0.5] xl:leading-[0.5]">
                    {leaderboardLoading && !myData ? '-' : myData?.Rank}
                  </p>
                  <h4 className="font-drukwide text-3xl font-black text-muted-foreground lg:text-7xl">
                    RANK
                  </h4>
                </div>
              </div>
            )}
            {/* <div className="col-span-12 flex items-center justify-between gap-8 lg:col-span-7 lg:items-end">
        <div className="flex gap-4">
        {userInfo?.DiscordId && (
        <FaDiscord
        className="h-6 w-6 cursor-pointer text-zinc-400 hover:text-zinc-300"
        onClick={() =>
        window.open(`https://discord.com/users/${userInfo?.DiscordId}`, '_blank')
        }
        />
        )}
        <FaTwitter
        className="h-6 w-6 cursor-pointer text-zinc-400 hover:text-zinc-300"
        onClick={() => window.open(`https://x.com/${userInfo?.TwitterHandle}`, '_blank')}
        />
        </div>
        </div> */}
          </div>
        </CardHeader>

        <Separator className="bg-border" />
        <CardContent className="py-6">
          <div className="grid w-full grid-cols-5 gap-8">
            <div className="col-span-5 w-full lg:col-span-3">
              <div className="pb-8">
                <StatTitle title="Statistics" />
              </div>
              <div className="grid w-full grid-cols-6 gap-8">
                <StatItem title="Points" value={userInfo?.Points?.toString() ?? ''} />
                <StatItem title="Swaps" value={userInfo?.SwapCounter?.toString() ?? ''} />
                <StatItem title="Faucet" value={userInfo?.FaucetUsageCounter?.toString() ?? ''} />
                <StatItem title="Referrals" value={successfulInvites?.toString() ?? ''} />
                <StatItem title="Discord Role" value={role} />
              </div>
            </div>
          </div>
        </CardContent>

        <Separator className="bg-border" />
        <CardContent className="py-6">
          <div className="font-poppins flex w-full flex-col gap-8">
            <StatTitle title="Showcase" />
            <div className="grid grid-cols-3 gap-4">
              {threeRandomCompletedAchievements.map(achievement => {
                const image = `/calling-cards/${achievement.label.toLowerCase().split(' ').join('-')}.gif`;
                return (
                  <div
                    key={achievement.label}
                    className={cn(
                      'font-raleway relative col-span-3 block aspect-[4/1] cursor-pointer rounded-md border border-transparent bg-muted hover:bg-muted/80 md:hidden lg:col-span-1'
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
                          alt="Achievement background"
                          width={512}
                          height={128}
                          className="aspect-[4/1] w-full rounded-md object-cover"
                        />
                      </div>
                    ) : (
                      <p className="flex h-full items-center justify-center">{achievement.label}</p>
                    )}
                  </div>
                );
              })}
              {completedAchievements.map(achievement => {
                const image = `/calling-cards/${achievement.label.toLowerCase().split(' ').join('-')}.gif`;
                return (
                  <div
                    key={achievement.label}
                    className={cn(
                      'font-raleway relative col-span-3 hidden aspect-[4/1] cursor-pointer rounded-md border border-transparent bg-muted hover:bg-muted/80 md:block lg:col-span-1'
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
                          alt="Achievement background"
                          width={512}
                          height={128}
                          className="aspect-[4/1] w-full rounded-md object-cover"
                        />
                      </div>
                    ) : (
                      <p className="flex h-full items-center justify-center">{achievement.label}</p>
                    )}
                  </div>
                );
              })}
              {completedAchievements.length === 0 &&
                achievements.slice(0, 3).map(achievement => {
                  const image = `/calling-cards/${achievement.label.toLowerCase().split(' ').join('-')}.gif`;
                  return (
                    <div
                      key={achievement.label}
                      className={cn(
                        'font-raleway relative col-span-3 flex aspect-[4/1] h-full cursor-pointer items-center justify-center rounded-md border border-transparent bg-muted hover:bg-muted/80 lg:col-span-1'
                      )}
                    >
                      <Image
                        src={image}
                        alt="Locked achievement"
                        className="absolute left-0 top-0 aspect-[4/1] w-full rounded-md object-cover opacity-30 saturate-0"
                        width={512}
                        height={128}
                      />
                      <div className="z-10 flex items-center gap-2 text-foreground">
                        <Lock className="size-4" />
                        <p className="text-sm font-semibold">{achievement.label}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </CardContent>

        <Separator className="bg-border" />
        <CardContent className="py-6">
          <div className="grid w-full grid-cols-6 gap-8">
            <StatItem title="Faucet" value={'Every 3 hours'} size="sm" />
            <StatItem title="Daily Cap" value={dailyCap.toString()} size="sm" />
            <StatItem title="Referral Tier" value={tier!} size="sm" />
          </div>
        </CardContent>

        {userInfo?.EthAddress && (
          <CardContent className="py-6">
            <div className="grid w-full grid-cols-6 gap-8">
              {/* <StatItem title="Export Private Key" value={<ExportPrivateKey />} size="sm" /> */}
              <StatItem title="Export Private Key" value={'Export Private Key'} size="sm" />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

const StatItem = ({
  title,
  value,
  size = 'base',
}: {
  title: ReactNode;
  value: ReactNode;
  size?: 'sm' | 'base';
}) => {
  return (
    <div className="font-poppins col-span-3 flex flex-col items-start gap-2 lg:col-span-2">
      <div className="text-sm font-semibold uppercase text-muted-foreground">{title}</div>
      <div className={cn('font-semibold text-foreground', size === 'base' ? 'text-sm' : 'text-sm')}>
        {value}
      </div>
    </div>
  );
};

const StatTitle = ({ title }: { title: string }) => {
  return <h3 className="font-poppins font-semibold uppercase text-foreground">{title}</h3>;
};
