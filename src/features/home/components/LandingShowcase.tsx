'use client';

import { AppEval } from '@/features/showcase/AppEval';
import { AppTraceReplay } from '@/features/showcase/AppTraceReplay';
import { AppCost } from '@/features/showcase/AppCost';
import { AppLadder } from '@/features/showcase/AppLadder';
import { AppSafeHandoff } from '@/features/showcase/AppSafeHandoff';

/* =========================================================================
   LandingShowcase: the aiAPP product slot.

   Three sections, and the order is the argument:

     1. The eval suite. The signature, and the one artifact a general development shop cannot
        hand you. Everyone else shows a chat window, and a chat window proves nothing because
        the demo always works.
     2. What it costs to RUN, per month. The question a dev shop cannot answer, and the larger
        half of the bill.
     3. The ladder, with the audit fee visibly subtracting from the build. The mechanic that
        turns a price into a deposit, and almost nobody shows it.

   A visual note. The obvious register for this page is near-black with an acid accent, which
   is both the dev-tool vernacular and one of the three looks that give AI-generated design
   away. So the page stays light, and the dark instrument panel appears only inside the eval
   harness and the cost reveal, where a terminal actually belongs. The lime is used as data,
   never as decoration.
   ========================================================================= */

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
