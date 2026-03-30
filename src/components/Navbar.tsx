import React from 'react';

type NavbarProps = {
  progress: number;
};

export default function Navbar({ progress }: NavbarProps) {
  const scrolled = progress > 0.02;
  return (
    <nav
      className={`fixed left-0 top-0 z-30 w-full px-8 py-5 transition-all duration-500 ${
        scrolled ? 'border-b border-white/20 bg-black/30 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <span className="text-sm tracking-[0.5em] text-white/85">PORSCHE</span>
        <div className="flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-white/70">
          <button data-cursor="hover">911 GT3 RS</button>
          <button data-cursor="hover">Telemetry</button>
          <button data-cursor="hover">Track Mode</button>
        </div>
      </div>
    </nav>
  );
}
