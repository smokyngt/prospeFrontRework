import { useCallback, useEffect, useState } from 'react';

export function useFullscreen(containerRef: { current: HTMLElement | null }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) {
      return;
    }
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, [containerRef]);
  return { active: isFullscreen, toggle: toggleFullscreen };
}
