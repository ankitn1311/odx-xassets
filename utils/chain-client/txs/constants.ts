import {
  getCurrentPermit2Address,
  getCurrentReactorAddress,
  getCurrentCosignerAddress,
} from '@/lib/utils';

export const targetRouterAddress = '0x09D1f7743834cf9f784F94b799609f0Ac77e0b4E';
// export const xUSDTAddress = '0x2d4b1eDa9514675a9F8CB13b3f3a7475ebb81024';
export const xUSDTAddress = '0x5A91D3042b71A92f6757Fa937763D03Cc65ED8BC';
export const xstETHAddress = '0xE46C5cFfcFe4DE4dBa431c48f2ea23C2a6fA1A10';
export const assetFactoryAddress = '0xDdd65132D3BC0F10AF425EC0DfD1B0Eaf72F8C15';

export const stETHAddress = '0x7Abc10792A56ceDd3d9d311F1D58ACcf520eb985';
export const xUSDCAddress = '0x79501d1987bb666F53bAa87cC88F24f29cE63391';

export const riftAddress = '0xed65cD422021E4834E19e367d9e899B3846BbDa0';
export const xRiftAddress = '0x0BD6616745303D9cB38EC5CD65338C5C07e00826';
export const cultAddress = '0xDFFf130eA54683B08e6f728E27Fb6016438A4c84';
export const xCultAddress = '0x6CD65b4f9A097F446b3aF0Da592d7f2980bEE361';
export const nadeAddress = '0xCd9bB774E8F885A8e15C8Aaea8D3B5dEd45bE9A3';
export const xNadeAddress = '0x956bD6cbB139BFC0e7B6c1585E3C8987e32ccF03';
export const novaAddress = '0xBbA25A3bD61F553Ed43474C5D670cE8FB2f6B09a';
export const xNovaAddress = '0x8E30d6a55F2E18dD9Afb10a58170B1B4F4A9Bc7e';
export const wishAddress = '0x1c3c4FDE30257A1950e24F317e0924d5f18EBeef';
export const xWishAddress = '0x8f31bEcc391eFdd23C1f2FfA85AceFad2B4f8E39';

export const XUSDT_DECIMALS = 18;
export const XSTETH_DECIMALS = 18;

export const nativeToXAssetMapping = {
  STETH: 'xstETH',
  XUSDC: 'xUSDT',
  RIFT: 'xRIFT',
  CULT: 'xCULT',
  NADE: 'xNADE',
  NOVA: 'xNOVA',
  WISH: 'xWISH',
};

export const xAssetToNativeMapping = {
  xstETH: 'STETH',
  xUSDT: 'XUSDC',
  xRIFT: 'RIFT',
  xCULT: 'CULT',
  xNADE: 'NADE',
  xNOVA: 'NOVA',
  xWISH: 'WISH',
};

export const nativeAddressToXAssetAddressMapping = {
  [stETHAddress]: xstETHAddress,
  [xUSDCAddress]: xUSDTAddress,
  [riftAddress]: xRiftAddress,
  [cultAddress]: xCultAddress,
  [nadeAddress]: xNadeAddress,
  [novaAddress]: xNovaAddress,
  [wishAddress]: xWishAddress,
};

export const xAssetAddressToNativeAddressMapping = {
  [xstETHAddress]: stETHAddress,
  [xUSDTAddress]: xUSDCAddress,
  [xRiftAddress]: riftAddress,
  [xCultAddress]: cultAddress,
  [xNadeAddress]: nadeAddress,
  [xNovaAddress]: novaAddress,
  [xWishAddress]: wishAddress,
};

export const xChainToChainMapping = {
  BASE1: 'BASE',
  OP1: 'OP',
  ETH1: 'ETH',
  BSC1: 'BSC',
  ARB1: 'ARB',
  ARBI1: 'ARBI',
  POL1: 'POL',
  SOL1: 'SOL',
  BERA1: 'BERA',
  MANTLE1: 'MANTLE',
  BTC1: 'BTC',
};

export const PERMIT2_ADDRESS =
  getCurrentPermit2Address() || '0x000000000022D473030F116dDEE9F6B43aC78BA3';

export const REACTOR_ADDRESS =
  getCurrentReactorAddress() || '0x0369e0ED08aabE340e7A77f1D39198BB986233e0';

export const COSIGNER_ADDRESS =
  getCurrentCosignerAddress() || '0x3343dB95afe77eA40Cd1333b627A70E16c285ad9';

// ODXDEX ABI - only including what we need for swapping
export const ODXDEX_ABI = [
  'function getReserves(address tokenA, address tokenB) public view returns (uint256 reserveA, uint256 reserveB)',
  'function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)',
  'event Swap(address indexed sender, uint256 amountIn, uint256 amountOut, address indexed tokenIn, address indexed tokenOut, address to)',
];
