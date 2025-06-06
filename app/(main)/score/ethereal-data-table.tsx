import { useRouter } from 'next/navigation';
import { DataTable } from './data-table';
import { etherealColumns } from './columns';
import { useLeaderboard } from '@/hooks/queries/use-leaderboard';
import { useUserInfo } from '@/hooks/queries/use-user';

export const EtherealDataTable = () => {
  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    isError,
  } = useLeaderboard('overall');
  const { data: userInfo, isLoading: userInfoLoading } = useUserInfo();
  const router = useRouter();

  const isLoading = leaderboardLoading || userInfoLoading;

  const myData = leaderboardData?.find(item => {
    return item.Name === userInfo?.OdxAddress;
  });

  if (isError) {
    return <div className="text-center font-medium text-destructive">Some error fetching data</div>;
  }

  return (
    <DataTable
      isLoading={isLoading}
      data={leaderboardData || []}
      columns={etherealColumns}
      currentUserData={myData}
      onRowClick={row => {
        router.push(`/profile/${row.Name}`);
      }}
    />
  );
};
