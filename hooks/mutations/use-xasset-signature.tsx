import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/utils/axiosConfig';
import { CosignerData, NonceManager, V2DutchOrderBuilder } from '@uniswap/uniswapx-sdk';
import { ethers as ethersV5 } from 'ethers';
import { useWalletClient, useAccount } from 'wagmi';
import { WalletClient, createWalletClient, custom } from 'viem';
import { TradeState, useTokenSwapStore } from '@/stores/token-swap-store';
import axios, { AxiosError } from 'axios';
import { Copy } from 'lucide-react';
import { useCopyToClipboard } from 'usehooks-ts';
import { getCurrentBaseUrl } from '@/lib/utils';
import { getBalance } from '@/utils/chain-client/txs/create_trade';
import { delay } from '@/utils/helper';

interface SigData {
  user_address: string;
  token: string;
  amount: string;
  output_token: string;
  input_decimals: number;
  output_decimals: number;
  output_amount: string;
  slippage: number;
}

interface SigDataWithSignature extends SigData {
  input_token: string;
  signature: string;
  serialized_order: string;
}

interface CosignatureData {
  cosign_hash: string;
}

const POLL_INTERVAL = 2000; // 2 seconds

// Add Base chain configuration
// EXECUTOR
const BASE_REACTOR = '0x0369e0ED08aabE340e7A77f1D39198BB986233e0'; // Replace with actual reactor address
const BASE_PERMIT2 = '0x000000000022D473030F116dDEE9F6B43aC78BA3'; // Base chain Permit2 address
const COSIGNER_ADDRESS = '0x3343dB95afe77eA40Cd1333b627A70E16c285ad9';

// Configure Permit2 addresses for different chains
const CHAIN_PERMIT2_CONFIG = {
  8453: BASE_PERMIT2, // Base
  84531: BASE_PERMIT2, // Base Sepolia
  64165: BASE_PERMIT2, // Sonic testnet
  57054: BASE_PERMIT2, // Sonic testnet
} as const;

const ERROR_STATES = [
  'VALIDATION_FAILED',
  'CUSTODY_PURCHASE_FAILED',
  'CUSTODY_VERIFIER_FAILED',
  'FAILED',
] as const;
const PENDING_STATES = [
  'VALIDATED',
  'CUSTODY_PURCHASE_START',
  'CUSTODY_PURCHASE_COMPLETE',
  'CUSTODY_VERIFIER_START',
  'CUSTODY_VERIFIER_SUCCESS',
  'PROCESSING',
  'PROCESSED',
] as const;

const SUCCESS_STATES = ['POINTS_AWARDED'] as const;

type SuccessStatus = (typeof SUCCESS_STATES)[number];
type ErrorStatus = (typeof ERROR_STATES)[number];
type PendingStatus = (typeof PENDING_STATES)[number];

type OrderStatus = SuccessStatus | ErrorStatus | PendingStatus;

interface OrderStatusResponse {
  executionName: string;
  status: OrderStatus;
  swapper: string;
  timestamp: string;
  processedAt: any;
  completedAt: any;
  txHash: any;
  errorMessage: any;
  custodyTxHash: any;
  orderQtyRequested: string;
  orderPrice: string;
  avgFillPrice: string;
  cmltvValue: string;
  cmltvQty: string;
  cmltvFees: string;
}

export const useXAssetSignature = () => {
  const { data: wallet, isError, error } = useWalletClient();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { setTradeState, setLatestTradeHash, setIsBalanceUpdating } = useTokenSwapStore();
  const [, copyToClipboard] = useCopyToClipboard();

  // Function to update balances by polling until they change
  const updateBalancesAfterTransaction = async (
    data: SigData,
    initialInputBalance: string,
    initialOutputBalance: string
  ) => {
    if (!wallet) return;

    // Set global state to indicate balances are updating
    setIsBalanceUpdating(true);

    // Poll for balance changes
    let attempts = 0;
    const maxAttempts = 30; // Maximum 30 attempts (30 seconds)

    while (attempts < maxAttempts) {
      await delay(1000); // Wait 1 second between checks

      const newInputBalance = await getBalance(wallet, data.token, data.input_decimals);
      const newOutputBalance = await getBalance(wallet, data.output_token, data.output_decimals);

      // Check if either balance has changed
      if (newInputBalance !== initialInputBalance || newOutputBalance !== initialOutputBalance) {
        // Update the query cache with new balances
        queryClient.setQueryData(
          ['token-balance', data.token, data.input_decimals],
          newInputBalance
        );
        queryClient.setQueryData(
          ['token-balance', data.output_token, data.output_decimals],
          newOutputBalance
        );

        // Reset balance updating state
        setIsBalanceUpdating(false);
        return;
      }

      attempts++;
    }

    // Reset balance updating state on timeout
    setIsBalanceUpdating(false);
    console.warn('Balance update polling timed out after', maxAttempts, 'attempts');
  };

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

  // Function to check if a nonce is already in use
  const checkNonceInUse = async (
    provider: ethersV5.providers.Web3Provider,
    signerAccount: string,
    nonce: ethersV5.BigNumber
  ): Promise<boolean> => {
    try {
      // Get the current transaction count (nonce) from the blockchain
      const currentNonce = await provider.getTransactionCount(signerAccount, 'pending');
      // Convert to BigNumber for consistent comparison with the nonce parameter
      const currentNonceBN = ethersV5.BigNumber.from(currentNonce);
      console.log(`Current pending nonce: ${currentNonce}, checking nonce: ${nonce.toString()}`);

      // If the nonce we want to use is less than the current nonce, it's already been used
      if (nonce.lt(currentNonceBN)) {
        console.log(
          `Nonce ${nonce.toString()} is already used (current pending nonce: ${currentNonce})`
        );
        return true;
      }

      // Check if there are any pending transactions with this nonce
      // This is a more thorough check but may not be available on all networks
      try {
        const latestNonce = await provider.getTransactionCount(signerAccount, 'latest');
        // Convert to BigNumber for consistent comparison
        const latestNonceBN = ethersV5.BigNumber.from(latestNonce);
        console.log(`Latest confirmed nonce: ${latestNonce}`);

        if (nonce.lt(latestNonceBN)) {
          console.log(
            `Nonce ${nonce.toString()} is already confirmed (latest nonce: ${latestNonce})`
          );
          return true;
        }
      } catch (error) {
        // If we can't get the latest nonce, fall back to the pending check
        console.warn('Could not check latest nonce, using pending nonce only:', error);
      }

      console.log(`Nonce ${nonce.toString()} appears to be safe to use`);
      return false;
    } catch (error) {
      console.error('Error checking nonce status:', error);
      // If we can't check, assume it's safe to use but log the warning
      console.warn('Assuming nonce is safe due to error in checking');
      return false;
    }
  };

  // Function to generate a unique nonce for concurrent users
  const generateUniqueNonce = async (
    provider: ethersV5.providers.Web3Provider,
    signerAccount: string,
    nonceMgr: NonceManager
  ): Promise<ethersV5.BigNumber> => {
    // Get the base nonce from NonceManager
    const baseNonce = await nonceMgr.useNonce(signerAccount);

    // Get current blockchain nonce for this user
    const blockchainNonce = await provider.getTransactionCount(signerAccount, 'pending');
    const blockchainNonceBN = ethersV5.BigNumber.from(blockchainNonce);

    console.log(`Base nonce from NonceManager: ${baseNonce.toString()}`);
    console.log(`Current blockchain nonce for user: ${blockchainNonce}`);

    // Strategy 1: Use blockchain nonce + offset to ensure uniqueness
    let uniqueNonce = blockchainNonceBN.add(1); // Start with next available blockchain nonce

    // Strategy 2: If NonceManager nonce is higher, use that with additional offset
    if (baseNonce.gt(blockchainNonceBN)) {
      // Use the higher of the two, but add a small offset for safety
      uniqueNonce = baseNonce.add(1);
    }

    // Strategy 3: Add timestamp-based offset for additional uniqueness
    const timestamp = Math.floor(Date.now() / 1000);
    const timestampOffset = ethersV5.BigNumber.from(timestamp % 1000); // Use last 3 digits of timestamp
    uniqueNonce = uniqueNonce.add(timestampOffset);

    console.log(`Generated unique nonce: ${uniqueNonce.toString()}`);
    return uniqueNonce;
  };

  // Function to get a safe nonce with collision detection
  const getSafeNonce = async (
    provider: ethersV5.providers.Web3Provider,
    signerAccount: string,
    nonceMgr: NonceManager
  ): Promise<ethersV5.BigNumber> => {
    // Generate a unique nonce that's less likely to collide
    let nonce = await generateUniqueNonce(provider, signerAccount, nonceMgr);
    let attempts = 0;
    const maxAttempts = 10; // Increased attempts for better collision resolution

    console.log(`Initial unique nonce generated: ${nonce.toString()}`);

    while ((await checkNonceInUse(provider, signerAccount, nonce)) && attempts < maxAttempts) {
      console.warn(`Nonce ${nonce.toString()} is already in use, generating new unique nonce`);

      // Generate a completely new unique nonce instead of just incrementing
      nonce = await generateUniqueNonce(provider, signerAccount, nonceMgr);
      attempts++;
      console.log(`Attempt ${attempts}: generated new nonce ${nonce.toString()}`);
    }

    if (attempts >= maxAttempts) {
      console.error('Failed to find a safe nonce after multiple attempts');
      throw new Error(
        'Unable to find a safe nonce for transaction after multiple attempts. Please try again.'
      );
    }

    if (attempts > 0) {
      console.log(`Found safe nonce after ${attempts} attempts: ${nonce.toString()}`);
    } else {
      console.log(`Using initial unique nonce: ${nonce.toString()}`);
    }

    return nonce;
  };

  const signatureMutation = useMutation({
    mutationFn: async (data: SigDataWithSignature) => {
      const response = await axios.post(`${getCurrentBaseUrl()}/`, {
        order: data.serialized_order,
        signature: data.signature,
      });

      return response.data;
    },
  });

  const cosignatureMutation = useMutation({
    mutationFn: async (data: CosignatureData) => {
      const response = await axios.post(`${getCurrentBaseUrl()}/cosign`, {
        cosignHash: data.cosign_hash,
      });

      return response.data;
    },
  });

  const checkOrderStatus = async (orderId: string): Promise<OrderStatusResponse> => {
    try {
      const response = await axios.get<OrderStatusResponse>(
        `${getCurrentBaseUrl()}/status/${orderId}`
      );
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
            errorMessage: null,
            custodyTxHash: null,
            orderQtyRequested: '0',
            orderPrice: '0',
            avgFillPrice: '0',
            cmltvValue: '0',
            cmltvQty: '0',
            cmltvFees: '0',
          };
        }
      }
      console.error('Error checking order status:', error);
      throw error;
    }
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
    // Get a safe nonce that's not already in use (returns BigNumber)
    const nonce = await getSafeNonce(provider, signerAccount, nonceMgr);

    // const builder = new DutchOrderBuilder(chainId, BASE_REACTOR, BASE_PERMIT2);
    const v2Builder = new V2DutchOrderBuilder(chainId, BASE_REACTOR, BASE_PERMIT2);

    // Set deadline to 20 minutes from now (in seconds)
    // const deadline = Math.floor(Date.now() / 1000) + 1000;
    const now = Math.floor(Date.now() / 1000);
    const startTime = now;
    const endTime = now + 3600; // 1 hour duration
    const deadline = now + 7200; //

    const inputAmount = ethersV5.utils.parseUnits(
      Number(data.amount).toFixed(data.input_decimals),
      data.input_decimals
    );
    const outputAmount = ethersV5.utils.parseUnits(
      Number(data.output_amount).toFixed(data.output_decimals),
      data.output_decimals
    );

    // Calculate output amounts with slippage
    // For Market orders: startAmount is the minimum (worst case), endAmount can be higher (best case)
    // slippage is applied to set the minimum amount the user will accept, but they can get more
    // const slippageMultiplier = (100 - data.slippage) / 100; // Convert percentage to decimal
    // const minimumOutputAmount = outputAmount
    //   .mul(ethersV5.BigNumber.from(Math.floor(slippageMultiplier * 10000)))
    //   .div(10000);

    // // For Market orders: startAmount is minimum, endAmount can be higher
    // // This allows users to benefit from price improvements
    // const maximumOutputAmount = outputAmount
    //   .mul(ethersV5.BigNumber.from(Math.floor((100 + data.slippage) * 100)))
    //   .div(10000);

    const cosignerData: CosignerData = {
      decayStartTime: startTime,
      decayEndTime: endTime,
      exclusiveFiller: BASE_REACTOR,
      exclusivityOverrideBps: inputAmount,
      inputOverride: inputAmount,
      outputOverrides: [outputAmount],
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
        startAmount: inputAmount,
        endAmount: inputAmount,
      })
      .output({
        token: data.output_token,
        startAmount: outputAmount,
        endAmount: outputAmount,
        recipient: data.user_address,
      })
      .cosignerData(cosignerData)
      .inputOverride(inputAmount)
      .outputOverrides([outputAmount]);

    let order = v2Builder.build();
    console.log('Initial order built:', order);

    const hash = order.cosignatureHash(cosignerData);

    const cosignature = await cosignatureMutation.mutateAsync({
      cosign_hash: hash,
    });

    order = v2Builder.cosignature(cosignature.cosignature).build();

    const { domain, types, values } = order.permitData();

    const signature = await signer._signTypedData(domain, types, values);

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

      // Store initial balances before the transaction starts
      // Get input balance from query cache
      const cachedInputBalance = queryClient.getQueryData([
        'token-balance',
        data.token,
        data.input_decimals,
      ]);
      const initialInputBalance =
        cachedInputBalance && typeof cachedInputBalance === 'string'
          ? cachedInputBalance
          : await getBalance(wallet, data.token, data.input_decimals);

      // Get output balance from query cache
      const cachedOutputBalance = queryClient.getQueryData([
        'token-balance',
        data.output_token,
        data.output_decimals,
      ]);
      const initialOutputBalance =
        cachedOutputBalance && typeof cachedOutputBalance === 'string'
          ? cachedOutputBalance
          : await getBalance(wallet, data.output_token, data.output_decimals);

      // const sigData = await sigDataMutation.mutateAsync(data);
      const signatureAndSerializedOrder = await getSignatureAndSerializedOrderV2(data, wallet);
      const result = await signatureMutation.mutateAsync({
        ...data,
        input_token: data.token,
        signature: signatureAndSerializedOrder.signature,
        serialized_order: signatureAndSerializedOrder.serializedOrder,
      });
      // Start polling for order status
      let orderStatus: OrderStatusResponse;
      // status - VALIDATED , PROCESSED , ERROR

      let attempts = 0;
      do {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        orderStatus = await checkOrderStatus(result?.executionName);
        console.log('TRADE STATUS: ', orderStatus.status);
        attempts++;
      } while (
        PENDING_STATES.includes(orderStatus.status as (typeof PENDING_STATES)[number]) &&
        attempts < 20
      );

      const txHash = orderStatus.txHash;

      if (SUCCESS_STATES.includes(orderStatus.status as SuccessStatus)) {
        if (orderStatus.errorMessage) {
          setTradeState(TradeState.FAILED);
          throw new Error(`FAILED_${orderStatus.executionName}`);
        }
        // Wait for transaction confirmation before invalidating queries
        // if (txHash) {
        //   try {
        //     // Wait for a few block confirmations
        //     await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
        //   } catch (error) {
        //     console.warn('Error waiting for confirmation:', error);
        //   }
        // }

        toast.success('Transaction successful', {
          description: (
            <a href={`https://sonicscan.org/tx/${txHash}`} target="_blank">
              View on Sonicscan
            </a>
          ),
        });
        setTradeState(TradeState.SUCCESS);
        setLatestTradeHash(txHash);

        // Start updating balances after successful transaction
        updateBalancesAfterTransaction(data, initialInputBalance, initialOutputBalance);
      } else if (ERROR_STATES.includes(orderStatus.status as ErrorStatus)) {
        if (
          orderStatus.status === 'VALIDATION_FAILED' &&
          orderStatus.errorMessage &&
          orderStatus.errorMessage.includes('whitelist')
        ) {
          setTradeState(TradeState.FAILED);
          throw new Error('Address used to trade is not whitelisted');
        }
        setTradeState(TradeState.FAILED);
        throw new Error(`FAILED_${orderStatus.executionName}`);
      } else if (PENDING_STATES.includes(orderStatus.status as PendingStatus)) {
        toast.info('Transaction pending', {
          description: txHash ? (
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
      if (error instanceof Error && error.message.includes('FAILED_')) {
        const errorMessage = 'Transaction failed';
        const description = (
          <div
            className="flex cursor-pointer items-center gap-2"
            onClick={() => {
              copyToClipboard(error.message.replace('FAILED_', ''));
              toast.success('Error copied to clipboard', {
                description: 'Send this to support on discord',
              });
            }}
          >
            <p>Copy error and reach out to support on discord</p>
            <Copy className="h-4 w-4" />
          </div>
        );
        toast.error(errorMessage, {
          description,
        });
      } else {
        toast.error(error instanceof Error ? error.message : 'Transaction failed');
      }
      setTradeState(TradeState.FAILED);
      throw error;
    }
  };

  return {
    submitSignature,
    isLoading: sigDataMutation.isPending || signatureMutation.isPending,
  };
};
