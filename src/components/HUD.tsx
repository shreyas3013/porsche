import { useEffect, useMemo, useState } from 'react';

export type Telemetry = {
  rpm: number;
  speed: number;
  gear: number;
};

type HUDProps = {
  opacity: number;
  telemetry: Telemetry;
};

export default function HUD({ opacity, telemetry }: HUDProps) {
  const [display, setDisplay] = useState(telemetry);

  useEffect(() => {
    const id = setInterval(() => {
      setDisplay((prev) => ({
        rpm: prev.rpm + (telemetry.rpm - prev.rpm) * 0.12,
        speed: prev.speed + (telemetry.speed - prev.speed) * 0.12,
        gear: prev.gear + (telemetry.gear - prev.gear) * 0.2
      }));
    }, 16);
    return () => clearInterval(id);
  }, [telemetry]);

  const formatted = useMemo(
    () => ({
      rpm: Math.round(display.rpm),
      speed: Math.round(display.speed),
      gear: Math.max(1, Math.round(display.gear))
    }),
    [display]
  );

  return (
    <aside
      className="fixed bottom-10 right-8 z-30 w-56 rounded-xl border border-white/20 bg-black/40 p-4 backdrop-blur-sm transition-opacity duration-300"
      style={{ opacity }}
    >
      <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-white/60">Telemetry</p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-white/80">
          <span>RPM</span>
          <span className="font-mono">{formatted.rpm}</span>
        </div>
        <div className="flex justify-between text-white/80">
          <span>SPEED</span>
          <span className="font-mono">{formatted.speed} KM/H</span>
        </div>
        <div className="flex justify-between text-white/80">
          <span>GEAR</span>
          <span className="font-mono">{formatted.gear}</span>
        </div>
      </div>
    </aside>
  );
}
