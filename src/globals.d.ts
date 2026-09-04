interface Window {
  __consent?: { analytics: boolean; marketing: boolean; timestamp: string };
  __gtmId?: string;
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
