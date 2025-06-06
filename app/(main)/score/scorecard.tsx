import { useQueryClient } from '@tanstack/react-query';
import { Rabbit, RefreshCw } from 'lucide-react';
import { Invite, InviteV2 } from '@/apis/users';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import millify from 'millify';
import { useUserInfo } from '@/hooks/queries/use-user';
import { useGenerateInviteCode } from '@/hooks/queries/use-generate-invite-code';
import { useLeaderboard } from '@/hooks/queries/use-leaderboard';
import { InviteItem } from './invite-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const tierData = [
  { name: 'Crawler', friends: '1-3', points: '150', bonus: '6%' },
  { name: 'Walker', friends: '4-9', points: '300', bonus: '8%' },
  { name: 'Runner', friends: '10-13', points: '600', bonus: '11%' },
  { name: 'Sprinter', friends: '13-16', points: '900', bonus: '15%' },
  { name: 'Mutant', friends: '16-20', points: '1200', bonus: '20%' },
];

export const Scorecard = () => {
  const {
    data: userInfo,
    isLoading: userInfoLoading,
    isRefetching: userInfoRefetching,
  } = useUserInfo();

  const { mutate: generateInviteCodeMutation, isPending: generateInviteCodePending } =
    useGenerateInviteCode();

  const queryClient = useQueryClient();

  const { data: originsLeaderboardData, isLoading: originsLeaderboardLoading } =
    useLeaderboard('legacy');
  const { data: etherealLeaderboardData, isLoading: etherealLeaderboardLoading } =
    useLeaderboard('overall');

  const generateCodeHandler = () => {
    // if (userInfo?.Invites && userInfo?.Invites.length > 19) {
    //   customToast({ type: 'error', message: 'Invite code limit reached' });
    //   return;
    // }
    if (generateInviteCodePending) return;
    generateInviteCodeMutation(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['user'],
        });
      },
    });
  };

  const noInvitesGenerated =
    userInfo?.Invites &&
    userInfo?.InvitesV2 &&
    userInfo?.Invites?.length === 0 &&
    userInfo?.InvitesV2?.length === 0;

  const hideGodCode = userInfo?.InvitesV2 && userInfo?.InvitesV2?.length === 0;

  const isLoading = originsLeaderboardLoading || etherealLeaderboardLoading || userInfoLoading;

  const originsRank = originsLeaderboardData?.find(
    item => item.Name === userInfo?.TwitterHandle
  )?.Rank;
  const etherealRank = etherealLeaderboardData?.find(
    item => item.Name === userInfo?.OdxAddress
  )?.Rank;

  if (isLoading) {
    return (
      <div className="font-poppins flex flex-col items-stretch gap-2">
        <div className="flex w-full flex-1 flex-row items-center justify-center gap-2 text-center">
          <div className="flex flex-1 flex-col gap-2 rounded-lg border border-border/10 bg-card p-6 shadow-sm">
            <div className="font-medium uppercase text-muted-foreground">Points Earned</div>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex flex-1 flex-col gap-2 rounded-lg border border-border/10 bg-card p-6 shadow-sm">
            <div className="font-medium uppercase text-muted-foreground">Leaderboard Rank</div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 md:flex-row">
          <Card className="flex-1 border-border/5 bg-card shadow-lg">
            <CardHeader className="border-b border-border/10">
              <h4 className="font-poppins flex items-center gap-2 font-semibold uppercase">
                YOUR TIER - <Skeleton className="h-6 w-24" />
              </h4>
            </CardHeader>
            <CardContent>
              <div className="font-poppins flex flex-col gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border bg-muted/50 p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-6 w-20" />
                      <div>
                        <Skeleton className="mb-1 h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1 flex-col border-border/5 bg-card shadow-lg">
            <CardHeader className="border-b border-border/10">
              <div className="flex items-center justify-between">
                <h4 className="font-poppins font-semibold uppercase">Invite codes</h4>
              </div>
            </CardHeader>
            <CardContent className="h-full pt-6">
              <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8">
                <Rabbit className="animate-skewShake h-24 w-24 text-primary/80" strokeWidth={1} />
                <div className="flex flex-col gap-2 text-center">
                  <p className="text-muted-foreground">No invite code found</p>
                  <Skeleton className="mx-auto h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="font-poppins flex flex-col items-stretch gap-2">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="flex flex-1 shrink-0 gap-2">
          <div className="flex flex-1 flex-col gap-2 rounded-lg border border-border/10 bg-card p-6 shadow-sm">
            <div className="font-medium uppercase text-muted-foreground">Origins Points Earned</div>
            <div className="font-drukwide text-4xl font-bold text-primary">
              {millify(userInfo?.LegacyPoints ?? 0, {
                precision: 2,
              })}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2 rounded-lg border border-border/10 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between font-medium uppercase text-muted-foreground">
              <span>Ascension Points Earned</span>
              <RefreshCw
                className={cn(
                  'h-4 w-4 cursor-pointer text-muted-foreground transition-colors hover:text-primary',
                  userInfoRefetching && 'animate-spin'
                )}
                onClick={async () => {
                  await queryClient.invalidateQueries({ queryKey: ['user'] });
                  toast.success('Refreshed Points');
                }}
              />
            </div>
            <div className="font-drukwide text-4xl font-bold text-primary">
              {millify(userInfo?.NewPoints ?? 0, {
                precision: 2,
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-1 shrink-0 gap-2">
          <div className="flex flex-1 flex-col gap-2 rounded-lg border border-border/10 bg-card p-6 shadow-sm">
            <div className="font-medium uppercase text-muted-foreground">
              Origins Leaderboard Rank
            </div>
            <div className="font-drukwide text-4xl font-bold text-primary">#{originsRank}</div>
          </div>
          <div className="flex flex-1 flex-col gap-2 rounded-lg border border-border/10 bg-card p-6 shadow-sm">
            <div className="font-medium uppercase text-muted-foreground">
              Ascension Leaderboard Rank
            </div>
            <div className="font-drukwide text-4xl font-bold text-primary">#{etherealRank}</div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2 md:flex-row">
        <Card className="flex-1 border-border/5 bg-card shadow-lg">
          <CardHeader className="border-b border-border/10">
            <h4 className="font-poppins font-semibold uppercase">
              YOUR TIER - <span className="font-normal text-accent">{userInfo?.Tier}</span>
            </h4>
          </CardHeader>
          <CardContent className="">
            <div className="font-poppins flex flex-col gap-4">
              {tierData.map(tier => (
                <div
                  key={tier.name}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    tier.name.toUpperCase() === userInfo?.Tier?.toUpperCase()
                      ? 'border-accent bg-accent/10'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={
                        tier.name.toUpperCase() === userInfo?.Tier?.toUpperCase()
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {tier.name}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{tier.friends} friends</p>
                      <p className="text-sm text-muted-foreground">
                        {tier.points} points + {tier.bonus} bonus
                      </p>
                    </div>
                  </div>
                  {tier.name.toUpperCase() === userInfo?.Tier?.toUpperCase() && (
                    <Badge variant="outline" className="bg-accent text-accent-foreground">
                      Your Tier
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="flex flex-1 flex-col border-border/5 bg-card shadow-lg">
          <CardHeader className="border-b border-border/10">
            <div className="flex items-center justify-between">
              <h4 className="font-poppins font-semibold uppercase">Invite codes</h4>
              {!noInvitesGenerated && (
                <span
                  className={cn(
                    'cursor-pointer select-none text-sm uppercase',
                    generateInviteCodePending
                      ? 'cursor-not-allowed text-muted-foreground'
                      : 'text-primary transition-colors hover:text-primary/80'
                  )}
                  onClick={generateCodeHandler}
                >
                  {generateInviteCodePending ? 'generating...' : 'generate code'}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 pt-6">
            <div className="flex h-full flex-col">
              {userInfo?.Invites && userInfo?.Invites.length > 0 && (
                <div className="grid flex-1 grid-cols-4 gap-x-4 gap-y-3 md:grid-cols-5">
                  {userInfo?.Invites?.map((invite: Invite) => {
                    return (
                      <InviteItem key={invite.ID} code={invite.Code} isUsed={invite?.IsUsed} />
                    );
                  })}
                </div>
              )}

              {noInvitesGenerated && (
                <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8">
                  <Rabbit className="animate-skewShake h-24 w-24 text-primary/80" strokeWidth={1} />
                  <div className="flex flex-col gap-2 text-center">
                    <p className="text-muted-foreground">No invite code found</p>
                    <p
                      className={cn(
                        'text-sm uppercase',
                        generateInviteCodePending
                          ? 'cursor-not-allowed text-muted-foreground'
                          : 'cursor-pointer text-primary transition-colors hover:text-primary/80'
                      )}
                      onClick={generateCodeHandler}
                    >
                      {generateInviteCodePending ? 'generating...' : 'generate one'}
                    </p>
                  </div>
                </div>
              )}
              {!hideGodCode && (
                <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 py-2">
                  <div className="font-poppins flex flex-wrap items-center justify-center gap-2 tracking-wider">
                    <div className="font-poppins animate-skewShake font-bold text-accent">
                      GOD ⚡
                    </div>
                    <p className="text-muted-foreground">invite code</p>
                  </div>
                  {userInfo?.InvitesV2?.map((invite: InviteV2) => {
                    return (
                      <InviteItem
                        key={invite.ID}
                        code={invite.Code}
                        isUsed={!!invite.IsExhausted}
                        isActive={invite.IsActive}
                        special
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
