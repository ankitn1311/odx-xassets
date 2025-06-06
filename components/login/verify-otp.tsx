'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVerifyOtp } from '@/hooks/mutations/use-verify-otp';
import { useAppStore } from '@/stores/app-store';
import { useDialogStore } from '@/stores/dialog-store';
import RequestOTP from './request-otp';

export const verifyOTPSchema = z.object({
  otp: z.string().min(6, { message: 'Must be 6 digit code' }).trim(),
  email: z.string(),
});

export type VerifyOTPSchema = z.infer<typeof verifyOTPSchema>;

export default function VerifyOTP() {
  const { loginEmail } = useAppStore();
  const { open, close } = useDialogStore();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOTPSchema>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: {
      otp: '',
      email: loginEmail,
    },
  });
  const verifyOtpMutation = useVerifyOtp();

  const onSubmit = (data: VerifyOTPSchema) => {
    verifyOtpMutation.mutate(data);
  };

  return (
    <div className={cn('flex flex-col gap-6')}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-6">
            <Controller
              control={control}
              name="otp"
              render={({ field }) => (
                <InputOTP maxLength={6} {...field} type="text">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />

            {errors?.otp?.message && <p className="text-red-500">{errors?.otp.message}</p>}
            <div className="flex w-full flex-col items-center gap-1">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || verifyOtpMutation.isPending}
                isLoading={isSubmitting || verifyOtpMutation.isPending}
              >
                Verify
              </Button>
              <Button
                variant="link"
                type="button"
                onClick={() => {
                  close();
                  open({
                    title: 'Welcome to ODX',
                    component: <RequestOTP />,
                    size: 'md',
                  });
                  // setScreen("request");
                }}
              >
                Go back
              </Button>
            </div>
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
