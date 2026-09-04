import { useCallback, useEffect, useRef, useState } from 'react';

const PDF_MIN_WIDTH = 380;
const PDF_MAX_WIDTH = 860;
const PDF_DEFAULT_WIDTH = 520;

export function usePdfPanelWidth(containerRef: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(PDF_DEFAULT_WIDTH);
  const dragging = useRef(false);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) {
        return;
      }
      const right = containerRef.current?.getBoundingClientRect().right ?? window.innerWidth;
      const next = right - e.clientX;
      setWidth(Math.min(PDF_MAX_WIDTH, Math.max(PDF_MIN_WIDTH, next)));
    }
    function onUp() {
      dragging.current = false;
      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [containerRef]);

  const startDrag = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  return { startDrag, width };
}
