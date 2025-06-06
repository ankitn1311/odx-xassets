import React, { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import TokensListPopover from './tokens-list-popover';
import { useSelectedToken } from '@/hooks/queries/use-selected-token';
import { useQuote } from '@/hooks/queries/use-quote';

const tokenDetails = [
  {
    label: 'Price',
    value: '$0.7321',
    percentageChange: 9.34,
  },
  // {
  //   label: "Volume",
  //   value: "$48M",
  //   percentageChange: 30,
  // },
  // { label: 'Separator' },
  // {
  //   label: 'MarketCap',
  //   value: '$7.28B',
  // },
  // {
  //   label: "Liquidity",
  //   value: "$10.7M",
  // },
  // { label: 'Circ. Supply', value: 1000000000 },
  // { label: "Holders", value: "1,232,150" },
];

type TokenDetailProps = (typeof tokenDetails)[number];

function TokenDetails() {
  const { data } = useSelectedToken();
  const { data: quote } = useQuote({
    assetIn: data?.TokenA.Address || '',
    assetOut: data?.TokenB.Address || '',
    amount: 1,
    enabled: !!data?.TokenA.Address && !!data?.TokenB.Address,
  });

  return (
    // <Card className="Token-Details py-2 lg:py-0">
    <Card className="px-2 py-4">
      {/* <div className="flex h-full flex-col items-start gap-2 lg:flex-row lg:items-center"> */}
      <div className="flex h-full flex-row items-center gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <TokensListPopover />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="h-4 w-4" />
          </div>
        </div>
        <div className="flex h-full flex-wrap items-center gap-6 px-4">
          {tokenDetails.map(tokenData => {
            if (tokenData.label === 'Price') {
              return (
                <TokenDetail
                  key={tokenData.label}
                  label={tokenData.label}
                  value={quote ? Number(quote).toFixed(6).toString() : '0'}
                  percentageChange={0}
                />
              );
            }
            if (tokenData.label === 'MarketCap') {
              return (
                <TokenDetail
                  key={tokenData.label}
                  label={tokenData.label}
                  // value={`$${
                  //   data?.TokenA.Name === 'ROGUE'
                  //     ? millify(100000000 * (tokenPrice?.baseToQuote || 0))
                  //     : millify(50000000 * (tokenPrice?.baseToQuote || 0))
                  // }`}
                  value={'N/A'}
                  percentageChange={0}
                />
              );
            }
            if (tokenData.label === 'Circ. Supply') {
              return (
                <TokenDetail
                  key={tokenData.label}
                  label={tokenData.label}
                  // value={data?.TokenA.Name === 'ROGUE' ? millify(100000000) : millify(50000000)}
                  value={'N/A'}
                  percentageChange={0}
                />
              );
            }
            return <TokenDetail key={tokenData.label} {...tokenData} />;
          })}
        </div>
      </div>
    </Card>
  );
}

const TokenDetail: FC<TokenDetailProps> = ({ label, percentageChange, value }) => {
  if (label === 'Separator') {
    return <Separator orientation="vertical" className="h-full" />;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex items-center gap-1">
        <div className="text-base text-foreground">{value}</div>
        {/* {percentageChange && percentageChange > 0 && (
          <div className="text-xs text-success">+{percentageChange.toFixed(2)}%</div>
        )}
        {percentageChange && percentageChange < 0 && (
          <div className="text-xs text-destructive">{percentageChange.toFixed(2)}%</div>
        )} */}
      </div>
    </div>
  );
};

export default TokenDetails;
