import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAppStore } from '@/stores/app-store';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncateAddress = (
  address: string,
  { prefix = 8, suffix = 4 }: { prefix?: number; suffix?: number } = {}
) => {
  return `${address.slice(0, prefix)}•••${address.slice(-suffix)}`;
};

export const getRpId = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
};

export const convertXUSDT = (symbol: string) => {
  if (symbol === 'xUSDT') return 'USDT.x';
  return symbol;
};

export const WHOLE_NUMBER_TOKENS = ['x1XRP', 'x1ADA', 'x1DOGE', 'x1PEPE', 'x1SUI'];

export const getCurrentBaseUrl = (): string => {
  const { customBaseUrl } = useAppStore.getState();

  const env = process.env.NEXT_PUBLIC_ENV || 'development';

  if (env === 'staging' && customBaseUrl) {
    return customBaseUrl;
  }

  return process.env.NEXT_PUBLIC_BASE_URL || '';
};

export const getCurrentWebSocketUrl = (): string => {
  const env = process.env.NEXT_PUBLIC_ENV || 'development';

  const { customWebSocketUrl } = useAppStore.getState();

  if (env === 'staging' && customWebSocketUrl) {
    return customWebSocketUrl;
  }

  return process.env.NEXT_PUBLIC_WSS_BASE_URL || '';
};

export const getCurrentPermit2Address = (): string => {
  const env = process.env.NEXT_PUBLIC_ENV || 'development';

  const { customPermit2Address } = useAppStore.getState();

  if (env === 'staging' && customPermit2Address) {
    return customPermit2Address;
  }

  return process.env.NEXT_PUBLIC_PERMIT2 || '';
};

export const getCurrentReactorAddress = (): string => {
  const env = process.env.NEXT_PUBLIC_ENV || 'development';

  const { customReactorAddress } = useAppStore.getState();

  if (env === 'staging' && customReactorAddress) {
    return customReactorAddress;
  }

  return process.env.NEXT_PUBLIC_REACTOR || '';
};

export const getCurrentCosignerAddress = (): string => {
  const env = process.env.NEXT_PUBLIC_ENV || 'development';

  const { customCosignerAddress } = useAppStore.getState();

  if (env === 'staging' && customCosignerAddress) {
    return customCosignerAddress;
  }

  return process.env.NEXT_PUBLIC_COSIGNER || '';
};

export const removeTrailingZeros = (value: string, maxDecimals: number = 8) => {
  if (value === '0') return '0';
  const numValue = Number(value);

  // Truncate to maxDecimals without rounding
  const multiplier = Math.pow(10, maxDecimals);
  const truncated = Math.floor(numValue * multiplier) / multiplier;

  return truncated.toString().replace(/\.?0+$/, '');
};

export function getWeekNumber(date: Date): number {
  const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tempDate.getUTCDay() || 7;
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getWeekId(date: Date = new Date()): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}_W${week.toString().padStart(2, '0')}`;
}
