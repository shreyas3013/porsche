interface NavbarProps {
  progress: number;
}

const Navbar = ({ progress }: NavbarProps) => {
  const active = progress > 0.04;
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 mx-4 mt-4 rounded-full border px-6 py-3 transition-all duration-500 ${
        active ? 'border-white/20 bg-black/35 backdrop-blur-md' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/80">
        <span>Porsche</span>
        <span>911 GT3 RS</span>
        <span>Chronoscroll</span>
      </div>
    </header>
  );
};

export default Navbar;
