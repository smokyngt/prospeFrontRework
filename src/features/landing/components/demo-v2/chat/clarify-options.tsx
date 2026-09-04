import { Send } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type ClarifySendMeta = {
  patchKind: 'clarify';
  patchLabel: string;
};

type ClarifyOptionsProps = {
  options: string[];
  inputRequired?: boolean[];
  inTimeline?: boolean;
  onSend: (content: string, meta?: ClarifySendMeta) => void;
};

export function ChatClarifyOptions({
  options,
  inputRequired,
  inTimeline = false,
  onSend,
}: ClarifyOptionsProps) {
  const { t } = useTranslation('chat');
  const [otherOpen, setOtherOpen] = useState(false);
  const [otherValue, setOtherValue] = useState('');
  const [expandedInputIdx, setExpandedInputIdx] = useState<number | null>(null);
  const [inputValues, setInputValues] = useState<Record<number, string>>({});

  const handleSubmitOther = () => {
    const value = otherValue.trim();
    if (value) {
      onSend(value, { patchKind: 'clarify', patchLabel: value });
    }
  };

  const handleSubmitOptionInput = (i: number, optionLabel: string) => {
    const value = inputValues[i]?.trim();
    if (value) {
      onSend(`${optionLabel}: ${value}`, {
        patchKind: 'clarify',
        patchLabel: `${optionLabel}: ${value}`,
      });
    }
  };

  return (
    <div className={inTimeline ? 'w-full' : 'max-w-[78%]'}>
      <div className="rounded-xl border border-border/60 bg-background/50 p-3 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t('clarify.pick')}
        </p>
        <div className="space-y-1.5">
          {options.map((option, i) => {
            const needsInput = inputRequired?.[i] === true;
            const isExpanded = expandedInputIdx === i;
            const label = String.fromCharCode(65 + i);

            if (needsInput) {
              return isExpanded ? (
                <div
                  key={i}
                  className="rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary">
                      {label}
                    </span>
                    <span className="text-sm text-foreground">{option}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground border-b border-border/60 pb-0.5"
                      placeholder={t('clarify.input_placeholder', 'Type your answer...')}
                      value={inputValues[i] ?? ''}
                      onChange={(e) =>
                        setInputValues((prev) => ({
                          ...prev,
                          [i]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmitOptionInput(i, option);
                        } else if (e.key === 'Escape') {
                          setExpandedInputIdx(null);
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={!inputValues[i]?.trim()}
                      className="flex-shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
                      onClick={() => handleSubmitOptionInput(i, option)}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  key={i}
                  type="button"
                  className="w-full flex items-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-2.5 text-sm text-left transition-colors hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99]"
                  onClick={() => setExpandedInputIdx(i)}
                >
                  <span className="flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                    {label}
                  </span>
                  {option}
                </button>
              );
            }

            return (
              <button
                key={i}
                type="button"
                className="w-full flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-left transition-colors hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99]"
                onClick={() => onSend(option, { patchKind: 'clarify', patchLabel: option })}
              >
                <span className="flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                  {label}
                </span>
                {option}
              </button>
            );
          })}
          {!otherOpen ? (
            <button
              type="button"
              className="w-full flex items-center gap-3 rounded-lg border border-dashed border-border/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              onClick={() => setOtherOpen(true)}
            >
              <span className="flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                ↳
              </span>
              {t('feedback.reasons.other')}
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2">
              <input
                autoFocus
                type="text"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder={t('clarify.other_placeholder')}
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitOther();
                  } else if (e.key === 'Escape') {
                    setOtherOpen(false);
                    setOtherValue('');
                  }
                }}
              />
              <button
                type="button"
                disabled={!otherValue.trim()}
                className="flex-shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
                onClick={handleSubmitOther}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
