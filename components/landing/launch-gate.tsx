'use client';
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'nextjs-toploader/app';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { REQUIRE_LAUNCH_PASSWORD } from '@/config/access';

// Same cookie the middleware checks for the app routes. The fallback matches the
// existing invite code so cookies set by the old /invite page keep working.
const COOKIE = 'invite_code';
const PASSWORD = process.env.NEXT_PUBLIC_LAUNCH_PASSWORD ?? '829239';
const APP_HOME = '/markets';

type Props = {
  children?: React.ReactNode;
  className?: string;
  variant?: 'solid' | 'light' | 'ghost';
  size?: 'sm' | 'lg';
};

/**
 * "Launch App" button. If the reader already unlocked the app it goes straight in,
 * otherwise it opens the password dialog and sets the cookie on success.
 */
export function LaunchGate({
  children = 'Launch App',
  className,
  variant = 'solid',
  size = 'sm',
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const enter = () => {
    Cookies.set(COOKIE, PASSWORD, { expires: 30, sameSite: 'lax' });
    router.push(APP_HOME);
  };

  const onClick = () => {
    if (!REQUIRE_LAUNCH_PASSWORD) return router.push(APP_HOME);
    if (Cookies.get(COOKIE)) return enter();
    setOpen(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setError('');
      setOpen(false);
      enter();
    } else {
      setError('That password is not right. Check it and try again.');
      setPassword('');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,color,box-shadow,transform] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--l-blue)] focus-visible:ring-offset-2',
          size === 'sm' ? 'h-10 px-5 text-[15px]' : 'h-14 px-8 text-base',
          variant === 'solid' &&
            'bg-[var(--l-ink)] text-white hover:bg-[var(--l-ink-2)] hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,.5)]',
          variant === 'light' &&
            'bg-white text-[var(--l-ink)] hover:bg-[var(--l-surface)] hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,.4)]',
          variant === 'ghost' &&
            'border border-current bg-transparent text-current hover:bg-white/10',
          className
        )}
      >
        {children}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="landing max-w-md rounded-2xl border-[var(--l-line)] bg-white p-8 text-[var(--l-ink)] sm:rounded-2xl">
          <DialogHeader className="items-center text-center sm:text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[var(--l-blue-mist)]">
              <Lock className="size-5 text-[var(--l-blue)]" />
            </div>
            <DialogTitle className="text-2xl font-medium tracking-tight">
              Access restricted
            </DialogTitle>
            <DialogDescription className="text-[15px] text-[var(--l-muted)]">
              The app is in private access. Enter the password to continue.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="mt-2 space-y-4">
            <div className="space-y-2">
              <label htmlFor="launch-password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="launch-password"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoFocus
                  autoComplete="off"
                  className="h-11 rounded-xl border-[var(--l-line)] bg-[var(--l-surface)] pr-11 text-base focus-visible:ring-[var(--l-blue)]"
                />
                <button
                  type="button"
                  aria-label={show ? 'Hide password' : 'Show password'}
                  onClick={() => setShow(s => !s)}
                  className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-[var(--l-muted)] hover:text-[var(--l-ink)]"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-[#fde6e6] px-4 py-3 text-sm text-[#b91c1c]">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--l-ink)] text-base font-medium text-white transition-colors hover:bg-[var(--l-ink-2)]"
            >
              Enter app <ArrowRight className="size-4" />
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
