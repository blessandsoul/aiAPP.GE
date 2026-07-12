'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Ico } from '@/components/common/Ico';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';
import { createAppDemoLoop } from './app-demo-visibility.mjs';

type CheckState = 'ready' | 'review' | 'stopped';
type DemoLoop = {
  replay: () => void;
  takeControl: () => void;
  cleanup: () => void;
};

const CHECKS: { key: string; state: CheckState; icon: string }[] = [
  { key: 'c1', state: 'ready', icon: 'solar:chat-round-dots-bold-duotone' },
  { key: 'c2', state: 'review', icon: 'solar:magnifer-bold-duotone' },
  { key: 'c3', state: 'review', icon: 'solar:user-check-rounded-bold-duotone' },
  { key: 'c4', state: 'stopped', icon: 'solar:shield-check-bold-duotone' },
  { key: 'c5', state: 'ready', icon: 'solar:check-circle-bold-duotone' },
];

const STATE_META: Record<CheckState, { icon: string; tone: string }> = {
  ready: {
    icon: 'solar:check-circle-bold-duotone',
    tone: 'bg-[#dcfce7] text-[#166534]',
  },
  review: {
    icon: 'solar:user-check-rounded-bold-duotone',
    tone: 'bg-[#fef3c7] text-[#92400e]',
  },
  stopped: {
    icon: 'solar:shield-check-bold-duotone',
    tone: 'bg-[#fee2e2] text-[#991b1b]',
  },
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
      setVisibleCount(1);
      CHECKS.slice(1).forEach((_, index) => {
        timers.current.push(
          setTimeout(() => setVisibleCount(index + 2), (CYCLE_MS / (CHECKS.length - 1)) * (index + 1)),
        );
      });
    };

    const loop = createAppDemoLoop({
      target: sectionRef.current,
      reducedMotion: Boolean(reduced),
      cycleMs: CYCLE_MS,
      play,
      showFinal: () => setVisibleCount(CHECKS.length),
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

  const complete = visibleCount === CHECKS.length;

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
          <span className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900/60">
            <Ico name="solar:shield-check-bold-duotone" className="h-5 w-5 text-neutral-900" />
            {complete ? t('complete') : `${visibleCount}/${CHECKS.length}`}
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

        <div className="grid min-w-0 gap-5 p-4 md:p-7 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.45fr)] lg:gap-7">
          <div className="flex min-w-0 flex-col justify-between rounded-2xl bg-neutral-900 p-5 text-white md:p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#111214]">
              <Ico name="solar:user-check-rounded-bold-duotone" className="h-6 w-6" />
            </span>
            <div className="mt-10">
              <p className="text-[13px] leading-relaxed text-white/55">{t('note')}</p>
              <motion.div
                initial={false}
                animate={{ opacity: complete ? 1 : 0.45, y: complete ? 0 : 6 }}
                transition={{ duration: reduced ? 0 : 0.25 }}
                className="mt-5 rounded-2xl bg-white/[0.08] p-4"
                aria-live="polite"
              >
                <span className="flex items-center gap-2 text-[13px] font-bold text-[var(--brand)]">
                  <Ico name="solar:check-circle-bold-duotone" className="h-5 w-5" />
                  {t('complete')}
                </span>
                <p className="mt-2 text-[14px] leading-relaxed text-white/80">{t('outcome')}</p>
              </motion.div>
            </div>
          </div>

          <ol className="min-w-0 space-y-3" aria-label={t('heading')}>
            {CHECKS.map((item, index) => {
              const shown = index < visibleCount;
              const active = index === Math.max(visibleCount - 1, 0) && visibleCount > 0;
              const meta = STATE_META[item.state];

              return (
                <motion.li
                  key={item.key}
                  initial={false}
                  animate={{ opacity: shown ? 1 : 0.42, x: shown ? 0 : -5 }}
                  transition={{ duration: reduced ? 0 : 0.22 }}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'flex min-h-[76px] min-w-0 items-center gap-4 rounded-2xl border bg-white px-4 py-3 md:px-5',
                    active ? 'border-neutral-900/25' : 'border-neutral-900/[0.07]',
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900/[0.06] text-neutral-900">
                    <Ico name={item.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1 text-[14px] font-semibold leading-snug text-neutral-900">
                    {t(item.key)}
                  </span>
                  <span className={cn('flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold', meta.tone)}>
                    <Ico name={meta.icon} className="h-3.5 w-3.5" />
                    {t(item.state)}
                  </span>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </SectionContainer>
  );
}
