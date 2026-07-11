'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  BookOpen,
  Building2,
  Check,
  ClipboardCheck,
  GitBranch,
  RotateCcw,
  Server,
  UsersRound,
} from 'lucide-react';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';
import {
  HANDOFF_ITEMS,
  createTimelinePlayer,
  handoffFrame,
} from './app-demo-models.mjs';

const HANDOFF_DURATION_MS = 7_200;
const HANDOFF_STAGES = [0, ...HANDOFF_ITEMS.map((_, index) => index + 1)];

const ITEM_ICONS = {
  repository: GitBranch,
  hosting: Server,
  modelAccount: Bot,
  evalSuite: ClipboardCheck,
  runbook: BookOpen,
} as const;

type TimelinePlayer = {
  play: () => void;
  replay: () => void;
  cleanup: () => void;
};

export function AppSafeHandoff() {
  const t = useTranslations('product.handoff');
  const reduced = useReducedMotion();
  const [transferredCount, setTransferredCount] = useState(0);
  const playerRef = useRef<TimelinePlayer | null>(null);

  useEffect(() => {
    const player = createTimelinePlayer({
      stages: HANDOFF_STAGES,
      durationMs: HANDOFF_DURATION_MS,
      reducedMotion: Boolean(reduced),
      onStage: (count: number) => setTransferredCount(count),
    });

    playerRef.current = player;
    player.play();

    return () => {
      player.cleanup();
      if (playerRef.current === player) playerRef.current = null;
    };
  }, [reduced]);

  const frame = handoffFrame(transferredCount);

  return (
    <SectionContainer className="py-20 md:py-28">
      <div className="mb-9 max-w-2xl">
        <span className="text-[12px] uppercase tracking-wide text-neutral-900/40">
          {t('eyebrow')}
        </span>
        <h2 className="mt-4 text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-neutral-900 md:text-4xl">
          {t('heading')}
        </h2>
        <p className="mt-3 text-pretty text-[15px] leading-relaxed text-[#525252]">
          {t('subtitle')}
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl bg-[#f7f7f5] shadow-[0_0_0_1px_rgba(0,0,0,0.07)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-900/[0.07] px-4 py-4 md:px-7">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-neutral-900/45">
            {t('custody')}
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tabular-nums text-neutral-900/45">
              {frame.transferredCount}/{HANDOFF_ITEMS.length}
            </span>
            <button
              type="button"
              onClick={() => playerRef.current?.replay()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-[12px] font-semibold text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] transition-transform duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
            >
              <RotateCcw size={14} aria-hidden="true" />
              {t('replay')}
            </button>
          </div>
        </div>

        <div className="p-4 md:p-7">
          <div className="grid grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] items-center gap-2 px-2 md:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] md:gap-4">
            <span className="flex min-h-11 items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-neutral-900/50">
              <Building2 size={15} aria-hidden="true" />
              {t('agency')}
            </span>
            <span aria-hidden="true" />
            <span className="flex min-h-11 items-center justify-end gap-2 text-right text-[12px] font-bold uppercase tracking-wide text-neutral-900">
              <UsersRound size={15} aria-hidden="true" />
              {t('client')}
            </span>
          </div>

          <ol className="mt-2 space-y-2" aria-label={t('custody')}>
            {frame.items.map((item) => {
              const Icon = ITEM_ICONS[item.key as keyof typeof ITEM_ICONS];
              const moved = item.owner === 'client';
              const active = frame.nextItem === item.key;

              return (
                <li
                  key={item.key}
                  aria-current={active ? 'step' : undefined}
                  className="grid grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] items-stretch gap-2 md:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] md:gap-4"
                >
                  <div
                    className={cn(
                      'flex min-h-[72px] min-w-0 items-center rounded-2xl px-3 py-3 md:px-4',
                      moved
                        ? 'bg-transparent text-neutral-900/30'
                        : 'bg-white text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.07)]',
                    )}
                  >
                    {moved ? (
                      <span className="text-[11px] font-semibold uppercase tracking-wide">
                        {t('transferred')}
                      </span>
                    ) : (
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white">
                          <Icon size={16} aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-bold">{t(item.key)}</span>
                          <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-neutral-900/40">
                            {t('owner')}: {t('agency')}
                          </span>
                        </span>
                      </span>
                    )}
                  </div>

                  <span className="flex min-h-11 items-center justify-center" aria-hidden="true">
                    <ArrowRight
                      size={18}
                      className={cn(
                        'transition-colors duration-200',
                        moved || active ? 'text-neutral-900' : 'text-neutral-900/20',
                      )}
                    />
                  </span>

                  <motion.div
                    initial={false}
                    animate={{ opacity: moved ? 1 : 0.62, x: moved ? 0 : -4 }}
                    transition={{ duration: reduced ? 0 : 0.28, ease: [0.23, 1, 0.32, 1] }}
                    className={cn(
                      'flex min-h-[72px] min-w-0 items-center rounded-2xl px-3 py-3 md:px-4',
                      moved
                        ? 'bg-white text-neutral-900 shadow-[0_0_0_1px_var(--brand)]'
                        : active
                          ? 'bg-[#fff7ed] text-[#9a3412] shadow-[0_0_0_1px_#fdba74]'
                          : 'bg-neutral-900/[0.035] text-neutral-900/35',
                    )}
                  >
                    {moved ? (
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-[#0e0e11]">
                          <Check size={17} aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-bold">{t(item.key)}</span>
                          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-neutral-900/45">
                            {t('owner')}: {t('client')}
                          </span>
                        </span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold uppercase tracking-wide">
                        {active ? t('transferring') : t('pending')}
                      </span>
                    )}
                  </motion.div>
                </li>
              );
            })}
          </ol>

          <div className="mt-5 min-h-[100px]" aria-live="polite">
            {frame.complete && (
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-[100px] flex-col justify-center rounded-2xl bg-neutral-900 px-5 py-4 text-white md:px-6"
              >
                <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-[var(--brand)]">
                  <Check size={15} aria-hidden="true" />
                  {t('complete')}
                </span>
                <p className="mt-2 font-display text-xl font-extrabold">{t('outcome')}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-white/60">{t('canOperate')}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
