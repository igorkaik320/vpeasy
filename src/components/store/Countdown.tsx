import { useEffect, useState } from 'react';

interface CountdownProps {
  target: string | Date;
  onComplete?: () => void;
}

const calc = (target: Date) => {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { diff, days, hours, minutes };
};

const Countdown = ({ target, onComplete }: CountdownProps) => {
  const t = typeof target === 'string' ? new Date(target) : target;
  const [time, setTime] = useState(() => calc(t));

  useEffect(() => {
    const i = setInterval(() => {
      const next = calc(t);
      setTime(next);
      if (next.diff === 0 && onComplete) { onComplete(); clearInterval(i); }
    }, 30000);
    return () => clearInterval(i);
  }, [target]);

  if (time.diff === 0) return null;

  const Box = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center bg-card border border-border rounded-md px-3 py-2 min-w-[60px] shadow-sm">
      <span className="font-display text-2xl neon-text font-bold leading-none">{String(value).padStart(2,'0')}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <Box value={time.days} label="Dias" />
      <Box value={time.hours} label="Horas" />
      <Box value={time.minutes} label="Min" />
    </div>
  );
};

export default Countdown;
