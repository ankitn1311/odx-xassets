import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const LeftFooter = () => {
  return (
    <Card className="Sidebar-Footer py-2 lg:py-0">
      <div className="flex h-full items-center justify-between gap-2 px-2">
        <Button
          size="sm"
          variant="success"
          className="bg-success/20 text-success hover:bg-success/30 hover:text-success/80"
        >
          Operational
        </Button>
        {/* <Button size="sm" variant="ghost" onClick={() => toast.info('Coming soon')}>
          <div className="flex items-center gap-2">
            <Settings />
            <p> Trading Settings </p>
          </div>
        </Button> */}
      </div>
    </Card>
  );
};
