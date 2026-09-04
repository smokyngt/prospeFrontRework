'use client';

import { ImageOff } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/workspace-ui/ui/skeleton';
import { cn } from '@/lib/cn';

import { pagePreviewCache, type PreviewPage } from './page-cache';

type PagePreviewProps = {
  className?: string;
  fileId?: string;
  highlightText?: string;
  pageNumber?: number;
};

export function PagePreview({ className, fileId, highlightText, pageNumber }: PagePreviewProps) {
  const [page, setPage] = useState<null | PreviewPage>(() =>
    pagePreviewCache.get({ fileId, highlightText, pageNumber }),
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const cached = pagePreviewCache.get({ fileId, highlightText, pageNumber });
    if (cached) {
      setPage(cached);
      setFailed(false);
      return;
    }

    setPage(null);
    setFailed(false);
    let active = true;

    pagePreviewCache
      .prerender([{ fileId, highlightText, pageNumber }])
      .then(() => {
        if (!active) {
          return;
        }
        const result = pagePreviewCache.get({ fileId, highlightText, pageNumber });
        if (result) {
          setPage(result);
        } else {
          setFailed(true);
        }
      })
      .catch(() => {
        if (active) {
          setFailed(true);
        }
      });

    return () => {
      active = false;
    };
  }, [fileId, highlightText, pageNumber]);

  if (failed) {
    return (
      <div
        className={cn(
          'flex aspect-[3/4] w-full items-center justify-center border border-dashed bg-muted/20 text-muted-foreground',
          className,
        )}
      >
        <ImageOff className="h-5 w-5" />
      </div>
    );
  }

  if (!page) {
    return <Skeleton className={cn('aspect-[3/4] w-full', className)} />;
  }

  return (
    <div className={cn('relative overflow-hidden border bg-background', className)}>
      <Image
        src={page.dataUrl}
        alt=""
        width={page.width}
        height={page.height}
        unoptimized
        className="block h-auto w-full"
      />
      {page.boxes.map((box, index) => (
        <div
          key={index}
          className="absolute border border-orange-500/80 bg-orange-500/25"
          style={{
            height: `${box.height}%`,
            left: `${box.left}%`,
            top: `${box.top}%`,
            width: `${box.width}%`,
          }}
        />
      ))}
    </div>
  );
}
