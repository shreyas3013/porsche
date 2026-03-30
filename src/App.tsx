import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import SceneCanvas from './components/SceneCanvas';
import Navbar from './components/Navbar';
import HeroText from './components/HeroText';
import HUD from './components/HUD';
import { createScrollSystem } from './systems/scrollSystem';
import { getState } from './systems/stateMachine';
import { useCursorSystem } from './systems/cursorSystem';

const App = () => {
  const scrollTrackRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const { cursorRef } = useCursorSystem();

  useEffect(() => {
    const node = scrollTrackRef.current;
    if (!node) return;

    const system = createScrollSystem(node, (store) => {
      setProgress(store.progress);
      setVelocity(store.velocity);
    });

    return () => system.destroy();
  }, []);

  useEffect(() => {
    gsap.to('body', {
      backgroundColor: progress > 0.7 ? '#060708' : '#020202',
      duration: 0.6,
      ease: 'power2.out',
    });
  }, [progress]);

  const state = useMemo(() => getState(progress), [progress]);

  return (
    <main className="relative min-h-screen bg-black text-white dark">
      <SceneCanvas progress={progress} velocity={velocity} />
      <Navbar progress={progress} />
      <HeroText progress={progress} />
      <HUD progress={progress} velocity={velocity} state={state} />

      <div ref={cursorRef} className="pointer-events-none fixed z-50 h-4 w-4 rounded-full border border-white/80 transition-transform duration-200" />
      <div className="noise-overlay" />
      <div ref={scrollTrackRef} className="scroll-track" />
    </main>
  );
};

export default App;
