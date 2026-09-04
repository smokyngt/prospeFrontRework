import { useMediaQuery } from './use-media-query';

export function useIsTouch(): boolean {
  return useMediaQuery('(pointer: coarse)');
}
