import { format } from 'date-fns';

export type TimeLeft = {
  hours: number;
  minutes: number;
  seconds: number;
};

const CountdownTimer = ({ startTime }: { startTime: string }) => {
  const _startTime = startTime && new Date(startTime);

  if (!_startTime) return null;

  const resetTime = new Date(_startTime?.getTime() + 24 * 60 * 60 * 1000);

  return (
    <div className="flex items-center gap-2">
      <div className="font-montserrat font-semibold text-zinc-400">Cap reset on </div>
      <div className="font-montserrat font-medium text-zinc-300">
        {format(resetTime, 'd MMM, hh:mm a')}
      </div>
    </div>
  );
};

export default CountdownTimer;
