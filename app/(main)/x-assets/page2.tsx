'use client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormMessage,
  FormItem,
  FormLabel,
  FormField,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  fromToken: z.string(),
  toToken: z.string(),
  fromAmount: z.number().min(1, { message: 'Amount must be greater than 0' }),
  toAmount: z.number().min(1, { message: 'Amount must be greater than 0' }),
});

export default function XAssets() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromToken: 'eth',
      toToken: 'btc',
      fromAmount: 0,
      toAmount: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-1 bg-background px-2 pb-2 font-sans">
      <Card className="px-2 py-2 lg:py-0">
        <div className="flex flex-col gap-4 p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* First Token Section */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="fromToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select token" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="eth">ETH</SelectItem>
                          <SelectItem value="btc">BTC</SelectItem>
                          <SelectItem value="usdt">USDT</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromAmount"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="fromAmount">Amount</FormLabel>
                      <FormControl>
                        <Input
                          id="fromAmount"
                          type="number"
                          placeholder="Enter amount"
                          className={form.formState.errors.fromAmount ? 'border-destructive' : ''}
                          {...field}
                          onChange={e => {
                            field.onChange(e.target.valueAsNumber);
                          }}
                        />
                      </FormControl>
                      {form.formState.errors.fromAmount && (
                        <FormMessage className="text-sm text-destructive">
                          {form.formState.errors.fromAmount.message}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              {/* Second Token Section */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="toToken"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="toToken">To</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        // className={form.formState.errors.toToken ? 'border-destructive' : ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select token" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="eth">ETH</SelectItem>
                          <SelectItem value="btc">BTC</SelectItem>
                          <SelectItem value="usdt">USDT</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.toToken && (
                        <FormMessage className="text-sm text-destructive">
                          {form.formState.errors.toToken.message}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toAmount"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="toAmount">Amount</FormLabel>
                      <FormControl>
                        <Input
                          id="toAmount"
                          type="number"
                          placeholder="Enter amount"
                          className={form.formState.errors.toAmount ? 'border-destructive' : ''}
                          {...field}
                          onChange={e => {
                            field.onChange(e.target.valueAsNumber);
                          }}
                        />
                      </FormControl>
                      {form.formState.errors.toAmount && (
                        <FormMessage className="text-sm text-destructive">
                          {form.formState.errors.toAmount.message}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                Swap
              </Button>
            </form>
          </Form>
        </div>
      </Card>
    </main>
  );
}
