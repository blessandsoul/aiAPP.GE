'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useReducedMotion } from 'framer-motion';
import { Ico } from '@/components/common/Ico';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';
import { createAppDemoLoop } from './app-demo-visibility.mjs';

const COST_FACTOR = {
  m1: 0.008,
  m2: 0.014,
  m3: 0.024,
} as const;

type Complexity = keyof typeof COST_FACTOR;
type DemoLoop = {
  replay: () => void;
  takeControl: () => void;
  cleanup: () => void;
};

const INITIAL_SAMPLE = { conversations: 1_200, steps: 2, complexity: 'm1' as Complexity };
const FINAL_SAMPLE = { conversations: 6_000, steps: 5, complexity: 'm2' as Complexity };
const CYCLE_MS = 6_000;

export function AppCost() {
  const t = useTranslations('product.cost');
  const reduced = useReducedMotion();
  const [conversations, setConversations] = useState(INITIAL_SAMPLE.conversations);
  const [steps, setSteps] = useState(INITIAL_SAMPLE.steps);
  const [complexity, setComplexity] = useState<Complexity>(INITIAL_SAMPLE.complexity);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const loopRef = useRef<DemoLoop | null>(null);

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const setSample = useCallback((sample: typeof INITIAL_SAMPLE) => {
    setConversations(sample.conversations);
    setSteps(sample.steps);
    setComplexity(sample.complexity);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    const play = () => {
      clear();
      setSample(INITIAL_SAMPLE);
      timers.current.push(setTimeout(() => setConversations(FINAL_SAMPLE.conversations), 2_000));
      timers.current.push(setTimeout(() => setSteps(FINAL_SAMPLE.steps), 4_000));
      timers.current.push(setTimeout(() => setComplexity(FINAL_SAMPLE.complexity), CYCLE_MS));
    };

    const loop = createAppDemoLoop({
      target: sectionRef.current,
      reducedMotion: Boolean(reduced),
      cycleMs: CYCLE_MS,
      play,
      showFinal: () => setSample(FINAL_SAMPLE),
      reset: () => setSample(INITIAL_SAMPLE),
      stop: clear,
    });
    loopRef.current = loop;

    return () => {
      loop.cleanup();
      clear();
      if (loopRef.current === loop) loopRef.current = null;
    };
  }, [clear, reduced, setSample]);

  const monthly = Math.max(20, conversations * steps * COST_FACTOR[complexity]);
  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(value));

  const takeControl = () => loopRef.current?.takeControl();
  const replay = () => loopRef.current?.replay();

  const updateConversations = (value: number) => {
    takeControl();
    setConversations(value);
  };
  const updateSteps = (value: number) => {
    takeControl();
    setSteps(value);
  };
  const updateComplexity = (value: Complexity) => {
    takeControl();
    setComplexity(value);
  };

  return (
    <SectionContainer className="py-20 md:py-28">
      <div ref={sectionRef} className="grid min-w-0 gap-10 lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)] lg:gap-14">
        <div className="min-w-0">
          <span className="text-[12px] tracking-wide text-neutral-900/45">{t('eyebrow')}</span>
          <h2 className="mt-4 text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-neutral-900 md:text-4xl">
            {t('heading')}
          </h2>
          <p className="mt-3 text-pretty text-[15px] leading-relaxed text-[#525252]">{t('subtitle')}</p>

          <div className="mt-8 flex flex-col gap-6">
            <Range
              label={t('conversations')}
              value={conversations}
              min={200}
              max={50_000}
              step={200}
              onChange={updateConversations}
            />
            <Range label={t('steps')} value={steps} min={1} max={12} step={1} onChange={updateSteps} />

            <div>
              <span className="text-[13px] font-medium text-neutral-900/70">{t('complexity')}</span>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(['m1', 'm2', 'm3'] as Complexity[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updateComplexity(item)}
                    aria-pressed={complexity === item}
                    className={cn(
                      'min-h-11 rounded-xl px-2 text-[13px] font-semibold transition-[transform,background-color,color,box-shadow] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2',
                      complexity === item
                        ? 'bg-neutral-900 text-white'
                        : 'bg-[#fafafa] text-neutral-900/65 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]',
                    )}
                  >
                    {t(item)}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={replay}
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[#fafafa] px-5 text-[13px] font-semibold text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.09)] transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
            >
              <Ico name="solar:refresh-bold-duotone" className="h-4 w-4" />
              {t('replay')}
            </button>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-3xl bg-[#111214] p-5 text-white shadow-[0_24px_60px_-42px_rgba(0,0,0,0.72)] md:p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-[13px] font-semibold text-white/55">
              <Ico name="solar:calculator-bold-duotone" className="h-5 w-5 text-[var(--brand)]" />
              {t('monthly')}
            </span>
            <span className="rounded-full bg-white/[0.08] px-3 py-1 text-[11px] font-semibold text-white/55">
              {t('usage')}
            </span>
          </div>

          <p className="mt-8 break-words font-display text-[clamp(2.8rem,10vw,5.5rem)] font-extrabold tabular-nums leading-none text-white">
            <span className="mr-2 text-[clamp(1rem,3vw,1.4rem)] font-bold text-[var(--brand)]">USD</span>
            {formatNumber(monthly)}
            <span className="ml-2 text-base font-semibold text-white/40 md:text-xl">{t('perMonth')}</span>
          </p>

          <div className="mt-9 grid gap-3 md:grid-cols-3">
            <Metric icon="solar:chat-round-dots-bold-duotone" label={t('conversations')} value={formatNumber(conversations)} />
            <Metric icon="solar:layers-minimalistic-bold-duotone" label={t('steps')} value={formatNumber(steps)} />
            <Metric icon="solar:spedometer-max-bold-duotone" label={t('complexity')} value={t(complexity)} />
          </div>

          <div className="mt-6 rounded-2xl bg-white/[0.07] p-4 md:p-5">
            <span className="flex items-center gap-2 text-[13px] font-bold text-[var(--brand)]">
              <Ico name="solar:wallet-bold-duotone" className="h-5 w-5" />
              {t('result')}
            </span>
            <p className="mt-2 text-[13px] leading-relaxed text-white/58">{t('note')}</p>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="flex items-baseline justify-between gap-4">
        <span className="text-[13px] font-medium text-neutral-900/70">{label}</span>
        <span className="font-display text-lg font-extrabold tabular-nums text-neutral-900">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-11 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[#e5e5e5] [&::-webkit-slider-thumb]:mt-[-7px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-900 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-neutral-900 [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[#e5e5e5]"
      />
    </label>
  );
}

function Metric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/[0.055] p-4">
      <Ico name={icon} className="h-5 w-5 text-white/50" />
      <span className="mt-4 block break-words text-[18px] font-bold text-white">{value}</span>
      <span className="mt-1 block text-[11px] leading-snug text-white/45">{label}</span>
    </div>
  );
}
