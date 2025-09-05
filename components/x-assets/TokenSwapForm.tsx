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
        // For Buy: inputToken is USDC, for Sell: inputToken is xAsset, but we always need USDC approval
        const usdcToken = isBuy ? inputToken : outputToken;
        const xUSDTContract = new ethers.Contract(usdcToken?.Address ?? '', erc20Abi, provider);
        const currentAllowance = await xUSDTContract.allowance(address, PERMIT2_ADDRESS);
        const requiredAmount = ethers.utils.parseUnits(amount, usdcToken?.Decimals ?? 6);
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
      const isBuy = activeTab === TabState.BUY;
      // For Buy: inputToken is USDC, for Sell: outputToken is USDC, but we always need USDC approval
      const usdcToken = isBuy ? inputToken : outputToken;
      const xUSDTContract = new ethers.Contract(usdcToken?.Address ?? '', erc20Abi, signer);
      await xUSDTContract.approve(PERMIT2_ADDRESS, ethers.constants.MaxUint256);
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

        // return console.log({
        //   token: inputToken?.Address ?? '',
        //   amount: values.amount,
        //   output_amount: values.outputAmount,
        //   input_decimals: inputToken?.Decimals ?? 0,
        //   output_decimals: outputToken?.Decimals ?? 0,
        //   output_token: outputToken?.Address ?? '',
        //   slippage: slippage,
        // });
        if (activeTab === TabState.BUY) {
          // Buy: inputToken = USDC, outputToken = xAsset
          await submitSignature({
            user_address: address ?? '',
            token: inputToken?.Address ?? '', // USDC
            amount: values.amount, // USDC amount
            output_amount: values.outputAmount, // xAsset amount
            input_decimals: inputToken?.Decimals ?? 0, // USDC decimals
            output_decimals: outputToken?.Decimals ?? 0, // xAsset decimals
            output_token: outputToken?.Address ?? '', // xAsset address
            slippage: slippage,
          });
        } else if (activeTab === TabState.SELL) {
          // Sell: inputToken = xAsset, outputToken = USDC
          await submitSignature({
            user_address: address ?? '',
            token: inputToken?.Address ?? '', // xAsset
            amount: values.amount, // xAsset amount
            output_amount: values.outputAmount, // USDC amount
            input_decimals: inputToken?.Decimals ?? 0, // xAsset decimals
            output_decimals: outputToken?.Decimals ?? 0, // USDC decimals
            output_token: outputToken?.Address ?? '', // USDC address
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

  const onError = () => {
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
