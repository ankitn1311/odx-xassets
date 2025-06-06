'use client';
import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '../../lib/utils';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRequestOtp } from '@/hooks/mutations/use-request-otp';
import { useAppStore } from '@/stores/app-store';

export const requestOTPSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }).trim(),
});

export type RequestOTPSchema = z.infer<typeof requestOTPSchema>;

export default function RequestOTP() {
  const { setLoginEmail } = useAppStore();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<RequestOTPSchema>({
    resolver: zodResolver(requestOTPSchema),
    defaultValues: {
      email: '',
    },
  });

  const requestOtpMutation = useRequestOtp();

  const onSubmit = (data: RequestOTPSchema) => {
    setLoginEmail(data.email.toLowerCase());
    requestOtpMutation.mutate(data);
  };

  return (
    <div className={cn('flex flex-col gap-6')}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            {/* <a
        href="#"
        className="flex flex-col items-center gap-2 font-medium"
        >
        <div className="flex h-8 w-8 items-center justify-center rounded-md">
        <GalleryVerticalEnd className="size-6" />
        </div> 
        <span className="sr-only">ODX</span>
        </a> */}
            {/* <h1 className="text-xl font-bold">Welcome to ODX</h1>*/}
            {/* <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="#" className="underline underline-offset-4">
        Sign up
        </a>
        </div>*/}
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                {...register('email')}
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
            {errors?.email?.message && <p className="text-red-500">{errors.email?.message}</p>}
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting || requestOtpMutation.isPending}
              disabled={isSubmitting || requestOtpMutation.isPending}
            >
              Continue
            </Button>
            {/*
        {privateKey ? (
        <div className="flex flex-col gap-2">
        <div>Private key: {privateKey?.substring(1, 3)}</div>
        <Button onClick={rF}>Request faucet</Button>
        </div>
        ) : (
        <Button onClick={createWallet} className="w-full">
        Login
        </Button>
        )}
        */}
          </div>
        </div>
      </form>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
