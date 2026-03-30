import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

interface HeroTextProps {
  progress: number;
}

const HeroText = ({ progress }: HeroTextProps) => {
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  useLayoutEffect(() => {
    if (!titleRef.current) return;
    const chars = titleRef.current.querySelectorAll('span');
    gsap.fromTo(
      chars,
      { yPercent: 120, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        stagger: 0.03,
        duration: 1,
        ease: 'power4.out',
      },
    );
  }, []);

  const title = '911 GT3 RS';

  return (
    <section className="pointer-events-none fixed inset-0 z-20 flex flex-col items-start justify-center px-8 md:px-16">
      <p className="mb-4 text-xs uppercase tracking-[0.4em] text-white/60">Scroll to drive the cinematic timeline</p>
      <h1 ref={titleRef} className="text-5xl font-semibold leading-none text-white md:text-8xl">
        {title.split('').map((char, index) => (
          <span key={`${char}-${index}`} className="inline-block">
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>
      <div className="mt-6 h-[1px] w-64 bg-gradient-to-r from-accent/90 to-transparent" />
      <p className="mt-3 max-w-sm text-sm text-white/65" style={{ opacity: 1 - progress * 0.7 }}>
        The car is always center-stage. Scroll pace controls velocity distortion, focus, lighting, and atmosphere.
      </p>
    </section>
  );
};

export default HeroText;
