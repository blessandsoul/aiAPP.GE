'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';

import { Ico } from '@/components/common/Ico';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';

import { AppDemoStory } from './AppDemoStory';
import { createAppDemoLoop } from './app-demo-visibility.mjs';

const RUNGS = ['r1', 'r2', 'r3'] as const;
type Rung = (typeof RUNGS)[number];
type DemoLoop = {
  replay: () => void;
  takeControl: () => void;
  cleanup: () => void;
};

const ICONS: Record<Rung, string> = {
  r1: 'solar:magnifer-bold-duotone',
  r2: 'solar:code-2-bold-duotone',
  r3: 'solar:settings-bold-duotone',
};
const CYCLE_MS = 6_000;

export function AppLadder() {
  const t = useTranslations('product.ladder');
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<Rung>('r1');
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
      setOpen('r1');
      timers.current.push(setTimeout(() => setOpen('r2'), 700));
      timers.current.push(setTimeout(() => setOpen('r3'), CYCLE_MS));
    };

    const loop = createAppDemoLoop({
      target: sectionRef.current,
      reducedMotion: Boolean(reduced),
      cycleMs: CYCLE_MS,
      play,
      showFinal: () => setOpen('r3'),
      reset: () => setOpen('r1'),
      stop: clear,
    });
    loopRef.current = loop;

    return () => {
      loop.cleanup();
      clear();
      if (loopRef.current === loop) loopRef.current = null;
    };
  }, [clear, reduced]);

  const activeIndex = RUNGS.indexOf(open);
  const replay = () => loopRef.current?.replay();
  const showNext = () => {
    loopRef.current?.takeControl();
    setOpen(RUNGS[(activeIndex + 1) % RUNGS.length]);
  };

  return (
    <SectionContainer
      className="py-16 md:py-24 lg:py-28"
      data-landing-demo="true"
      data-demo-id="app-ladder"
      data-demo-detail={open}
      aria-live="off"
    >
      <AppDemoStory
        eyebrow={t('eyebrow')}
        title={t('heading')}
        description={t('subtitle')}
        resultLabel={t('businessResultLabel')}
        result={t('businessResult')}
        icon="solar:route-bold-duotone"
        visualFirst
      >
        <div
          ref={sectionRef}
          aria-live="off"
          className="min-h-[520px] overflow-hidden rounded-[28px] bg-[#F6F8F3] shadow-[0_0_0_1px_rgba(17,24,39,0.08)]"
        >
          <div className="flex min-h-[76px] items-center justify-between gap-4 border-b border-neutral-900/[0.08] bg-white px-4 py-3 md:px-6">
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold text-[#667085]">{t('stageLabel')}</span>
              <span className="mt-0.5 block text-[14px] font-extrabold text-[#111827]">
                {activeIndex + 1} / {RUNGS.length}
              </span>
            </span>
            <button
              type="button"
              onClick={replay}
              data-demo-replay="app-ladder"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-white px-3 text-[13px] font-semibold text-[#111827] shadow-[0_0_0_1px_rgba(17,24,39,0.12)] transition-transform duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ink)] focus-visible:ring-offset-2"
              aria-label={t('replay')}
            >
              <Ico name="solar:refresh-bold-duotone" className="h-4 w-4" />
              <span className="hidden sm:inline">{t('replay')}</span>
            </button>
          </div>

          <ol className="grid grid-cols-3 gap-2 px-4 pt-4 md:px-6" aria-label={t('heading')}>
            {RUNGS.map((rung, index) => {
              const reached = index <= activeIndex;
              const active = rung === open;

              return (
                <li key={rung} className="min-w-0">
                  <span className={cn(
                    'flex min-h-[58px] min-w-0 flex-col justify-center rounded-xl border px-2.5 py-2 text-center',
                    active
                      ? 'border-[var(--brand)] bg-white'
                      : reached
                        ? 'border-neutral-900/10 bg-white/80'
                        : 'border-neutral-900/[0.07] bg-[#FAFBF8]',
                  )}>
                    <span className="text-[10px] font-extrabold text-[#667085]">0{index + 1}</span>
                    <span className="mt-0.5 break-words text-[11px] font-bold leading-4 text-[#111827]">{t(rung)}</span>
                  </span>
                </li>
              );
            })}
          </ol>

          <motion.div
            key={open}
            id="app-ladder-detail"
            data-ladder-detail-slot="true"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="mx-3 mt-3 min-h-[440px] rounded-2xl border border-neutral-900/[0.08] bg-white p-4 max-[359px]:min-h-[600px] md:mx-6 md:min-h-[310px] md:p-6"
            aria-live="off"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#111827] text-[var(--brand)]">
                <Ico name={ICONS[open]} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[22px] font-extrabold leading-7 tracking-tight text-[#111827]">{t(open)}</span>
                <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-semibold text-[#667085]">
                  <span>{t(`${open}time`)}</span>
                  <strong className="text-[#111827]">{t(`${open}price`)}</strong>
                </span>
              </span>
            </div>

            <p className="mt-5 text-[14px] leading-6 text-[#334155]">{t(`${open}what`)}</p>

            <p className="mt-5 flex min-h-[64px] items-start gap-2 rounded-xl bg-[var(--brand-soft)] px-3 py-3 text-[12px] font-semibold leading-5 text-[#334155]">
              <Ico name="solar:check-circle-bold-duotone" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-ink)]" />
              {t(`${open}highlight`)}
            </p>
          </motion.div>

          <div className="flex justify-end px-4 pb-4 pt-3 md:px-6 md:pb-6">
            <button
              type="button"
              onClick={showNext}
              aria-controls="app-ladder-detail"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#111827] px-4 text-[13px] font-bold text-white transition-transform duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ink)] focus-visible:ring-offset-2"
            >
              {t('next')}
              <Ico name="solar:arrow-right-bold-duotone" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </AppDemoStory>
    </SectionContainer>
  );
}
