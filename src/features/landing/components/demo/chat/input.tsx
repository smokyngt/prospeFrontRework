import {
  ArrowUp,
  CornerDownLeft,
  FileUp,
  Loader2,
  Paperclip,
  Pencil,
  Sparkles,
  StopCircle,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { selectedStoreIds, toStores } from './adapters';
import { usePortalContainer } from './portal-context';
import { ChatStoreSelector } from './store-selector';

import type { DemoStoreOption } from '../demo-config';

const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.txt,.csv,.md';
const acceptedDocumentTypes: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export const EFFORT_LEVELS = [5, 10, 15, 20, 25] as const;
export const EFFORT_DEFAULT = EFFORT_LEVELS[0];

const effortLevel = (effort: number): number => {
  const index = EFFORT_LEVELS.findIndex((level) => level >= effort);
  return index === -1 ? EFFORT_LEVELS.length : index + 1;
};

type ChatInputProps = {
  autoFocus?: boolean;
  draftKey?: string;
  onSend: (message: string) => void;
  onSteer?: (message: string) => void;
  onStop?: () => void;
  onUpload?: (files: File[]) => void;
  streaming?: boolean;
  queuedSteer?: string;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  readOnly?: boolean;
  storeLabels?: Record<string, string>;
  stores?: DemoStoreOption[];
  renderFilterSlot?: () => React.ReactNode;
  effort?: number;
  onEffortChange?: (effort: number) => void;
  editingMessageId?: string | null;
  editingText?: string;
  onCancelEdit?: () => void;
};

export function ChatInput({
  autoFocus = true,
  draftKey,
  onSend,
  onSteer,
  onStop,
  onUpload,
  streaming,
  queuedSteer,
  disabled,
  placeholder,
  value: controlledValue,
  readOnly,
  storeLabels,
  stores = [],
  renderFilterSlot,
  effort = EFFORT_DEFAULT,
  onEffortChange,
  editingMessageId,
  editingText,
  onCancelEdit,
}: ChatInputProps) {
  const { t } = useTranslation('chat');
  const portalContainer = usePortalContainer();
  const [value, setValue] = useState('');
  const sdkStores = useMemo(() => toStores(stores, storeLabels ?? {}), [stores, storeLabels]);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => selectedStoreIds(stores));
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const savedDraftRef = useRef<string>('');
  const focusTextarea = useCallback(() => {
    if (!autoFocus || disabled) {
      return;
    }

    const textarea = ref.current;
    if (!textarea) {
      return;
    }

    requestAnimationFrame(() => {
      const current = ref.current;
      if (!current || current.disabled) {
        return;
      }
      current.focus({ preventScroll: true });
      const end = current.value.length;
      current.setSelectionRange(end, end);
    });
  }, [autoFocus, disabled]);
  useEffect(() => {
    if (!draftKey) {
      setValue('');
      return;
    }
    try {
      setValue(sessionStorage.getItem(draftKey) ?? '');
    } catch {
      setValue('');
    }
  }, [draftKey]);
  useEffect(() => {
    if (!draftKey) {
      return;
    }
    try {
      if (value.trim()) {
        sessionStorage.setItem(draftKey, value);
        return;
      }
      sessionStorage.removeItem(draftKey);
    } catch {
      void 0;
    }
  }, [draftKey, value]);
  useEffect(() => {
    if (controlledValue !== undefined) {
      setValue(controlledValue);
    }
  }, [controlledValue]);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 200)}px`;
    }
  }, [value]);
  const editingTextRef = useRef(editingText);

  editingTextRef.current = editingText;
  useEffect(() => {
    if (editingMessageId) {
      setValue(editingTextRef.current ?? '');
      focusTextarea();
    }
  }, [editingMessageId, focusTextarea]);
  useEffect(() => {
    focusTextarea();
  }, [focusTextarea]);
  const submitSteer = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || !onSteer) {
      return;
    }
    onSteer(trimmed);
    setValue('');
    focusTextarea();
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) {
      onSend(value.trim());
      return;
    }
    if (value.trim() && !disabled) {
      if (streaming) {
        submitSteer();
        return;
      }
      const trimmed = value.trim();
      historyRef.current = [trimmed, ...historyRef.current.filter((h) => h !== trimmed)].slice(
        0,
        50,
      );
      historyIndexRef.current = -1;
      savedDraftRef.current = '';
      onSend(trimmed);
      if (draftKey) {
        try {
          sessionStorage.removeItem(draftKey);
        } catch {
          void 0;
        }
      }
      setValue('');
      focusTextarea();
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) {
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }
    const ta = ref.current;
    if (!ta) {
      return;
    }
    if (e.key === 'ArrowUp') {
      const cursorAtStart = ta.selectionStart === 0 && ta.selectionEnd === 0;
      const noNewlineBeforeCursor = !ta.value.slice(0, ta.selectionStart).includes('\n');
      if (cursorAtStart || noNewlineBeforeCursor) {
        const history = historyRef.current;
        if (history.length === 0) {
          return;
        }
        const nextIndex = historyIndexRef.current + 1;
        if (nextIndex >= history.length) {
          return;
        }
        if (historyIndexRef.current === -1) {
          savedDraftRef.current = value;
        }
        e.preventDefault();
        historyIndexRef.current = nextIndex;
        setValue(history[nextIndex]);
        requestAnimationFrame(() => {
          if (ta) {
            ta.selectionStart = 0;
            ta.selectionEnd = 0;
          }
        });
      }
      return;
    }
    if (e.key === 'ArrowDown' && historyIndexRef.current >= 0) {
      e.preventDefault();
      const nextIndex = historyIndexRef.current - 1;
      historyIndexRef.current = nextIndex;
      setValue(nextIndex === -1 ? savedDraftRef.current : historyRef.current[nextIndex]);
      requestAnimationFrame(() => {
        if (ta) {
          const end =
            nextIndex === -1 ? savedDraftRef.current.length : historyRef.current[nextIndex].length;
          ta.selectionStart = end;
          ta.selectionEnd = end;
        }
      });
    }
  };
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!onUpload) {
        return;
      }
      e.preventDefault();
      setIsDragOver(true);
    },
    [onUpload],
  );
  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!onUpload) {
        return;
      }
      const allowed = Object.keys(acceptedDocumentTypes);
      const files = Array.from(e.dataTransfer.files).filter(
        (f) =>
          allowed.includes(f.type) ||
          ACCEPTED_EXTENSIONS.split(',').some((ext) => f.name.toLowerCase().endsWith(ext)),
      );
      if (files.length > 0) {
        onUpload(files);
      }
    },
    [onUpload],
  );
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onUpload || !e.target.files) {
        return;
      }
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        onUpload(files);
      }
      e.target.value = '';
    },
    [onUpload],
  );
  const inSteerMode = streaming && !!onSteer;
  return (
    <form
      data-tour="chat-composer"
      onSubmit={handleSubmit}
      className="relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {editingMessageId && (
        <div className="mb-2 flex items-center gap-2 rounded-none border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
          <Pencil className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">{t('edit.editing_message', 'Editing message')}</span>
          <button
            type="button"
            className="ml-auto shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => {
              onCancelEdit?.();
              setValue('');
            }}
            aria-label={t('actions.cancel', 'Cancel')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {queuedSteer && (
        <div className="mb-2 flex items-center gap-2 rounded-none border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
          <span className="font-medium truncate">{queuedSteer}</span>
          <span className="ml-auto shrink-0 text-muted-foreground">
            {streaming
              ? t('steer.active', 'Steering...')
              : t('steer.queued', 'Sending after stop...')}
          </span>
        </div>
      )}
      {isDragOver && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md border-2 border-dashed border-primary bg-primary/5 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <FileUp className="h-6 w-6 text-primary" />
            <p className="text-sm font-medium text-primary">
              {t('upload.drop_here', 'Drop files here')}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border/50 bg-background/95 px-3 py-2.5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-colors focus-within:border-primary/30 focus-within:shadow-[0_14px_38px_rgba(15,23,42,0.10)]">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={handleFileInput}
        />
        <Textarea
          ref={ref}
          data-chat-input
          value={value}
          readOnly={readOnly}
          onChange={(e) => !readOnly && setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            inSteerMode
              ? t('steer_placeholder', 'Steer the agent...')
              : placeholder || t('input_placeholder')
          }
          disabled={disabled}
          className="min-h-[40px] max-h-[220px] w-full resize-none border-0 bg-transparent px-1 py-1 text-[15px] shadow-none placeholder:truncate focus-visible:ring-0 focus-visible:ring-offset-0"
          rows={1}
        />
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
            {stores.length > 0 && (
              <ChatStoreSelector
                stores={sdkStores}
                selectedIds={selectedIds}
                onChange={setSelectedIds}
              />
            )}
            {renderFilterSlot?.()}
            {onUpload && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    aria-label={t('upload.attach', 'Attach files')}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-xs" container={portalContainer}>
                  <p>{t('upload.attach', 'Attach files')}</p>
                  <p className="text-muted-foreground">
                    {t(
                      'upload.accepted_types',
                      'PDF, Word, Excel, PowerPoint, ODT, TXT, CSV, Markdown',
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            {onEffortChange && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="hidden sm:inline">
                      {t(`effort.level_${effortLevel(effort)}`)}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  container={portalContainer}
                  className="w-72 max-w-[calc(100vw-2rem)] rounded-none p-3"
                  side="top"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-medium text-foreground">{t('effort.selector')}</p>
                    <span className="text-xs font-medium text-primary">
                      {t(`effort.level_${effortLevel(effort)}`)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {t('effort.description')}
                  </p>
                  <Slider
                    className={cn('mt-3', readOnly && 'pointer-events-none')}
                    min={1}
                    max={EFFORT_LEVELS.length}
                    step={1}
                    value={effortLevel(effort)}
                    readOnly={readOnly}
                    tabIndex={readOnly ? -1 : undefined}
                    onChange={(event) =>
                      onEffortChange(EFFORT_LEVELS[Number(event.target.value) - 1])
                    }
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/70">
                    <span>{t('effort.level_1')}</span>
                    <span>{t(`effort.level_${EFFORT_LEVELS.length}`)}</span>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <p className="hidden text-[11px] text-muted-foreground/60 md:block">
              {t('composer.shortcut_hint')}
            </p>
            {streaming ? (
              <>
                {inSteerMode && value.trim() && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 shrink-0 rounded-none text-primary hover:bg-primary/10 hover:text-primary"
                        aria-label={t('steer', 'Steer')}
                      >
                        <CornerDownLeft className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent container={portalContainer}>
                      {t('steer', 'Steer the agent')}
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={onStop}
                      className="h-9 w-9 shrink-0 rounded-none hover:bg-destructive/10"
                      aria-label={t('stop')}
                    >
                      <StopCircle className="h-5 w-5 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent container={portalContainer}>{t('stop')}</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    data-demo-tour="send"
                    type="submit"
                    size="icon"
                    disabled={(!readOnly && !value.trim()) || disabled}
                    className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:scale-100 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
                    aria-label={t('actions.send')}
                  >
                    <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent container={portalContainer}> {t('actions.send')} </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
