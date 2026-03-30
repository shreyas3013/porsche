export function initCursorSystem(cursor: HTMLElement): () => void {
  let mx = window.innerWidth * 0.5;
  let my = window.innerHeight * 0.5;
  let x = mx;
  let y = my;
  let raf = 0;

  const onMouseMove = (event: MouseEvent) => {
    mx = event.clientX;
    my = event.clientY;
  };

  const onDown = () => cursor.classList.add('scale-75');
  const onUp = () => {
    cursor.classList.remove('scale-75');
    cursor.classList.add('scale-110');
    setTimeout(() => cursor.classList.remove('scale-110'), 180);
  };

  const onOver = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-cursor="hover"]')) {
      cursor.classList.add('scale-[1.9]');
    } else {
      cursor.classList.remove('scale-[1.9]');
    }
  };

  const loop = () => {
    x += (mx - x) * 0.2;
    y += (my - y) * 0.2;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    raf = requestAnimationFrame(loop);
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mousedown', onDown);
  window.addEventListener('mouseup', onUp);
  window.addEventListener('mouseover', onOver, { passive: true });
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mousedown', onDown);
    window.removeEventListener('mouseup', onUp);
    window.removeEventListener('mouseover', onOver);
  };
}
