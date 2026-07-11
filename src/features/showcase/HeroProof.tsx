'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/* =========================================================================
   HeroProof, aiAPP: an eval run, with a guardrail catching an injection.

   Everyone in this category opens with a chat window, and a chat window proves nothing, because
   the demo always works. What separates an AI engineer from a body shop is the eval suite, the
   guardrail, and the trace that shows which TOOL the agent reached for on its way to a right
   answer down a wrong path.

   So the first thing this page shows is a test suite running. It passes, it fails once, and it
   blocks a prompt injection before the model ever sees it. A technical buyer knows in three
   seconds that we are not an outsourcing shop, and that is the entire job of this frame.

   A note on the visual register, because it was a real decision. The obvious move for a dev-tool
   page is a near-black canvas with an acid accent. That is the category vernacular AND one of the
   three looks that give AI-generated design away, so the PAGE stays light and the terminal lives
   only in here, where a terminal actually belongs. The lime is data (pass) and the red is data
   (fail). Neither is decoration.
   ========================================================================= */

const CASES = [
  { id: 'e01', tool: 'lookup_order', state: 'pass' },
  { id: 'e02', tool: 'lookup_policy', state: 'pass' },
  { id: 'e03', tool: 'blocked', state: 'guard' },
  { id: 'e04', tool: 'search_docs', state: 'fail' },
  { id: 'e05', tool: 'escalate', state: 'pass' },
  { id: 'e06', tool: 'refuse', state: 'pass' },
] as const;

const CYCLE = 6200;
const TICK = 340;

export function HeroProof() {
  const t = useTranslations('product.proof');
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduced) {
      setN(CASES.length);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      setN(0);
      CASES.forEach((_, i) => timers.push(setTimeout(() => setN(i + 1), 600 + i * TICK)));
    };
    run();
    const loop = setInterval(run, CYCLE);
    return () => {
      clearInterval(loop);
      timers.forEach(clearTimeout);
    };
  }, [reduced]);

  const shown = CASES.slice(0, n);
  const pass = shown.filter((c) => c.state === 'pass').length;
  const fail = shown.filter((c) => c.state === 'fail').length;
  const guard = shown.filter((c) => c.state === 'guard').length;

  return (
    <div className="overflow-hidden rounded-3xl bg-[#0b0b0e] shadow-[0_28px_60px_-40px_rgba(0,0,0,0.6)]">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-white/8 px-5 py-3.5">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-white/40">
          {t('suite')}
        </span>
        <span className="ml-auto flex items-baseline gap-x-4 font-mono text-[11.5px]">
          <span className="tabular-nums" style={{ color: 'var(--brand)' }}>
            {pass} {t('pass')}
          </span>
          <span className="tabular-nums text-[#ef4444]">
            {fail} {t('fail')}
          </span>
          <span className="tabular-nums text-[#f59e0b]">
            {guard} {t('guard')}
          </span>
        </span>
      </div>

      <ul className="flex flex-col gap-1 p-4 md:p-5">
        {CASES.map((c, i) => {
          const on = i < n;
          return (
            <motion.li
              key={c.id}
              initial={false}
              animate={
                on
                  ? { opacity: 1, x: 0, filter: 'blur(0px)' }
                  : { opacity: 0, x: -8, filter: 'blur(3px)' }
              }
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className={cn(
                'grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-3 py-2 font-mono text-[11.5px]',
                c.state === 'guard'
                  ? 'bg-[#f59e0b]/10'
                  : c.state === 'fail'
                    ? 'bg-[#ef4444]/10'
                    : 'bg-white/[0.03]',
              )}
            >
              <span
                className={cn(
                  'w-4 shrink-0 text-center font-bold',
                  c.state === 'guard' ? 'text-[#f59e0b]' : c.state === 'fail' ? 'text-[#ef4444]' : '',
                )}
                style={c.state === 'pass' ? { color: 'var(--brand)' } : undefined}
                aria-hidden="true"
              >
                {c.state === 'guard' ? '!' : c.state === 'fail' ? 'x' : '+'}
              </span>
              <span className="min-w-0 truncate">
                <span className="mr-2 text-white/25">{c.id}</span>
                <span className="text-white/80">{t(c.id)}</span>
              </span>
              {/* The tool column is the second-most useful thing here, and on a 390px phone it was
                  eating the case name down to "refund, in policy w...". The case is what a founder
                  has to read; which tool the agent reached for is detail. So on a phone it goes. */}
              <span
                className={cn(
                  'hidden shrink-0 text-[10.5px] sm:inline',
                  c.state === 'guard'
                    ? 'text-[#f59e0b]'
                    : c.state === 'fail'
                      ? 'text-[#ef4444]'
                      : 'text-white/45',
                )}
              >
                {c.tool}
              </span>
            </motion.li>
          );
        })}
      </ul>

      <motion.p
        initial={false}
        animate={
          n >= CASES.length
            ? { opacity: 1, y: 0, filter: 'blur(0px)' }
            : { opacity: 0, y: 6, filter: 'blur(3px)' }
        }
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="border-t border-white/8 px-5 py-3.5 text-pretty text-[11.5px] leading-snug text-white/45"
      >
        {t('note')}
      </motion.p>
    </div>
  );
}
