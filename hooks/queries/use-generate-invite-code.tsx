import { generateInviteCode } from '@/apis/users';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGenerateInviteCode = () => {
  return useMutation({
    mutationFn: () => generateInviteCode(),
    onSuccess() {
      toast.success('Successfully generated');
    },
    onError(error: any) {
      let message = 'Something went wrong';
      if (error?.response?.data === 'Invite code already exists') {
        message = 'God code already generated';
      }
      toast.error(message);
    },
  });
};
