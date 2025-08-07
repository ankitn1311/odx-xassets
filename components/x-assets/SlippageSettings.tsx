'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const slippageSchema = z.object({
  slippage: z
    .string()
    .min(1, { message: 'Slippage is required' })
    .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a valid number' })
    .refine(val => parseFloat(val) >= 0.1, { message: 'Minimum slippage is 0.1%' })
    .refine(val => parseFloat(val) <= 2, { message: 'Maximum slippage is 2%' }),
});

type SlippageSchema = z.infer<typeof slippageSchema>;

interface SlippageSettingsProps {
  className?: string;
}

export function SlippageSettings({ className }: SlippageSettingsProps) {
  const { slippage, setSlippage } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SlippageSchema>({
    resolver: zodResolver(slippageSchema),
    defaultValues: {
      slippage: slippage.toString(),
    },
  });

  const onSubmit = (data: SlippageSchema) => {
    const numValue = parseFloat(data.slippage);
    setSlippage(numValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    reset({ slippage: slippage.toString() });
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(onSubmit)();
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <Label htmlFor="slippage-input" className="text-xs font-medium">
              Slippage (%)
            </Label>
            <Controller
              control={control}
              name="slippage"
              render={({ field }) => (
                <Input
                  {...field}
                  id="slippage-input"
                  type="text"
                  placeholder="0.5"
                  className="text-sm"
                  autoFocus
                  onKeyDown={handleKeyDown}
                />
              )}
            />
            {errors.slippage && <p className="text-xs text-red-500">{errors.slippage.message}</p>}
            <p className="text-xs text-muted-foreground">Enter a value between 0.1% and 2%</p>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="flex-1" disabled={isSubmitting}>
                Save
              </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
