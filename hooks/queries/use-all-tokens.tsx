import { api } from '@/utils/axiosConfig';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export type TokenInfo = {
  Name: string;
  FullName: string;
  Address: string;
  V1Name?: string;
  V1Address?: string;
  Decimals: number;
  QtyTickSize?: number;
};

export type TokenPair = {
  TokenA: TokenInfo;
  TokenB: TokenInfo;
  Name: string;
};

export const ALL_V2_TOKEN_PAIRS = [
  {
    TokenA: {
      Name: 'USDC',
      FullName: 'USDC',
      Address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
      Decimals: 6,
    },
    TokenB: {
      Name: 'x2SOL',
      V1Name: 'x1SOL',
      FullName: 'x2SOL',
      Address: '0x722B74D3360Ed67e16C39d972A782D3A44D69a23',
      V1Address: '0x40eF79F7f9B0e05e761440B2eC2A6210fc453B1e',
      Decimals: 18,
      QtyTickSize: 0.001,
    },
    Name: 'USDC/x2SOL',
  },
  {
    TokenA: {
      Name: 'USDC',
      FullName: 'USDC',
      Address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
      Decimals: 6,
    },
    TokenB: {
      Name: 'x2XRP',
      V1Name: 'x1XRP',
      FullName: 'x2XRP',
      Address: '0x30cB5168DaBb7F4E2f2B576a74cB767886e91A27',
      V1Address: '0x1B4FEAE9cc60940d1F8745d13527A56c7eb16bCc',
      Decimals: 18,
      QtyTickSize: 0.1,
    },
    Name: 'USDC/x2XRP',
  },
  {
    TokenA: {
      Name: 'USDC',
      FullName: 'USDC',
      Address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
      Decimals: 6,
    },
    TokenB: {
      Name: 'x2SUI',
      V1Name: 'x1SUI',
      FullName: 'x2SUI',
      Address: '0x9AEa2652c28D19aAc7F2598e1473F35623313864',
      V1Address: '0x9AEa2652c28D19aAc7F2598e1473F35623313864',
      Decimals: 18,
      QtyTickSize: 0.1,
    },
    Name: 'USDC/x2SUI',
  },
  {
    TokenA: {
      Name: 'USDC',
      FullName: 'USDC',
      Address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
      Decimals: 6,
    },
    TokenB: {
      Name: 'x2ADA',
      V1Name: 'x1ADA',
      FullName: 'x2ADA',
      Address: '0xa6EEee081e957529b7eCC28dD1c9EE312d967Bbc',
      V1Address: '0x1B4FEAE9cc60940d1F8745d13527A56c7eb16bCc',
      Decimals: 18,
      QtyTickSize: 0.1,
    },
    Name: 'USDC/x2ADA',
  },
];

// export const ALL_V1_TOKEN_PAIRS = [
//   {
//     TokenA: {
//       Name: 'USDC',
//       FullName: 'USDC',
//       Address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
//       Decimals: 6,
//     },
//     TokenB: {
//       Name: 'x1SOL',
//       FullName: 'x1SOL',
//       Address: '0x40eF79F7f9B0e05e761440B2eC2A6210fc453B1e',
//       Decimals: 18,
//       QtyTickSize: 0.001,
//     },
//     Name: 'USDC/x1SOL',
//   },
//   {
//     TokenA: {
//       Name: 'USDC',
//       FullName: 'USDC',
//       Address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
//       Decimals: 6,
//     },
//     TokenB: {
//       Name: 'x1XRP',
//       FullName: 'x1XRP',
//       Address: '0x1B4FEAE9cc60940d1F8745d13527A56c7eb16bCc',
//       Decimals: 18,
//       QtyTickSize: 0.1,
//     },
//     Name: 'USDC/x1XRP',
//   },
//   {
//     TokenA: {
//       Name: 'USDC',
//       FullName: 'USDC',
//       Address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
//       Decimals: 6,
//     },
//     TokenB: {
//       Name: 'x1ADA',
//       FullName: 'x1ADA',
//       Address: '0xEbbEaEF27b155F46A5C13d9fa2760E376990510A',
//       Decimals: 18,
//       QtyTickSize: 0.1,
//     },
//     Name: 'USDC/x1ADA',
//   },
//   {
//     TokenA: {
//       Name: 'USDC',
//       FullName: 'USDC',
//       Address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
//       Decimals: 6,
//     },
//     TokenB: {
//       Name: 'x1DOGE',
//       FullName: 'x1DOGE',
//       Address: '0x4C4Cf2E8ED4c387818CBdD2B00Dc634A3b3805B6',
//       Decimals: 18,
//       QtyTickSize: 0.1,
//     },
//     Name: 'USDC/x1DOGE',
//     QtyTickSize: 1,
//   },
//   {
//     TokenA: {
//       Name: 'USDC',
//       FullName: 'USDC',
//       Address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
//       Decimals: 6,
//     },
//     TokenB: {
//       Name: 'x1PEPE',
//       FullName: 'x1PEPE',
//       Address: '0x66a9087b66eb373F344b2E88A3eaEA7Baa978397',
//       Decimals: 18,
//       QtyTickSize: 10000,
//     },
//     Name: 'USDC/x1PEPE',
//   },
//   {
//     TokenA: {
//       Name: 'USDC',
//       FullName: 'USDC',
//       Address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
//       Decimals: 6,
//     },
//     TokenB: {
//       Name: 'x1SUI',
//       FullName: 'x1SUI',
//       Address: '0xdCaCe98a85EE692a214c0B6Bf8F10C53ddF03643',
//       Decimals: 18,
//       QtyTickSize: 0.1,
//     },
//     Name: 'USDC/x1SUI',
//   },
// ];

const getAllTokens = async (xAssetScreen: boolean) => {
  return ALL_V2_TOKEN_PAIRS;
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
  const pathname = usePathname();

  const xAssetScreen = pathname.includes('x-asset');

  const isXAssetScreen = override ? false : xAssetScreen;

  const allTokensData = useQuery<TokenPair[]>({
    queryKey: ['all-tokens', isXAssetScreen ? 'x-asset' : 'trade'],
    queryFn: () => getAllTokens(isXAssetScreen),
    initialData: ALL_V2_TOKEN_PAIRS,
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
