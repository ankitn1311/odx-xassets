import { useRouter } from 'next/navigation';
import { DataTable } from './data-table';
import { columns } from './columns';
import { useLeaderboard } from '@/hooks/queries/use-leaderboard';
import { useUserInfo } from '@/hooks/queries/use-user';

export const WeeklyDataTable = () => {
  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    isError,
  } = useLeaderboard('weekly');
  const { data: userInfo, isLoading: userInfoLoading } = useUserInfo();
  const router = useRouter();

  const isLoading = leaderboardLoading || userInfoLoading;

  const myData = leaderboardData?.find(item => {
    return item.Name === userInfo?.TwitterHandle;
  });

  if (isError) {
    return <div className="text-center font-medium text-destructive">Some error fetching data</div>;
  }

  return (
    <DataTable
      isLoading={isLoading}
      data={leaderboardData || []}
      columns={columns}
      currentUserData={myData}
      onRowClick={row => {
        router.push(`/profile/${row.Username}`);
      }}
    />
  );
};
