import { TradeState, useTokenSwapStore } from '@/stores/token-swap-store';
import { ReviewStep } from './ReviewStep';
import { InitialStep } from './InitialStep';
import { SuccessStep } from './SuccessStep';
import { FailedStep } from './FailedStep';
import { PendingStep } from './PendingStep';

export function SwapBody() {
  const { tradeState } = useTokenSwapStore();
  switch (tradeState) {
    case TradeState.REVIEW:
    case TradeState.PROCESSING:
      return <ReviewStep />;
    case TradeState.SUCCESS:
      return <SuccessStep />;
    case TradeState.FAILED:
      return <FailedStep />;
    case TradeState.PENDING:
      return <PendingStep />;
    case TradeState.INITIAL:
    case TradeState.CHECKING_APPROVAL:
      return <InitialStep />;
    default:
      return <InitialStep />;
  }
}
