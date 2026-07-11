export const TRACE_STAGES = [
  'request',
  'wrong-tool',
  'blocked',
  'correct-tool',
  'response',
  'passed',
];

export const HANDOFF_ITEMS = [
  'repository',
  'hosting',
  'modelAccount',
  'evalSuite',
  'runbook',
];

const ORDER_ID = 'ord_[redacted]_1842';

const REQUEST = {
  orderId: ORDER_ID,
  intent: 'order_status',
};

const WRONG_TOOL_CALL = {
  name: 'search_docs',
  arguments: {
    orderId: ORDER_ID,
    query: 'order status',
  },
};

const CORRECT_TOOL_CALL = {
  name: 'lookup_order',
  arguments: {
    orderId: ORDER_ID,
  },
};

const ANSWER = {
  orderId: ORDER_ID,
  status: 'in_transit',
  eta: '2026-07-14',
};

const TRACE_BASE = {
  traceId: 'trace_[redacted]_01',
  request: REQUEST,
  toolCall: null,
  toolResult: null,
  answer: null,
  blocked: false,
  customerVisible: false,
  verdict: 'running',
  badPathStoppedBeforeCustomer: false,
  resultKey: null,
};

const TRACE_FRAMES = {
  request: {
    ...TRACE_BASE,
    stage: 'request',
  },
  'wrong-tool': {
    ...TRACE_BASE,
    stage: 'wrong-tool',
    toolCall: WRONG_TOOL_CALL,
  },
  blocked: {
    ...TRACE_BASE,
    stage: 'blocked',
    toolCall: WRONG_TOOL_CALL,
    toolResult: {
      status: 'blocked',
      reason: 'tool_policy_mismatch',
    },
    blocked: true,
  },
  'correct-tool': {
    ...TRACE_BASE,
    stage: 'correct-tool',
    toolCall: CORRECT_TOOL_CALL,
  },
  response: {
    ...TRACE_BASE,
    stage: 'response',
    toolCall: CORRECT_TOOL_CALL,
    toolResult: ANSWER,
    answer: ANSWER,
    customerVisible: true,
  },
  passed: {
    ...TRACE_BASE,
    stage: 'passed',
    toolCall: CORRECT_TOOL_CALL,
    toolResult: ANSWER,
    answer: ANSWER,
    customerVisible: true,
    verdict: 'passed',
    badPathStoppedBeforeCustomer: true,
    resultKey: 'passed',
  },
};

export function traceFrame(stage) {
  return TRACE_FRAMES[stage] ?? TRACE_FRAMES.request;
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
      from: 'agency',
      owner: index < count ? 'client' : 'agency',
      transferred: index < count,
    })),
    complete,
    owner: complete ? 'client' : 'transition',
    operator: complete ? 'client' : 'agency',
    clientOwns: complete,
    clientCanOperate: complete,
    resultKey: complete ? 'clientOwned' : null,
  };
}

/**
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
  durationMs = 7_200,
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

    const intervalMs = durationMs / (stages.length - 1);
    timers = stages.slice(1).map((stage, index) =>
      schedule(() => onStage(stage), intervalMs * (index + 1)),
    );
  };

  return {
    play,
    replay: play,
    cancel,
    cleanup: cancel,
  };
}
