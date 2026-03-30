import Lenis from 'lenis';
import { clamp } from '../utils/clamp';

export type ScrollFrame = {
  progress: number;
  velocity: number;
};

export function createScrollSystem(onFrame: (frame: ScrollFrame) => void): () => void {
  const lenis = new Lenis({
    smoothWheel: true,
    wheelMultiplier: 0.95,
    lerp: 0.08,
    touchMultiplier: 1.4
  });

  let rafId = 0;
  const update = (time: number) => {
    lenis.raf(time);
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
    onFrame({
      progress,
      velocity: Math.abs(lenis.velocity)
    });
    rafId = requestAnimationFrame(update);
  };

  rafId = requestAnimationFrame(update);
  return () => {
    cancelAnimationFrame(rafId);
    lenis.destroy();
  };
}

export function mapVelocityToEffects(velocity: number) {
  return {
    motionBlur: clamp(velocity * 0.0005, 0, 1),
    rgbShift: clamp(velocity * 0.00001, 0, 0.008),
    shake: clamp(velocity * 0.00002, 0, 0.035),
    particles: clamp(velocity * 0.0008, 0, 1)
  };
}
