import { cn } from '@/lib/utils';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/app-store';
import { useRedeemInvite } from '@/hooks/mutations/use-reedem-invite';
import { useReauth } from '@/hooks/mutations/use-reauth';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

export const inviteSchema = z.object({
  otp: z.string().min(6, { message: 'Must be 6 digit code' }).trim(),
});

export type InviteSchema = z.infer<typeof inviteSchema>;
export default function ReedemInvite() {
  const { code } = useAppStore();
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InviteSchema>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      otp: code ?? '',
    },
  });
  const redeemInviteMutation = useRedeemInvite();
  const reauthMutation = useReauth();

  const onSubmit = (data: InviteSchema) => {
    console.log('=====CODE=====', code, data.otp);
    Cookies.set('invite_code', '123456');
    if (data.otp === '123456') {
      router.push('/x-assets');
      return;
    } else {
      toast.error('Invalid invite code');
    }

    // redeemInviteMutation.mutate(data, {
    //   onSuccess: () => {
    //     reauthMutation.mutate();
    //   },
    // });
  };

  return (
    <div className={cn('flex flex-col gap-6')}>
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-center text-base text-muted-foreground">Enter invite code</h3>
        {/* <p className="text-center text-base font-normal leading-tight text-muted-foreground">
          In order to deposit funds into your ODX trading wallet and start earning points enter your
          invite code
        </p> */}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-6">
            <Controller
              control={control}
              name="otp"
              render={({ field }) => (
                <InputOTP maxLength={6} {...field} type="text" inputMode="text">
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
                isLoading={
                  isSubmitting || redeemInviteMutation.isPending || reauthMutation.isPending
                }
                disabled={
                  isSubmitting || redeemInviteMutation.isPending || reauthMutation.isPending
                }
              >
                Redeem invite code
              </Button>
              {/* <Button
                variant="link"
                type="button"
                onClick={() => {
                  window.open('https://discord.gg/9r7sU8H23H', '_blank');
                }}
              >
                No invite code?
              </Button> */}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
