import { FileText, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/workspace-ui/ui/button';
import { ScrollArea, ScrollBar } from '@/components/workspace-ui/ui/scroll';
import { cn } from '@/lib/cn';
import { type PdfTab, usePdfStore } from '@/stores/pdf';

type PdfTabStripProps = {
  className?: string;
};

export function PdfTabStrip({ className }: PdfTabStripProps) {
  const { t } = useTranslation('files');
  const tabs = usePdfStore((s) => s.tabs);
  const activeTabId = usePdfStore((s) => s.activeTabId);
  const setActiveTab = usePdfStore((s) => s.setActiveTab);
  const closeTab = usePdfStore((s) => s.closeTab);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <ScrollArea className={cn('min-w-0 flex-1', className)}>
      <div className="flex items-center gap-0.5 p-1">
        {tabs.map((tab: PdfTab) => (
          <div
            key={tab.id}
            className={cn(
              'group relative flex shrink-0 items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer',
              'text-xs min-w-[96px] max-w-[160px] transition-all',
              tab.id === activeTabId
                ? 'bg-background text-foreground shadow-sm border border-border/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            <FileText
              className={cn(
                'h-3.5 w-3.5 shrink-0',
                tab.id === activeTabId ? 'text-primary' : 'text-muted-foreground',
              )}
            />
            <div className="flex-1 min-w-0">
              <span className="block truncate font-medium text-[11px] leading-tight">
                {tab.fileName}
              </span>
              <span className="block text-[9px] leading-tight text-muted-foreground">
                {t('viewer.page', {
                  current: tab.pageNumber,
                  total: tab.totalPages,
                })}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-4.5 w-4.5 p-0 shrink-0',
                'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity',
                'hover:bg-destructive/10 hover:text-destructive',
              )}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
