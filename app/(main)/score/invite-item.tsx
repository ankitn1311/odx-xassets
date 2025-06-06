import Image from 'next/image';
import { customToast } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const InviteItem = ({
  isUsed,
  code,
  special = false,
  isActive = false,
}: {
  isUsed: boolean;
  code: string;
  special?: boolean;
  isActive?: boolean;
}) => {
  const copyToClipboard = (text: string) => {
    if (special) {
      navigator.clipboard.writeText(code);
      toast.success('Copied invite link');
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success('Copied the code');
  };

  return (
    <div className="relative">
      <div
        // className={`text-lg ${
        //   isUsed ? 'bg-opacity-50 text-secondryText text-opacity-50 select-none cursor-default' : ''
        // }`}
        className={cn(
          'text-center text-base hover:underline md:text-3xl',
          isUsed && 'text-secondryText cursor-default select-none bg-opacity-50 text-opacity-50',
          special && 'text-brand-400 text-3xl'
        )}
        onClick={() => {
          copyToClipboard(code);
        }}
      >
        {code}
      </div>
      {isUsed && (
        <div className={cn('absolute inset-0 h-5 md:h-7', special && 'h-7')}>
          <div className="relative h-4 w-4"></div>
          <Image src="/i.png" alt="cut" layout="fill" />
        </div>
      )}
      {/* {isActive && (
        <div className='absolute inset-0 h-8 rotate-[45deg] '>
          <div className='relative w-4 h-4 '></div>
          <Image src='/i.png' alt='cut' layout='fill' />
        </div>
      )} */}
    </div>
  );
};
