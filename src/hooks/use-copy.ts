import { useCallback, useEffect, useRef, useState } from 'react';

type UseCopyToClipboardParams = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  resetTime?: number;
};

export function useCopyToClipboard({
  onSuccess,
  onError,
  resetTime = 2000,
}: UseCopyToClipboardParams = {}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), resetTime);
        onSuccess?.();
        return true;
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error(String(error)));
        return false;
      }
    },
    [resetTime, onSuccess, onError],
  );

  const reset = useCallback(() => {
    clearTimeout(timerRef.current);
    setCopied(false);
  }, []);

  return { copied, copy, reset };
}
