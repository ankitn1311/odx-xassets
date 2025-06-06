'use client';
import React from 'react';
import ReedemInvite from './redeem-invite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function Invite() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div
        className={cn(
          'absolute inset-0',
          '[background-size:20px_20px]',
          '[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]',
          'dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]'
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      <div className="z-10 mx-auto flex w-full max-w-2xl flex-col gap-2 p-2">
        <div className="flex h-dvh flex-col items-center justify-center p-4 md:p-10">
          <Card className="w-full max-w-lg p-10">
            <CardHeader className="flex flex-col items-center gap-2">
              <CardTitle className="text-center text-lg font-semibold">
                <Image
                  src="/images/logos/odx-dark-text.svg"
                  alt="ODX Logo"
                  width={169}
                  height={211}
                  className="h-10"
                />
              </CardTitle>
              <CardDescription className="text-center text-lg text-muted-foreground">
                Mainnet Beta Access
                {/* Enter your invite code to access the mainnet beta. */}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReedemInvite />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
  return (
    <div className="flex h-dvh flex-col items-center justify-center p-4 md:p-10">
      <Card className="w-full max-w-lg p-10">
        <CardHeader className="flex flex-col items-center gap-2">
          <CardTitle className="text-center text-lg font-semibold">
            <Image
              src="/images/logos/odx-dark-text.svg"
              alt="ODX Logo"
              width={169}
              height={211}
              className="h-10"
            />
          </CardTitle>
          <CardDescription className="text-center text-lg text-muted-foreground">
            Mainnet Beta Access
            {/* Enter your invite code to access the mainnet beta. */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReedemInvite />
        </CardContent>
      </Card>
    </div>
  );
}
