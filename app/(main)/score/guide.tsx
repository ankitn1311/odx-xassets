import { Coins, Cpu, Hourglass, SunSnow, Users, Zap } from 'lucide-react';
import React from 'react';
import FAQs from './faqs';
import { Card, CardContent } from '@/components/ui/card';

const guideData = [
  {
    id: 1,
    title: 'Earn',
    Icon: Coins,
    description:
      'Points are distributed on the basis of Trade Frequency, Trade Volume, Referrals & Utilizing boosts',
  },
  {
    id: 2,
    title: 'Referrals',
    Icon: Users,
    description:
      'The more friends you refer, the more you earn. There are 5 tiers each with unique rewards allowing you to earn points quicker.',
  },
  {
    id: 3,
    title: 'Loyalty',
    Icon: Zap,
    description:
      'Each new epoch ODX users will be awarded points that will reflect their usage in the previous season. The longer you use ODX, the bigger the rewards',
  },
  {
    id: 4,
    title: 'ODX Ascension Testnet',
    Icon: SunSnow,
    description:
      'As we prepare for Ascension Mainnet in Q2 2025. Participate in our incentivized testnet - and become ASCENSION.',
  },
  {
    id: 5,
    title: 'Duration',
    Icon: Hourglass,
    description:
      'Ascension Testnet – will continue for ~1.5 months. Multipliers boost the points you accumulate throughout the season before Mainnet.',
  },
  {
    id: 6,
    title: 'Tech',
    Icon: Cpu,
    description:
      'ODX is a cross-chain liquidity protocol designed to bring assets from any blockchain into Sonic, creating a more capital-efficient DeFi ecosystem – powered by Turnkey.',
  },
];

const Guide = () => {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 px-0 pb-0">
        <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-3">
          {guideData.map(item => {
            return <GuideItem key={item.id} data={item} />;
          })}
        </div>
        <FAQs />
      </CardContent>
    </Card>
  );
};

const GuideItem = ({ data }: { data: (typeof guideData)[0] }) => {
  const { Icon, description, title } = data;
  return (
    <div className="group flex flex-1 flex-col gap-3 rounded-lg border border-border/50 bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg md:min-w-96">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      <p className="leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
};

export default Guide;
