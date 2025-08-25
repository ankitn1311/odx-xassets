import { ethers } from 'ethers';

// Create a JSON RPC provider for Sonic mainnet
export const SONIC_RPC_URL =
  'https://sonic-mainnet.g.alchemy.com/v2/l2yRk6wTEi_ilQ5R3Pbw0PIIu05PGgAD';

// Export the provider instance for use across the application
export const sonicProvider = new ethers.providers.JsonRpcProvider(SONIC_RPC_URL);

// Export ethers v5 provider for compatibility with existing code
export const sonicProviderV5 = new ethers.providers.JsonRpcProvider(SONIC_RPC_URL);
