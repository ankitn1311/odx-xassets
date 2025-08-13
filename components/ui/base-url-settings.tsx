'use client';

import { useState, useEffect } from 'react';
import { Settings, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const baseUrlSchema = z.object({
  baseUrl: z
    .string()
    .min(1, { message: 'Base URL is required' })
    .url({ message: 'Must be a valid URL' })
    .refine(val => val.startsWith('http'), { message: 'URL must start with http:// or https://' }),
  webSocketUrl: z.string(),
});

type BaseUrlSchema = z.infer<typeof baseUrlSchema>;

interface BaseUrlSettingsProps {
  className?: string;
}

export function BaseUrlSettings({ className }: BaseUrlSettingsProps) {
  const {
    customBaseUrl,
    setCustomBaseUrl,
    clearCustomBaseUrl,
    customWebSocketUrl,
    setCustomWebSocketUrl,
    clearCustomWebSocketUrl,
  } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';

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
              <h3 className="text-sm font-medium text-foreground">Base URL Configuration</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Configure custom API endpoint for staging environment
              </p>
            </div>
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
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
