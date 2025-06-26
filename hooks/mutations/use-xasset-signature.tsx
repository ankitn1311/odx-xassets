import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/utils/axiosConfig';
import { CosignerData, NonceManager, V2DutchOrderBuilder } from '@uniswap/uniswapx-sdk';
import { ethers as ethersV5 } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import { WalletClient, createWalletClient, custom } from 'viem';
import { PERMIT_TESTNET_ADDRESS } from '@/utils/chain-client/txs/constants';
import { TradeState, useTokenSwapStore } from '@/stores/token-swap-store';
import axios, { AxiosError } from 'axios';

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

type OrderStatus =
  | 'VALIDATED'
  | 'PROCESSED'
  | 'ERROR'
  | 'FAILED'
  | 'PROCESSING'
  | 'CUSTODY_TRANSFER_START'
  | 'CUSTODY_TRANSFER_COMPLETE'
  | 'CUSTODY_TRANSFER_FAILED';

interface OrderStatusResponse {
  executionName: string;
  status: OrderStatus;
  swapper: string;
  timestamp: string;
  processedAt: any;
  completedAt: any;
  txHash: any;
}

const POLL_INTERVAL = 2000; // 2 seconds

// Add Base chain configuration
// EXECUTOR
const BASE_REACTOR = '0x0369e0ED08aabE340e7A77f1D39198BB986233e0'; // Replace with actual reactor address
const BASE_PERMIT2 = PERMIT_TESTNET_ADDRESS; // Base chain Permit2 address
const COSIGNER_ADDRESS = '0x3343dB95afe77eA40Cd1333b627A70E16c285ad9';

// Configure Permit2 addresses for different chains
const CHAIN_PERMIT2_CONFIG = {
  8453: BASE_PERMIT2, // Base
  84531: BASE_PERMIT2, // Base Sepolia
  64165: BASE_PERMIT2, // Sonic testnet
  57054: BASE_PERMIT2, // Sonic testnet
} as const;

const BASE_URL = 'https://gm6urhv0gd.execute-api.ap-northeast-1.amazonaws.com/prod';

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
      const response = await axios.post(`${BASE_URL}/`, {
        order: data.serialized_order,
        signature: data.signature,
      });
      // const response = await api.AXIOS(
      //   {
      //     url: '/order/v1/signature',
      //     method: 'POST',
      //     data,
      //   },
      //   'pricefeed'
      // );

      return response.data;
    },
  });

  const cosignatureMutation = useMutation({
    mutationFn: async (data: CosignatureData) => {
      const response = await axios.post(`${BASE_URL}/cosign`, {
        cosignHash: data.cosign_hash,
      });

      // const response = await api.AXIOS(
      //   {
      //     url: '/order/v1/cosign',
      //     method: 'POST',
      //     data,
      //   },
      //   'pricefeed'
      // );

      return response.data;
    },
  });

  const checkOrderStatus = async (orderId: string): Promise<OrderStatusResponse> => {
    try {
      const response = await axios.get(`${BASE_URL}/status/${orderId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error?.response?.status === 404) {
          console.log('Order not found, returning default status');
          return {
            executionName: orderId,
            status: 'VALIDATED',
            swapper: '0xFB423C2431747681D737c1ee5c81Ab00Cc2841CC',
            timestamp: new Date().toISOString(),
            processedAt: null,
            completedAt: null,
            txHash: null,
          };
        }
      }
      console.error('Error checking order status:', error);
      throw error;
    }
  };

  const getSignatureAndSerializedOrderV2 = async (data: SigData, wallet: WalletClient) => {
    console.log('Starting getSignatureAndSerializedOrderV2 with data:', data);

    if (!wallet) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }
    console.log('Wallet connected:', wallet);

    if (!address) {
      throw new Error('No account address found. Please connect your wallet first.');
    }
    console.log('Address found:', address);

    const account = await wallet.getAddresses();
    if (!account[0]) {
      throw new Error('No account found');
    }
    console.log('Account addresses:', account);

    // Create a provider and signer using wallet client
    const walletClient = createWalletClient({
      transport: custom(wallet.transport),
    });
    console.log('Wallet client created:', walletClient);

    // Create ethers provider from wallet client
    const provider = new ethersV5.providers.Web3Provider(walletClient.transport);
    console.log('Provider created:', provider);

    const signer = provider.getSigner(account[0]);
    console.log('Signer created:', signer);

    const signerAccount = await signer.getAddress();
    console.log('Signer account address:', signerAccount);

    const chainId = wallet.chain?.id;
    if (!chainId) {
      toast.error('Chain ID not found');
      throw new Error('Chain ID not found');
    }
    console.log('Chain ID:', chainId);

    // Use the provider for NonceManager with permit2 configuration
    const nonceMgr = new NonceManager(provider, chainId, BASE_PERMIT2);
    console.log('Nonce manager created:', nonceMgr);

    const nonce = await nonceMgr.useNonce(signerAccount);
    console.log('Nonce obtained:', nonce);

    // const builder = new DutchOrderBuilder(chainId, BASE_REACTOR, BASE_PERMIT2);
    const v2Builder = new V2DutchOrderBuilder(chainId, BASE_REACTOR, BASE_PERMIT2);
    console.log('V2 Dutch order builder created:', v2Builder);

    // Set deadline to 20 minutes from now (in seconds)
    // const deadline = Math.floor(Date.now() / 1000) + 1000;
    const now = Math.floor(Date.now() / 1000);
    const startTime = now;
    const endTime = now + 3600; // 1 hour duration
    const deadline = now + 7200; //
    console.log(
      'dat',
      data
      // ethersV5.utils.parseUnits(data.output_amount, data.output_decimals),
      // ethersV5.utils.parseUnits(data.amount, data.input_decimals)
    );
    console.log(
      'Time parameters - now:',
      now,
      'startTime:',
      startTime,
      'endTime:',
      endTime,
      'deadline:',
      deadline
    );

    // console.log('DATA', data);
    // return;
    //
    //
    const inputAmount = ethersV5.utils.parseUnits(
      Number(data.amount).toFixed(6),
      data.input_decimals
    );
    const outputAmount = ethersV5.utils.parseUnits(
      Number(data.output_amount).toFixed(18),
      data.output_decimals
    );
    console.log('amounts', inputAmount, outputAmount, data);

    const cosignerData: CosignerData = {
      decayStartTime: startTime,
      decayEndTime: endTime,
      exclusiveFiller: BASE_REACTOR,
      exclusivityOverrideBps: inputAmount,
      inputOverride: inputAmount,
      outputOverrides: [outputAmount],
    };
    console.log('Cosigner data created:', cosignerData);

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
        startAmount: inputAmount,
        endAmount: inputAmount,
      })
      .output({
        token: data.output_token,
        startAmount: outputAmount,
        endAmount: outputAmount,
        // .mul(90)
        // .div(100),
        recipient: data.user_address,
      })
      .cosignerData(cosignerData)
      .inputOverride(inputAmount)
      .outputOverrides([outputAmount]);
    console.log('V2 Builder configured with all parameters');

    let order = v2Builder.build();
    console.log('Initial order built:', order);

    const hash = order.cosignatureHash(cosignerData);
    console.log('Cosignature hash generated:', hash);

    const cosignature = await cosignatureMutation.mutateAsync({
      cosign_hash: hash,
    });
    console.log('Cosignature received:', cosignature);

    order = v2Builder.cosignature(cosignature.cosignature).build();
    console.log('Final order built with cosignature:', order);

    const { domain, types, values } = order.permitData();
    console.log('Permit data extracted - domain:', domain, 'types:', types, 'values:', values);

    const signature = await signer._signTypedData(domain, types, values);
    console.log('Signature generated:', signature);

    const serializedOrder = order.serialize();
    console.log('Order serialized:', serializedOrder);
    console.log('Final result - signature:', signature, 'serializedOrder:', serializedOrder);

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

      // const sigData = await sigDataMutation.mutateAsync(data);
      const signatureAndSerializedOrder = await getSignatureAndSerializedOrderV2(data, wallet);
      const result = await signatureMutation.mutateAsync({
        ...data,
        input_token: data.token,
        signature: signatureAndSerializedOrder.signature,
        serialized_order: signatureAndSerializedOrder.serializedOrder,
      });
      console.log('result', result);

      // Start polling for order status
      let orderStatus: OrderStatusResponse;

      // status - VALIDATED , PROCESSED , ERROR

      let attempts = 0;
      do {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        orderStatus = await checkOrderStatus(result?.executionName);
        console.log('orderStatus', orderStatus);
        attempts++;
      } while (
        (orderStatus.status === 'VALIDATED' ||
          orderStatus.status === 'PROCESSING' ||
          orderStatus.status === 'CUSTODY_TRANSFER_START' ||
          orderStatus.status === 'CUSTODY_TRANSFER_COMPLETE') &&
        attempts < 20
      );

      const txHash = orderStatus.txHash;

      if (orderStatus.status === 'PROCESSED') {
        toast.success('Transaction successful', {
          description: (
            // <a href={`https://testnet.sonicscan.org/tx/${txHash}`} target="_blank">
            <a href={`https://sonicscan.org/tx/${txHash}`} target="_blank">
              View on Sonicscan
            </a>
          ),
        });
        setTradeState(TradeState.SUCCESS);
        setLatestTradeHash(txHash);
      } else if (
        orderStatus.status === 'ERROR' ||
        orderStatus.status === 'FAILED' ||
        orderStatus.status === 'CUSTODY_TRANSFER_FAILED'
      ) {
        toast.error('Transaction failed');
        setTradeState(TradeState.FAILED);
        throw new Error('Transaction failed');
      } else if (
        orderStatus.status === 'VALIDATED' ||
        orderStatus.status === 'PROCESSING' ||
        orderStatus.status === 'CUSTODY_TRANSFER_START' ||
        orderStatus.status === 'CUSTODY_TRANSFER_COMPLETE'
      ) {
        toast.info('Transaction pending', {
          description: txHash ? (
            // <a href={`https://testnet.sonicscan.org/tx/${txHash}`} target="_blank">
            <a href={`https://sonicscan.org/tx/${txHash}`} target="_blank">
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
