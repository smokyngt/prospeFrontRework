export {};

declare global {
  interface Window {
    __consent?: { analytics: boolean; marketing: boolean; timestamp: string };
    __gtmId?: string;
    dataLayer?: unknown[];
  }
}
