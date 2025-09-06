import { getCurrentBaseUrl } from '@/lib/utils';
import { LeaderboardEntry } from './columns';
import axios from 'axios';

export type LeaderboardApiResponse = {
  leaderboard: LeaderboardEntry[];
  count: number;
};

export async function fetchLeaderboardPage({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}): Promise<LeaderboardApiResponse> {
  const startRank = (page - 1) * pageSize + 1;
  const limit = pageSize;

  const response = await axios.get(`${getCurrentBaseUrl()}/rankings/leaderboard`, {
    params: {
      limit,
      startRank,
    },
  });

  return response.data;
}

export async function fetchWeeklyLeaderboardPage({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}): Promise<LeaderboardApiResponse> {
  const startRank = (page - 1) * pageSize + 1;
  const limit = pageSize;

  const response = await axios.get(`${getCurrentBaseUrl()}/weekly-rankings`, {
    params: {
      limit,
      startRank,
    },
  });

  const weeklyLeaderboard = response.data.leaderboard.map((item: any) => {
    return {
      ...item,
      totalPoints: item.total_points,
      rank: item.rank,
      address: item.wallet_address,
    };
  });

  return {
    leaderboard: weeklyLeaderboard,
    count: response.data.count,
  };
}
