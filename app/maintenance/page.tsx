'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon, ClockIcon, WrenchIcon } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <AlertTriangleIcon className="h-12 w-12 text-orange-500" />
          </div>
          <CardTitle className="text-3xl font-bold">Critical Maintenance</CardTitle>
          <CardDescription className="mt-2 text-lg">
            We&apos;re performing critical system maintenance to improve your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="text-md space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <WrenchIcon className="h-5 w-5 text-primary" />
              <p className="text-muted-foreground">
                Our team is working hard to resolve critical issues and enhance system performance.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <ClockIcon className="h-5 w-5 text-primary" />
              <p className="text-muted-foreground">Expected completion time: 3-4 hours</p>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              We apologize for the inconvenience and appreciate your patience during this
              maintenance period.
            </p>
          </div>

          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => window.open('https://discord.gg/9r7sU8H23H', '_blank')}
            >
              Join our Discord for real-time updates and status notifications.
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
