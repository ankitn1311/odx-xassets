import { useWalletProfile } from './use-wallet-profile';

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
      Name: 'x2ETH',
      V1Name: 'x1ETH',
      FullName: 'x2ETH',
      Address: '0xf5FC32390c371AA29250CE16dec397CA48B5Bfe7',
      V1Address: '0xf5FC32390c371AA29250CE16dec397CA48B5Bfe7',
      Decimals: 18,
      QtyTickSize: 0.0001,
    },
    Name: 'USDC/x2ETH',
  },
];

export const useAllTokens = () => {
  // Get tokens from wallet profile API when available
  const { data: walletProfile, isLoading: isWalletProfileLoading } = useWalletProfile(
    '0x0000000000000000000000000000000000000000'
  );

  // Use wallet profile assets if available, otherwise fall back to hardcoded data
  const tokens = walletProfile?.assets || ALL_V2_TOKEN_PAIRS;

  return {
    data: tokens,
    isLoading: isWalletProfileLoading,
  };
};
