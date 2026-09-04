import { canonicalUrl } from '@/config/constants';
import { BlogPostPage } from '@/features/landing/components/blog';
import { blog, post } from '@/features/landing/data/blog';

type BlogPostRouteProps = {
  params: Promise<{ slug: string }>;
};

const BlogPostRoute = async ({ params }: BlogPostRouteProps) => {
  const { slug } = await params;

  return <BlogPostPage lang="fr" slug={slug} />;
};

export default BlogPostRoute;

export const generateMetadata = async ({ params }: BlogPostRouteProps) => {
  const { slug } = await params;
  const blogPost = await blog.post.retrieve(slug).catch(() => null);
  const title = blogPost?.fr.title ?? 'Blog | Prosperify';
  const description = blogPost?.fr.excerpt ?? 'Prosperify blog post.';
  const postUrl = canonicalUrl(`/blog/${slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title,
      description,
      url: postUrl,
      type: 'article',
      publishedTime: blogPost?.date ? new Date(blogPost.date).toISOString() : undefined,
      authors: blogPost ? post.authors(blogPost).map((a: { name: string }) => a.name) : undefined,
      tags: blogPost?.tags,
    },
  };
};

export const generateStaticParams = async () => {
  const slugs = await blog.slugs.all().catch(() => []);

  return slugs.map((slug) => ({ slug }));
};
