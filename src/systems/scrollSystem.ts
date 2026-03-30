import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollStore {
  progress: number;
  velocity: number;
}

export const createScrollSystem = (
  container: HTMLElement,
  onUpdate: (store: ScrollStore) => void,
) => {
  const lenis = new Lenis({
    smoothWheel: true,
    lerp: 0.09,
    wheelMultiplier: 0.9,
    gestureOrientation: 'vertical',
  });

  let rafId = 0;

  const raf = (time: number) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  };

  rafId = requestAnimationFrame(raf);

  lenis.on('scroll', ({ scroll, limit, velocity }) => {
    onUpdate({
      progress: limit > 0 ? scroll / limit : 0,
      velocity,
    });
  });

  ScrollTrigger.create({
    trigger: container,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      onUpdate({ progress: self.progress, velocity: lenis.velocity });
    },
  });

  return {
    lenis,
    destroy: () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    },
  };
};
