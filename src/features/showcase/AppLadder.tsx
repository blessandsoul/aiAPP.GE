'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';

/* =========================================================================
   AppLadder: the offer, with the credit mechanic made visible.

   The audit is 1,500 dollars and it comes off the build. Every serious firm in this category
   uses that mechanic and almost none of them SHOW it, so the buyer reads "1,500 dollars" and
   stops there without ever registering that it refunds itself.

   So when he clicks the build rung, the audit fee visibly subtracts. That is the whole trick,
   and it turns a price into a deposit in front of his eyes.

   Note the last rung is marked optional and says he can take the whole thing in-house whenever
   he wants. Volunteering that costs us the retainer conversation and buys the only thing that
   matters at this stage, which is that he believes the rest of the page.
   ========================================================================= */

const RUNGS = ['r1', 'r2', 'r3'] as const;
type Rung = (typeof RUNGS)[number];

export function AppLadder() {
  const t = useTranslations('product.ladder');
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<Rung>('r1');

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

      {/* NOT three equal cards. A ladder is an order of operations, so it is a stack, and the
          open rung expands. Three equal cards would say these are alternatives. They are not. */}
      <ul className="flex flex-col gap-3">
        {RUNGS.map((r, i) => {
          const on = r === open;
          const isBuild = r === 'r2';
          return (
            <li key={r}>
              <button
                type="button"
                onClick={() => setOpen(r)}
                aria-expanded={on}
                className={cn(
                  'w-full rounded-2xl px-5 py-5 text-left md:px-7 md:py-6',
                  'transition-[transform,background-color,box-shadow] duration-150 ease-out',
                  'active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2',
                  on
                    ? 'bg-white shadow-[0_0_0_1px_var(--brand),0_18px_40px_-30px_rgba(0,0,0,0.4)]'
                    : 'bg-[#fafafa] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] md:hover:bg-[#f4f4f4]',
                )}
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold tabular-nums',
                      on
                        ? 'text-[var(--primary-foreground)]'
                        : 'bg-white text-neutral-900/40 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]',
                    )}
                    style={on ? { background: 'var(--brand)' } : undefined}
                  >
                    {i + 1}
                  </span>
                  <span className="font-display text-xl font-extrabold tracking-tight text-neutral-900 md:text-2xl">
                    {t(r)}
                  </span>
                  <span className="ml-auto flex items-baseline gap-3">
                    <span className="text-[13px] text-neutral-900/45">{t(`${r}time`)}</span>
                    <span className="font-display text-lg font-extrabold tabular-nums text-neutral-900">
                      {t(`${r}price`)}
                    </span>
                  </span>
                </div>

                {on && (
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 8, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="mt-5"
                  >
                    <p className="max-w-2xl text-pretty text-[15px] leading-relaxed text-[#404040]">
                      {t(`${r}what`)}
                    </p>

                    <p
                      className={cn(
                        'mt-4 max-w-2xl text-pretty text-[14px] leading-relaxed',
                        isBuild ? 'font-semibold text-neutral-900' : 'text-[#525252]',
                      )}
                    >
                      {t(`${r}risk`)}
                    </p>

                    {/* the credit mechanic, made physical */}
                    {isBuild && (
                      <div className="mt-6 inline-flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-[#fafafa] px-5 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
                        <span className="text-[13px] text-neutral-900/50">{t('credit')}</span>
                        <span className="font-display text-lg font-extrabold tabular-nums text-neutral-900/35 line-through">
                          1,500
                        </span>
                        <motion.span
                          initial={reduced ? false : { scale: 0.25, opacity: 0, filter: 'blur(4px)' }}
                          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                          transition={{ type: 'spring', duration: 0.3, bounce: 0, delay: 0.15 }}
                          className="flex h-7 items-center rounded-full px-3 text-[12px] font-bold"
                          style={{
                            background: 'var(--brand)',
                            color: 'var(--primary-foreground)',
                          }}
                        >
                          {t('youPay')} 0
                        </motion.span>
                      </div>
                    )}
                  </motion.div>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-[13px] font-semibold text-neutral-900">{t('note')}</p>
    </SectionContainer>
  );
}
