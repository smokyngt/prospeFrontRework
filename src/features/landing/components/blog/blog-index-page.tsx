"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { LandingFooter } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/navigation";
import {
  type BlogPost,
  getBlogLanguage,
  getPostAuthors,
  getTagIcon,
} from "@/features/landing/data/blog";
import { workspace } from "@/features/landing/data/workspace-api";

type BlogIndexPageProps = {
  initialError?: string | null;
  initialPosts?: BlogPost[];
  lang?: string;
};

const EMPTY_POSTS: BlogPost[] = [];

function slugifyTag(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function BlogIndexPage({
  initialError = null,
  initialPosts = EMPTY_POSTS,
  lang,
}: BlogIndexPageProps) {
  const router = useRouter();
  const language = getBlogLanguage(lang);
  const { t } = useTranslation();
  const allLabel = t("blog.all");
  const errorLabel = t("blog.error");
  const homeHref = "/";
  const blogHref = "/blog";
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState(t("blog.all"));
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [loadError, setLoadError] = useState<string | null>(initialError);
  const [recency, setRecency] = useState<"30" | "90" | "all">("all");
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const pageSize = 6;

  useEffect(() => {
    let cancelled = false;

    void workspace.publicContent
      .load()
      .then((content) => {
        if (!cancelled && content) {
          setLoadError(null);
          setPosts(content.posts.map(workspace.post.toBlog));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : errorLabel);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialPosts, errorLabel]);

  useEffect(() => {
    setActiveTag(allLabel);
  }, [allLabel]);

  useEffect(() => {
    setPage(1);
  }, [activeTag, query, recency, sort]);

  const tags = useMemo(() => {
    const uniqueTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

    return [allLabel, ...uniqueTags];
  }, [allLabel, posts]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...posts]
      .filter(
        (post) =>
          activeTag === allLabel ||
          post.tags.some((tag) => slugifyTag(tag) === activeTag),
      )
      .filter((post) => {
        if (recency === "all") {
          return true;
        }

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - Number(recency));

        return new Date(post.date) >= cutoff;
      })
      .filter((post) => {
        const content = post[language];

        return `${content.title} ${content.excerpt} ${post.tags.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort(
        (left, right) =>
          left.date.localeCompare(right.date) * (sort === "latest" ? -1 : 1),
      );
  }, [activeTag, allLabel, language, posts, query, recency, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const paginatedPosts = filteredPosts.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const selectTag = (nextTag: string) => {
    setActiveTag(
      nextTag === t("blog.all") ? t("blog.all") : slugifyTag(nextTag),
    );
    router.push(blogHref, { scroll: false });
  };

  return (
    <main className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <LandingNavbar />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-orange-600 dark:text-neutral-400"
          href={homeHref}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("blog.back")}
        </Link>

        <section className="mt-12 border-b border-neutral-200 pb-10 dark:border-neutral-800">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                <span className="h-px w-6 bg-orange-400" />
                {t("blog.badge")}
              </span>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]">
                {t("blog.title")}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-400">
                {t("blog.subtitle")}
              </p>
            </div>
            <div className="border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900/40">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                {t("blog.results")}
              </p>
              <p className="mt-2 text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
                {filteredPosts.length}
              </p>
              <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                {activeTag === t("blog.all")
                  ? t("blog.recencyAll")
                  : tags.find((item) => slugifyTag(item) === activeTag)}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  className="h-10 bg-white pl-9 dark:bg-neutral-950"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("blog.search")}
                  value={query}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {tags.length > 1
                  ? tags.map((item) => {
                      const isActive =
                        (item === t("blog.all") &&
                          activeTag === t("blog.all")) ||
                        slugifyTag(item) === activeTag;
                      const Icon = getTagIcon(item);
                      return (
                        <button
                          key={item}
                          className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm font-medium transition-colors ${
                            isActive
                              ? "border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                              : "border-neutral-200 text-neutral-600 hover:border-orange-200 hover:text-orange-600 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-orange-500/30"
                          }`}
                          onClick={() => selectTag(item)}
                          type="button"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {item}
                        </button>
                      );
                    })
                  : null}
                <button
                  className="inline-flex items-center gap-2 border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:border-orange-200 hover:text-orange-600 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-orange-500/30"
                  onClick={() =>
                    setSort((current) =>
                      current === "latest" ? "oldest" : "latest",
                    )
                  }
                  type="button"
                >
                  <Clock3 className="h-4 w-4" />
                  {sort === "latest"
                    ? t("blog.newerFirst")
                    : t("blog.olderFirst")}
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500">
                {t("blog.recency")}
              </span>
              {[
                ["all", t("blog.recencyAll")],
                ["30", t("blog.recency30")],
                ["90", t("blog.recency90")],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={`border px-3 py-1.5 text-sm font-medium transition-colors ${
                    recency === value
                      ? "border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                      : "border-neutral-200 text-neutral-600 hover:border-orange-200 hover:text-orange-600 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-orange-500/30"
                  }`}
                  onClick={() => setRecency(value as "30" | "90" | "all")}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loadError ? (
            <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {t("blog.error")}
            </div>
          ) : null}

          {/* Posts grid */}
          {paginatedPosts.length > 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {paginatedPosts.map((post, index) => {
                const content = post[language];
                const href = post.href;
                const isFeatured = index === 0;

                return (
                  <Link
                    key={post.id}
                    className={`group relative border border-neutral-200 bg-white transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-orange-500/30 ${
                      isFeatured ? "md:col-span-2" : ""
                    }`}
                    href={href}
                  >
                    <div className={`p-6 ${isFeatured ? "sm:p-8" : ""}`}>
                      {/* Top row: tags + read time */}
                      <div className="mb-4 flex items-center justify-between text-xs text-neutral-500">
                        <div className="flex flex-wrap gap-1.5">
                          {post.tags.slice(0, 2).map((tag) => {
                            const BadgeIcon = getTagIcon(tag);
                            return (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 font-medium text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                              >
                                <BadgeIcon className="h-3.5 w-3.5" />
                                {tag}
                              </span>
                            );
                          })}
                        </div>
                        <span className="inline-flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
                          <Clock3 className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>

                      {/* Title */}
                      <h2
                        className={`font-bold leading-snug tracking-tight text-neutral-900 dark:text-neutral-50 ${
                          isFeatured ? "text-2xl sm:text-3xl" : "text-xl"
                        }`}
                      >
                        {content.title}
                      </h2>

                      {/* Excerpt */}
                      <p
                        className={`mt-3 leading-relaxed text-neutral-600 dark:text-neutral-400 ${
                          isFeatured ? "text-base" : "text-sm"
                        }`}
                      >
                        {content.excerpt}
                      </p>

                      {/* Meta row: date + authors */}
                      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Intl.DateTimeFormat(
                            language === "fr" ? "fr-FR" : "en-US",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          ).format(new Date(post.date))}
                        </span>
                        {getPostAuthors(post).map((author, ai) => (
                          <span
                            key={`${post.id}-${author.id}`}
                            className="inline-flex items-center gap-1.5"
                          >
                            {ai > 0 && (
                              <span className="text-neutral-300 dark:text-neutral-600">
                                ·
                              </span>
                            )}
                            {author.avatarUrl ? (
                              <Image
                                src={author.avatarUrl}
                                alt={author.name}
                                width={16}
                                height={16}
                                className="h-4 w-4 rounded-full object-cover"
                                unoptimized
                              />
                            ) : null}
                            {author.name}
                          </span>
                        ))}
                      </div>

                      {/* Read link */}
                      <span
                        className={`inline-flex items-center gap-1.5 font-semibold transition-colors group-hover:text-orange-600 ${
                          isFeatured ? "mt-6 text-sm" : "mt-5 text-sm"
                        } text-neutral-950 dark:text-neutral-50`}
                      >
                        {t("blog.read")}
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-12 border border-dashed border-neutral-200 px-6 py-12 text-center dark:border-neutral-800">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {posts.length ? t("blog.empty") : t("blog.noResults")}
              </p>
            </div>
          )}

          {totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-between border-t border-neutral-200 pt-6 text-sm dark:border-neutral-800">
              <button
                className="border border-neutral-200 px-4 py-2 font-semibold transition-colors hover:border-orange-200 hover:text-orange-600 disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:text-neutral-600 dark:border-neutral-800 dark:hover:border-orange-500/30"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                type="button"
              >
                {t("blog.previous")}
              </button>
              <span className="font-medium text-neutral-400">
                {page} / {totalPages}
              </span>
              <button
                className="border border-neutral-200 px-4 py-2 font-semibold transition-colors hover:border-orange-200 hover:text-orange-600 disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:text-neutral-600 dark:border-neutral-800 dark:hover:border-orange-500/30"
                disabled={page === totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                type="button"
              >
                {t("blog.next")}
              </button>
            </div>
          ) : null}
        </section>
      </div>
      <LandingFooter />
    </main>
  );
}
