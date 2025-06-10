import { api } from '@/utils/axiosConfig';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export type TokenInfo = {
  Name: string;
  FullName: string;
  Address: string;
  Decimals: number;
};

export type TokenPair = {
  TokenA: TokenInfo;
  TokenB: TokenInfo;
  Name: string;
};

const getAllTokens = async (xAssetScreen: boolean) => {
  const tokenPair = {
    TokenA: {
      Name: 'USDC',
      FullName: 'USDC',
      Address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
      Decimals: 6,
    },
    TokenB: {
      Name: 'x1SOL',
      FullName: 'x1SOL',
      Address: '0x344C683C891e3e0b5b393Fc10f6479B725353a36',
      Decimals: 18,
    },
    Name: 'USDC/x1SOL',
  };

  return [tokenPair];
  // const response = await api.AXIOS(
  //
  //   {
  //     url: xAssetScreen ? `/order/v1/tokens` : `/trade/v1/tokens`,
  //     method: 'get',
  //   },
  //   'pricefeed'
  // );
  // return response;
};

export const useAllTokens = (override?: boolean) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const xAssetScreen = pathname.includes('x-asset');

  const isXAssetScreen = override ? false : xAssetScreen;

  const allTokensData = useQuery<TokenPair[]>({
    queryKey: ['all-tokens', isXAssetScreen ? 'x-asset' : 'trade'],
    queryFn: () => getAllTokens(isXAssetScreen),
    // initialData: [
    //   {
    //     TokenA: {
    //       Name: 'RIFT.x',
    //       FullName: 'RIFT (ODX)',
    //       Address: '0x1D90E2e571B2cF32Ac5910b81e300C88FD90A58c',
    //       Decimals: 18,
    //     },
    //     TokenB: {
    //       Name: 'xUSDT',
    //       FullName: 'USDT (ODX)',
    //       Address: '0x2d4b1eDa9514675a9F8CB13b3f3a7475ebb81024',
    //       Decimals: 6,
    //     },
    //     Name: 'RIFT.x/xUSDT',
    //   },
    // ],
    retry: false,
    staleTime: Infinity,
  });

  // useEffect(() => {
  //   if (allTokensData.data && allTokensData.data.length > 0 && !searchParams.has('token')) {
  //     const params = new URLSearchParams(searchParams.toString());
  //     params.set('token', allTokensData.data[0].TokenA.Address);
  //     router.push(`?${params.toString()}`);
  //   }
  // }, [allTokensData.data, router, searchParams]);

  return allTokensData;
};
