import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page not found | Prosperify',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
        404 - Page not found
      </h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-300">
        This page does not exist or has been moved.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
        <Link href="/" className="text-orange-600 hover:text-orange-700" title="Retour à l'accueil">
          Back home
        </Link>
        <Link
          href="/blog"
          className="text-neutral-600 hover:text-orange-600 dark:text-neutral-400"
          title="Blog"
        >
          Blog
        </Link>
        <Link
          href="/team"
          className="text-neutral-600 hover:text-orange-600 dark:text-neutral-400"
          title="Team"
        >
          Team
        </Link>
      </div>
    </div>
  );
}
