import { useMemo } from 'react';
import { DriveState } from '../systems/stateMachine';
import { clamp } from '../utils/clamp';

interface HUDProps {
  progress: number;
  velocity: number;
  state: DriveState;
}

const HUD = ({ progress, velocity, state }: HUDProps) => {
  const rpm = useMemo(() => Math.round(clamp(progress * 9800 + Math.abs(velocity) * 220, 1100, 9800)), [progress, velocity]);
  const speed = useMemo(() => Math.round(clamp(progress * 340 + Math.abs(velocity) * 6, 0, 340)), [progress, velocity]);
  const gear = useMemo(() => Math.max(1, Math.min(7, Math.ceil(progress * 7))), [progress]);

  const visible = progress >= 0.2;

  return (
    <aside
      className={`fixed right-6 bottom-8 z-30 w-64 rounded-xl border border-white/15 bg-black/30 p-4 backdrop-blur-md transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">Telemetry</p>
      <p className="mt-2 text-xs tracking-[0.2em] text-accent">{state}</p>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between"><span className="text-white/60">RPM</span><span>{rpm}</span></div>
        <div className="flex items-center justify-between"><span className="text-white/60">SPEED</span><span>{speed} km/h</span></div>
        <div className="flex items-center justify-between"><span className="text-white/60">GEAR</span><span>{gear}</span></div>
      </div>
    </aside>
  );
};

export default HUD;
