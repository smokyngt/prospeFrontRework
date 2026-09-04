import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Maximize2,
  Minimize2,
  RotateCw,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/workspace-ui/ui/badge';
import { Button } from '@/components/workspace-ui/ui/button';
import { Input } from '@/components/workspace-ui/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/workspace-ui/ui/select';
import { Separator } from '@/components/workspace-ui/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/workspace-ui/ui/tooltip';
import { cn } from '@/lib/cn';

import { usePortalContainer } from '../portal-context';
type PdfToolbarProps = {
  fileName: string;
  pageCount?: number;
  pageNumber: number;
  numPages: number;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomChange: (value: number) => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  onRotate: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onDownload?: () => void;
  onOpenDetails?: () => void;
  onSearch?: () => void;
  onClose?: () => void;
  className?: string;
};
export const PdfToolbar = memo(function PdfToolbar({
  fileName,
  pageCount,
  pageNumber,
  numPages,
  onPageChange,
  onPreviousPage,
  onNextPage,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomChange,
  canZoomIn,
  canZoomOut,
  onRotate,
  isFullscreen,
  onToggleFullscreen,
  onDownload,
  onOpenDetails,
  onSearch,
  onClose,
  className,
}: PdfToolbarProps) {
  const { t } = useTranslation('files');
  const portalContainer = usePortalContainer();
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-1.5 p-1.5 border-b bg-muted/30',
        className,
      )}
    >
      <div className="flex items-center gap-2 min-w-0 shrink">
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="hidden text-xs font-medium truncate sm:inline" title={fileName}>
          {fileName}
        </span>
        {pageCount && (
          <Badge
            variant="outline"
            className="hidden h-5 text-[10px] whitespace-nowrap sm:inline-flex"
          >
            {t('viewer.page_count', { count: pageCount })}
          </Badge>
        )}
      </div>
      <div className="flex w-full min-w-0 shrink items-center justify-end gap-1 overflow-x-auto scrollbar-thin flex-nowrap sm:w-auto">
        <div className="flex shrink-0 items-center gap-1 px-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onPreviousPage}
                disabled={pageNumber <= 1}
                className="h-7 w-7"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent container={portalContainer}>{t('viewer.previous_page')}</TooltipContent>
          </Tooltip>
          <div className="flex shrink-0 items-center gap-1 text-xs">
            <Input
              type="number"
              min={1}
              max={numPages}
              value={pageNumber}
              onChange={(e) => onPageChange(parseInt(e.target.value) || 1)}
              className="h-7 w-14 text-center"
            />
            <span className="text-muted-foreground">/ {numPages}</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNextPage}
                disabled={pageNumber >= numPages}
                className="h-7 w-7"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent container={portalContainer}>{t('viewer.next_page')}</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="h-6 shrink-0" />
        <div className="flex shrink-0 items-center gap-1 px-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onZoomOut}
                disabled={!canZoomOut}
                className="h-7 w-7"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent container={portalContainer}>{t('viewer.zoom_out')}</TooltipContent>
          </Tooltip>
          <Select value={zoom.toString()} onValueChange={(v) => onZoomChange(parseFloat(v))}>
            <SelectTrigger className="h-7 w-20" aria-label={t('viewer.zoom')}>
              <SelectValue>{Math.round(zoom * 100)}%</SelectValue>
            </SelectTrigger>
            <SelectContent container={portalContainer}>
              <SelectItem value="0.5">50%</SelectItem>
              <SelectItem value="0.75">75%</SelectItem>
              <SelectItem value="1">100%</SelectItem>
              <SelectItem value="1.25">125%</SelectItem>
              <SelectItem value="1.5">150%</SelectItem>
              <SelectItem value="2">200%</SelectItem>
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onZoomIn}
                disabled={!canZoomIn}
                className="h-7 w-7"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent container={portalContainer}>{t('viewer.zoom_in')}</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="h-6 shrink-0" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onRotate} className="h-7 w-7 shrink-0">
              <RotateCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent container={portalContainer}>{t('viewer.rotate')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="h-7 w-7 shrink-0"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent container={portalContainer}>
            {isFullscreen ? t('viewer.exit_fullscreen') : t('viewer.fullscreen')}
          </TooltipContent>
        </Tooltip>
        {onDownload && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onDownload} className="h-7 w-7 shrink-0">
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent container={portalContainer}>{t('actions.download')}</TooltipContent>
          </Tooltip>
        )}
        {onSearch && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onSearch} className="h-7 w-7 shrink-0">
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent container={portalContainer}>{t('viewer.search')}</TooltipContent>
          </Tooltip>
        )}
        {onOpenDetails && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenDetails}
                className="h-7 w-7 shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent container={portalContainer}>{t('viewer.file_details')}</TooltipContent>
          </Tooltip>
        )}
        {onClose && (
          <>
            <Separator orientation="vertical" className="h-6 shrink-0" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent container={portalContainer}>{t('viewer.close')}</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
});
