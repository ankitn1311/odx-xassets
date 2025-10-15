import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTokenSwapStore } from '@/stores/token-swap-store';
import { TokenInfo } from '../queries/use-all-tokens';
import { useState, useEffect } from 'react';
import { getCurrentBaseUrl } from '@/lib/utils';

interface QuoteParams {
  inputToken: TokenInfo;
  outputToken: TokenInfo;
  inputAmount: string;
  type: 'buy' | 'sell' | 'mark';
}

// const CRYPTO_API_BASE = 'https://api.crypto.com/exchange/v1/public';

export const tokenConvert = {
  USDC: 'USD',
  USDT: 'USD',
  x1SOL: 'SOL',
  x1BTC: 'BTC',
  x1XRP: 'XRP',
  x1ADA: 'ADA',
  x1DOGE: 'DOGE',
  x1PEPE: 'PEPE',
  x1SUI: 'SUI',
  x2SOL: 'SOL',
  x2XRP: 'XRP',
  x2ADA: 'ADA',
  x2SUI: 'SUI',
  x2BTC: 'BTC',
  x2ETH: 'ETH',
};

export const tokenConvertReverse = {
  USD: 'USDC',
  SOL: 'x2SOL',
  XRP: 'x2XRP',
  ADA: 'x2ADA',
  DOGE: 'x2DOGE',
  PEPE: 'x2PEPE',
  SUI: 'x2SUI',
  BTC: 'x2BTC',
  ETH: 'x2ETH',
};

export const tokenConvertReverseV1 = {
  USD: 'USDC',
  SOL: 'x1SOL',
  XRP: 'x1XRP',
  ADA: 'x1ADA',
  DOGE: 'x1DOGE',
  PEPE: 'x1PEPE',
  SUI: 'x1SUI',
  BTC: 'x1BTC',
  ETH: 'x1ETH',
};

export const tokenConvertForUI = {
  USDC: 'USD',
  USDT: 'USD',
  USD: 'USD',
  SOL: 'Solana',
  XRP: 'XRP',
  ADA: 'Cardano',
  DOGE: 'Dogecoin',
  PEPE: 'Pepe',
  SUI: 'Sui',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
};

const calculateQuote = async (params: QuoteParams) => {
  const inputToken = params.inputToken.Name;
  const outputToken = params.outputToken.Name;
  const isBuy = params.type === 'buy';
  const isSell = params.type === 'sell';

  if (Number(params.inputAmount) === 0) {
    return 0;
  }

  // Always construct instrument_name as XRP_USD format regardless of input/output order
  const usdToken = inputToken === 'USDC' || inputToken === 'USDT' ? inputToken : outputToken;
  const cryptoToken = inputToken === 'USDC' || inputToken === 'USDT' ? outputToken : inputToken;

  const response = await axios.get(`${getCurrentBaseUrl()}/cdc/get-valuations`, {
    params: {
      instrument_name: `${tokenConvert[cryptoToken as keyof typeof tokenConvert]}_${tokenConvert[usdToken as keyof typeof tokenConvert]}`,
      valuation_type: 'mark_price',
      count: 1,
    },
  });

  const buyPrice = parseFloat(response.data.result.data[0].buy_price);
  const sellPrice = parseFloat(response.data.result.data[0].sell_price);
  const currentPrice = parseFloat(response.data.result.data[0].v);
  const inputAmount = parseFloat(params.inputAmount);

  // For buy: user pays USD, gets crypto (divide by buy price)
  // For sell: user pays crypto, gets USD (multiply by sell price)
  if (isBuy) {
    return inputAmount / buyPrice;
  } else if (isSell) {
    return inputAmount * sellPrice;
  } else {
    return inputAmount / currentPrice;
  }
};

const getTokenPrice = async (tokenSymbol: string) => {
  const response = await axios.get(`${getCurrentBaseUrl()}/cdc/get-valuations`, {
    params: {
      instrument_name: `${tokenConvert[tokenSymbol as keyof typeof tokenConvert]}_USD`,
      valuation_type: 'mark_price',
      count: 1,
    },
  });

  return parseFloat(response.data.result.data[0].v);
};

export const useTradeQuote = () => {
  const { setQuoteLoading } = useTokenSwapStore();

  const quoteMutation = useMutation({
    mutationFn: async (params: QuoteParams) => {
      try {
        setQuoteLoading(true);
        return await calculateQuote(params);
      } catch (error) {
        console.error('Error fetching price from Crypto.com:', error);
        throw error;
      } finally {
        setQuoteLoading(false);
      }
    },
  });

  return {
    getQuote: quoteMutation.mutateAsync,
    isLoading: quoteMutation.isPending,
    error: quoteMutation.error,
  };
};

export const useTokenQuote = () => {
  const quoteMutation = useMutation({
    mutationFn: async (params: QuoteParams) => {
      try {
        return await calculateQuote(params);
      } catch (error) {
        console.error('Error fetching price from Crypto.com:', error);
        throw error;
      }
    },
  });

  return {
    getQuote: quoteMutation.mutateAsync,
    isLoading: quoteMutation.isPending,
    error: quoteMutation.error,
  };
};

export const useTokenPrice = (tokenSymbol: string) => {
  return useQuery({
    queryKey: ['token-price', tokenSymbol],
    queryFn: () => {
      return getTokenPrice(tokenSymbol);
    },
    refetchInterval: 1000 * 5,
  });
};

export const useTokenPriceWithFlash = (tokenSymbol: string) => {
  const { data: currentPrice, isLoading, error } = useTokenPrice(tokenSymbol);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [flashState, setFlashState] = useState<'none' | 'up' | 'down' | 'same'>('none');

  useEffect(() => {
    if (currentPrice !== undefined && previousPrice !== null) {
      if (currentPrice > previousPrice) {
        setFlashState('up');
      } else if (currentPrice < previousPrice) {
        setFlashState('down');
      } else {
        setFlashState('same');
      }

      // Reset flash state after animation duration
      const timer = setTimeout(() => {
        setFlashState('none');
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (currentPrice !== undefined) {
      setPreviousPrice(currentPrice);
    }
  }, [currentPrice, previousPrice]);

  return {
    data: currentPrice,
    isLoading,
    error,
    flashState,
  };
};

export const useTokenPriceChange = (tokenSymbol: string) => {
  return useQuery({
    queryKey: ['token-tickers', tokenSymbol],
    queryFn: () => {
      return getTokenPriceChange(tokenSymbol);
    },
    refetchInterval: 1000 * 8,
  });
};

const getTokenPriceChange = async (tokenSymbol: string) => {
  const response = await axios.get(`${getCurrentBaseUrl()}/cdc/get-tickers`, {
    params: {
      instrument_name: `${tokenConvert[tokenSymbol as keyof typeof tokenConvert]}_USD`,
    },
  });
  return parseFloat(response.data.result.data[0].c);
};
