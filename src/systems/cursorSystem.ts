import { useEffect, useRef } from 'react';

export const useCursorSystem = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let rafId = 0;

    const animate = () => {
      tx += (x - tx) * 0.14;
      ty += (y - ty) * 0.14;
      cursor.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(animate);
    };

    const onMove = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
    };

    const onDown = () => cursor.classList.add('scale-75');
    const onUp = () => cursor.classList.remove('scale-75');

    const onOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('button, a')) cursor.classList.add('scale-150');
      else cursor.classList.remove('scale-150');
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mouseover', onOver);
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  return { cursorRef };
};
