'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Ico } from '@/components/common/Ico';
import { cn } from '@/lib/utils';
import { BUSINESS_STAGES, createTimelinePlayer } from './app-demo-models.mjs';
import { createAppDemoLoop } from './app-demo-visibility.mjs';

const CYCLE_MS = 6_000;
const STEP_META = {
  request: {
    label: 'request',
    detail: 'requestDetail',
    icon: 'solar:chat-round-dots-bold-duotone',
  },
  'safety-check': {
    label: 'check',
    detail: 'checkDetail',
    icon: 'solar:shield-check-bold-duotone',
  },
  action: {
    label: 'action',
    detail: 'actionDetail',
    icon: 'solar:settings-bold-duotone',
  },
  'customer-result': {
    label: 'result',
    detail: 'resultDetail',
    icon: 'solar:check-circle-bold-duotone',
  },
} as const;

type DemoLoop = {
  replay: () => void;
  takeControl: () => void;
  cleanup: () => void;
};

export function HeroProof() {
  const t = useTranslations('product.proof');
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<string>(BUSINESS_STAGES[0]);
  const proofRef = useRef<HTMLDivElement | null>(null);
  const loopRef = useRef<DemoLoop | null>(null);

  useEffect(() => {
    if (!proofRef.current) return;

    const player = createTimelinePlayer({
      stages: BUSINESS_STAGES,
      durationMs: CYCLE_MS,
      onStage: (nextStage: string) => setStage(nextStage),
    });
    const loop = createAppDemoLoop({
      target: proofRef.current,
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

  const activeIndex = Math.max(0, BUSINESS_STAGES.indexOf(stage));
  const complete = stage === 'customer-result';

  return (
    <div
      ref={proofRef}
      className="overflow-hidden rounded-3xl bg-[#111214] text-white shadow-[0_28px_60px_-42px_rgba(0,0,0,0.78)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5 md:px-5">
        <span className="flex min-w-0 items-center gap-2 text-[12px] font-semibold text-white/60">
          <Ico name="solar:bolt-bold-duotone" className="h-4 w-4 text-[var(--brand)]" />
          {t('label')}
        </span>
        <button
          type="button"
          onClick={() => loopRef.current?.replay()}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-white/[0.08] px-3.5 text-[12px] font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111214]"
        >
          <Ico name="solar:refresh-bold-duotone" className="h-4 w-4" />
          {t('replay')}
        </button>
      </div>

      <ol className="grid gap-2.5 p-4 xl:grid-cols-2 xl:p-5" aria-label={t('label')}>
        {BUSINESS_STAGES.map((item, index) => {
          const meta = STEP_META[item as keyof typeof STEP_META];
          const reached = index <= activeIndex;
          const current = item === stage;

          return (
            <motion.li
              key={item}
              initial={false}
              animate={{ opacity: reached ? 1 : 0.38, y: reached ? 0 : 4 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
              aria-current={current ? 'step' : undefined}
              className={cn(
                'flex min-w-0 items-start gap-3 rounded-2xl border p-3.5',
                current
                  ? 'border-[var(--brand)] bg-white/[0.09]'
                  : reached
                    ? 'border-white/12 bg-white/[0.05]'
                    : 'border-white/[0.07] bg-white/[0.025]',
              )}
            >
              <span className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                reached ? 'bg-[var(--brand)] text-[#111214]' : 'bg-white/[0.07] text-white/40',
              )}>
                <Ico name={meta.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-white">{t(meta.label)}</span>
                <span className="mt-1 block text-[11px] leading-relaxed text-white/50">{t(meta.detail)}</span>
              </span>
            </motion.li>
          );
        })}
      </ol>

      <motion.div
        initial={false}
        animate={{ opacity: complete ? 1 : 0.42, y: complete ? 0 : 5 }}
        transition={{ duration: reduced ? 0 : 0.25 }}
        className="mx-4 mb-4 flex min-h-[72px] items-center gap-3 rounded-2xl bg-white px-4 py-3 text-neutral-900 xl:mx-5 xl:mb-5"
        aria-live="polite"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-[#111214]">
          <Ico name="solar:check-circle-bold-duotone" className="h-5 w-5" />
        </span>
        <span className="text-[13px] font-semibold leading-relaxed">{t('outcome')}</span>
      </motion.div>
    </div>
  );
}
