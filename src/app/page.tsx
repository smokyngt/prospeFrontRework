'use client';

import LandingPage from '@/features/landing/components/landing-page';
import { useLandingLanguageSync } from '@/hooks/use-landing-language';

export default function Home() {
  useLandingLanguageSync();

  return <LandingPage />;
}
