'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

const CYCLE_MS = 2800;

type Step = {
  description: string;
  heading: string;
  title: string;
};

function WorkflowSection() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const steps: Step[] = [
    {
      description: t('workflow_tabs.create.description'),
      heading: t('workflow_tabs.create.heading'),
      title: t('workflow_tabs.create.title'),
    },
    {
      description: t('workflow_tabs.unify.description'),
      heading: t('workflow_tabs.unify.heading'),
      title: t('workflow_tabs.unify.title'),
    },
    {
      description: t('workflow_tabs.chat.description'),
      heading: t('workflow_tabs.chat.heading'),
      title: t('workflow_tabs.chat.title'),
    },
  ];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || isPaused || document.hidden) {
      return undefined;
    }
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, [isVisible, isPaused, steps.length]);

  const isRunning = isVisible && !isPaused;

  return (
    <div ref={rootRef} className="w-full [overflow-anchor:none]">
      <div className="mb-[var(--pf-content-gap)] scroll-mt-8 text-center">
        <h2
          className="m-0 text-balance font-semibold leading-[1.08]"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)" }}
        >
          {t('workflow.title')}{' '}
          <span className="text-orange-500">{t('workflow.title_highlight')}</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg">
          {t('workflow.subtitle')}
        </p>
      </div>

      <PipelineDiagram activeStep={activeStep} />
      <div className="mt-[var(--pf-cta-gap)] grid grid-cols-3 gap-3 sm:gap-[var(--pf-block-gap)]">
        {steps.map((step, index) => {
          const isActive = activeStep === index;

          return (
            <button
              key={step.title}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveStep(index)}
              onMouseEnter={() => {
                setActiveStep(index);
                setIsPaused(true);
              }}
              onMouseLeave={() => setIsPaused(false)}
              onFocus={() => {
                setActiveStep(index);
                setIsPaused(true);
              }}
              onBlur={() => setIsPaused(false)}
              className="group relative pb-3 text-left"
            >
              <span
                aria-hidden
                className={cn(
                  'absolute inset-x-0 bottom-0 h-0.5 transition-colors duration-500',
                  'bg-neutral-200 dark:bg-neutral-800',
                )}
              />
              {isActive && (
                <span
                  key={`${String(index)}-${String(isRunning)}`}
                  aria-hidden
                  style={{ animationDuration: `${CYCLE_MS}ms` }}
                  className={cn(
                    'absolute inset-x-0 bottom-0 h-0.5 bg-orange-500 dark:bg-orange-400',
                    isRunning ? 'workflow-progress' : 'scale-x-100',
                  )}
                />
              )}

              <span className="flex items-baseline gap-2">
                <span
                  aria-hidden
                  className={cn(
                    'font-mono text-xs tabular-nums transition-colors duration-500 sm:text-sm',
                    isActive
                      ? 'text-orange-500 dark:text-orange-400'
                      : 'text-neutral-300 dark:text-neutral-700',
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors duration-500 sm:text-sm sm:tracking-[0.16em]',
                    isActive
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-neutral-400 dark:text-neutral-500',
                  )}
                >
                  {step.title}
                </span>
              </span>

              <span
                className={cn(
                  'mt-2 hidden text-base font-semibold leading-snug tracking-tight transition-colors duration-500 sm:block sm:text-xl',
                  isActive
                    ? 'text-neutral-950 dark:text-neutral-50'
                    : 'text-neutral-500 dark:text-neutral-400',
                )}
              >
                {step.heading}
              </span>
              <span
                className={cn(
                  'mt-1.5 hidden text-[15px] leading-6 transition-colors duration-500 sm:block',
                  isActive
                    ? 'text-neutral-600 dark:text-neutral-300'
                    : 'text-neutral-400 dark:text-neutral-500',
                )}
              >
                {step.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 sm:hidden">
        <p className="text-base font-semibold leading-snug tracking-tight text-neutral-950 dark:text-neutral-50">
          {steps[activeStep]?.heading}
        </p>
        <p className="mt-1 text-[13px] leading-5 text-neutral-600 dark:text-neutral-300">
          {steps[activeStep]?.description}
        </p>
      </div>
    </div>
  );
}

const STAGE_CROPS = ['0 18 320 292', '376 18 316 300', '760 18 340 292'];

function PipelineDiagram({ activeStep }: { activeStep: number }) {
  return (
    <>
      <svg
        viewBox="0 20 1100 292"
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto hidden h-auto w-full max-w-[1180px] lg:block"
        fill="none"
        aria-hidden
      >
        <StoresStage active={activeStep === 0} />
        <FlowArrow active={activeStep === 1} x={324} />
        <RetrievalStage active={activeStep === 1} />
        <FlowArrow active={activeStep === 2} x={708} />
        <AnswerStage active={activeStep === 2} />
      </svg>

      <svg
        key={activeStep}
        viewBox={STAGE_CROPS[activeStep] ?? STAGE_CROPS[0]}
        preserveAspectRatio="xMidYMid meet"
        className="workflow-rise mx-auto h-auto w-full max-w-[420px] lg:hidden"
        fill="none"
        aria-hidden
      >
        {activeStep === 0 && <StoresStage active />}
        {activeStep === 1 && <RetrievalStage active />}
        {activeStep === 2 && <AnswerStage active />}
      </svg>
    </>
  );
}

type Tone = {
  accent: string;
  accentText: string;
  band: string;
  chrome: string;
  hairline: string;
  muted: string;
  panel: string;
  primary: string;
  strong: string;
  text: string;
};

function stageTone(active: boolean): Tone {
  return {
    accent: active
      ? 'fill-orange-500 dark:fill-orange-400'
      : 'fill-orange-300 dark:fill-orange-500/50',
    accentText: active
      ? 'fill-orange-600 dark:fill-orange-400'
      : 'fill-orange-400 dark:fill-orange-500/70',
    band: 'fill-orange-100 dark:fill-orange-500/15',
    chrome: active
      ? 'stroke-orange-500 dark:stroke-orange-400'
      : 'stroke-neutral-300 dark:stroke-neutral-700',
    hairline: 'stroke-neutral-200 dark:stroke-neutral-800',
    muted: 'fill-neutral-400 dark:fill-neutral-500',
    panel: 'stroke-neutral-200 dark:stroke-neutral-800',
    primary: 'fill-neutral-700 dark:fill-neutral-200',
    strong: 'fill-neutral-300 dark:fill-neutral-700',
    text: 'fill-neutral-200 dark:fill-neutral-800',
  };
}

function TextLine({
  className,
  height = 5,
  width,
  x,
  y,
}: {
  className: string;
  height?: number;
  width: number;
  x: number;
  y: number;
}) {
  return <rect x={x} y={y} width={width} height={height} className={className} />;
}

function Hairline({
  className,
  width,
  x,
  y,
}: {
  className: string;
  width: number;
  x: number;
  y: number;
}) {
  return <path d={`M${x} ${y}h${width}`} className={className} strokeWidth="1" />;
}

function DatabaseGlyph({ className, x, y }: { className: string; x: number; y: number }) {
  return (
    <g className={className} strokeWidth="1.4">
      <ellipse cx={x + 8} cy={y + 4} rx="8" ry="3.4" />
      <path d={`M${x} ${y + 4}v9c0 1.9 3.6 3.4 8 3.4s8-1.5 8-3.4V${y + 4}`} />
      <path d={`M${x} ${y + 9}c0 1.9 3.6 3.4 8 3.4s8-1.5 8-3.4`} />
    </g>
  );
}

function FolderGlyph({ className, x, y }: { className: string; x: number; y: number }) {
  return (
    <g className={className} strokeWidth="1.4">
      <path d={`M${x} ${y + 3}h6l2.5 3H${x + 16}v10H${x}z`} />
    </g>
  );
}

function FileGlyph({ className, x, y }: { className: string; x: number; y: number }) {
  return (
    <g className={className} strokeWidth="1.4">
      <path d={`M${x + 1} ${y}h8l5 5v12H${x + 1}z`} />
      <path d={`M${x + 9} ${y}v5h5`} />
    </g>
  );
}

function CheckGlyph({ className, x, y }: { className: string; x: number; y: number }) {
  return <path d={`M${x} ${y + 5}l4 4 8-9`} className={className} strokeWidth="2" />;
}

function StoresStage({ active }: { active: boolean }) {
  const { t } = useTranslation();
  const tone = stageTone(active);
  const rows = [
    {
      glyph: 'database',
      included: true,
      label: t('workflow_tabs.create.preview.store_first'),
      meta: t('workflow_tabs.create.preview.store_first_meta'),
      y: 78,
    },
    {
      glyph: 'folder',
      included: true,
      label: t('workflow_tabs.create.preview.store_second'),
      meta: t('workflow_tabs.create.preview.store_second_meta'),
      y: 126,
    },
    {
      glyph: 'excluded',
      included: false,
      label: t('workflow_tabs.create.preview.store_excluded'),
      meta: t('workflow_tabs.create.preview.store_excluded_meta'),
      y: 198,
    },
  ];

  return (
    <g className={active ? undefined : 'opacity-60'}>
      <rect
        x="8"
        y="26"
        width="300"
        height="272"
        className={cn('fill-white dark:fill-neutral-950', tone.panel)}
        strokeWidth="1.5"
      />

      <g className={tone.hairline} strokeWidth="1.4">
        <circle cx="31" cy="48" r="5.5" />
        <path d="M35 52l4 4" />
      </g>
      <text x="48" y="52" fontSize="12" className={tone.muted}>
        {t('workflow_tabs.create.preview.search')}
      </text>
      <Hairline className={tone.hairline} width={300} x={8} y={68} />

      <rect
        x="18"
        y="74"
        width="268"
        height="104"
        className={
          active
            ? 'stroke-orange-400 dark:stroke-orange-500/60'
            : 'stroke-neutral-300 dark:stroke-neutral-700'
        }
        strokeWidth="1.5"
        strokeDasharray="5 6"
      />

      {rows.map((row) => (
        <g key={row.glyph}>
          {row.glyph === 'database' && (
            <DatabaseGlyph className={active ? tone.chrome : tone.hairline} x={32} y={row.y + 10} />
          )}
          {row.glyph === 'folder' && (
            <FolderGlyph className={active ? tone.chrome : tone.hairline} x={32} y={row.y + 10} />
          )}
          {row.glyph === 'excluded' && (
            <DatabaseGlyph className={tone.hairline} x={32} y={row.y + 10} />
          )}
          <text
            x="62"
            y={row.y + 20}
            fontSize="12.5"
            className={row.included ? tone.primary : tone.muted}
            textDecoration={row.included ? undefined : 'line-through'}
          >
            {row.label}
          </text>
          <text x="62" y={row.y + 34} fontSize="10.5" className={tone.muted}>
            {row.meta}
          </text>
          {row.included ? (
            <CheckGlyph className={active ? tone.chrome : tone.hairline} x={258} y={row.y + 10} />
          ) : (
            <g className={tone.hairline} strokeWidth="1.6">
              <path d={`M258 ${row.y + 11}l11 11`} />
              <path d={`M269 ${row.y + 11}l-11 11`} />
            </g>
          )}
        </g>
      ))}

      <Hairline className={tone.hairline} width={252} x={26} y={122} />
      <Hairline className={tone.hairline} width={300} x={8} y={188} />
      <Hairline className={tone.hairline} width={300} x={8} y={258} />
      <CheckGlyph className={active ? tone.chrome : tone.hairline} x={32} y={268} />
      <text x="54" y="281" fontSize="10.5" className={tone.muted}>
        {t('workflow_tabs.create.preview.selected')}
      </text>
    </g>
  );
}

function RetrievalStage({ active }: { active: boolean }) {
  const { t } = useTranslation();
  const tone = stageTone(active);

  return (
    <g className={active ? undefined : 'opacity-60'}>
      <rect x="392" y="34" width="292" height="272" className={tone.hairline} strokeWidth="1.5" />
      <rect
        x="384"
        y="26"
        width="292"
        height="272"
        className={cn('fill-white dark:fill-neutral-950', tone.panel)}
        strokeWidth="1.5"
      />

      <FileGlyph className={active ? tone.chrome : tone.hairline} x={398} y={40} />
      <text x="420" y="54" fontSize="11.5" className={tone.primary}>
        {t('workflow_tabs.unify.preview.file')}
      </text>
      <g className={tone.hairline} strokeWidth="1.4">
        <path d="M576 45l-5 6 5 6" />
        <rect x="586" y="42" width="48" height="18" />
        <path d="M644 45l5 6-5 6" />
      </g>
      <text x="610" y="55" fontSize="10.5" textAnchor="middle" className={tone.muted}>
        {t('workflow_tabs.unify.preview.page')}
      </text>
      <Hairline className={tone.hairline} width={292} x={384} y={70} />

      <rect
        x="404"
        y="84"
        width="252"
        height="200"
        className={cn('fill-white dark:fill-neutral-950', tone.hairline)}
        strokeWidth="1.2"
      />
      <text x="420" y="110" fontSize="12.5" fontWeight="600" className={tone.primary}>
        {t('workflow_tabs.unify.preview.title')}
      </text>
      {[0, 1, 2].map((index) => (
        <TextLine
          key={`intro-${index}`}
          className={tone.text}
          width={index === 2 ? 148 : 220}
          x={420}
          y={124 + index * 13}
        />
      ))}

      <rect x="410" y="170" width="240" height="42" className={tone.band} />
      <rect x="404" y="170" width="4" height="42" className={tone.accent} />
      <text x="420" y="187" fontSize="11.5" className={tone.accentText}>
        {t('workflow_tabs.unify.preview.highlight_first')}
      </text>
      <text x="420" y="203" fontSize="11.5" className={tone.accentText}>
        {t('workflow_tabs.unify.preview.highlight_second')}
      </text>

      <rect
        x="414"
        y="220"
        width="124"
        height="60"
        className={
          active
            ? 'stroke-orange-400 dark:stroke-orange-500/60'
            : 'stroke-orange-300 dark:stroke-orange-500/40'
        }
        strokeWidth="1.4"
        strokeDasharray="4 5"
      />
      <rect x="422" y="228" width="108" height="44" className={tone.hairline} strokeWidth="1.2" />
      <path
        d="M422 243h108M422 258h108M458 228v44M494 228v44"
        className={tone.hairline}
        strokeWidth="1"
      />
      {[0, 1, 2].map((index) => (
        <TextLine
          key={`tail-${index}`}
          className={tone.text}
          width={index === 2 ? 62 : 92}
          x={550}
          y={232 + index * 14}
        />
      ))}
    </g>
  );
}

function AnswerStage({ active }: { active: boolean }) {
  const { t } = useTranslation();
  const tone = stageTone(active);
  const sources = [
    {
      key: 'first',
      label: t('workflow_tabs.chat.preview.source_first'),
      page: t('workflow_tabs.chat.preview.source_first_page'),
      x: 784,
    },
    {
      key: 'second',
      label: t('workflow_tabs.chat.preview.source_second'),
      page: t('workflow_tabs.chat.preview.source_second_page'),
      x: 938,
    },
  ];

  return (
    <g className={active ? undefined : 'opacity-60'}>
      <rect
        x="768"
        y="26"
        width="324"
        height="272"
        className={cn('fill-white dark:fill-neutral-950', tone.panel)}
        strokeWidth="1.5"
      />

      <DatabaseGlyph className={active ? tone.chrome : tone.hairline} x={784} y={42} />
      <text x="810" y="54" fontSize="11" className={tone.muted}>
        {t('workflow_tabs.create.preview.store_first')}
      </text>
      <Hairline className={tone.hairline} width={324} x={768} y={70} />

      <rect x="912" y="84" width="164" height="46" className={tone.band} />
      <text x="926" y="103" fontSize="11.5" className={tone.primary}>
        {t('workflow_tabs.chat.preview.question_first')}
      </text>
      <text x="926" y="119" fontSize="11.5" className={tone.primary}>
        {t('workflow_tabs.chat.preview.question_second')}
      </text>

      <text x="784" y="159" fontSize="11.5" className={tone.primary}>
        {t('workflow_tabs.chat.preview.answer_first')}
      </text>
      <text x="784" y="175" fontSize="11.5" className={tone.primary}>
        {t('workflow_tabs.chat.preview.answer_second')}
      </text>
      <rect x="914" y="164" width="18" height="14" className={tone.accent} />
      <text
        x="923"
        y="174.5"
        fontSize="9"
        fontWeight="700"
        textAnchor="middle"
        className="fill-white dark:fill-neutral-950"
      >
        1
      </text>

      <Hairline className={tone.hairline} width={308} x={776} y={204} />
      <text x="784" y="220" fontSize="9.5" letterSpacing="1.4" className={tone.muted}>
        {t('workflow_tabs.chat.preview.sources').toUpperCase()}
      </text>

      {sources.map((source, index) => (
        <g key={source.key}>
          <rect
            x={source.x}
            y="232"
            width="146"
            height="54"
            className={tone.hairline}
            strokeWidth="1.4"
          />
          <FileGlyph
            className={index === 0 && active ? tone.chrome : tone.hairline}
            x={source.x + 14}
            y={246}
          />
          <text x={source.x + 38} y="257" fontSize="9.5" className={tone.primary}>
            {source.label}
          </text>
          <text
            x={source.x + 38}
            y="272"
            fontSize="9.5"
            className={index === 0 ? tone.accentText : tone.muted}
          >
            {source.page}
          </text>
        </g>
      ))}
    </g>
  );
}

function FlowArrow({ active, x }: { active: boolean; x: number }) {
  const stroke = active
    ? 'stroke-orange-400 dark:stroke-orange-500/70'
    : 'stroke-neutral-200 dark:stroke-neutral-800';
  const head = active
    ? 'fill-orange-400 dark:fill-orange-500/70'
    : 'fill-neutral-200 dark:fill-neutral-800';

  return (
    <g>
      <path d={`M${x} 162h44`} className={stroke} strokeWidth="1.5" />
      <path d={`M${x + 52} 162l-10-6.5v13z`} className={head} />
    </g>
  );
}

export { WorkflowSection };
