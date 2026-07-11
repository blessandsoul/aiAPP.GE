import assert from 'node:assert/strict';
import test from 'node:test';

import {
  HANDOFF_ITEMS,
  TRACE_STAGES,
  createTimelinePlayer,
  handoffFrame,
  traceFrame,
} from './app-demo-models.mjs';

test('trace stages keep the unsafe call before the correction and customer answer', () => {
  assert.deepEqual(TRACE_STAGES, [
    'request',
    'wrong-tool',
    'blocked',
    'correct-tool',
    'response',
    'passed',
  ]);

  const wrongTool = traceFrame('wrong-tool');
  const blocked = traceFrame('blocked');

  assert.equal(wrongTool.toolCall.name, 'search_docs');
  assert.equal(wrongTool.answer, null);
  assert.equal(blocked.toolCall.name, 'search_docs');
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.answer, null);
  assert.equal(blocked.customerVisible, false);
});

test('the corrected lookup produces a deterministic passed answer', () => {
  const corrected = traceFrame('correct-tool');
  const response = traceFrame('response');
  const passed = traceFrame('passed');

  assert.equal(corrected.toolCall.name, 'lookup_order');
  assert.equal(corrected.answer, null);
  assert.equal(response.toolCall.name, 'lookup_order');
  assert.deepEqual(response.answer, {
    orderId: 'ord_[redacted]_1842',
    status: 'in_transit',
    eta: '2026-07-14',
  });
  assert.equal(passed.verdict, 'passed');
  assert.equal(passed.customerVisible, true);
  assert.equal(passed.badPathStoppedBeforeCustomer, true);
  assert.equal(passed.resultKey, 'passed');
});

test('trace fixtures contain only repeatable redacted identifiers and JSON data', () => {
  assert.deepEqual(traceFrame('passed'), traceFrame('passed'));
  assert.match(JSON.stringify(traceFrame('passed')), /\[redacted\]/);
  assert.doesNotMatch(JSON.stringify(traceFrame('passed')), /Math\.random|Date\.now/);
});

test('all five handoff assets move from agency to client in a fixed order', () => {
  assert.deepEqual(HANDOFF_ITEMS, [
    'repository',
    'hosting',
    'modelAccount',
    'evalSuite',
    'runbook',
  ]);

  for (let count = 0; count <= HANDOFF_ITEMS.length; count += 1) {
    const frame = handoffFrame(count);
    assert.deepEqual(frame.transferred, HANDOFF_ITEMS.slice(0, count));
    assert.deepEqual(
      frame.items.map(({ key, owner }) => [key, owner]),
      HANDOFF_ITEMS.map((key, index) => [key, index < count ? 'client' : 'agency']),
    );
  }
});

test('handoff completion means the client owns and can operate the system', () => {
  const frame = handoffFrame(HANDOFF_ITEMS.length);

  assert.equal(frame.complete, true);
  assert.equal(frame.owner, 'client');
  assert.equal(frame.operator, 'client');
  assert.equal(frame.clientCanOperate, true);
  assert.equal(frame.resultKey, 'clientOwned');
  assert.equal(frame.items.every((item) => item.owner === 'client'), true);
});

test('timeline emits one automatic trace pass in order over exactly 7,200 ms', () => {
  const clock = createManualClock();
  const emitted = [];
  const player = createTimelinePlayer({
    stages: TRACE_STAGES,
    durationMs: 7_200,
    onStage: (stage) => emitted.push(stage),
    schedule: clock.schedule,
    cancel: clock.cancel,
  });

  player.play();
  assert.deepEqual(emitted, ['request']);

  clock.advanceBy(7_199);
  assert.deepEqual(emitted, TRACE_STAGES.slice(0, -1));

  clock.advanceBy(1);
  assert.deepEqual(emitted, TRACE_STAGES);
  assert.equal(clock.pendingCount(), 0);
});

test('replay cancels the superseded pass and resets to the first stage', () => {
  const clock = createManualClock();
  const emitted = [];
  const player = createTimelinePlayer({
    stages: HANDOFF_ITEMS.map((_, index) => index + 1),
    onStage: (stage) => emitted.push(stage),
    schedule: clock.schedule,
    cancel: clock.cancel,
  });

  player.play();
  clock.advanceBy(1_800);
  assert.deepEqual(emitted, [1, 2]);

  player.replay();
  assert.deepEqual(emitted, [1, 2, 1]);
  assert.equal(clock.pendingCount(), 4);

  clock.advanceBy(7_200);
  assert.deepEqual(emitted, [1, 2, 1, 2, 3, 4, 5]);
});

test('cancel and cleanup remove every outstanding timeline timer', () => {
  const clock = createManualClock();
  const emitted = [];
  const player = createTimelinePlayer({
    stages: TRACE_STAGES,
    onStage: (stage) => emitted.push(stage),
    schedule: clock.schedule,
    cancel: clock.cancel,
  });

  player.play();
  assert.equal(clock.pendingCount(), 5);
  player.cancel();
  assert.equal(clock.pendingCount(), 0);

  player.play();
  assert.equal(clock.pendingCount(), 5);
  player.cleanup();
  assert.equal(clock.pendingCount(), 0);

  clock.advanceBy(20_000);
  assert.deepEqual(emitted, ['request', 'request']);
});

test('reduced motion emits only the final meaningful state and schedules nothing', () => {
  const clock = createManualClock();
  const emitted = [];
  const player = createTimelinePlayer({
    stages: TRACE_STAGES,
    reducedMotion: true,
    onStage: (stage) => emitted.push(stage),
    schedule: clock.schedule,
    cancel: clock.cancel,
  });

  player.play();

  assert.deepEqual(emitted, ['passed']);
  assert.equal(clock.pendingCount(), 0);
});

function createManualClock() {
  let now = 0;
  let nextId = 1;
  const jobs = new Map();

  const schedule = (callback, delay) => {
    const id = nextId;
    nextId += 1;
    jobs.set(id, { callback, dueAt: now + delay });
    return id;
  };

  const cancel = (id) => {
    jobs.delete(id);
  };

  const advanceBy = (milliseconds) => {
    const target = now + milliseconds;

    while (true) {
      const nextJob = [...jobs.entries()]
        .filter(([, job]) => job.dueAt <= target)
        .sort((a, b) => a[1].dueAt - b[1].dueAt || a[0] - b[0])[0];

      if (!nextJob) break;

      const [id, job] = nextJob;
      jobs.delete(id);
      now = job.dueAt;
      job.callback();
    }

    now = target;
  };

  return {
    schedule,
    cancel,
    advanceBy,
    pendingCount: () => jobs.size,
  };
}
