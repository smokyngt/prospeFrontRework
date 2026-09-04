import { Folder, Tag } from 'lucide-react';

import { workspace } from '@/features/landing/data/workspace-api';
import { uiLanguage } from '@/features/landing/lib/theme';

import type { LucideIcon } from 'lucide-react';

type BlogPostContent = {
  excerpt: string;
  sections: Array<{ body: string; heading: string }>;
  title: string;
};

export type BlogPost = {
  asset?: { alt: string; src: string };
  authorIds: string[];
  authors?: Array<{ avatarUrl?: string; id: string; name: string }>;
  date: string;
  en: BlogPostContent;
  fr: BlogPostContent;
  href: string;
  id: string;
  readTime: string;
  tags: string[];
};

export const blogLanguage = {
  get(lang?: string): 'en' | 'fr' {
    return uiLanguage(lang);
  },
};

export const blog = {
  async posts(): Promise<BlogPost[]> {
    return workspace.blog.posts();
  },
  post: {
    async retrieve(id: string): Promise<BlogPost | null> {
      const posts = await blog.posts();

      return posts.find((post) => post.id === id) ?? null;
    },
  },
  slugs: {
    async all(): Promise<string[]> {
      const posts = await blog.posts();

      return posts.map((post) => post.id);
    },
  },
};

export const post = {
  authors(post: BlogPost): Array<{
    avatarUrl?: string;
    id: string;
    initials: string;
    linkedinUrl?: string;
    name: string;
  }> {
    if (post.authors && post.authors.length > 0) {
      return post.authors.map((a) => ({
        avatarUrl: a.avatarUrl,
        id: a.id,
        initials: a.name.slice(0, 2).toUpperCase(),
        name: a.name,
      }));
    }

    return post.authorIds.map((id) => {
      const initials = id.slice(0, 2).toUpperCase();
      return { avatarUrl: undefined, id, initials, name: id };
    });
  },
};

export const tag = {
  icon(tag?: string): LucideIcon {
    if (!tag) {
      return Folder;
    }

    return Tag;
  },
};
