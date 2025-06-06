import React from 'react';
import Token from '@/components/common/token';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useSingleToken } from '@/hooks/queries/use-single-token';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TokensListTable from './tokens-list-table';
import { usePopupStore } from '@/stores/popup-store';

function TokensListPopover() {
  const { openPopup, popupsOpen, closePopup } = usePopupStore();
  const popoverOpen = popupsOpen.includes('tokens-list');
  const searchParams = useSearchParams();

  const tokenAddress = searchParams.get('token');

  const tokenData = useSingleToken(tokenAddress);

  return (
    <Popover
      open={popoverOpen}
      onOpenChange={open => (open ? openPopup('tokens-list') : closePopup('tokens-list'))}
    >
      <PopoverTrigger>
        <div className="group flex cursor-pointer items-center gap-2 text-muted-foreground">
          <Token data={tokenData.data} />
          {popoverOpen ? (
            <ChevronUp className="h-4 w-4 group-hover:text-primary-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 group-hover:text-primary-foreground" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <TokensListTable />
      </PopoverContent>
    </Popover>
  );
}

export default TokensListPopover;
