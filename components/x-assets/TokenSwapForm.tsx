import { useFormContext } from 'react-hook-form';

import { useXAssetSignature } from '@/hooks/mutations/use-xasset-signature';
import { toast } from 'sonner';
import { PERMIT2_ADDRESS } from '@/utils/chain-client/txs/constants';
import { useTokenSwapStore, TradeState, TabState } from '@/stores/token-swap-store';
import { useEffect } from 'react';
import { ethers } from 'ethers';
import { erc20Abi } from 'viem';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import { SwapScreens } from './SwapScreens';
import { SwapFormValues } from './TokenSwapCard';
import { truncateToFixed } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { sonic } from 'viem/chains';

export function TokenSwapForm() {
  const { submitSignature } = useXAssetSignature();
  const {
    tradeState,
    setTradeState,
    isApproved,
    setIsApproved,
    setLatestTradeHash,
    activeTab,
    isBalanceUpdating,
  } = useTokenSwapStore();
  const { slippage } = useAppStore();
  const { address } = useAccount();
  const form = useFormContext<SwapFormValues>();
  const chainId = useChainId();
  const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';

  const { watch } = form;
  const formValues = watch();
  const amount = formValues.amount;
  const { data: wallet } = useWalletClient();
  const inputToken = formValues.inputToken;
  const outputToken = formValues.outputToken;

  const resetForm = () => {
    form.reset({
      amount: '0',
      outputAmount: '0',
      percentage: 0,
      inputToken: inputToken,
      outputToken: outputToken,
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
        const isBuy = activeTab === TabState.BUY;
        const xUSDTContract = new ethers.Contract(
          isBuy ? outputToken?.Address : (inputToken?.Address ?? ''),
          erc20Abi,
          provider
        );
        const currentAllowance = await xUSDTContract.allowance(address, PERMIT2_ADDRESS);
        const requiredAmount = ethers.utils.parseUnits(
          amount,
          isBuy ? outputToken?.Decimals : inputToken?.Decimals
        );
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
  }, [
    inputToken,
    wallet,
    address,
    setIsApproved,
    setTradeState,
    tradeState,
    amount,
    activeTab,
    outputToken,
  ]);

  const isValidAmount = amount && Number(amount) > 0;

  const maxApprovalForInputToken = async () => {
    try {
      setTradeState(TradeState.CHECKING_APPROVAL);
      const provider = new ethers.providers.Web3Provider(wallet as any);
      const signer = provider.getSigner();
      if (activeTab === TabState.BUY) {
        const xUSDTContract = new ethers.Contract(outputToken?.Address ?? '', erc20Abi, signer);
        await xUSDTContract.approve(PERMIT2_ADDRESS, ethers.constants.MaxUint256);
      } else if (activeTab === TabState.SELL) {
        const xUSDTContract = new ethers.Contract(inputToken?.Address ?? '', erc20Abi, signer);
        await xUSDTContract.approve(PERMIT2_ADDRESS, ethers.constants.MaxUint256);
      }
      setTradeState(TradeState.REVIEW);
      setIsApproved(true);
    } catch (error) {
      console.error('Error approving max amount:', error);
      toast.error('Error approving max amount');
      setTradeState(TradeState.APPROVAL);
    }
  };

  const roundOutputAndAdjustInput = (values: SwapFormValues) => {
    const inputAmount = Number(values.amount);
    const outputAmount = Number(values.outputAmount);

    if (inputAmount <= 0 || outputAmount <= 0) return values;

    // Round output amount to whole number
    const roundedOutputAmount = Math.floor(outputAmount);

    if (roundedOutputAmount === 0) return values;

    // Calculate the ratio of original amounts
    const originalRatio = outputAmount / inputAmount;

    // Calculate new input amount based on rounded output
    const adjustedInputAmount = roundedOutputAmount / originalRatio;

    // Update form values
    form.setValue('outputAmount', roundedOutputAmount.toString());
    form.setValue('amount', truncateToFixed(adjustedInputAmount, 6)); // Keep 6 decimal places for precision

    return {
      ...values,
      amount: truncateToFixed(adjustedInputAmount, 6),
      outputAmount: roundedOutputAmount.toString(),
    };
  };

  const onSubmit = async (values: SwapFormValues) => {
    // return toast.info(
    //   'We are currently upgrading our xAssets platform to bring you an even better experience. Please check back soon!'
    // );

    if (!address) return toast.error('Please connect your wallet');
    if (!isStaging && sonic.id !== chainId) return toast.error('Please switch to Sonic Mainnet');
    // if (isInsufficientBalance) return toast.error('Insufficient balance');
    if (!isValidAmount) return toast.error('Amount must be greater than 0');
    // if (isBalanceUpdating) return toast.info('Please wait for the balance to update');

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
        // roundOutputAndAdjustInput(values);
        if (isBalanceUpdating) return toast.info('Please wait for the balance to update');
        setTradeState(TradeState.REVIEW);
        return;
      }

      if (tradeState === TradeState.APPROVED) {
        // roundOutputAndAdjustInput(values);
        if (isBalanceUpdating) return toast.info('Please wait for the balance to update');
        setTradeState(TradeState.REVIEW);
        return;
      }

      if (tradeState === TradeState.REVIEW) {
        setTradeState(TradeState.PROCESSING);
        if (activeTab === TabState.BUY) {
          await submitSignature({
            user_address: address ?? '',
            token: outputToken?.Address ?? '',
            amount: values.outputAmount,
            output_amount: values.amount,
            input_decimals: outputToken?.Decimals ?? 0,
            output_decimals: inputToken?.Decimals ?? 0,
            output_token: inputToken?.Address ?? '',
            slippage: slippage,
          });
        } else if (activeTab === TabState.SELL) {
          await submitSignature({
            user_address: address ?? '',
            token: inputToken?.Address ?? '',
            amount: values.amount,
            output_amount: values.outputAmount,
            input_decimals: inputToken?.Decimals ?? 0,
            output_decimals: outputToken?.Decimals ?? 0,
            output_token: outputToken?.Address ?? '',
            slippage: slippage,
          });
        }
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

  const onError = (error: any) => {
    switch (tradeState) {
      case TradeState.SUCCESS:
        setTradeState(TradeState.INITIAL);
        resetForm();
        break;
      case TradeState.FAILED:
        setTradeState(TradeState.INITIAL);
        resetForm();
        break;
      default:
        break;
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, onError)}
      className="flex h-full flex-col justify-between"
    >
      <SwapScreens />
    </form>
  );
}
