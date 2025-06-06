import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { decodeDiscord } from '../../apis/users';
import { connectDiscord } from '@/apis/users';
import { toast } from 'sonner';

export const useDecodeDiscord = ({ token }: { token: string }) => {
  return useQuery({
    queryKey: ['decodedDiscord'],
    queryFn: () => decodeDiscord({ token }),
    staleTime: Infinity,
    enabled: !!token,
  });
};

export const useConnectDiscord = ({ closePopup }: { closePopup: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => connectDiscord({ token }),
    onError(error) {
      toast.error('Something went wrong');
    },
    onSuccess(data) {
      if (data === 'Discord has been connected to your ODX account') {
        toast.info("Your discord account doesn't have OG role.");
        return;
      }
      if (data === 'OG Boost has been applied') {
        toast.success('OG Boost has been applied');
        queryClient.invalidateQueries({ queryKey: ['user'] });
        return;
      }
      if (data === "Please join ODX's Discord server and reconnect") {
        toast.info("Please join ODX's Discord");
        return;
      }
      if (data === 'Blitz Boost has been applied') {
        toast.success('Blitz Boost has been applied');
        queryClient.invalidateQueries({ queryKey: ['user'] });
        return;
      }
      if (data === 'Eclipse Boost has been applied') {
        toast.success('Eclipse Boost has been applied');
        queryClient.invalidateQueries({ queryKey: ['user'] });
        return;
      }
      toast.info(data);
    },
    onSettled() {
      closePopup();
    },
  });
};
