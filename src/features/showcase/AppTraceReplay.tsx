'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';

import { Ico } from '@/components/common/Ico';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';

import { AppDemoStory } from './AppDemoStory';
import {
  BUSINESS_STAGES,
  businessFrame,
  createTimelinePlayer,
} from './app-demo-models.mjs';
import { createAppDemoLoop } from './app-demo-visibility.mjs';

const CYCLE_MS = 6_000;

const STAGE_META = {
  request: {
    label: 'request',
    detail: 'requestDetail',
    icon: 'solar:document-add-bold-duotone',
  },
  'safety-check': {
    label: 'safetyCheck',
    detail: 'safetyCheckDetail',
    icon: 'solar:shield-check-bold-duotone',
  },
  action: {
    label: 'action',
    detail: 'actionDetail',
    icon: 'solar:user-check-rounded-bold-duotone',
  },
  'customer-result': {
    label: 'customerResult',
    detail: 'customerResultDetail',
    icon: 'solar:check-circle-bold-duotone',
  },
} as const;

type DemoLoop = {
  replay: () => void;
  takeControl: () => void;
  cleanup: () => void;
};

export function AppTraceReplay() {
  const t = useTranslations('product.trace');
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<string>(BUSINESS_STAGES[0]);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const loopRef = useRef<DemoLoop | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const player = createTimelinePlayer({
      stages: BUSINESS_STAGES,
      durationMs: CYCLE_MS,
      onStage: (nextStage: string) => setStage(nextStage),
    });
    const loop = createAppDemoLoop({
      target: sectionRef.current,
      reducedMotion: Boolean(reduced),
      cycleMs: CYCLE_MS,
      play: player.play,
      showFinal: () => setStage(BUSINESS_STAGES[BUSINESS_STAGES.length - 1]),
      reset: () => setStage(BUSINESS_STAGES[0]),
      stop: player.cancel,
    });
    loopRef.current = loop;

    return () => {
      loop.cleanup();
      player.cleanup();
      if (loopRef.current === loop) loopRef.current = null;
    };
  }, [reduced]);

  const frame = businessFrame(stage);
  const activeIndex = Math.max(0, BUSINESS_STAGES.indexOf(stage));

  return (
    <SectionContainer
      className="py-16 md:py-24 lg:py-28"
      data-landing-demo="true"
      data-demo-id="app-trace"
      data-demo-detail={stage}
      aria-live="off"
    >
      <AppDemoStory
        eyebrow={t('eyebrow')}
        title={t('heading')}
        description={t('subtitle')}
        resultLabel={t('businessResultLabel')}
        result={t('businessResult')}
        icon="solar:shield-check-bold-duotone"
        visualFirst
      >
        <div
          ref={sectionRef}
          aria-live="off"
          className="min-h-[510px] overflow-hidden rounded-[28px] bg-[#111827] text-white shadow-[0_26px_64px_-42px_rgba(17,24,39,0.78)]"
        >
          <div className="flex min-h-[76px] items-center justify-between gap-4 border-b border-white/10 px-4 py-3 md:px-6">
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-[#111214]">
                <Ico name="solar:bill-check-bold-duotone" className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold text-white/70">{t('sampleLabel')}</span>
                <span className="block break-words text-[14px] font-extrabold text-white">{t('invoiceNumber')}</span>
              </span>
            </span>
            <button
              type="button"
              onClick={() => loopRef.current?.replay()}
              data-demo-replay="app-trace"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-3 text-[13px] font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.16)] transition-transform duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]"
              aria-label={t('replay')}
            >
              <Ico name="solar:refresh-bold-duotone" className="h-4 w-4" />
              <span className="hidden sm:inline">{t('replay')}</span>
            </button>
          </div>

          <ol className="grid min-w-0 gap-2 p-4 md:p-6" aria-label={t('heading')}>
            {BUSINESS_STAGES.map((item, index) => {
              const meta = STAGE_META[item as keyof typeof STAGE_META];
              const current = item === stage;
              const reached = index <= activeIndex;

              return (
                <motion.li
                  key={item}
                  data-trace-stage="true"
                  initial={false}
                  animate={{ x: current ? 3 : 0 }}
                  transition={{ duration: reduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                  aria-current={current ? 'step' : undefined}
                  className={cn(
                    'flex min-h-[78px] min-w-0 items-start gap-3 rounded-2xl border px-3 py-3 md:px-4',
                    current
                      ? 'border-[var(--brand)] bg-white/[0.10]'
                      : reached
                        ? 'border-white/15 bg-white/[0.06]'
                        : 'border-white/10 bg-white/[0.035]',
                  )}
                >
                  <span className={cn(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                    reached ? 'bg-[var(--brand)] text-[#111214]' : 'bg-white/10 text-white/70',
                  )}>
                    <Ico name={reached ? 'solar:check-circle-bold-duotone' : meta.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-extrabold text-white">{t(meta.label)}</span>
                    <span className="mt-1 block text-[12px] leading-5 text-white/72">{t(meta.detail)}</span>
                  </span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] font-extrabold text-white/80">
                    {index + 1}
                  </span>
                </motion.li>
              );
            })}
          </ol>

          <div className="px-4 pb-4 md:px-6 md:pb-6" aria-live="off">
            <div className="flex min-h-[82px] min-w-0 items-start gap-3 rounded-2xl bg-white p-4 text-[#111827]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-ink)]">
                <Ico
                  name={frame.customerVisible ? 'solar:check-circle-bold-duotone' : 'solar:clock-circle-bold-duotone'}
                  className="h-5 w-5"
                />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-extrabold text-[#111827]">{t('outcomeLabel')}</span>
                <span className="mt-1 block text-[13px] leading-5 text-[#4B5563]">{t('outcome')}</span>
              </span>
            </div>
          </div>
        </div>
      </AppDemoStory>
    </SectionContainer>
  );
}
