import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function UpgradeOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-background/30 backdrop-blur-md" />

      {/* Upgrade message card */}
      <Card className="relative z-10 max-w-md border border-border bg-background p-8 text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Upgrading xAssets</h2>
          <p className="text-muted-foreground">
            We&apos;re currently upgrading our xAssets platform to bring you an even better
            experience. Please check back soon!
          </p>
          <div className="pt-4">
            <Link href="/trade">
              <Button variant="default" size="lg">
                Trade Tokens
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
