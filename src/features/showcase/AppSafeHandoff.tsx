'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Ico } from '@/components/common/Ico';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';
import {
  HANDOFF_ITEMS,
  createTimelinePlayer,
  handoffFrame,
} from './app-demo-models.mjs';
import { createAppDemoLoop } from './app-demo-visibility.mjs';

const CYCLE_MS = 6_000;
const HANDOFF_STAGES = [0, ...HANDOFF_ITEMS.map((_, index) => index + 1)];

const ITEM_ICONS = {
  code: 'solar:code-2-bold-duotone',
  hostingAccess: 'solar:monitor-bold-duotone',
  serviceAccounts: 'solar:key-bold-duotone',
  documentation: 'solar:document-text-bold-duotone',
  operatingControl: 'solar:settings-bold-duotone',
} as const;

type DemoLoop = {
  replay: () => void;
  takeControl: () => void;
  cleanup: () => void;
};

export function AppSafeHandoff() {
  const t = useTranslations('product.handoff');
  const reduced = useReducedMotion();
  const [transferredCount, setTransferredCount] = useState(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const loopRef = useRef<DemoLoop | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const player = createTimelinePlayer({
      stages: HANDOFF_STAGES,
      durationMs: CYCLE_MS,
      onStage: (count: number) => setTransferredCount(count),
    });
    const loop = createAppDemoLoop({
      target: sectionRef.current,
      reducedMotion: Boolean(reduced),
      cycleMs: CYCLE_MS,
      play: player.play,
      showFinal: () => setTransferredCount(HANDOFF_ITEMS.length),
      reset: () => setTransferredCount(0),
      stop: player.cancel,
    });
    loopRef.current = loop;

    return () => {
      loop.cleanup();
      player.cleanup();
      if (loopRef.current === loop) loopRef.current = null;
    };
  }, [reduced]);

  const frame = handoffFrame(transferredCount);

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
        className="overflow-hidden rounded-3xl bg-[#f7f7f5] shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-900/[0.08] px-4 py-4 md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-[var(--brand)]">
              <Ico name="solar:user-check-rounded-bold-duotone" className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[12px] text-neutral-900/45">{t('custody')}</span>
              <span className="flex items-center gap-1.5 text-[14px] font-bold text-neutral-900">
                {t('ainow')}
                <Ico name="solar:arrow-right-bold-duotone" className="h-4 w-4 text-neutral-900/45" />
                {t('client')}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold tabular-nums text-neutral-900/45">
              {frame.transferredCount}/{HANDOFF_ITEMS.length}
            </span>
            <button
              type="button"
              onClick={() => loopRef.current?.replay()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
            >
              <Ico name="solar:refresh-bold-duotone" className="h-4 w-4" />
              {t('replay')}
            </button>
          </div>
        </div>

        <div className="p-4 md:p-7">
          <ol className="grid min-w-0 gap-3 lg:grid-cols-2" aria-label={t('custody')}>
            {frame.items.map((item) => {
              const moved = item.owner === 'client';
              const active = frame.nextItem === item.key;
              const status = moved ? 'ready' : active ? 'moving' : 'pending';
              const statusIcon = moved
                ? 'solar:check-circle-bold-duotone'
                : active
                  ? 'solar:arrow-right-bold-duotone'
                  : 'solar:clock-circle-bold-duotone';

              return (
                <motion.li
                  key={item.key}
                  initial={false}
                  animate={{ opacity: moved || active ? 1 : 0.56, y: moved ? 0 : 3 }}
                  transition={{ duration: reduced ? 0 : 0.22 }}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'flex min-h-[88px] min-w-0 items-center gap-4 rounded-2xl border bg-white px-4 py-4 md:px-5',
                    moved
                      ? 'border-[var(--brand)]'
                      : active
                        ? 'border-neutral-900/25'
                        : 'border-neutral-900/[0.07]',
                  )}
                >
                  <span className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                    moved ? 'bg-[var(--brand)] text-[#111214]' : 'bg-neutral-900/[0.06] text-neutral-900',
                  )}>
                    <Ico name={ITEM_ICONS[item.key as keyof typeof ITEM_ICONS]} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold leading-snug text-neutral-900">{t(item.key)}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-neutral-900/50">
                      <Ico name={statusIcon} className="h-3.5 w-3.5" />
                      {t(status)}
                    </span>
                  </span>
                </motion.li>
              );
            })}
          </ol>

          <motion.div
            initial={false}
            animate={{ opacity: frame.complete ? 1 : 0.42, y: frame.complete ? 0 : 5 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="mt-5 flex min-h-[108px] min-w-0 items-center gap-4 rounded-2xl bg-neutral-900 px-5 py-4 text-white md:px-6"
            aria-live="polite"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#111214]">
              <Ico name="solar:check-circle-bold-duotone" className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <span className="text-[13px] font-bold text-[var(--brand)]">{t('complete')}</span>
              <p className="mt-1 text-[18px] font-bold leading-snug text-white">{t('outcome')}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionContainer>
  );
}
