import { Card } from '@/components/ui/card';
import { TokenSwapForm } from './TokenSwapForm';
import Faucet from '@/app/(main)/trade/faucet/faucet';

export function TokenSwapCard() {
  return (
    <Card className="flex h-full flex-col justify-between overflow-hidden">
      <div>
        <h2 className="px-4 pt-4 text-lg font-semibold">Trade</h2>
        <div className="px-4 py-4">
          <TokenSwapForm />
        </div>
      </div>
      <div className="px-4 py-4">
        <Faucet />
      </div>
    </Card>
  );
}
