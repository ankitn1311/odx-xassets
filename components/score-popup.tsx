import { Skeleton } from './ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import millify from 'millify';
import { useUserInfo } from '@/hooks/queries/use-user';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import CountdownTimer from './common/countdown-timer';

export const ScorePopup = () => {
  const {
    data: userInfo,
    isLoading: isUserInfoLoading,
    isRefetching: isUserInfoRefetching,
  } = useUserInfo();
  const queryClient = useQueryClient();

  const capDate = userInfo?.PointsCheckpointTime
    ? new Date(userInfo?.PointsCheckpointTime).getTime() + 24 * 60 * 60 * 1000
    : 0;
  const currentTime = new Date().getTime();

  const hideTimer = !userInfo?.PointsCheckpointTime || currentTime > capDate;

  return (
    <div className="flex flex-col gap-4">
      {isUserInfoLoading || isUserInfoRefetching ? (
        <div className="px-4">
          <Skeleton className="mb-4 h-6 w-20 shrink-0" />
          <div className="flex flex-col gap-4">
            {!hideTimer && (
              <>
                <Skeleton className="h-4 w-40 shrink-0" />
                <Skeleton className="h-4 w-32 shrink-0" />
              </>
            )}
            <Skeleton className="h-4 w-40 shrink-0" />
            <Skeleton className="h-4 w-32 shrink-0" />
            <Skeleton className="h-4 w-32 shrink-0" />
          </div>
        </div>
      ) : (
        <div className="px-4">
          <div className="flex items-center justify-between">
            <p className="text-base text-foreground">Score</p>
            <RefreshCw
              className="h-4 w-4 cursor-pointer text-muted-foreground transition-colors hover:text-primary"
              onClick={async () => {
                await queryClient.invalidateQueries({ queryKey: ['user'] });
                toast.success('Refreshed Score');
              }}
            />
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {!hideTimer && (
              <div>
                <p className="text-sm text-muted-foreground">Next Cap Reset</p>
                <CountdownTimer startTime={userInfo?.PointsCheckpointTime} />
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Ascension Points Earned</p>
              <p className="flex items-center justify-between text-xl font-medium">
                <div>
                  <span className="text-accent">
                    {millify(userInfo?.NewPoints ?? 0, {
                      precision: 2,
                    })}
                  </span>{' '}
                  points
                </div>
                <span className="ml-2 text-xs text-muted-foreground">
                  {userInfo?.NewPoints?.toLocaleString() ?? 0}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
