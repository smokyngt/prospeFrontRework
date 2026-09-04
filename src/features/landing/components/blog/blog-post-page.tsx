import { ArrowLeft, CalendarDays, Clock3, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { LandingFooter } from '@/features/landing/components/footer';
import { LandingNavbar } from '@/features/landing/components/navigation';
import { blog, blogLanguage, post, tag } from '@/features/landing/data/blog';

type BlogPostPageProps = {
  lang?: string;
  slug: string;
};

export const BlogPostPage = async ({ lang, slug }: BlogPostPageProps) => {
  const blogPost = await blog.post.retrieve(slug).catch(() => null);

  if (!blogPost) {
    notFound();
  }

  const language = blogLanguage.get(lang);
  const content = blogPost[language];
  const authors = post.authors(blogPost);
  const postUrl = `https://prosperify.app/blog/${slug}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: content.title,
    description: content.excerpt,
    datePublished: new Date(blogPost.date).toISOString(),
    author: authors.map((a) => ({
      '@type': 'Person',
      name: a.name,
    })),
    publisher: {
      '@type': 'Organization',
      name: 'Prosperify',
      logo: {
        '@type': 'ImageObject',
        url: 'https://prosperify.app/assets/brand/logo-icon.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    ...(blogPost.readTime && {
      timeRequired: blogPost.readTime,
    }),
    ...(blogPost.tags.length > 0 && {
      keywords: blogPost.tags.join(', '),
    }),
    image: 'https://prosperify.app/opengraph-image',
  };

  const jsonLdHtml = JSON.stringify(articleJsonLd).replace(/</g, '\\u003c');

  return (
    <main className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml }} />
      <LandingNavbar />
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-orange-600 dark:text-neutral-400"
          href="/blog"
          title={language === 'fr' ? 'Retour au blog' : 'Back to blog'}
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'fr' ? 'Retour au blog' : 'Back to blog'}
        </Link>

        <header className="mt-12 border-b border-neutral-200 pb-12 dark:border-neutral-800">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              {(() => {
                return blogPost.tags.slice(0, 3).map((tagStr) => {
                  const BadgeIcon = tag.icon(tagStr);
                  return (
                    <span
                      key={tagStr}
                      className="inline-flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 font-medium text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                    >
                      <BadgeIcon className="h-3.5 w-3.5" />
                      {tagStr}
                    </span>
                  );
                });
              })()}
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(blogPost.date))}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                {blogPost.readTime}
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              {content.title}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-600 dark:text-neutral-400">
              {content.excerpt}
            </p>

            {authors.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {authors.map((author) => (
                  <span
                    key={author.id}
                    className="inline-flex items-center gap-2 border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  >
                    {author.avatarUrl ? (
                      <Image
                        src={author.avatarUrl}
                        alt={author.name}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <User className="h-3.5 w-3.5 text-neutral-400" />
                    )}
                    {author.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="mt-12 space-y-12">
          {content.sections.map((section) => (
            <section key={section.heading || section.body.slice(0, 24)}>
              {section.heading ? (
                <h2 className="text-2xl font-bold leading-snug tracking-tight text-neutral-900 dark:text-neutral-50">
                  {section.heading}
                </h2>
              ) : null}
              <div
                className={`${
                  section.heading ? 'mt-4' : ''
                } border-l-2 border-orange-200 pl-5 dark:border-orange-500/40`}
              >
                <div className="space-y-5">
                  {section.body.split(/\n{2,}/).map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 32)}
                      className="whitespace-pre-line leading-8 text-neutral-600 dark:text-neutral-400"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-orange-600 dark:text-neutral-400"
            href="/blog"
            title={language === 'fr' ? 'Retour au blog' : 'Back to blog'}
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'fr' ? 'Retour au blog' : 'Back to blog'}
          </Link>
        </div>
      </article>
      <LandingFooter />
    </main>
  );
};
