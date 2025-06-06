'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RocketIcon, ServerIcon, ZapIcon } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <RocketIcon className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Mainnet Beta Live Soon</CardTitle>
          <CardDescription className="mt-2 text-lg">
            We&apos;re not just upgrading; we&apos;re redefining the game:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="text-md space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <ServerIcon className="h-5 w-5 text-primary" />
              <p className="text-muted-foreground">
                Testnet vFinal: Rebuilt from the ground up for max throughput, scalability, and
                rock-solid stability.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <ZapIcon className="h-5 w-5 text-primary" />
              <p className="text-muted-foreground">
                Mainnet&apos;s around the corner. Time to ape in!
              </p>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              The platform will be back shortly. Thank you for your patience!
            </p>
          </div>

          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => window.open('https://discord.gg/9r7sU8H23H', '_blank')}
            >
              Stay plugged in—join the Discord for alpha updates.
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
