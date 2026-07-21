'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';

import { Ico } from '@/components/common/Ico';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';

import { AppDemoStory } from './AppDemoStory';
import { createAppDemoLoop } from './app-demo-visibility.mjs';

const STEPS = [
  { key: 'orderFound', icon: 'solar:magnifer-bold-duotone' },
  { key: 'ownerChecked', icon: 'solar:shield-check-bold-duotone' },
  { key: 'answerReady', icon: 'solar:chat-round-check-bold-duotone' },
] as const;

type DemoLoop = {
  replay: () => void;
  takeControl: () => void;
  cleanup: () => void;
};

const CYCLE_MS = 6_000;

export function AppEval() {
  const t = useTranslations('product.eval');
  const reduced = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(0);
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
      setVisibleCount(0);
      const delays = [700, 3_000, CYCLE_MS];
      timers.current = delays.map((delay, index) => (
        setTimeout(() => setVisibleCount(index + 1), delay)
      ));
    };

    const loop = createAppDemoLoop({
      target: sectionRef.current,
      reducedMotion: Boolean(reduced),
      cycleMs: CYCLE_MS,
      play,
      showFinal: () => setVisibleCount(STEPS.length),
      reset: () => setVisibleCount(0),
      stop: clear,
    });
    loopRef.current = loop;

    return () => {
      loop.cleanup();
      clear();
      if (loopRef.current === loop) loopRef.current = null;
    };
  }, [clear, reduced]);

  const complete = visibleCount === STEPS.length;

  return (
    <SectionContainer
      className="py-16 md:py-24 lg:py-28"
      data-landing-demo="true"
      data-demo-id="app-eval"
      data-demo-detail={complete ? 'final' : `checks-${visibleCount}`}
      aria-live="off"
    >
      <AppDemoStory
        eyebrow={t('eyebrow')}
        title={t('heading')}
        description={t('subtitle')}
        resultLabel={t('businessResultLabel')}
        result={t('businessResult')}
        icon="solar:chat-round-check-bold-duotone"
      >
        <div
          ref={sectionRef}
          aria-live="off"
          className="min-h-[474px] overflow-hidden rounded-[28px] bg-[#F6F8F3] shadow-[0_0_0_1px_rgba(17,24,39,0.08)]"
        >
          <div className="grid min-h-[88px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-neutral-900/[0.08] bg-white px-4 py-3 md:min-h-[76px] md:px-6">
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-ink)]">
                <Ico name="solar:box-bold-duotone" className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold text-[#667085]">{t('sampleLabel')}</span>
                <span className="block break-words text-[14px] font-extrabold text-[#111827]">{t('orderNumber')}</span>
              </span>
            </span>
            <button
              type="button"
              onClick={() => loopRef.current?.replay()}
              data-demo-replay="app-eval"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-white px-3 text-[13px] font-semibold text-[#111827] shadow-[0_0_0_1px_rgba(17,24,39,0.12)] transition-transform duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ink)] focus-visible:ring-offset-2"
              aria-label={t('replay')}
            >
              <Ico name="solar:refresh-bold-duotone" className="h-4 w-4" />
              <span className="hidden sm:inline">{t('replay')}</span>
            </button>
          </div>

          <div className="p-4 md:p-6">
            <div className="rounded-2xl bg-white p-4 shadow-[0_0_0_1px_rgba(17,24,39,0.07)]">
              <span className="text-[11px] font-bold text-[#667085]">{t('customerLabel')}</span>
              <p className="mt-2 text-[15px] font-semibold leading-6 text-[#111827]">{t('customerMessage')}</p>
            </div>

            <ol className="mt-4 grid min-w-0 gap-2" aria-label={t('heading')}>
              {STEPS.map((item, index) => {
                const reached = index < visibleCount;
                const active = index === Math.max(visibleCount - 1, 0) && visibleCount > 0;

                return (
                  <motion.li
                    key={item.key}
                    initial={false}
                    animate={{ y: active ? -2 : 0 }}
                    transition={{ duration: reduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                    aria-current={active ? 'step' : undefined}
                    className={cn(
                      'flex min-h-[66px] min-w-0 items-center gap-3 rounded-2xl border px-3 py-3 md:px-4',
                      reached
                        ? 'border-[color:var(--brand)] bg-white'
                        : 'border-neutral-900/[0.07] bg-[#FAFBF8]',
                    )}
                  >
                    <span className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                      reached
                        ? 'bg-[var(--brand)] text-[#111214]'
                        : 'bg-neutral-900/[0.06] text-[#667085]',
                    )}>
                      <Ico name={reached ? 'solar:check-circle-bold-duotone' : item.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 text-[13px] font-bold leading-5 text-[#111827]">
                      {t(item.key)}
                    </span>
                  </motion.li>
                );
              })}
            </ol>

            <div className="mt-4 flex min-h-[76px] items-start gap-3 rounded-2xl bg-[#111827] p-4 text-white">
              <Ico
                name={complete ? 'solar:check-circle-bold-duotone' : 'solar:clock-circle-bold-duotone'}
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]"
              />
              <span className="min-w-0">
                <span className="block text-[11px] font-bold text-[var(--brand)]">{t('answerLabel')}</span>
                <span className="mt-1 block text-[13px] font-semibold leading-5 text-white">{t('answerText')}</span>
              </span>
            </div>
          </div>
        </div>
      </AppDemoStory>
    </SectionContainer>
  );
}
