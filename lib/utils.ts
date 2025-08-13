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

export const removeTrailingZeros = (value: string) => {
  const numValue = Number(value);

  return numValue.toFixed(8).replace(/\.?0+$/, '');
};

export const truncateToFixed = (num: number, decimals: number) => {
  const factor = Math.pow(10, decimals);
  return (Math.floor(num * factor) / factor).toFixed(decimals);
};
