import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/utils/axiosConfig';
import {
  CosignerData,
  DutchOrder,
  DutchOrderBuilder,
  NonceManager,
  V2DutchOrderBuilder,
} from '@uniswap/uniswapx-sdk';
import { constants, ethers as ethersV6 } from 'ethers';
import { ethers as ethersV5 } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import { WalletClient, createWalletClient, custom } from 'viem';
import { PERMIT_TESTNET_ADDRESS } from '@/utils/chain-client/txs/constants';
import { TradeState, useTokenSwapStore } from '@/stores/token-swap-store';

interface SigData {
  user_address: string;
  token: string;
  amount: string;
  output_token: string;
  input_decimals: number;
  output_decimals: number;
  output_amount: string;
}

interface SigDataWithSignature extends SigData {
  input_token: string;
  signature: string;
  serialized_order: string;
}

interface CosignatureData {
  cosign_hash: string;
}

interface OrderStatusResponse {
  Status: number;
  UserAddress: string;
  InputToken: string;
  Amount: string;
  OutputToken: string;
  Th: string;
}

const OrderStatus = {
  Open: 0,
  Filled: 1,
  Failed: 2,
} as const;

const POLL_INTERVAL = 2000; // 2 seconds

// Add Base chain configuration
// EXECUTOR
const BASE_REACTOR = '0x9dA0Ca5FaF06F0294abCa89cB34213F09faD97B9'; // Replace with actual reactor address
const BASE_PERMIT2 = PERMIT_TESTNET_ADDRESS; // Base chain Permit2 address
const COSIGNER_ADDRESS = '0x8A8Cc1469bE57118542FE9c3fF5f0011C9132e73';

// Configure Permit2 addresses for different chains
const CHAIN_PERMIT2_CONFIG = {
  8453: BASE_PERMIT2, // Base
  84531: BASE_PERMIT2, // Base Sepolia
  64165: BASE_PERMIT2, // Sonic testnet
  57054: BASE_PERMIT2, // Sonic testnet
} as const;

export const useXAssetSignature = () => {
  const { data: wallet, isError, error } = useWalletClient();
  const { address } = useAccount();
  const { setTradeState, setLatestTradeHash } = useTokenSwapStore();

  const sigDataMutation = useMutation({
    mutationFn: async (data: SigData) => {
      const response = await api.AXIOS(
        {
          url: '/order/v1/sig-data',
          method: 'POST',
          data,
        },
        'pricefeed'
      );

      return response;
    },
  });

  const signatureMutation = useMutation({
    mutationFn: async (data: SigDataWithSignature) => {
      const response = await api.AXIOS(
        {
          url: '/order/v1/signature',
          method: 'POST',
          data,
        },
        'pricefeed'
      );

      return response;
    },
  });

  const cosignatureMutation = useMutation({
    mutationFn: async (data: CosignatureData) => {
      const response = await api.AXIOS(
        {
          url: '/order/v1/cosign',
          method: 'POST',
          data,
        },
        'pricefeed'
      );

      return response;
    },
  });

  const checkOrderStatus = async (orderId: string): Promise<OrderStatusResponse> => {
    const response = await api.AXIOS(
      {
        url: `/order/v1/id/${orderId}`,
        method: 'GET',
      },
      'pricefeed'
    );
    return response;
  };

  const getSignatureAndSerializedOrderV2 = async (data: SigData, wallet: WalletClient) => {
    if (!wallet) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    if (!address) {
      throw new Error('No account address found. Please connect your wallet first.');
    }

    const account = await wallet.getAddresses();
    if (!account[0]) {
      throw new Error('No account found');
    }

    // Create a provider and signer using wallet client
    const walletClient = createWalletClient({
      transport: custom(wallet.transport),
    });

    // Create ethers provider from wallet client
    const provider = new ethersV5.providers.Web3Provider(walletClient.transport);
    const signer = provider.getSigner(account[0]);
    const signerAccount = await signer.getAddress();

    const chainId = wallet.chain?.id;
    if (!chainId) {
      toast.error('Chain ID not found');
      throw new Error('Chain ID not found');
    }

    // Use the provider for NonceManager with permit2 configuration
    const nonceMgr = new NonceManager(provider, chainId, BASE_PERMIT2);
    const nonce = await nonceMgr.useNonce(signerAccount);

    // const builder = new DutchOrderBuilder(chainId, BASE_REACTOR, BASE_PERMIT2);
    const v2Builder = new V2DutchOrderBuilder(chainId, BASE_REACTOR, BASE_PERMIT2);
    // Set deadline to 20 minutes from now (in seconds)
    // const deadline = Math.floor(Date.now() / 1000) + 1000;
    const now = Math.floor(Date.now() / 1000);
    const startTime = now;
    const endTime = now + 3600; // 1 hour duration
    const deadline = now + 7200; //

    const cosignerData: CosignerData = {
      decayStartTime: startTime,
      decayEndTime: endTime,
      exclusiveFiller: BASE_REACTOR,
      exclusivityOverrideBps: ethersV5.utils.parseUnits(data.amount, data.input_decimals),
      inputOverride: ethersV5.utils.parseUnits(data.amount, data.input_decimals),
      outputOverrides: [ethersV5.utils.parseUnits(data.output_amount, data.output_decimals)],
    };

    v2Builder
      .swapper(signerAccount)
      .cosigner(COSIGNER_ADDRESS)
      .cosignature('0x0000')
      .nonce(nonce)
      .deadline(deadline)
      .decayStartTime(startTime)
      .decayEndTime(endTime)
      .input({
        token: data.token,
        startAmount: ethersV5.utils.parseUnits(data.amount, data.input_decimals),
        endAmount: ethersV5.utils.parseUnits(data.amount, data.input_decimals),
      })
      .output({
        token: data.output_token,
        startAmount: ethersV5.utils.parseUnits(data.output_amount, data.output_decimals),
        endAmount: ethersV5.utils.parseUnits(data.output_amount, data.output_decimals),
        // .mul(90)
        // .div(100),
        recipient: data.user_address,
      })
      .cosignerData(cosignerData)
      .inputOverride(ethersV5.utils.parseUnits(data.amount, data.input_decimals))
      .outputOverrides([ethersV5.utils.parseUnits(data.output_amount, data.output_decimals)]);

    let order = v2Builder.build();

    const hash = order.cosignatureHash(cosignerData);
    const cosignature = await cosignatureMutation.mutateAsync({
      cosign_hash: hash,
    });
    order = v2Builder.cosignature(cosignature).build();

    const { domain, types, values } = order.permitData();
    const signature = await signer._signTypedData(domain, types, values);

    const serializedOrder = order.serialize();
    return {
      signature,
      serializedOrder,
    };
  };

  const getSignatureAndSerializedOrder = async (data: SigData, wallet: WalletClient) => {
    if (!wallet) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    if (!address) {
      throw new Error('No account address found. Please connect your wallet first.');
    }

    const account = await wallet.getAddresses();
    if (!account[0]) {
      throw new Error('No account found');
    }

    console.log('ACCOUNT', account);

    // Create a provider and signer using wallet client
    const walletClient = createWalletClient({
      transport: custom(wallet.transport),
    });

    // Create ethers provider from wallet client
    const provider = new ethersV5.providers.Web3Provider(walletClient.transport);
    console.log('PROVIDER', provider);
    const signer = provider.getSigner(account[0]);
    const signerAccount = await signer.getAddress();
    console.log('SIGNER', signer);
    console.log('SIGNER ACCOUNT', signerAccount);

    const chainId = wallet.chain?.id;
    console.log('CHAIN ID', chainId);
    if (!chainId) {
      toast.error('Chain ID not found');
      throw new Error('Chain ID not found');
    }

    // Use the provider for NonceManager with permit2 configuration
    const nonceMgr = new NonceManager(provider, chainId, BASE_PERMIT2);
    console.log('NONCEMGR', nonceMgr);
    const nonce = await nonceMgr.useNonce(signerAccount);
    console.log('NONCE', nonce);

    const builder = new DutchOrderBuilder(chainId, BASE_REACTOR, BASE_PERMIT2);
    console.log('BUILDER', builder);
    // Set deadline to 20 minutes from now (in seconds)
    const deadline = Math.floor(Date.now() / 1000) + 20 * 60;
    console.log('DEADLINE', deadline);
    const order = builder
      .deadline(deadline)
      .decayEndTime(deadline)
      .decayStartTime(deadline - 100)
      .nonce(nonce)
      .swapper(account[0])
      .input({
        token: data.token,
        startAmount: ethersV5.utils.parseUnits(data.amount, data.input_decimals),
        endAmount: ethersV5.utils.parseUnits(data.amount, data.input_decimals),
      })
      .output({
        token: data.output_token,
        startAmount: ethersV5.utils.parseUnits(data.output_amount, data.output_decimals),
        endAmount: ethersV5.utils.parseUnits(data.output_amount, data.output_decimals),
        recipient: data.user_address,
      })
      .build();

    // Sign the built order
    console.log('ORDER', order);
    const { domain, types, values } = order.permitData();
    console.log('DOMAIN', domain);
    console.log('TYPES', types);
    console.log('VALUES', values);
    const signature = await signer._signTypedData(domain, types, values);
    console.log('SIGNATURE', signature);

    const serializedOrder = order.serialize();
    return {
      signature,
      serializedOrder,
    };
  };

  const submitSignature = async (data: SigData) => {
    try {
      if (isError) {
        throw new Error(`Wallet error: ${error?.message}`);
      }

      if (!wallet) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      const sigData = await sigDataMutation.mutateAsync(data);
      console.log('sigData', sigData);
      const signatureAndSerializedOrder = await getSignatureAndSerializedOrderV2(data, wallet);
      console.log('signatureAndSerializedOrder', signatureAndSerializedOrder);
      const result = await signatureMutation.mutateAsync({
        ...data,
        input_token: data.token,
        signature: signatureAndSerializedOrder.signature,
        serialized_order: signatureAndSerializedOrder.serializedOrder,
      });
      console.log('result', result);

      // Start polling for order status
      let orderStatus: OrderStatusResponse;

      let attempts = 0;
      do {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        orderStatus = await checkOrderStatus(result?.ID);
        console.log('orderStatus', orderStatus);
        attempts++;
      } while (orderStatus.Status === OrderStatus.Open && attempts < 10);

      const txHash = orderStatus.Th;

      if (orderStatus.Status === OrderStatus.Filled) {
        toast.success('Transaction successful', {
          description: (
            <a href={`https://testnet.sonicscan.org/tx/${txHash}`} target="_blank">
              View on Sonicscan
            </a>
          ),
        });
        setTradeState(TradeState.SUCCESS);
        setLatestTradeHash(txHash);
      } else if (orderStatus.Status === OrderStatus.Failed) {
        toast.error('Transaction failed');
        setTradeState(TradeState.FAILED);
        throw new Error('Transaction failed');
      } else if (orderStatus.Status === OrderStatus.Open) {
        toast.info('Transaction pending', {
          description: txHash ? (
            <a href={`https://testnet.sonicscan.org/tx/${txHash}`} target="_blank">
              View on Sonicscan
            </a>
          ) : null,
        });
        setTradeState(TradeState.PENDING);
        setLatestTradeHash(txHash);
      }

      return result;
    } catch (error) {
      toast.error('Transaction failed');
      setTradeState(TradeState.FAILED);
      throw error;
    }
  };

  return {
    submitSignature,
    isLoading: sigDataMutation.isPending || signatureMutation.isPending,
  };
};
