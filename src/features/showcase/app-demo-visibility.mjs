import { createDemoLoop } from '../home/components/lib/demo-loop.mjs';

const VISIBILITY_THRESHOLD = 0.35;
const FINAL_HOLD_MS = 2000;

export function createAppDemoLoop(options) {
  return createDemoLoop({
    ...options,
    threshold: VISIBILITY_THRESHOLD,
    holdMs: FINAL_HOLD_MS,
  });
}
