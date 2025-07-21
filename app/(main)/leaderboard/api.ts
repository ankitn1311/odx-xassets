import { LeaderboardEntry } from './columns';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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

  const response = await axios.get(`${BASE_URL}/rankings/leaderboard`, {
    params: {
      limit,
      startRank,
    },
  });

  return response.data;
}
