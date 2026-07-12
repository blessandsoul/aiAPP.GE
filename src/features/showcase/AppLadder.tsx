'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Ico } from '@/components/common/Ico';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';
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
      timers.current.push(setTimeout(() => setOpen('r2'), 3_000));
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

  const selectRung = (rung: Rung) => {
    loopRef.current?.takeControl();
    setOpen(rung);
  };
  const replay = () => loopRef.current?.replay();

  return (
    <SectionContainer className="py-20 md:py-28">
      <div ref={sectionRef}>
        <div className="mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="text-[12px] tracking-wide text-neutral-900/45">{t('eyebrow')}</span>
            <h2 className="mt-4 text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-neutral-900 md:text-4xl">
              {t('heading')}
            </h2>
            <p className="mt-3 text-pretty text-[15px] leading-relaxed text-[#525252]">{t('subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={replay}
            className="inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-full bg-[#fafafa] px-5 text-[13px] font-semibold text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.09)] transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
          >
            <Ico name="solar:refresh-bold-duotone" className="h-4 w-4" />
            {t('replay')}
          </button>
        </div>

        <ul className="flex min-w-0 flex-col gap-3">
          {RUNGS.map((rung, index) => {
            const active = rung === open;
            const build = rung === 'r2';

            return (
              <li key={rung} className="min-w-0">
                <button
                  type="button"
                  onClick={() => selectRung(rung)}
                  aria-expanded={active}
                  className={cn(
                    'w-full min-w-0 rounded-2xl px-4 py-5 text-left transition-[transform,background-color,box-shadow] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 md:px-7 md:py-6',
                    active
                      ? 'bg-white shadow-[0_0_0_1px_var(--brand),0_18px_40px_-34px_rgba(0,0,0,0.45)]'
                      : 'bg-[#fafafa] shadow-[0_0_0_1px_rgba(0,0,0,0.07)]',
                  )}
                >
                  <span className="flex min-w-0 items-start gap-4">
                    <span className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                      active ? 'bg-neutral-900 text-[var(--brand)]' : 'bg-white text-neutral-900/45 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]',
                    )}>
                      <Ico name={ICONS[rung]} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                        <span className="font-display text-xl font-extrabold tracking-tight text-neutral-900 md:text-2xl">
                          {index + 1}. {t(rung)}
                        </span>
                        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-neutral-900/50">
                          <span>{t(`${rung}time`)}</span>
                          <strong className="text-[15px] text-neutral-900">{t(`${rung}price`)}</strong>
                        </span>
                      </span>

                      {active && (
                        <motion.span
                          initial={reduced ? false : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: reduced ? 0 : 0.25 }}
                          className="mt-5 block"
                        >
                          <span className="block max-w-3xl text-[15px] leading-relaxed text-[#404040]">{t(`${rung}what`)}</span>
                          <span className="mt-3 block max-w-3xl text-[14px] leading-relaxed text-[#525252]">{t(`${rung}risk`)}</span>

                          {build && (
                            <span className="mt-5 inline-flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-[#f7f7f5] px-4 py-2.5 text-[13px] shadow-[0_0_0_1px_rgba(0,0,0,0.07)]">
                              <Ico name="solar:wallet-bold-duotone" className="h-5 w-5 text-neutral-900" />
                              <span className="text-neutral-900/55">{t('credit')}</span>
                              <span className="font-bold text-neutral-900/35 line-through">1,500</span>
                              <span className="rounded-full bg-[var(--brand)] px-3 py-1 font-bold text-[#111214]">{t('youPay')} 0</span>
                            </span>
                          )}
                        </motion.span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 flex items-start gap-2 text-[13px] font-semibold leading-relaxed text-neutral-900">
          <Ico name="solar:check-circle-bold-duotone" className="mt-0.5 h-4 w-4 text-neutral-900" />
          {t('note')}
        </p>
      </div>
    </SectionContainer>
  );
}
