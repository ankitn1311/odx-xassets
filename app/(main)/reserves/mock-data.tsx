export function getData() {
  // dummy data
  return [
    {
      tokenName: 'CULT',
      tokenSymbol: 'CULT.x',
      price: 4587.32,
      priceChange: -3.76,
      marketCap: 1254453218400,
      image: '/images/tokens/CULT.png',
    },
    {
      tokenName: 'NOVA',
      tokenSymbol: 'NOVA.x',
      price: 3127.89,
      priceChange: 2.54,
      marketCap: 743123652311,
      image: '/images/tokens/NOVA.png',
    },
    {
      tokenName: 'NADE',
      tokenSymbol: 'NADE.x',
      price: 567.12,
      priceChange: 1.98,
      marketCap: 534214678221,
      image: '/images/tokens/NADE.png',
    },
    {
      tokenName: 'RIFT',
      tokenSymbol: 'RIFT.x',
      price: 0.98,
      priceChange: -0.89,
      marketCap: 282143768150,
      image: '/images/tokens/RIFT.png',
    },
    {
      tokenName: 'WISH',
      tokenSymbol: 'WISH.x',
      price: 1.56,
      priceChange: 3.21,
      marketCap: 121423985200,
      image: '/images/tokens/WISH.png',
    },
  ];
}

export const infoPanelData = {
  title: 'Trade any token from your onchain wallet',
  description:
    'Connect your wallet and trade wrapped versions of any token, called xAssets, on any supported chain.',
  hoverText: 'Wrapped Assets',
  hoverDescription:
    'Wrapped assets are tokens backed one-to-one by the underlying asset, making tokens previously incompatible available on other chains.',
  hoverCardEnabled: true,
};

export const basicCardData = [
  {
    topSectionData: {
      coinImage: '/images/USDC.svg',
      coinName: 'Sui',
      coinSubtext: 'uSUI',
    },
    bottomSectionData: {
      price: '$2.28',
      percentage: '+2.49%',
    },
  },
  {
    topSectionData: {
      coinImage: '/images/USDC.svg',
      coinName: 'Sui Token',
      coinSubtext: 'SUI-USDT',
    },
    bottomSectionData: {
      price: '$3.12',
      percentage: '-1.75%',
    },
  },
  {
    topSectionData: {
      coinImage: '/images/USDC.svg',
      coinName: 'Sui Network',
      coinSubtext: 'uNetwork',
    },
    bottomSectionData: {
      price: '$1.75',
      percentage: '+0.84%',
    },
  },
  {
    topSectionData: {
      coinImage: '/images/USDC.svg',
      coinName: 'Sui Protocol',
      coinSubtext: 'Protocol Token',
    },
    bottomSectionData: {
      price: '$2.90',
      percentage: '+3.05%',
    },
  },
];
