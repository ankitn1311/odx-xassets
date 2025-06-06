import { UserInfoType } from '../apis/users';
import {
  getISOWeek,
  formatDistanceToNow,
  startOfISOWeek,
  addWeeks,
  subDays,
  format,
  formatDistanceStrict as formatDistance,
  addHours,
  formatDuration,
  intervalToDuration,
} from 'date-fns';

export type LabelType =
  | 'Legacy Leader'
  | 'Blitz Through'
  | 'Kino der toten'
  | 'Shadow Hunter'
  | 'Swap Specialist'
  | 'Faucet Fury'
  | 'Wingman'
  | 'Pool Party'
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
  | 'Tranzit'
  | 'Ascend';

export const imagesMap: Record<string, string> = {
  DUSDT: '/tokens/dusdt.webp',
  BEER: '/tokens/beer.webp',
  BREW: '/tokens/brew.webp',
  COLA: '/tokens/cola.webp',
  SODA: '/tokens/soda.webp',
  TONIC: '/tokens/tonic.webp',
  LIQUIDATIONS: '/tokens/liquidations.webp',
  '850111:753': '/tokens/liquidations.webp',
  USDX: '/tokens/usdx.png',
  WOOF: '/tokens/woof.png',
  NAPCAT: '/tokens/napcat.png',
  KING: '/tokens/king.png',
  CHIPS: '/tokens/chips.png',
  FLUFF: '/tokens/fluff.png',
  BLOP: '/tokens/blop.png',
};

export const STAKE_ENABLED_FOR_TOKENS = ['BASE_KUSDT'];

export const delay = (delayInMs: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, delayInMs));
};

export const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  // Prevent the '-' (45) and '+' (43) keys from being entered
  if (event.code === 'NumpadSubtract' || event.code === 'NumpadAdd') {
    event.preventDefault();
  }
};

export const isProd = process.env.NEXT_PUBLIC_ENV === 'production';

export const isEmptyPool = (assetABalance: number, assetBBalance: number) =>
  assetABalance === 0 && assetBBalance === 0;

export const capitalize = (slug: string) => {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
};

export const getWeekAndYear = () => {
  const now = new Date();
  // Calculate the current ISO week number
  const currentWeekNumber = getISOWeek(now);

  // Format the string as "W{weekNumber}Y{yearNumber}"
  const formattedWeekYear = `W${currentWeekNumber}Y${now.getFullYear()}`;

  return formattedWeekYear;
};

export const remainingTimeUntilNextISOWeek = () => {
  const now = new Date();
  const nextISOWeekStart = startOfISOWeek(addWeeks(now, 1));
  const distance = formatDistanceToNow(nextISOWeekStart, {
    includeSeconds: true,
  });
  return distance;
};

export const roundDownToTwoDecimals = (num: number, decimals?: number) => {
  const dec = Math.pow(10, decimals || 2);

  return Math.floor(num * dec) / dec;
};

export const hasMoreThanTwoDecimalDigits = (numberString: string) => {
  // Find the position of the decimal point
  const decimalIndex = numberString.indexOf('.');

  // If there's no decimal point, return false
  if (decimalIndex === -1) {
    return false;
  }

  // Get the part of the string after the decimal point
  const decimalPart = numberString.slice(decimalIndex + 1);

  // Check if the length of the decimal part is greater than 2
  return decimalPart.length > 2;
};

export const removeDashFromString = (str: string) => {
  return str.replace(/-/g, '');
};

export const getLastDays = (num: number) => {
  const today = new Date();
  const lastDays = [];

  for (let i = 0; i < num; i++) {
    const day = subDays(today, i);
    lastDays.push(format(day, 'yyyy-MM-dd'));
  }

  return lastDays.reverse();
};

export const isAchievementEquiped = ({
  achievementLabel,
  userInfo,
}: {
  achievementLabel: LabelType;
  userInfo: UserInfoType;
}) => {
  if (!userInfo) return false;

  const successfulInvitesV1 = userInfo?.Invites.filter(
    invite => invite.IsUsed && invite.IsActive
  )?.length;
  const successfulGodCodeInvites = userInfo?.InvitesV2.reduce((acc, invite) => {
    return acc + (invite.UsageCount || 0);
  }, 0);
  const successfulInvites = (successfulInvitesV1 || 0) + (successfulGodCodeInvites || 0);

  // Convert above to switch case
  switch (achievementLabel) {
    case 'Legacy Leader':
      return userInfo.IsOGBoostEnabled;
    case 'Blitz Through':
      return userInfo.IsBlitzBoostEnabled;
    case 'Faucet Fury':
      return (
        userInfo.FaucetUsageCounter > 20 && (userInfo.SwapCounter > 1 || userInfo.StakePoints > 0)
      );
    case 'Kino der toten':
      return userInfo.IsKinoBoostEnabled;
    case 'Shadow Hunter':
      return userInfo.IsEclipseBoostEnabled;
    case 'Ascend':
      return userInfo?.IsAscendBoostEnabled;
    case 'Swap Specialist':
      return userInfo.SwapCounter >= 500;
    case 'Tap Machine':
      return userInfo.TapPoints > 25000;
    case 'Wingman':
      const isWingman = successfulInvites >= 7;
      return isWingman;
    case 'Stake-a-holic':
      return userInfo.StakeStreak >= 20 && userInfo.LastStakeAmount >= 100;
    case 'Invite Shark':
      const isInviteShark = successfulInvites >= 14;
      return isInviteShark;
    case 'Highroller':
      return userInfo.Points === 0
        ? userInfo.LegacyPoints + userInfo.NewPoints > 250000
        : userInfo.Points > 250000;
    case 'Points Party':
      return userInfo.TotalKickbackPoints > 10000;
    case 'Payday':
      return userInfo.WithdrawCount > 0;
    case 'Sailing the SUI':
      return userInfo.BoundConfirmedSui && userInfo.AuthAddressSui;
    case 'Pool Party':
      return false;
    case 'Stakeout':
      return false;
    case 'Provider':
      return false;
    case 'Token Tactician':
      return false;
    case 'Tranzit':
      return userInfo.IsTranzitBoostEnabled;
    default:
      return false;
  }
};

// Function to get the readable time remaining until the next 12-hour mark
export const getReadableTimeRemainingForNext12Hours = () => {
  const now = new Date(); // Current time

  // Determine the next 12-hour mark (either 12:00 PM or 12:00 AM)
  const next12Hour = now.getHours() < 12 ? 12 : 24; // Next 12 PM or AM
  const next12Time = addHours(
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
    next12Hour
  ); // Next 12:00

  // Calculate the interval between now and the next 12-hour mark
  const duration = intervalToDuration({
    start: now,
    end: next12Time,
  });

  // Format the duration (include only hours and minutes)
  const formattedDuration = formatDuration(
    {
      hours: duration.hours,
      minutes: duration.minutes,
    },
    {
      format: ['hours', 'minutes'],
      delimiter: ' ',
      zero: false,
    }
  )
    .replace(' hours', 'h')
    .replace(' minutes', 'm') // Plural form
    .replace(' hour', 'h')
    .replace(' minute', 'm'); // Singular form

  return formattedDuration;

  // Get the readable time difference between now and the next 12:00
  const timeRemaining = formatDistance(next12Time, now, { addSuffix: true });

  return timeRemaining;
};

export const constants = {
  BOUND_MISMATCH: 'Your connected wallet differs from the bounded wallet.',
};

export const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const walletConnectedProperly = ({
  connectedWallet,
  connectedWalletType,
  tonAddress,
  evmAddress,
  suiAddress,
}: {
  connectedWallet: string;
  connectedWalletType: string;
  tonAddress: string;
  evmAddress: string;
  suiAddress: string;
}) => {
  if (!connectedWallet) return false;

  switch (connectedWalletType) {
    case 'TON':
      return connectedWallet === tonAddress;
    case 'EVM':
      return connectedWallet === evmAddress;
    case 'SUI':
      return connectedWallet === suiAddress;
    default:
      return false;
  }
};

// export const TOKENS: TokenType[] = [
//   {
//     imageUrl: '/tokens/ordxt.png',
//     symbol: 'ORDXT',
//     chain: 'BASE',
//     enable: true,
//     value: undefined,
//     tokenAddress: '0xcA1372fE66a2C4D9b25fb28Ab6643a43d035dceb',
//     poolBalance: 0,
//     poolType: 'A'
//   },
//   {
//     imageUrl: '/tokens/bzrk.png',
//     symbol: 'BZRK',
//     chain: 'BRC20',
//     enable: true,
//     value: undefined,
//     poolBalance: 0,
//     poolType: 'B'
//   }
// ];
