import { AlertTriangle, ExternalLink, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/cn';

import { PagePreview } from './page-preview';
import { utils } from './utils';

import type { Citation, Hallucination } from '@prosperify/sdk';

export type SegmentLabels = {
  noSource: string;
  page: (number: number) => string;
  potentialInaccuracy: string;
  relevanceLabel: string;
  riskLabel: string;
};

const STAT_SEGMENTS = 10;

function Stat({
  label,
  value,
  tone = 'primary',
}: {
  label: string;
  value: number;
  tone?: 'primary' | 'warning';
}) {
  const pct = Math.round(value * 100);
  const filled = Math.round(value * STAT_SEGMENTS);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
          {label}
        </span>
        <span
          className={cn(
            'font-mono text-[11px] font-medium tabular-nums',
            utils.strengthClass(value, tone),
          )}
        >
          {pct}%
        </span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: STAT_SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1',
              i < filled ? (tone === 'warning' ? 'bg-warning' : 'bg-primary') : 'bg-muted',
            )}
          />
        ))}
      </div>
    </div>
  );
}

function CardHeader({
  icon,
  title,
  tone,
  meta,
}: {
  icon: React.ReactNode;
  title: string;
  tone: 'primary' | 'warning';
  meta?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center',
          tone === 'primary' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning',
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">{title}</span>
      {meta && <span className="shrink-0 text-[10px] text-muted-foreground">{meta}</span>}
    </div>
  );
}

function CitationPreview({
  citation,
  page,
  relevanceLabel,
}: {
  citation: Citation;
  page: (number: number) => string;
  relevanceLabel: string;
}) {
  return (
    <div className="space-y-2">
      <CardHeader
        icon={<FileText className="h-3 w-3" />}
        title={citation.fileName ?? ''}
        tone="primary"
        meta={citation.pageNumber ? page(citation.pageNumber) : undefined}
      />
      {citation.fileId && citation.pageNumber ? (
        <PagePreview
          className="mx-auto w-40"
          fileId={citation.fileId}
          highlightText={citation.evidence ?? citation.answer ?? undefined}
          pageNumber={citation.pageNumber}
        />
      ) : null}
      {(citation.evidence || citation.answer) && (
        <blockquote className="border-l-2 border-primary/40 pl-2 text-[11px] leading-relaxed text-muted-foreground">
          {citation.evidence ?? citation.answer}
        </blockquote>
      )}
      {citation.confidence !== undefined && (
        <Stat label={relevanceLabel} value={citation.confidence} />
      )}
    </div>
  );
}

function HallucinationPreview({
  hallucination,
  noSourceLabel,
  source,
  title,
  riskLabel,
}: {
  hallucination: Hallucination;
  noSourceLabel: string;
  source?: Citation;
  title: string;
  riskLabel: string;
}) {
  const hasPage = !!source?.fileId && !!source.pageNumber;

  return (
    <div className="space-y-2">
      <CardHeader icon={<AlertTriangle className="h-3 w-3" />} title={title} tone="warning" />
      {hasPage ? (
        <PagePreview
          className="mx-auto w-40"
          fileId={source.fileId!}
          highlightText={hallucination.evidence ?? source.evidence ?? undefined}
          pageNumber={source.pageNumber!}
        />
      ) : (
        <p className="border border-dashed border-border/60 px-2 py-1.5 text-[10px] text-muted-foreground">
          {noSourceLabel}
        </p>
      )}
      <p className="text-[11px] leading-relaxed text-muted-foreground">{hallucination.reason}</p>
      {hallucination.evidence && (
        <blockquote className="border-l-2 border-warning/40 pl-2 text-[11px] leading-relaxed text-muted-foreground">
          {hallucination.evidence}
        </blockquote>
      )}
      <Stat label={riskLabel} value={hallucination.score} tone="warning" />
    </div>
  );
}

function HoverCardShell({
  tone,
  children,
}: {
  tone: 'primary' | 'warning';
  children: React.ReactNode;
}) {
  return (
    <div className="flex max-h-[min(70vh,26rem)] w-72 max-w-[calc(100vw-2rem)] flex-col">
      <div
        className={cn(
          '-mx-3 -mt-3 mb-2.5 h-0.5 shrink-0',
          tone === 'warning' ? 'bg-warning' : 'bg-primary',
        )}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

function useCitationLabels(): SegmentLabels {
  const { t } = useTranslation('chat');
  return {
    noSource: t('hallucination.no_source'),
    page: (number: number) => t('citations.page', { number }),
    potentialInaccuracy: t('hallucination.detected'),
    relevanceLabel: t('citations.confidence_label'),
    riskLabel: t('hallucination.risk_label'),
  };
}

function OpenInDocument({ onOpen }: { onOpen: () => void }) {
  const { t } = useTranslation('chat');
  return (
    <button
      type="button"
      onClick={onOpen}
      className="mt-2.5 flex w-full items-center justify-center gap-1.5 border border-primary/40 bg-primary/10 px-2 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
    >
      <ExternalLink className="h-3 w-3" />
      {t('citations.open_in_document')}
    </button>
  );
}

export const citationPreview = {
  Citation: CitationPreview,
  Hallucination: HallucinationPreview,
  OpenInDocument,
  Shell: HoverCardShell,
  useLabels: useCitationLabels,
};
