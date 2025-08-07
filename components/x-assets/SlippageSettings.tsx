'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';

interface SlippageSettingsProps {
  className?: string;
}

export function SlippageSettings({ className }: SlippageSettingsProps) {
  const { slippage, setSlippage } = useAppStore();
  const [inputValue, setInputValue] = useState(slippage.toString());
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (value: string) => {
    // Only allow numbers and decimals
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setInputValue(cleanValue);
  };

  const handleSave = () => {
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      setSlippage(numValue);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setInputValue(slippage.toString());
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('h-4 w-4', className)}>
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Slippage Tolerance</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Your transaction will revert if the price changes unfavorably by more than this
              percentage.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slippage-input" className="text-xs font-medium">
              Slippage (%)
            </Label>
            <Input
              id="slippage-input"
              type="text"
              value={inputValue}
              onChange={e => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0.5"
              className="text-sm"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Enter a value between 0.1% and 50%</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="flex-1"
              disabled={
                isNaN(parseFloat(inputValue)) ||
                parseFloat(inputValue) < 0.1 ||
                parseFloat(inputValue) > 50
              }
            >
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
