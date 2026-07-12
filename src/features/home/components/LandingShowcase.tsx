'use client';

import { AppEval } from '@/features/showcase/AppEval';
import { AppTraceReplay } from '@/features/showcase/AppTraceReplay';
import { AppCost } from '@/features/showcase/AppCost';
import { AppLadder } from '@/features/showcase/AppLadder';
import { AppSafeHandoff } from '@/features/showcase/AppSafeHandoff';

/* The order answers a buyer's questions: work, checks, monthly cost, offer, ownership. */

export function LandingShowcase() {
  return (
    <div id="showcase" className="landing-showcase">
      <AppEval />
      <AppTraceReplay />
      <AppCost />
      <AppLadder />
      <AppSafeHandoff />
    </div>
  );
}
