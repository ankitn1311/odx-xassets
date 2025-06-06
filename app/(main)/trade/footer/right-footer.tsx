import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const RightFooter = () => {
  return (
    <Card className="Footer py-2 lg:py-0">
      <div className="flex h-full items-center justify-between gap-2 px-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => window.open('https://discord.gg/9r7sU8H23H', '_blank')}
        >
          Help & Support
        </Button>
        <Button
          size="sm"
          variant="accent"
          className="bg-accent/20 text-accent hover:bg-accent/30 hover:text-accent/80"
          onClick={() => {
            window.open('https://docs.odx.so', '_blank');
          }}
        >
          Testnet Guide
        </Button>
      </div>
    </Card>
  );
};
