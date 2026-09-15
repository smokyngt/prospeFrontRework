import { DemoPreviewClient } from './demo-preview-client';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo preview',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DemoPreviewPage() {
  return <DemoPreviewClient />;
}
