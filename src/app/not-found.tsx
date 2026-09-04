import Link from "next/link";

import { getServerTranslation } from "@/lib/translations";

const tr = getServerTranslation("fr");

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
        404
      </h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-300">
        {tr.notFound.description}
      </p>
      <Link
        href="/"
        className="mt-6 text-sm font-medium text-orange-600 hover:text-orange-700"
      >
        {tr.notFound.back}
      </Link>
    </div>
  );
}
