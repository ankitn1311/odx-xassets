import axios, { AxiosError } from 'axios';
import { api, baseURL } from '../utils/axiosConfig';
import { delay, getWeekAndYear } from '../utils/helper';
// import { LeaderboardType } from '../providers/score.context';
import { BoundBody, DailyCheckInBody, TapPointsBody } from './user.types';
// import { MOCK_PROFILE } from '../lib/utils';

export interface UserInfoType {
  CreatedAt: string;
  Nickname: string;
  TwitterHandle: string;
  Username: string;
  Email: string;
  Userid: string;
  ImgUrl: string;
  Points: number;
  UnclaimedPoints: number;
  IsVerified: boolean;
  VerifiedAt: string;
  EthAddress: string;
  EthAddressGeneratedAt: string;
  Invite: Invite;
  InviteV2Code: string;
  InviteV2CodeUser: number;
  UsedInviteUsername: string;
  UsedInviteCodeID: number;
  InviteUsedAt: string;
  Invites: any[];
  InvitesV2: InviteV2[];
  HasAppliedInvite: boolean;
  PointsHistory: any[];
  LastEthBalance: string;
  LastUsdtBalance: string;
  IsSwapWhitelisted: boolean;
  IsOGBoostEnabled: boolean;
  IsBlitzBoostEnabled: boolean;
  LoggedInAt: string;
  HasDeposited: boolean;
  Tier: string;
  OgPoints: number;
  DiscordImage: string;
  DiscordUserId: string;
  DiscordId: string;
  DiscordUserName: string;
  VileCount: string;
  PointsCheckpointTime: string;
  PointsCheckpoint: number;
  VileCheckpoint: number;
  VileProCount: number;
  StakePoints: number;
  LastStakeRecordHeight: number;
  LastStakeAmount: number;
  StakePointsMultiplier: number;
  SwapCounter: number;
  FaucetUsageCounter: number;
  E3SuccessfulInviteCount: number;
  IsKinoBoostEnabled: boolean;
  BoundEvmAddress: string;
  BoundBtcAddress: string;
  AuthAddress: string;
  TapCheckpoint: number;
  TapCheckpointTimestamp: string;
  TapDailyCap: number;
  TapPoints: number;
  DailyCheckinCheckpointTimestamp: string;
  DailyCheckinCount: number;
  DailyCheckinPoints: number;
  IsEclipseBoostEnabled: boolean;
  IsAscendBoostEnabled: boolean;
  E4SuccessfulInviteCount: number;
  StakeStartDate: string;
  StakeStreak: number;
  StakeCheckpointTime: string;
  TotalKickbackPoints: number;
  StakeCheckpointPoints: number;
  BoundConfirmed: boolean;
  BoundConfirmedEvm: boolean;
  BoundConfirmedSui: boolean;
  AuthAddressEvm: string;
  AuthAddressSui: string;
  WithdrawCount: number;
  OdxAddress: string;
  PubKey: string;
  EncryptedPayload: string;
  SuborgId: string;
  NewPoints: number;
  IsTranzitBoostEnabled: boolean;
  LegacyPoints: number;
  OdxSonicAddress: string;
}

export type InviteV2 = {
  ID: number;
  Code: string;
  UsedByUser?: string[];
  Limit: number;
  IsExhausted?: boolean;
  CreatedByUsername: string;
  CreatedAt: string;
  IsActive?: boolean;
  UsageCount?: number;
};

export interface Invite {
  ID: number;
  Code: string;
  IsUsed: boolean;
  UsedByUsername: any;
  UsedByID: number;
  CreatedByUsername: string;
  EthDeposited: number;
  UsdtDeposited: number;
  Points: number;
  TotalKickback: number;
  CreatedAt: string;
  IsActive: boolean;
}

export type Stats = string[];

export type LeaderboardItem = {
  Name: string;
  Nickname: string;
  Points: number;
  Rank: number;
  Username: string;
};

export const getUser = async (username?: string): Promise<UserInfoType> => {
  /** FOR TESTING */
  // return MOCK_PROFILE;

  if (username === 'me') {
    return await api.AXIOS({
      url: `/user/profile`,
      method: 'get',
    });
  }

  return await api.AXIOS({
    url: `/user/profile`,
    params: {
      username,
    },
    method: 'get',
  });
};

export const generateInviteCode = async (): Promise<Invite> => {
  await delay(1000);

  const res = await api.AXIOS({
    url: `/invite/generate`,
    method: 'post',
  });
  return res;
};

export const getStats = async (): Promise<Stats> => {
  const res = await api.AXIOS({
    url: `/stats`,
    method: 'get',
  });
  return res;
};

// export const getLeaderboard = async (type: LeaderboardType): Promise<LeaderboardItem[]> => {
//   let leaderboard;
//
//   if (type === 'overall') {
//     leaderboard = await api.AXIOS({
//       url: `/user/leaderboard`,
//       method: 'get'
//     });
//   }
//   if (type === 'weekly') {
//     leaderboard = await api.AXIOS({
//       url: `/user/weekly-leaderboard?key=${getWeekAndYear()}`,
//       method: 'get'
//     });
//     leaderboard = leaderboard?.map((item: any) => {
//       return {
//         ...item,
//         Name: item.TwitterHandle
//       };
//     });
//   }
//
//   const updatedLeaderboard = [];
//   leaderboard?.sort?.((x: LeaderboardItem, y: LeaderboardItem) => {
//     if (x.Points < y.Points) {
//       return 1;
//     }
//     if (x.Points > y.Points) {
//       return -1;
//     }
//     return 0;
//   });
//
//   for (let item = 0; item < leaderboard?.length; item++) {
//     updatedLeaderboard.push({
//       ...leaderboard[item],
//       Rank: item + 1
//     });
//   }
//   return updatedLeaderboard;
// };

export const addAddress = async (address: string): Promise<string> => {
  return await api.AXIOS({
    url: `/user/address/set`,
    method: 'post',
    data: {
      address,
    },
  });
};

export const tapPoints = async ({ tap_count }: TapPointsBody) => {
  return await api.AXIOS({
    url: `/user/tap`,
    method: 'post',
    data: {
      tap_count,
    },
  });
};

export const reauth = async () => {
  return await api.AXIOS({
    url: `/auth2/reauth`,
    method: 'get',
  });
};

export const boundAddress = async ({ evmAddress, btcAddress }: BoundBody) => {
  return await api.AXIOS({
    url: `/user/address/set`,
    method: 'post',
    data: {
      EvmAddress: evmAddress,
      BtcAddress: btcAddress,
    },
  });
};

export const claimPoints = async (): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  return await api.AXIOS({
    url: `/user/claim`,
    method: 'post',
    data: {},
  });
};

export type DailyCheckInResponse = {
  CheckinCount: number;
  PointsEarned: number;
};

export const dailyCheckIn = async (): Promise<string | DailyCheckInResponse> => {
  const response = await api.AXIOS({
    url: `/user/daily-checkin`,
    method: 'get',
  });
  return response;
};

export const reedemInvite = async (inviteCode: string): Promise<string> => {
  const response = await api.AXIOS({
    url: `/invite/apply`,
    method: 'post',
    data: {
      invite_code: inviteCode,
    },
  });
  await delay(1000);
  return response;
};

export async function fetchUserInfo(token: string): Promise<UserInfoType> {
  // FOR TESTING
  // return MOCK_PROFILE;
  const res = await axios.get(`${baseURL}/user/profile`, {
    headers: {
      Authorization: token,
    },
  });
  return res.data;
}

export const decodeDiscord = async ({ token }: { token: string }) => {
  return await api.AXIOS({
    url: `/auth/discord/decode?token=${token}`,
    method: 'get',
  });
};

export const connectDiscord = async ({ token }: { token: string }) => {
  return await api.AXIOS({
    url: `/auth/discord/connect?token=${token}`,
    method: 'post',
  });
};
