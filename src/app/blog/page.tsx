import { BlogIndexPage } from "@/features/landing/components/blog";
import { workspace } from "@/features/landing/data/workspace-api";
import { getServerTranslation } from "@/lib/translations";

import type { Metadata } from "next";

const tr = getServerTranslation("fr");

export const metadata: Metadata = {
  title: tr.meta.pages.blog.title,
  description: tr.meta.pages.blog.description,
};

export default async function BlogPage() {
  try {
    const posts = await workspace.blog.posts();

    return <BlogIndexPage initialPosts={posts} lang="fr" />;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : tr.meta.pages.blogError;

    return <BlogIndexPage initialError={message} initialPosts={[]} lang="fr" />;
  }
}
