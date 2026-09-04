import { File, Folder } from 'lucide-react';

import { cn } from '@/lib/cn';
import { format } from '@/lib/format';
import { usePdfStore } from '@/stores/pdf';

import type { ToolResponse } from './types';

type LsItem = {
  fileId?: string;
  name: string;
  size?: number;
  type: 'file' | 'folder';
};

function LsItemRow({ item }: { item: LsItem }) {
  const openTab = usePdfStore((s) => s.openTab);
  const openSidebar = usePdfStore((s) => s.openSidebar);
  const isFolder = item.type === 'folder';
  const Icon = isFolder ? Folder : File;
  const canOpen = !isFolder && Boolean(item.fileId);

  return (
    <button
      type="button"
      disabled={!canOpen}
      onClick={() => {
        if (!item.fileId) {
          return;
        }
        openTab({ fileId: item.fileId, fileName: item.name });
        openSidebar();
      }}
      className={cn(
        'flex w-full items-center gap-1.5 py-0.5 text-left text-[10px] transition-colors',
        canOpen ? 'cursor-pointer hover:bg-primary/5' : 'cursor-default',
      )}
    >
      <Icon
        className={cn('h-2.5 w-2.5 shrink-0', isFolder ? 'text-primary/70' : 'text-primary/40')}
      />
      <span
        className={cn(
          'truncate',
          isFolder ? 'font-medium text-foreground/80' : 'text-muted-foreground/80',
        )}
      >
        {item.name}
        {isFolder ? '/' : ''}
      </span>
      {item.size !== null && item.size !== undefined && (
        <span className="ml-auto shrink-0 text-[9px] text-muted-foreground/40">
          {format.bytes(item.size)}
        </span>
      )}
    </button>
  );
}

type TreeData = {
  files: { fileId?: string; name: string; size?: number }[];
  folders: { name: string }[];
  path?: string;
  totalFiles?: number;
  totalFolders?: number;
};

type LsTreeViewProps = { response: ToolResponse | null };

export function LsTreeView({ response }: LsTreeViewProps) {
  if (!response) {
    return null;
  }
  const chunk = response.chunks?.[0];
  if (!chunk) {
    return null;
  }

  const treeData = chunk.metadata?.treeData as TreeData | undefined;

  if (treeData) {
    const items: LsItem[] = [
      ...treeData.folders.map((f) => ({
        name: f.name,
        type: 'folder' as const,
      })),
      ...treeData.files.map((f) => ({
        fileId: f.fileId,
        name: f.name,
        size: f.size,
        type: 'file' as const,
      })),
    ];
    return (
      <div className="mt-1.5 overflow-hidden rounded-none border border-border/30 bg-background/50">
        {treeData.path && (
          <div className="border-b border-border/20 bg-muted/20 px-2 py-1">
            <span className="font-mono text-[9px] text-muted-foreground/60">
              ls {treeData.path}
            </span>
          </div>
        )}
        <div className="max-h-44 overflow-y-auto px-2 py-1.5">
          {items.length === 0 ? (
            <span className="text-[10px] text-muted-foreground/40">(empty)</span>
          ) : (
            items.map((item, i) => <LsItemRow key={i} item={item} />)
          )}
        </div>
        <div className="border-t border-border/20 bg-muted/10 px-2 py-1">
          <span className="text-[9px] text-muted-foreground/40">
            {treeData.folders.length} folder(s), {treeData.files.length} file(s)
            {(treeData.totalFolders ?? 0) > treeData.folders.length
              ? ` · ${treeData.totalFolders} total`
              : ''}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1.5 overflow-hidden rounded-none border border-border/30 bg-background/50 p-2">
      <pre className="max-h-44 overflow-y-auto whitespace-pre-wrap text-[10px] leading-relaxed text-muted-foreground/70">
        {chunk.content}
      </pre>
    </div>
  );
}
