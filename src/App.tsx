import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SceneCanvas from './components/SceneCanvas';
import Navbar from './components/Navbar';
import HeroText from './components/HeroText';
import HUD from './components/HUD';
import { initCursorSystem } from './systems/cursorSystem';
import { createScrollSystem } from './systems/scrollSystem';
import { getInterpolatedConfig } from './systems/stateMachine';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [stateName, setStateName] = useState('STATIC');
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [hudOpacity, setHudOpacity] = useState(0);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanupScroll = createScrollSystem(({ progress, velocity: v }) => {
      setScrollProgress(progress);
      setVelocity(v);
      document.body.dataset.scrollProgress = String(progress);
      document.body.dataset.scrollVelocity = String(v);
      const cinematic = getInterpolatedConfig(progress);
      setStateName(cinematic.state);
      setHeroOpacity(cinematic.config.heroOpacity);
      setHudOpacity(cinematic.config.hudOpacity);
    });

    const st = ScrollTrigger.create({
      trigger: '#timeline',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true
    });

    return () => {
      st.kill();
      cleanupScroll();
    };
  }, []);

  useEffect(() => {
    if (!cursorRef.current) return;
    return initCursorSystem(cursorRef.current);
  }, []);

  const telemetry = useMemo(() => {
    const rpm = 900 + scrollProgress * 7700 + velocity * 1.2;
    const speed = scrollProgress * 312 + velocity * 0.08;
    const gear = Math.min(7, Math.max(1, Math.floor(scrollProgress * 7 + 1)));
    return { rpm, speed, gear };
  }, [scrollProgress, velocity]);

  return (
    <main className="dark relative min-h-[900vh] overflow-hidden bg-black text-white scanlines">
      <SceneCanvas progress={scrollProgress} velocity={velocity} />
      <Navbar progress={scrollProgress} />
      <HeroText opacity={heroOpacity} stateName={stateName} />
      <HUD opacity={hudOpacity} telemetry={telemetry} />

      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-50 h-5 w-5 rounded-full border border-white/70 bg-white/10 backdrop-blur-sm transition-transform duration-150"
      />

      <section id="timeline" className="relative z-10 h-[900vh]">
        <div className="sticky top-0 flex h-screen items-end justify-center pb-10">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/30">Scroll to drive the cinematic timeline</p>
        </div>
      </section>
    </main>
  );
}
