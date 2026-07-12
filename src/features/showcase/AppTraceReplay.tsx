'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Ico } from '@/components/common/Ico';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';
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
    icon: 'solar:chat-round-dots-bold-duotone',
  },
  'safety-check': {
    label: 'safetyCheck',
    detail: 'safetyCheckDetail',
    icon: 'solar:shield-check-bold-duotone',
  },
  action: {
    label: 'action',
    detail: 'actionDetail',
    icon: 'solar:settings-bold-duotone',
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
    <SectionContainer className="py-20 md:py-28">
      <div className="mb-9 max-w-3xl">
        <span className="text-[12px] tracking-wide text-neutral-900/45">{t('eyebrow')}</span>
        <h2 className="mt-4 text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-neutral-900 md:text-4xl">
          {t('heading')}
        </h2>
        <p className="mt-3 text-pretty text-[15px] leading-relaxed text-[#525252]">{t('subtitle')}</p>
      </div>

      <div
        ref={sectionRef}
        className="overflow-hidden rounded-3xl bg-[#111214] text-white shadow-[0_22px_60px_-42px_rgba(0,0,0,0.72)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-4 py-4 md:px-7">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-white/60">
            <Ico name="solar:bolt-bold-duotone" className="h-5 w-5 text-[var(--brand)]" />
            {t('resultLabel')}
          </span>
          <button
            type="button"
            onClick={() => loopRef.current?.replay()}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-[13px] font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.14)] transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111214]"
          >
            <Ico name="solar:refresh-bold-duotone" className="h-4 w-4" />
            {t('replay')}
          </button>
        </div>

        <ol className="grid min-w-0 gap-3 p-4 md:p-7 lg:grid-cols-2" aria-label={t('heading')}>
          {BUSINESS_STAGES.map((item, index) => {
            const meta = STAGE_META[item as keyof typeof STAGE_META];
            const current = item === stage;
            const reached = index <= activeIndex;

            return (
              <motion.li
                key={item}
                initial={false}
                animate={{ opacity: reached ? 1 : 0.42, y: reached ? 0 : 5 }}
                transition={{ duration: reduced ? 0 : 0.22 }}
                aria-current={current ? 'step' : undefined}
                className={cn(
                  'min-w-0 rounded-2xl border p-4 md:p-5',
                  current
                    ? 'border-[var(--brand)] bg-white/[0.09]'
                    : reached
                      ? 'border-white/12 bg-white/[0.055]'
                      : 'border-white/[0.07] bg-white/[0.025]',
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    reached ? 'bg-[var(--brand)] text-[#111214]' : 'bg-white/[0.08] text-white/45',
                  )}>
                    <Ico name={meta.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold text-white">{t(meta.label)}</span>
                    <span className="mt-1.5 block text-[13px] leading-relaxed text-white/58">{t(meta.detail)}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-white/[0.07] px-2.5 py-1 text-[10px] font-semibold text-white/50">
                    {current ? t('current') : reached ? t('complete') : t('waiting')}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ol>

        <div className="px-4 pb-4 md:px-7 md:pb-7" aria-live="polite">
          <motion.div
            initial={false}
            animate={{ opacity: frame.customerVisible ? 1 : 0.48, y: frame.customerVisible ? 0 : 5 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="flex min-h-[96px] min-w-0 items-center gap-4 rounded-2xl bg-white p-4 text-neutral-900 md:px-6"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#111214]">
              <Ico name={frame.customerVisible ? 'solar:check-circle-bold-duotone' : 'solar:clock-circle-bold-duotone'} className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <span className="text-[13px] font-bold text-neutral-900">{t('customerResult')}</span>
              <p className="mt-1 text-[14px] leading-relaxed text-neutral-900/60">{t('outcome')}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionContainer>
  );
}
