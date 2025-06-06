import useAuthToken from '@/hooks/use-auth';
import { useDialogStore } from '@/stores/dialog-store';
import { PropsWithChildren, ReactNode } from 'react';
import RequestOTP from '../login/request-otp';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';

type AuthenticatedProps = {
  customUI?: ReactNode;
  padding?: boolean;
};

export default function Authenticated({
  children,
  customUI,
  padding = false,
}: PropsWithChildren<AuthenticatedProps>) {
  const authenticated = useAuthToken();
  const { open } = useDialogStore();
  const { setLoginEmail } = useAppStore();

  if (authenticated) return children;

  if (customUI) return customUI;

  const login = () => {
    open({
      title: 'Login to your ODX account',
      component: <RequestOTP />,
      size: 'md',
    });
    setLoginEmail('');
  };

  const signup = () => {
    open({
      title: 'Welcome to ODX',
      component: <RequestOTP />,
      size: 'md',
    });
    setLoginEmail('');
  };

  return (
    <div
      className={cn(
        'flex h-full w-full flex-1 items-center justify-center gap-1 py-8 lg:py-0',
        padding && 'py-8 lg:py-8'
      )}
    >
      Please{' '}
      <span onClick={login} className="inline-block font-bold text-accent">
        login
      </span>{' '}
      or{' '}
      <span onClick={signup} className="inline-block font-bold text-accent">
        sign up
      </span>{' '}
      first
    </div>
  );
}
