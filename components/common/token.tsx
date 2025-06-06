import { TokenPair } from '@/hooks/queries/use-all-tokens';
import { Copy } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useCopyToClipboard } from 'usehooks-ts';
import { toast } from 'sonner';
import Image from 'next/image';
import { convertXUSDT } from '@/lib/utils';

export default function Token({ data }: { data?: TokenPair }) {
  const [, copyToClipboard] = useCopyToClipboard();

  if (!data) {
    return (
      <div className="px-2">
        <Skeleton className="h-8 w-20" />
      </div>
    );
  }

  return (
    <div className="flex h-full items-center gap-2 px-2">
      <div className="relative">
        {/* <div className="rounded-full w-10 border  border-primary h-10 flex items-center justify-center text-lg">
          {data.BaseSymbol.substring(0, 1)}
        </div>*/}
        <Image
          src={`/images/tokens/${data.TokenA.Name}.png`}
          alt={data.TokenA.Name}
          width={40}
          height={40}
          // className="rounded-full"
        />
        {/* <div className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent p-1 text-[0.6rem] text-accent-foreground">
          {data.Chain.substring(0, 1)}
        </div> */}
      </div>
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-1">
          <div className="text-base">{convertXUSDT(data.TokenA.Name)}</div>
          <Copy
            className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-primary-foreground"
            strokeWidth={1}
            onClick={() => {
              copyToClipboard(data.TokenA.Address);
              toast.success(`Copied!`, {
                description: data.TokenA.Address,
              });
            }}
          />
        </div>
        <div className="text-xs text-muted-foreground">{data.TokenA.FullName}</div>
      </div>
    </div>
  );
}
