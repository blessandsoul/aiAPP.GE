'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  CircleX,
  LockKeyhole,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Terminal,
  Wrench,
} from 'lucide-react';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';
import {
  TRACE_STAGES,
  createTimelinePlayer,
  traceFrame,
} from './app-demo-models.mjs';
import { createVisibilityGate } from './app-demo-visibility.mjs';

const TRACE_DURATION_MS = 7_200;

const STAGE_META = {
  request: { label: 'request', icon: MessageCircle },
  'wrong-tool': { label: 'wrongTool', icon: CircleX },
  blocked: { label: 'blocked', icon: ShieldCheck },
  'correct-tool': { label: 'correctTool', icon: Wrench },
  response: { label: 'response', icon: Send },
  passed: { label: 'passed', icon: Check },
} as const;

type TimelinePlayer = {
  play: () => void;
  replay: () => void;
  cleanup: () => void;
};

export function AppTraceReplay() {
  const t = useTranslations('product.trace');
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<string>(TRACE_STAGES[0]);
  const playerRef = useRef<TimelinePlayer | null>(null);
  const visibilityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const player = createTimelinePlayer({
      stages: TRACE_STAGES,
      durationMs: TRACE_DURATION_MS,
      reducedMotion: Boolean(reduced),
      onStage: (nextStage: string) => setStage(nextStage),
    });

    playerRef.current = player;
    const cleanupVisibility = createVisibilityGate({
      target: visibilityRef.current,
      play: player.play,
      reducedMotion: Boolean(reduced),
    });

    return () => {
      cleanupVisibility();
      player.cleanup();
      if (playerRef.current === player) playerRef.current = null;
    };
  }, [reduced]);

  const frame = traceFrame(stage);
  const activeIndex = Math.max(0, TRACE_STAGES.indexOf(stage));
  const eventJson = JSON.stringify(
    {
      trace_id: frame.traceId,
      stage: frame.stage,
      request: frame.request,
      tool_call: frame.toolCall,
      tool_result: frame.toolResult,
      answer: frame.answer,
      customer_visible: frame.customerVisible,
      verdict: frame.verdict,
    },
    null,
    2,
  );

  return (
    <SectionContainer className="py-20 md:py-28">
      <div
        ref={visibilityRef}
        className="grid items-start gap-10 lg:grid-cols-[minmax(250px,350px)_1fr] lg:gap-14"
      >
        <div>
          <span className="text-[12px] uppercase tracking-wide text-neutral-900/40">
            {t('eyebrow')}
          </span>
          <h2 className="mt-4 text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-neutral-900 md:text-4xl">
            {t('heading')}
          </h2>
          <p className="mt-3 text-pretty text-[15px] leading-relaxed text-[#525252]">
            {t('subtitle')}
          </p>

          <ol className="mt-7 space-y-2" aria-label={t('heading')}>
            {TRACE_STAGES.map((item, index) => {
              const meta = STAGE_META[item as keyof typeof STAGE_META];
              const Icon = meta.icon;
              const current = item === stage;
              const reached = index <= activeIndex;

              return (
                <li
                  key={item}
                  aria-current={current ? 'step' : undefined}
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] transition-[background-color,color,box-shadow] duration-200',
                    current
                      ? 'bg-white font-semibold text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]'
                      : reached
                        ? 'text-neutral-900/70'
                        : 'text-neutral-900/35',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                      reached ? 'bg-neutral-900 text-white' : 'bg-neutral-900/[0.06]',
                      current && item === 'wrong-tool' && 'bg-[#dc2626]',
                      current && item === 'blocked' && 'bg-[#d97706]',
                      current && item === 'passed' && 'bg-[var(--brand)] text-[#0e0e11]',
                    )}
                  >
                    <Icon size={14} aria-hidden="true" />
                  </span>
                  <span>{t(meta.label)}</span>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={() => playerRef.current?.replay()}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[13px] font-semibold text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.12)] transition-transform duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
          >
            <RotateCcw size={15} aria-hidden="true" />
            {t('replay')}
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl bg-[#0e0e11] text-white shadow-[0_24px_60px_-34px_rgba(0,0,0,0.55)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 md:px-7">
            <span className="flex items-center gap-2 font-mono text-[12px] text-white/65">
              <Terminal size={15} aria-hidden="true" />
              {frame.traceId}
            </span>
            <span className="rounded-full bg-white/[0.07] px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-white/45">
              {t('redacted')}
            </span>
          </div>

          <div className="grid gap-4 p-4 md:p-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(210px,0.75fr)]">
            <div className="min-w-0 rounded-2xl bg-white/[0.05] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] md:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] font-semibold text-white/60">{t('toolCall')}</span>
                {stage === 'blocked' && (
                  <span className="flex items-center gap-1.5 rounded-full bg-[#d97706]/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-[#fbbf24]">
                    <ShieldCheck size={12} aria-hidden="true" />
                    {t('blocked')}
                  </span>
                )}
              </div>
              <motion.pre
                key={stage}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0 : 0.22 }}
                className="mt-4 min-h-[330px] overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-white/70"
                aria-live="polite"
              >
                {eventJson}
              </motion.pre>
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <div className="rounded-2xl bg-white px-4 py-4 text-neutral-900">
                <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-900/40">
                  <MessageCircle size={13} aria-hidden="true" />
                  {t('request')}
                </span>
                <p className="mt-3 text-[14px] font-semibold">{t('customerRequest')}</p>
                <code className="mt-3 block break-all text-[11px] text-neutral-900/45">
                  {frame.request.orderId}
                </code>
              </div>

              <div
                className={cn(
                  'flex min-h-[148px] flex-col justify-between rounded-2xl p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]',
                  frame.customerVisible ? 'bg-white/[0.09]' : 'bg-[#d97706]/10',
                )}
                aria-live="polite"
              >
                <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-white/45">
                  {frame.customerVisible ? (
                    <Send size={13} aria-hidden="true" />
                  ) : (
                    <LockKeyhole size={13} aria-hidden="true" />
                  )}
                  {t('answerChannel')}
                </span>
                <div className="mt-4">
                  <p className="text-[13px] font-bold text-white">
                    {frame.customerVisible ? t('answerDelivered') : t('answerHeld')}
                  </p>
                  {frame.answer && (
                    <code className="mt-3 block break-words font-mono text-[10px] leading-4 text-white/55">
                      {JSON.stringify(frame.answer)}
                    </code>
                  )}
                </div>
              </div>

              <div className="min-h-[92px]" aria-live="polite">
                {frame.badPathStoppedBeforeCustomer && (
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-[var(--brand)] p-4 text-[#0e0e11]"
                  >
                    <span className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide">
                      <Check size={15} aria-hidden="true" />
                      {t('badPath')}
                    </span>
                    <p className="mt-2 text-[12px] font-semibold leading-relaxed">{t('outcome')}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
