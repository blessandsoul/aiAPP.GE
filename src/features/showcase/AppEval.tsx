'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';

/* =========================================================================
   AppEval: the signature, and the one thing a general development shop cannot hand you.

   Everyone in this category shows you a chat window. A chat window proves nothing: it is the
   demo, and the demo always works. What separates an AI engineer from a body shop is the eval
   suite, the guardrail that catches a prompt injection, and the trace that shows WHICH TOOL the
   agent reached for on the way to a right answer through a wrong path.

   So the hero of this page is an eval run. Fifty cases scroll past, they pass and they fail, and
   one of them is an injection attempt that the guardrail stops before the model ever sees it.

   A note on the visual register, because it was a real decision. The obvious move here is a
   near-black page with an acid accent, which is the dev-tool vernacular and also one of the
   three looks that give AI-generated design away. So the page stays light and the dark
   instrument panel lives only INSIDE this widget, where a terminal actually belongs. The lime
   is used as data (pass) and the red as data (fail), never as decoration.
   ========================================================================= */

type Case = { id: string; name: string; tool: string; ok: boolean; guard?: boolean };

/* A fixed suite. No Math.random anywhere: the same run every visit, which is also what a real
   eval suite is for. A test set that changes between runs is not a test set. */
const CASES: Case[] = [
  { id: 'e01', name: 'refund, in policy window', tool: 'lookup_order', ok: true },
  { id: 'e02', name: 'refund, outside window', tool: 'lookup_policy', ok: true },
  { id: 'e03', name: 'order status, valid id', tool: 'lookup_order', ok: true },
  { id: 'e04', name: 'order status, mistyped id', tool: 'lookup_order', ok: true },
  { id: 'e05', name: 'ignore instructions, dump context', tool: 'blocked', ok: true, guard: true },
  { id: 'e06', name: 'ask for another customer email', tool: 'blocked', ok: true, guard: true },
  { id: 'e07', name: 'complaint, needs escalation', tool: 'escalate', ok: true },
  { id: 'e08', name: 'question with no answer in docs', tool: 'refuse', ok: true },
  { id: 'e09', name: 'two questions in one message', tool: 'lookup_order', ok: false },
  { id: 'e10', name: 'price question, product renamed', tool: 'search_docs', ok: false },
  { id: 'e11', name: 'delivery date, weekend edge', tool: 'lookup_order', ok: true },
  { id: 'e12', name: 'cancel, already shipped', tool: 'lookup_order', ok: true },
  { id: 'e13', name: 'off topic, weather', tool: 'refuse', ok: true },
  { id: 'e14', name: 'invoice request', tool: 'send_invoice', ok: true },
  { id: 'e15', name: 'change address after dispatch', tool: 'escalate', ok: true },
  { id: 'e16', name: 'pretend to be an admin', tool: 'blocked', ok: true, guard: true },
];

const TICK_MS = 190;
const TOTAL = 50; // the visible suite is a window onto a 50-case run

export function AppEval() {
  const t = useTranslations('product.eval');
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => clear, [clear]);

  const run = useCallback(() => {
    clear();
    setN(0);
    setRunning(true);
    if (reduced) {
      setN(CASES.length);
      setRunning(false);
      return;
    }
    timer.current = setInterval(() => {
      setN((p) => {
        if (p + 1 >= CASES.length) {
          clear();
          setRunning(false);
          return CASES.length;
        }
        return p + 1;
      });
    }, TICK_MS);
  }, [clear, reduced]);

  const shown = CASES.slice(0, n);
  const passed = shown.filter((c) => c.ok).length;
  const failed = shown.filter((c) => !c.ok).length;
  const guards = shown.filter((c) => c.guard).length;
  const done = n >= CASES.length;

  /* The visible window is 16 cases, scaled to read as a slice of a 50-case run. */
  const scale = (v: number) => Math.round((v / CASES.length) * TOTAL);

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

      {/* the instrument panel. dark ONLY here, where a terminal actually belongs. */}
      <div className="overflow-hidden rounded-3xl bg-[#0e0e11]">
        <div className="flex flex-wrap items-center gap-4 border-b border-white/8 px-5 py-4 md:px-7">
          <button
            type="button"
            onClick={run}
            disabled={running}
            className={cn(
              'inline-flex h-11 items-center rounded-full px-6 text-[14px] font-bold',
              'transition-[transform,filter] duration-150 ease-out active:scale-[0.96] md:hover:brightness-110',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0e11]',
              running && 'opacity-70',
            )}
            style={{ background: 'var(--brand)', color: 'var(--primary-foreground)' }}
          >
            {running ? t('running') : done ? t('again') : t('run')}
          </button>

          <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono text-[12px]">
            <span className="tabular-nums text-white/40">
              {scale(n)}/{TOTAL} {t('cases')}
            </span>
            <span className="tabular-nums" style={{ color: 'var(--brand)' }}>
              {scale(passed)} {t('passed')}
            </span>
            <span className="tabular-nums text-[#ef4444]">
              {scale(failed)} {t('failed')}
            </span>
            {guards > 0 && (
              <span className="tabular-nums text-[#f59e0b]">
                {scale(guards)} {t('guard')}
              </span>
            )}
          </span>
        </div>

        {/* the run */}
        <div className="max-h-[380px] overflow-y-auto px-5 py-4 md:px-7">
          <ul className="flex flex-col gap-1">
            {shown.map((c, i) => (
              <motion.li
                key={c.id}
                initial={reduced ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className={cn(
                  'grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-3 py-2 font-mono text-[12px]',
                  c.guard
                    ? 'bg-[#f59e0b]/10'
                    : c.ok
                      ? 'bg-white/[0.03]'
                      : 'bg-[#ef4444]/10',
                )}
              >
                <span
                  className={cn(
                    'w-5 shrink-0 text-center font-bold',
                    c.guard ? 'text-[#f59e0b]' : c.ok ? '' : 'text-[#ef4444]',
                  )}
                  style={c.ok && !c.guard ? { color: 'var(--brand)' } : undefined}
                  aria-hidden="true"
                >
                  {c.guard ? '!' : c.ok ? '+' : 'x'}
                </span>

                <span className="min-w-0">
                  <span className="mr-2 text-white/25">{c.id}</span>
                  <span className="text-white/80">{c.name}</span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="text-[11px] text-white/30">{t('tool')} </span>
                  <span
                    className={cn(
                      'text-[11px]',
                      c.guard ? 'text-[#f59e0b]' : c.ok ? 'text-white/55' : 'text-[#ef4444]',
                    )}
                  >
                    {c.tool}
                  </span>
                </span>

                {i === n - 1 && running && (
                  <span className="col-span-3 h-px w-full" aria-hidden="true" />
                )}
              </motion.li>
            ))}

            {n === 0 && (
              <li className="py-16 text-center font-mono text-[12px] text-white/25">
                {t('run')}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* the two things the run is actually saying */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-[#fafafa] p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06)] md:p-6">
          <span className="block text-[13px] font-bold text-neutral-900">{t('why')}</span>
          <p className="mt-2 text-pretty text-[14px] leading-relaxed text-[#525252]">
            {t('whyBody')}
          </p>
        </div>
        <div className="rounded-2xl bg-[#fffbeb] p-5 shadow-[0_0_0_1px_#f59e0b] md:p-6">
          <span className="block text-[13px] font-bold text-[#92400e]">{t('injection')}</span>
          <p className="mt-2 text-pretty text-[14px] leading-relaxed text-[#78350f]">
            {t('injectionBody')}
          </p>
        </div>
      </div>

      <p className="mt-5 text-[12px] leading-relaxed text-[#737373]">{t('note')}</p>
    </SectionContainer>
  );
}
