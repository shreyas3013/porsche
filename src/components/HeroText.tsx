import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

type HeroTextProps = {
  opacity: number;
  stateName: string;
};

export default function HeroText({ opacity, stateName }: HeroTextProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current) return;
    gsap.fromTo(
      [titleRef.current, subtitleRef.current],
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', stagger: 0.2 }
    );
  }, []);

  return (
    <section
      className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-end px-10 pb-14 md:px-16"
      style={{ opacity }}
    >
      <p ref={subtitleRef} className="mb-4 text-xs uppercase tracking-[0.35em] text-white/65">
        Porsche 911 GT3 RS • Scroll-controlled cinematic timeline
      </p>
      <h1 ref={titleRef} className="max-w-5xl text-4xl font-semibold leading-[0.9] md:text-7xl">
        Engineered <span className="text-porscheRed">for apexes</span> and controlled like a film.
      </h1>
      <p className="mt-6 text-xs uppercase tracking-[0.4em] text-white/40">{stateName.replace('_', ' ')}</p>
    </section>
  );
}
