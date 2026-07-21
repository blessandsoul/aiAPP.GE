'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';

import { Ico } from '@/components/common/Ico';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';

import { AppDemoStory } from './AppDemoStory';
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
    <SectionContainer
      className="py-16 md:py-24 lg:py-28"
      data-landing-demo="true"
      data-demo-id="app-handoff"
      data-demo-detail={frame.complete ? 'final' : `transfer-${frame.transferredCount}`}
      aria-live="off"
    >
      <AppDemoStory
        eyebrow={t('eyebrow')}
        title={t('heading')}
        description={t('subtitle')}
        resultLabel={t('businessResultLabel')}
        result={t('businessResult')}
        icon="solar:hand-shake-bold-duotone"
      >
        <div
          ref={sectionRef}
          aria-live="off"
          className="min-h-[500px] overflow-hidden rounded-[28px] bg-[#F6F8F3] shadow-[0_0_0_1px_rgba(17,24,39,0.08)]"
        >
          <div className="flex min-h-[76px] items-center justify-between gap-4 border-b border-neutral-900/[0.08] bg-white px-4 py-3 md:px-6">
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#111827] text-[var(--brand)]">
                <Ico name="solar:case-round-bold-duotone" className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold text-[#667085]">{t('projectLabel')}</span>
                <span className="block break-words text-[14px] font-extrabold text-[#111827]">{t('projectName')}</span>
              </span>
            </span>
            <button
              type="button"
              onClick={() => loopRef.current?.replay()}
              data-demo-replay="app-handoff"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-white px-3 text-[13px] font-semibold text-[#111827] shadow-[0_0_0_1px_rgba(17,24,39,0.12)] transition-transform duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ink)] focus-visible:ring-offset-2"
              aria-label={t('replay')}
            >
              <Ico name="solar:refresh-bold-duotone" className="h-4 w-4" />
              <span className="hidden sm:inline">{t('replay')}</span>
            </button>
          </div>

          <div className="p-4 md:p-6">
            <div className="flex min-w-0 items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-[0_0_0_1px_rgba(17,24,39,0.07)]">
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold text-[#667085]">{t('custody')}</span>
                <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[13px] font-extrabold text-[#111827]">
                  {t('ainow')}
                  <Ico name="solar:arrow-right-bold-duotone" className="h-4 w-4 text-[#667085]" />
                  {t('client')}
                </span>
              </span>
              <strong className="shrink-0 text-[18px] font-extrabold tabular-nums text-[#111827]">
                {frame.transferredCount}/{HANDOFF_ITEMS.length}
              </strong>
            </div>

            <ol className="mt-4 grid min-w-0 gap-2" aria-label={t('custody')}>
              {frame.items.map((item) => {
                const moved = item.owner === 'client';
                const active = frame.nextItem === item.key;
                const status = moved ? 'ready' : active ? 'moving' : 'pending';

                return (
                  <motion.li
                    key={item.key}
                    initial={false}
                    animate={{ x: active ? 3 : 0 }}
                    transition={{ duration: reduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                    aria-current={active ? 'step' : undefined}
                    className={cn(
                      'flex min-h-[64px] min-w-0 items-center gap-3 rounded-2xl border bg-white px-3 py-3 md:px-4',
                      moved
                        ? 'border-[var(--brand)]'
                        : active
                          ? 'border-neutral-900/25'
                          : 'border-neutral-900/[0.07]',
                    )}
                  >
                    <span className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                      moved
                        ? 'bg-[var(--brand)] text-[#111214]'
                        : 'bg-neutral-900/[0.06] text-[#4B5563]',
                    )}>
                      <Ico
                        name={moved ? 'solar:check-circle-bold-duotone' : ITEM_ICONS[item.key as keyof typeof ITEM_ICONS]}
                        className="h-5 w-5"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-extrabold leading-5 text-[#111827]">{t(item.key)}</span>
                      <span className="mt-0.5 block text-[11px] font-semibold text-[#667085]">{t(status)}</span>
                    </span>
                  </motion.li>
                );
              })}
            </ol>

            <div className="mt-4 flex min-h-[72px] items-start gap-3 rounded-2xl bg-[#111827] p-4 text-white">
              <Ico
                name={frame.complete ? 'solar:check-circle-bold-duotone' : 'solar:clock-circle-bold-duotone'}
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]"
              />
              <span className="min-w-0">
                <span className="block text-[11px] font-bold text-[var(--brand)]">
                  {frame.complete ? t('complete') : t('moving')}
                </span>
                <span className="mt-1 block text-[13px] font-semibold leading-5 text-white">{t('outcome')}</span>
              </span>
            </div>
          </div>
        </div>
      </AppDemoStory>
    </SectionContainer>
  );
}
