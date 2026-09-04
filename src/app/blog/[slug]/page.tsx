import { BlogPostPage } from "@/features/landing/components/blog";
import { getAllBlogSlugs, getBlogPost } from "@/features/landing/data/blog";

type BlogPostRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostRoute({ params }: BlogPostRouteProps) {
  const { slug } = await params;

  return <BlogPostPage lang="fr" slug={slug} />;
}

export async function generateMetadata({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug).catch(() => null);

  return {
    title: post?.fr.title ?? "Blog | Prosperify",
    description: post?.fr.excerpt ?? "Prosperify blog post.",
  };
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs().catch(() => []);

  return slugs.map((slug) => ({ slug }));
}
