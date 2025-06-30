import { Form as FormProvider } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useXAssetSignature } from '@/hooks/mutations/use-xasset-signature';
import { toast } from 'sonner';
import { PERMIT_TESTNET_ADDRESS, XUSDT_DECIMALS } from '@/utils/chain-client/txs/constants';
import { useTokenSwapStore, TradeState } from '@/stores/token-swap-store';
import { useEffect } from 'react';
import { ethers } from 'ethers';
import { erc20Abi } from 'viem';
import { useWalletStore } from '@/stores/wallet-store';
import { useWalletClient } from 'wagmi';
import { SwapScreens } from './SwapScreens';

const swapFormSchema = z.object({
  amount: z.string().refine(val => !isNaN(Number(val)), { message: 'Invalid number' }),
  outputAmount: z.string().refine(val => !isNaN(Number(val)), { message: 'Invalid number' }),
  percentage: z.number().min(0).max(100),
});

export type SwapFormValues = z.infer<typeof swapFormSchema>;

export function TokenSwapForm() {
  const { submitSignature } = useXAssetSignature();
  const {
    numericBalance,
    inputToken,
    outputToken,
    tradeState,
    setTradeState,
    isApproved,
    setIsApproved,
    setLatestTradeHash,
  } = useTokenSwapStore();
  const { connectedWallet } = useWalletStore();

  const form = useForm<SwapFormValues>({
    resolver: zodResolver(swapFormSchema),
    defaultValues: {
      amount: '0',
      outputAmount: '0',
      percentage: 25,
    },
  });

  const { watch } = form;
  const formValues = watch();
  const amount = formValues.amount;
  const { data: wallet } = useWalletClient();

  const resetForm = () => {
    form.reset({
      amount: '0',
      outputAmount: '0',
      percentage: 0,
    });
  };

  // Check USDC approval when amount changes or when input token changes
  useEffect(() => {
    const checkApproval = async () => {
      try {
        if (!wallet) return;
        if (Number(amount) === 0 || isNaN(Number(amount))) return;
        if (tradeState !== TradeState.INITIAL) return;
        setTradeState(TradeState.CHECKING_APPROVAL);
        const provider = new ethers.providers.Web3Provider(wallet as any);
        const xUSDTContract = new ethers.Contract(inputToken?.Address ?? '', erc20Abi, provider);
        const currentAllowance = await xUSDTContract.allowance(
          connectedWallet,
          PERMIT_TESTNET_ADDRESS
        );
        const requiredAmount = ethers.utils.parseUnits(amount, XUSDT_DECIMALS);
        const approved = Number(currentAllowance.toString()) >= Number(requiredAmount.toString());
        setIsApproved(approved);
        if (approved) {
          setTradeState(TradeState.APPROVED);
        } else {
          setTradeState(TradeState.APPROVAL);
        }
      } catch (error) {
        console.error('Error checking approval:', error);
        setIsApproved(false);
        setTradeState(TradeState.INITIAL);
      }
    };

    checkApproval();
  }, [inputToken, wallet, connectedWallet, setIsApproved, setTradeState, tradeState, amount]);

  const isInsufficientBalance = Number(amount) > numericBalance;
  const isValidAmount = amount && Number(amount) > 0;

  const maxApprovalForInputToken = async () => {
    try {
      setTradeState(TradeState.CHECKING_APPROVAL);
      const provider = new ethers.providers.Web3Provider(wallet as any);
      const signer = provider.getSigner();
      const xUSDTContract = new ethers.Contract(inputToken?.Address ?? '', erc20Abi, signer);
      await xUSDTContract.approve(PERMIT_TESTNET_ADDRESS, ethers.constants.MaxUint256);
      setTradeState(TradeState.REVIEW);
      setIsApproved(true);
    } catch (error) {
      console.error('Error approving max amount:', error);
      toast.error('Error approving max amount');
      setTradeState(TradeState.APPROVAL);
    }
  };

  const onSubmit = async (values: SwapFormValues) => {
    // return toast.info(
    //   'We are currently upgrading our xAssets platform to bring you an even better experience. Please check back soon!'
    // );

    if (!connectedWallet) return toast.error('Please connect your wallet');
    
    if (!isValidAmount) return toast.error('Amount must be greater than 0');

    try {
      if (tradeState === TradeState.APPROVAL) {
        maxApprovalForInputToken();
        return;
      }

      if (tradeState === TradeState.SUCCESS) {
        resetForm();
        setLatestTradeHash('');
        setTradeState(TradeState.INITIAL);
        return;
      }

      if (tradeState === TradeState.FAILED) {
        resetForm();
        setLatestTradeHash('');
        setTradeState(TradeState.INITIAL);
        return;
      }

      if (tradeState === TradeState.PENDING) {
        resetForm();
        setLatestTradeHash('');
        setTradeState(TradeState.INITIAL);
        return;
      }

      // If USDC is input token and not approved, show approval step
      if (!isApproved && tradeState === TradeState.INITIAL) {
        setTradeState(TradeState.APPROVAL);
        return;
      }

      if (tradeState === TradeState.INITIAL) {
        setTradeState(TradeState.REVIEW);
        return;
      }

      if (tradeState === TradeState.APPROVED) {
        setTradeState(TradeState.REVIEW);
        return;
      }

      if (tradeState === TradeState.REVIEW) {
        setTradeState(TradeState.PROCESSING);
        await submitSignature({
          user_address: connectedWallet ?? '',
          token: inputToken?.Address ?? '',
          amount: values.amount,
          output_amount: values.outputAmount,
          input_decimals: inputToken?.Decimals ?? 0,
          output_decimals: outputToken?.Decimals ?? 0,
          output_token: outputToken?.Address ?? '',
        });
      }

      // Reset everything after successful submission
      // resetTradeState();
      // setValue('amount', '');
      // setValue('outputAmount', '');
      // setValue('percentage', 25);
      // setTradeState(TradeState.REVIEW);
    } catch (error) {
      console.error('Transaction failed:', error);
      // toast.error('Transaction failed');
      // setTradeState(TradeState.INITIAL);
      setTradeState(TradeState.FAILED);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        <SwapScreens />
      </form>
    </FormProvider>
  );
}
