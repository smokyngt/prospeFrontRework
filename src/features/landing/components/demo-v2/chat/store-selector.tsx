import { Check, Database } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/workspace-ui/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/workspace-ui/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/workspace-ui/ui/popover';
import { cn } from '@/lib/cn';

import { usePortalContainer } from './portal-context';

import type { Store } from '@/lib/workspace-sdk-types';

type ChatStoreSelectorProps = {
  stores: Store[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export function ChatStoreSelector({
  stores,
  selectedIds,
  onChange,
  disabled,
}: ChatStoreSelectorProps) {
  const { t } = useTranslation('chat');
  const portalContainer = usePortalContainer();
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = (store: Store) => {
    const isSelected = selectedIds.includes(store.id);
    if (isSelected) {
      if (selectedIds.length <= 1) {
        return;
      }
      onChange(selectedIds.filter((id) => id !== store.id));
      return;
    }
    onChange([...selectedIds, store.id]);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="relative h-8 w-8 p-0 text-foreground"
          aria-label={`${selectedIds.length} selected stores`}
        >
          <Database className="h-3.5 w-3.5 shrink-0" />
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full border border-background bg-primary px-1 text-[9px] font-semibold tabular-nums text-primary-foreground">
            {selectedIds.length}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        container={portalContainer}
        side="top"
        align="start"
        className="w-64 border-border/70 bg-popover p-0 shadow-lg"
      >
        <Command className="bg-popover">
          <CommandInput placeholder={t('store.search', 'Search stores...')} />
          <CommandList>
            <CommandEmpty>{t('store.unknown', 'No stores found')}</CommandEmpty>
            <CommandGroup>
              {stores.map((store) => {
                const isSelected = selectedIds.includes(store.id);
                return (
                  <CommandItem
                    key={store.id}
                    value={store.name}
                    onSelect={() => handleToggle(store)}
                    className={cn('gap-2 text-foreground', isSelected && 'bg-primary/5')}
                  >
                    <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{store.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
