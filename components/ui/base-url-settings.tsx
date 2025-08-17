'use client';

import { useState, useEffect } from 'react';
import { Settings, Info, Network } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/stores/app-store';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useSwitchChain, useAccount } from 'wagmi';
import { sonic } from 'viem/chains';
import { useQueryClient } from '@tanstack/react-query';

const baseUrlSchema = z.object({
  baseUrl: z
    .string()
    .min(1, { message: 'Base URL is required' })
    .url({ message: 'Must be a valid URL' })
    .refine(val => val.startsWith('http'), { message: 'URL must start with http:// or https://' }),
  webSocketUrl: z.string(),
});

type BaseUrlSchema = z.infer<typeof baseUrlSchema>;

const CHAINS = [
  { id: sonic.id, name: 'Sonic Mainnet', label: 'Sonic Mainnet' },
  { id: 57054, name: 'Sonic Testnet', label: 'Sonic Testnet' },
];

export function StagingSettings() {
  const {
    customBaseUrl,
    setCustomBaseUrl,
    clearCustomBaseUrl,
    customWebSocketUrl,
    setCustomWebSocketUrl,
    clearCustomWebSocketUrl,
  } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const { chainId } = useAccount();
  const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<BaseUrlSchema>({
    resolver: zodResolver(baseUrlSchema),
    defaultValues: {
      baseUrl: customBaseUrl || '',
      webSocketUrl: customWebSocketUrl || '',
    },
  });

  useEffect(() => {
    setValue('baseUrl', customBaseUrl || '');
    setValue('webSocketUrl', customWebSocketUrl || '');
  }, [customBaseUrl, customWebSocketUrl, setValue]);

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['token-balance'] }),
      queryClient.invalidateQueries({ queryKey: ['sonic-balance'] }),
    ]);
  };

  const handleChainSwitch = async (newChainId: number) => {
    try {
      console.log('switching to', newChainId);
      await switchChainAsync({ chainId: newChainId });
      await handleRefresh();
      toast.success(`Switched to ${CHAINS.find(c => c.id === newChainId)?.label}`);
    } catch (error) {
      toast.error('Failed to switch chain');
    }
  };

  const onSubmit = (data: BaseUrlSchema) => {
    setCustomBaseUrl(data.baseUrl);
    setCustomWebSocketUrl(data.webSocketUrl);
    setIsOpen(false);
    toast.success('Base URL updated successfully');
  };

  const handleClear = () => {
    clearCustomBaseUrl();
    clearCustomWebSocketUrl();
    reset({ baseUrl: '', webSocketUrl: '' });
    setIsOpen(false);
    toast.success('Custom Base URL cleared');
  };

  const handleCancel = () => {
    reset({ baseUrl: customBaseUrl || '', webSocketUrl: customWebSocketUrl || '' });
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(onSubmit)();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Don't render if not in staging environment
  if (!isStaging) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <div>
              <h3 className="text-sm font-medium text-foreground">Staging Configuration</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Configure custom API endpoint and chain for staging environment
              </p>
            </div>
          </div>

          {/* Chain Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Network</Label>
            <Select
              value={chainId?.toString() || ''}
              onValueChange={value => {
                const newChainId = parseInt(value);
                handleChainSwitch(newChainId);
              }}
              disabled={isSwitching}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={chainId ? 'Select network' : 'Connect wallet first'} />
              </SelectTrigger>
              <SelectContent>
                {CHAINS.map(chain => (
                  <SelectItem key={chain.id} value={chain.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Network className="h-3 w-3" />
                      {chain.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isSwitching && <p className="text-xs text-muted-foreground">Switching network...</p>}
            {chainId && (
              <p className="text-xs text-muted-foreground">
                Currently connected to:{' '}
                {CHAINS.find(c => c.id === chainId)?.label || 'Unknown network'}
              </p>
            )}
          </div>

          {customBaseUrl && (
            <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950/20">
              <p className="flex flex-col gap-1 text-xs text-blue-700 dark:text-blue-300">
                <span>Base URL:</span>
                <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900">
                  {customBaseUrl}
                </code>
              </p>
            </div>
          )}

          {customWebSocketUrl && (
            <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950/20">
              <p className="flex flex-col gap-1 text-xs text-blue-700 dark:text-blue-300">
                <span>WebSocket URL:</span>
                <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900">
                  {customWebSocketUrl}
                </code>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label htmlFor="base-url-input" className="text-xs font-medium">
                Base URL
              </Label>
              <Controller
                control={control}
                name="baseUrl"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="base-url-input"
                    type="url"
                    placeholder="https://api.example.com"
                    className="font-mono text-sm"
                    autoFocus
                    onKeyDown={handleKeyDown}
                  />
                )}
              />
              {errors.baseUrl && (
                <p className="mt-1 text-xs text-red-500">{errors.baseUrl.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="web-socket-url-input" className="text-xs font-medium">
                WebSocket URL
              </Label>
              <Controller
                control={control}
                name="webSocketUrl"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="web-socket-url-input"
                    type="url"
                    placeholder="wss://api.example.com"
                    className="font-mono text-sm"
                    onKeyDown={handleKeyDown}
                  />
                )}
              />
              {errors.webSocketUrl && (
                <p className="mt-1 text-xs text-red-500">{errors.webSocketUrl.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1" disabled={isSubmitting}>
                {customBaseUrl ? 'Update' : 'Set'} Base URL
              </Button>
              {customBaseUrl && (
                <Button type="button" onClick={handleClear} variant="destructive" size="sm">
                  Clear
                </Button>
              )}
              <Button type="button" onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </form>

          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• This setting only applies in staging environment</p>
            <p>• Changes are persisted locally</p>
            <p>• Leave empty to use default environment URL</p>
            <p>• Network switching affects the connected blockchain</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
