'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { SectionContainer } from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';

/* =========================================================================
   AppCost: the number a general development shop cannot give you.

   Everyone asks what the build costs. That is the smaller half of the bill, and the reason
   nobody tells you is not malice, it is that a shop which has never run an agent in production
   does not know. An agent costs money every single time it thinks, forever.

   So the widget does the arithmetic in front of him on today's public token prices, then puts
   the three-year running cost next to the build and shows what share the build actually is.
   The industry finding (initial development is roughly a quarter to a third of a three-year
   total) is attributed as someone else's, because it is.

   Saying this out loud costs us the deal with a buyer who wants to hear a small number. It
   wins the deal with the one who has been burned by a small number before, and he is the one
   worth having.
   ========================================================================= */

/* Public per-million-token rates, rounded, blended input and output. They move constantly, and
   the note under the widget says so: this is arithmetic, not a quote. */
const MODEL = {
  m1: { usdPerMTok: 1.2 },
  m2: { usdPerMTok: 9 },
  m3: { usdPerMTok: 42 },
} as const;
type Tier = keyof typeof MODEL;

const TOKENS_PER_TURN = 2400; // prompt plus context plus completion, a realistic RAG turn
const BUILD_USD = 26000; // an illustrative mid-size agent build, stated as illustrative

export function AppCost() {
  const t = useTranslations('product.cost');
  const reduced = useReducedMotion();
  const [convos, setConvos] = useState(3000);
  const [turns, setTurns] = useState(4);
  const [tier, setTier] = useState<Tier>('m2');

  const tokens = convos * turns * TOKENS_PER_TURN;
  const monthly = (tokens / 1_000_000) * MODEL[tier].usdPerMTok;
  const run3 = monthly * 36;
  const total = run3 + BUILD_USD;
  const buildShare = Math.round((BUILD_USD / total) * 100);

  const usd = (n: number) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

  return (
    <SectionContainer className="py-20 md:py-28">
      <div className="grid gap-10 lg:grid-cols-[minmax(280px,380px)_1fr] lg:gap-14">
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

          <div className="mt-8 flex flex-col gap-6">
            <Range label={t('convos')} value={convos} min={200} max={50000} step={200} onChange={setConvos} />
            <Range label={t('turns')} value={turns} min={1} max={12} step={1} onChange={setTurns} />

            <div>
              <span className="text-[13px] font-medium text-neutral-900/70">{t('model')}</span>
              <div className="mt-3 flex gap-2">
                {(['m1', 'm2', 'm3'] as Tier[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTier(m)}
                    aria-pressed={tier === m}
                    className={cn(
                      'min-h-[44px] flex-1 rounded-xl px-3 text-[13px] font-semibold',
                      'transition-[transform,background-color,color,box-shadow] duration-150 ease-out',
                      'active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2',
                      tier === m
                        ? 'text-[var(--primary-foreground)]'
                        : 'bg-[#fafafa] text-[#525252] shadow-[0_0_0_1px_rgba(0,0,0,0.07)] md:hover:bg-[#f0f0f0]',
                    )}
                    style={tier === m ? { background: 'var(--brand)' } : undefined}
                  >
                    {t(m)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* the reveal */}
        <div>
          <div className="rounded-2xl bg-[#0e0e11] p-6 md:p-8">
            <span className="text-[12px] uppercase tracking-wide text-white/40">{t('monthly')}</span>
            <p className="mt-3 font-display text-5xl font-extrabold tabular-nums leading-none text-white md:text-6xl">
              <span style={{ color: 'var(--brand)' }}>$</span>
              {usd(monthly)}
              <span className="ml-2 text-xl font-bold text-white/35">{t('perMonth')}</span>
            </p>

            {/* build against run, as a single bar. the shape IS the argument. */}
            <div className="mt-9">
              <div className="flex h-12 w-full overflow-hidden rounded-xl">
                <motion.div
                  initial={false}
                  animate={{ flexGrow: buildShare }}
                  transition={{ duration: reduced ? 0 : 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="flex items-center justify-center bg-white/12 text-[11px] font-bold uppercase tracking-wide text-white/60"
                  style={{ flexBasis: 0 }}
                >
                  {t('build')}
                </motion.div>
                <motion.div
                  initial={false}
                  animate={{ flexGrow: 100 - buildShare }}
                  transition={{ duration: reduced ? 0 : 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="flex items-center justify-center text-[11px] font-bold uppercase tracking-wide"
                  style={{
                    flexBasis: 0,
                    background: 'var(--brand)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  {t('run3')}
                </motion.div>
              </div>

              <div className="mt-4 flex flex-wrap items-baseline gap-x-3">
                <span className="text-[13px] text-white/45">{t('share')}</span>
                <span className="font-display text-3xl font-extrabold tabular-nums text-white">
                  {buildShare}%
                </span>
                <span className="text-[13px] text-white/45">{t('shareOf')}</span>
              </div>
            </div>

            <p className="mt-7 border-t border-white/10 pt-5 text-pretty text-[13px] leading-relaxed text-white/50">
              {t('reveal')}
            </p>
          </div>

          <p className="mt-4 text-pretty text-[12px] leading-relaxed text-[#737373]">{t('note')}</p>
        </div>
      </div>
    </SectionContainer>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-4">
        <span className="text-[13px] font-medium text-neutral-900/70">{label}</span>
        <span className="font-display text-lg font-extrabold tabular-nums text-neutral-900">
          {value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-10 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[#e5e5e5] [&::-webkit-slider-thumb]:mt-[-7px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:ease-out active:[&::-webkit-slider-thumb]:scale-[0.96] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-neutral-900 [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[#e5e5e5]"
      />
    </label>
  );
}
