import { canonicalUrl } from '@/config/constants';
import { BlogIndexPage } from '@/features/landing/components/blog';
import { workspace } from '@/features/landing/data/workspace-api';

export const metadata = {
  title: 'Prosperify Blog | Governed document AI insights',
  description:
    'Practical writing on evidence-backed document AI, retrieval, governance and enterprise deployment.',
  alternates: {
    canonical: canonicalUrl('/blog'),
  },
  openGraph: {
    title: 'Blog | Prosperify - Intelligence documentaire gouvernée',
    description:
      "Articles sur l'IA documentaire sourcée, la recherche hybride, la gouvernance et le déploiement en entreprise.",
  },
  twitter: {
    title: 'Blog | Prosperify - Intelligence documentaire gouvernée',
    description:
      "Articles sur l'IA documentaire sourcée, la recherche hybride, la gouvernance et le déploiement en entreprise.",
  },
};

const BlogPage = async () => {
  try {
    const posts = await workspace.blog.posts();

    return <BlogIndexPage initialPosts={posts} lang="fr" />;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Workspace content could not be loaded.';

    return <BlogIndexPage initialError={message} initialPosts={[]} lang="fr" />;
  }
};

export default BlogPage;
