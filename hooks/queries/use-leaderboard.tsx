import { api } from '@/utils/axiosConfig';
import { getWeekAndYear } from '@/utils/helper';
import { useQuery } from '@tanstack/react-query';

export type LeaderboardType = 'weekly' | 'overall' | 'legacy';

export type LeaderboardItem = {
  Name: string;
  Nickname: string;
  Points: number;
  Rank: number;
  Username: string;
};

export const getLeaderboard = async (type: LeaderboardType): Promise<LeaderboardItem[]> => {
  let leaderboard;
  if (type === 'legacy') {
    leaderboard = await api.AXIOS({
      url: `/user/leaderboard-legacy`,
      method: 'get',
    });
  }

  if (type === 'overall') {
    leaderboard = await api.AXIOS({
      url: `/user/leaderboard`,
      method: 'get',
    });
  }
  if (type === 'weekly') {
    leaderboard = await api.AXIOS({
      url: `/user/weekly-leaderboard?key=${getWeekAndYear()}`,
      method: 'get',
    });
    leaderboard = leaderboard?.map((item: any) => {
      return {
        ...item,
        Name: item.TwitterHandle,
      };
    });
  }

  const updatedLeaderboard = [];
  leaderboard?.sort?.((x: LeaderboardItem, y: LeaderboardItem) => {
    if (x.Points < y.Points) {
      return 1;
    }
    if (x.Points > y.Points) {
      return -1;
    }
    return 0;
  });

  for (let item = 0; item < leaderboard?.length; item++) {
    updatedLeaderboard.push({
      ...leaderboard[item],
      Rank: item + 1,
    });
  }
  return updatedLeaderboard;
};

export const useLeaderboard = (leaderboardType: LeaderboardType) => {
  return useQuery({
    queryKey: ['leaderboard', leaderboardType],
    queryFn: () => getLeaderboard(leaderboardType),
    staleTime: Infinity,
    retry: 1,
  });
};
