export const BUSINESS_STAGES = [
  'request',
  'safety-check',
  'action',
  'customer-result',
];

export const HANDOFF_ITEMS = [
  'code',
  'hostingAccess',
  'serviceAccounts',
  'documentation',
  'operatingControl',
];

const BUSINESS_BASE = {
  requestVisible: true,
  checkStatus: 'waiting',
  actionStatus: 'waiting',
  customerVisible: false,
  resultKey: null,
};

const BUSINESS_FRAMES = {
  request: {
    ...BUSINESS_BASE,
    stage: 'request',
  },
  'safety-check': {
    ...BUSINESS_BASE,
    stage: 'safety-check',
    checkStatus: 'passed',
  },
  action: {
    ...BUSINESS_BASE,
    stage: 'action',
    checkStatus: 'passed',
    actionStatus: 'allowed',
  },
  'customer-result': {
    ...BUSINESS_BASE,
    stage: 'customer-result',
    checkStatus: 'passed',
    actionStatus: 'allowed',
    customerVisible: true,
    resultKey: 'sent',
  },
};

export function businessFrame(stage) {
  return BUSINESS_FRAMES[stage] ?? BUSINESS_FRAMES.request;
}

export function handoffFrame(transferredCount) {
  const numericCount = Number.isFinite(transferredCount) ? Math.floor(transferredCount) : 0;
  const count = Math.max(0, Math.min(HANDOFF_ITEMS.length, numericCount));
  const complete = count === HANDOFF_ITEMS.length;

  return {
    transferredCount: count,
    transferred: HANDOFF_ITEMS.slice(0, count),
    nextItem: HANDOFF_ITEMS[count] ?? null,
    items: HANDOFF_ITEMS.map((key, index) => ({
      key,
      owner: index < count ? 'client' : 'ainow',
      transferred: index < count,
    })),
    complete,
    owner: complete ? 'client' : 'transition',
    clientCanOperate: complete,
    resultKey: complete ? 'clientOwned' : null,
  };
}

/**
 * Play a deterministic list of states once. The family loop owns visibility,
 * repetition, final hold, and manual ownership; this helper owns only the
 * timers inside one pass.
 *
 * @template T
 * @param {{
 *   stages?: T[],
 *   durationMs?: number,
 *   schedule?: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>,
 *   cancel?: (timer: ReturnType<typeof setTimeout>) => void,
 *   reducedMotion?: boolean,
 *   onStage?: (stage: T) => void,
 * }} [options]
 */
export function createTimelinePlayer({
  stages = [],
  durationMs = 6_000,
  schedule = setTimeout,
  cancel: cancelScheduled = clearTimeout,
  reducedMotion = false,
  onStage = () => {},
} = {}) {
  let timers = [];

  const cancel = () => {
    timers.forEach((timer) => cancelScheduled(timer));
    timers = [];
  };

  const play = () => {
    cancel();
    if (stages.length === 0) return;

    if (reducedMotion) {
      onStage(stages[stages.length - 1]);
      return;
    }

    onStage(stages[0]);
    if (stages.length === 1) return;

    const transitionCount = stages.length - 1;
    const firstChangeMs = Math.min(850, durationMs / transitionCount);
    timers = stages.slice(1).map((stage, index) => {
      const position = index + 1;
      const delay = transitionCount === 1
        ? firstChangeMs
        : firstChangeMs + ((durationMs - firstChangeMs) * (position - 1)) / (transitionCount - 1);
      return schedule(() => onStage(stage), delay);
    });
  };

  return {
    play,
    replay: play,
    cancel,
    cleanup: cancel,
  };
}
