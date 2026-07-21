'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useReducedMotion } from 'framer-motion';

import { Ico } from '@/components/common/Ico';
import { SectionContainer } from '@/components/layout/SectionContainer';

import { AppDemoStory } from './AppDemoStory';
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

const INITIAL_VOLUME = 1_200;
const MID_VOLUME = 2_800;
const FINAL_VOLUME = 6_000;
const CYCLE_MS = 6_000;

export function AppCost() {
  const t = useTranslations('product.cost');
  const reduced = useReducedMotion();
  const [conversations, setConversations] = useState(INITIAL_VOLUME);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const loopRef = useRef<DemoLoop | null>(null);

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    const play = () => {
      clear();
      setConversations(INITIAL_VOLUME);
      timers.current.push(setTimeout(() => setConversations(MID_VOLUME), 700));
      timers.current.push(setTimeout(() => setConversations(FINAL_VOLUME), CYCLE_MS));
    };

    const loop = createAppDemoLoop({
      target: sectionRef.current,
      reducedMotion: Boolean(reduced),
      cycleMs: CYCLE_MS,
      play,
      showFinal: () => setConversations(FINAL_VOLUME),
      reset: () => setConversations(INITIAL_VOLUME),
      stop: clear,
    });
    loopRef.current = loop;

    return () => {
      loop.cleanup();
      clear();
      if (loopRef.current === loop) loopRef.current = null;
    };
  }, [clear, reduced]);

  const steps = conversations < 2_000 ? 2 : conversations < 8_000 ? 5 : 7;
  const complexity: Complexity = conversations < 2_000 ? 'm1' : conversations < 8_000 ? 'm2' : 'm3';
  const monthly = Math.max(20, conversations * steps * COST_FACTOR[complexity]);
  const formatNumber = (value: number) => (
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(value))
  );

  const updateConversations = (value: number) => {
    loopRef.current?.takeControl();
    setConversations(value);
  };

  return (
    <SectionContainer
      className="py-16 md:py-24 lg:py-28"
      data-landing-demo="true"
      data-demo-id="app-cost"
      data-demo-detail={`${complexity}-${conversations}-${steps}`}
      aria-live="off"
    >
      <AppDemoStory
        eyebrow={t('eyebrow')}
        title={t('heading')}
        description={t('subtitle')}
        resultLabel={t('businessResultLabel')}
        result={t('businessResult')}
        icon="solar:calculator-bold-duotone"
      >
        <div
          ref={sectionRef}
          aria-live="off"
          className="min-h-[454px] overflow-hidden rounded-[28px] bg-[#111827] p-5 text-white shadow-[0_26px_64px_-42px_rgba(17,24,39,0.78)] md:p-7"
        >
          <div className="flex min-h-11 items-center justify-between gap-4">
            <span className="flex min-w-0 items-center gap-2 text-[13px] font-extrabold text-white">
              <Ico name="solar:calendar-bold-duotone" className="h-5 w-5 shrink-0 text-[var(--brand)]" />
              {t('monthly')}
            </span>
            <button
              type="button"
              onClick={() => loopRef.current?.replay()}
              data-demo-replay="app-cost"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-3 text-[13px] font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.16)] transition-transform duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]"
              aria-label={t('replay')}
            >
              <Ico name="solar:refresh-bold-duotone" className="h-4 w-4" />
              <span className="hidden sm:inline">{t('replay')}</span>
            </button>
          </div>

          <div className="mt-8">
            <span className="block text-[11px] font-semibold text-white/70">{t('usage')}</span>
            <p className="mt-2 break-words font-display text-[clamp(2.8rem,11vw,5.4rem)] font-extrabold tabular-nums leading-none text-white">
              <span className="mr-2 text-[clamp(1rem,3vw,1.35rem)] font-bold text-[var(--brand)]">USD</span>
              {formatNumber(monthly)}
              <span className="ml-2 text-base font-semibold text-white/70 md:text-lg">{t('perMonth')}</span>
            </p>
          </div>

          <label className="mt-9 block min-w-0 rounded-2xl bg-white/[0.07] p-4 md:p-5">
            <span className="flex min-w-0 items-end justify-between gap-4">
              <span className="text-[13px] font-semibold text-white/75">{t('conversations')}</span>
              <strong className="text-[18px] font-extrabold tabular-nums text-white">{formatNumber(conversations)}</strong>
            </span>
            <input
              type="range"
              min={200}
              max={20_000}
              step={200}
              value={conversations}
              onChange={(event) => updateConversations(Number(event.target.value))}
              className="mt-3 h-11 w-full cursor-pointer appearance-none rounded-full bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/20 [&::-webkit-slider-thumb]:mt-[-7px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--brand)] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--brand)] [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/20"
            />
          </label>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric icon="solar:chat-round-dots-bold-duotone" label={t('conversations')} value={formatNumber(conversations)} />
            <Metric icon="solar:layers-minimalistic-bold-duotone" label={t('steps')} value={formatNumber(steps)} />
          </div>

          <p className="mt-4 flex items-start gap-2 text-[12px] leading-5 text-white/70">
            <Ico name="solar:info-circle-bold-duotone" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
            {t('note')}
          </p>
        </div>
      </AppDemoStory>
    </SectionContainer>
  );
}

function Metric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/[0.07] p-4">
      <Ico name={icon} className="h-5 w-5 text-[var(--brand)]" />
      <span className="mt-3 block break-words text-[18px] font-extrabold text-white">{value}</span>
      <span className="mt-1 block text-[11px] leading-4 text-white/70">{label}</span>
    </div>
  );
}
