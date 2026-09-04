import { useEffect, useRef } from 'react';

export function usePdfShortcuts(handlers: {
  onPreviousPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  const ref = useRef(handlers);
  ref.current = handlers;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      switch (e.key) {
        case 'ArrowLeft':
        case 'PageUp':
          ref.current.onPreviousPage();
          break;
        case 'ArrowRight':
        case 'PageDown':
          ref.current.onNextPage();
          break;
        case '+':
        case '=':
          ref.current.onZoomIn();
          break;
        case '-':
          ref.current.onZoomOut();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
