import { Chain } from '@rainbow-me/rainbowkit';
import { generateKey, generateKeyPair, subtle } from 'crypto';
import CryptoJS from 'crypto-js';

//The Function Below To Encrypt Text
export const encryptWithAES = ({ text, password }: { text: string; password: string }) => {
  const passphrase = password;
  return CryptoJS.AES.encrypt(text, passphrase).toString();
};

//The Function Below To Decrypt Text
export const decryptWithAES = ({
  ciphertext,
  password,
}: {
  ciphertext: string;
  password: string;
}) => {
  const passphrase = password;
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};

export const shortenAddress = (address: string) => {
  if (!address) return '';
  return address?.toString().slice(0, 5) + '...' + address?.toString().slice(-5);
};

export const shortenAddressWithLength = (address: string, length: number) => {
  if (!address) return '';
  return address?.toString().slice(0, length) + '...' + address?.toString().slice(-length);
};

export const getBtcAddress = async () => {
  const unisat = (window as any).unisat;
  const [address] = await unisat.getAccounts();
  return address || null;
};

export const getBtcBalance = async ({
  address,
  ticker,
}: {
  address: string;
  ticker: string;
}): Promise<any> => {
  const response = await fetch(
    `https://open-api.unisat.io/v1/indexer/address/${address}/brc20/${ticker}/info`,
    {
      method: 'GET',
      headers: {
        Authorization:
          'Bearer ' + '163f34792755a2220c344532ec47839ffafe8a4924da742e909d7f0afaf50198',
      },
    }
  );
  const data = await response.json();
  return data;
};

export const getRunesBalance = async ({
  address,
  runeid,
}: {
  address: string;
  runeid: string;
}): Promise<any> => {
  const response = await fetch(
    `https://open-api.unisat.io/v1/indexer/address/${address}/runes/${runeid}/balance`,
    {
      method: 'GET',
      headers: {
        Authorization:
          'Bearer ' + '163f34792755a2220c344532ec47839ffafe8a4924da742e909d7f0afaf50198',
      },
    }
  );
  const data = await response.json();
  return data;
};

export const getWalletAddressBasedOnTokenChain = ({
  tokenChain,
  btcAddress,
  evmAddress,
}: {
  tokenChain: string;
  btcAddress: string;
  evmAddress: string;
}) => {
  if (!btcAddress || !evmAddress) {
    // SendEventToSentry('No wallet connected but still went to submit transaction');
    console.log('No wallet connected but still went to submit transaction');
    return '';
  }
  if (isBRC20Token(tokenChain)) {
    return btcAddress;
  }
  if (isRunesToken(tokenChain)) {
    return btcAddress;
  }
  return evmAddress;
};

export const remove0xFromAddress = (address: string) => {
  if (address.startsWith('0x') || address.startsWith('0X')) {
    return address.substring(2);
  }
  return address;
};

export const isBRC20Token = (chain: string) => ['BRC20'].includes(chain);
export const isEVMToken = (chain: string) => ['ERC20', 'BASE', 'BITL'].includes(chain);
export const isRunesToken = (chain: string) => ['RUNES'].includes(chain);

/**** CONSTANTS */

export const chainAndTickerMap: { [key: string]: string } = {
  BITL: 'Bitlayer',
  BASE: 'Base',
};

export const chainsConfig = {
  bitlayer: {
    id: 200901,
    name: 'Bitlayer',
    iconUrl: 'https://docs.bitlayer.org/img/FA_Bitlayer-Logo.png',
    iconBackground: '#fff',
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://rpc.bitlayer.org'] },
    },
    blockExplorers: {
      default: { name: 'Btrscan', url: 'https://www.btrscan.com' },
    },
    // contracts: {
    //   multicall3: {
    //     address: '0xca11bde05977b3631167028862be2a173976ca11',
    //     blockCreated: 11_907_934,
    //   },
    // },
  } as const satisfies Chain,
};

export const FAUCET_ADDRESSES: { [key: string]: `0x${string}` } = {
  Base: '0x1F1021e3b376D8028E7D8C65f0b2704F133ff651',
  Bitlayer: '0xCdcd072959dD037c4a62239dd7F787769B0c793f',
};

export const isFaucetSupported = (chainName: string) => ['Base', 'Bitlayer'].includes(chainName);

// const VAULT_ADDRESS = "0xa21ddd2f6db2e1bc5ee29fc714d78212c9793dda";
// export const EVM_VAULT = '0xcf961a8531ad9171cf342e532362256783c9f648'; // TESTNET VAULT

// const BTC_VAULT = B "1Nk1SPdNW2DQYWFij24tggmhndBf2Y81SP";
// export const BTC_VAULT = '1JCX1jsCuiPsPj9nJWrZYCdYnauF99Z1mU';

// const RELAYER_BASE_URL = "http://localhost:3245";
// export const RELAYER_BASE_URL = "https://relayer-testnet.ordinox.xyz";
// export const RELAYER_BASE_URL = "https://relayer-testnet.ordinox.xyz";
//
//



export function findUncompressedAccount(accounts: any[]) {
  for (const account of accounts) {
    if (account.addressFormat == 'ADDRESS_FORMAT_UNCOMPRESSED') {
      return account;
    }
  }
  return undefined;
}

export function findEthAccount(accounts: any[]) {
  for (const account of accounts) {
    if (account.addressFormat === 'ADDRESS_FORMAT_ETHEREUM') {
      return account;
    }
  }
  return undefined;
}
