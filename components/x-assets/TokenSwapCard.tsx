import { BackgroundGradient } from '../ui/background-gradient';
import { TokenSwapForm } from './TokenSwapForm';

export const TokenSwapCard = () => {
  return (
    <div className="flex w-full flex-col">
      <BackgroundGradient>
        <div className="w-full rounded-xl bg-card">
          <h2 className="px-8 pt-8 text-lg font-semibold">Trade X-Assets</h2>
          <div className="px-8 py-8">
            <TokenSwapForm />
          </div>
        </div>
      </BackgroundGradient>
    </div>
  );
};
