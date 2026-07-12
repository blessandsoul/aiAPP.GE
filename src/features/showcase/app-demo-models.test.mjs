import assert from 'node:assert/strict';
import test from 'node:test';

import * as model from './app-demo-models.mjs';

test('the customer-facing story has exactly four business stages', () => {
  assert.deepEqual(model.BUSINESS_STAGES, [
    'request',
    'safety-check',
    'action',
    'customer-result',
  ]);
});

test('nothing reaches the customer before the checked result stage', () => {
  assert.equal(typeof model.businessFrame, 'function');

  assert.equal(model.businessFrame('request').customerVisible, false);
  assert.equal(model.businessFrame('safety-check').customerVisible, false);
  assert.equal(model.businessFrame('action').customerVisible, false);
  assert.equal(model.businessFrame('customer-result').customerVisible, true);
});

test('the safety check must pass before the action is allowed', () => {
  assert.equal(typeof model.businessFrame, 'function');

  const request = model.businessFrame('request');
  const checked = model.businessFrame('safety-check');
  const action = model.businessFrame('action');
  const result = model.businessFrame('customer-result');

  assert.equal(request.checkStatus, 'waiting');
  assert.equal(request.actionStatus, 'waiting');
  assert.equal(checked.checkStatus, 'passed');
  assert.equal(checked.actionStatus, 'waiting');
  assert.equal(action.checkStatus, 'passed');
  assert.equal(action.actionStatus, 'allowed');
  assert.equal(result.actionStatus, 'allowed');
  assert.equal(result.resultKey, 'sent');
});

test('unknown business stages fail closed to the initial request', () => {
  assert.equal(typeof model.businessFrame, 'function');
  assert.deepEqual(model.businessFrame('not-a-stage'), model.businessFrame('request'));
});

test('handoff names the five things a business owner keeps', () => {
  assert.deepEqual(model.HANDOFF_ITEMS, [
    'code',
    'hostingAccess',
    'serviceAccounts',
    'documentation',
    'operatingControl',
  ]);
});

test('handoff completion means the client owns and can operate the application', () => {
  assert.equal(typeof model.handoffFrame, 'function');

  for (let count = 0; count <= model.HANDOFF_ITEMS.length; count += 1) {
    const frame = model.handoffFrame(count);
    assert.deepEqual(frame.transferred, model.HANDOFF_ITEMS.slice(0, count));
    assert.deepEqual(
      frame.items.map(({ key, owner }) => [key, owner]),
      model.HANDOFF_ITEMS.map((key, index) => [key, index < count ? 'client' : 'ainow']),
    );
  }

  const complete = model.handoffFrame(model.HANDOFF_ITEMS.length);
  assert.equal(complete.complete, true);
  assert.equal(complete.owner, 'client');
  assert.equal(complete.clientCanOperate, true);
  assert.equal(complete.resultKey, 'clientOwned');
});

test('timeline emits one deterministic business pass over exactly 6,000 ms', () => {
  assert.equal(typeof model.createTimelinePlayer, 'function');
  const clock = createManualClock();
  const emitted = [];
  const player = model.createTimelinePlayer({
    stages: model.BUSINESS_STAGES,
    durationMs: 6_000,
    onStage: (stage) => emitted.push(stage),
    schedule: clock.schedule,
    cancel: clock.cancel,
  });

  player.play();
  assert.deepEqual(emitted, ['request']);

  clock.advanceBy(5_999);
  assert.deepEqual(emitted, model.BUSINESS_STAGES.slice(0, -1));

  clock.advanceBy(1);
  assert.deepEqual(emitted, model.BUSINESS_STAGES);
  assert.equal(clock.pendingCount(), 0);
});

test('timeline replay cancels a superseded pass and restarts from the first stage', () => {
  assert.equal(typeof model.createTimelinePlayer, 'function');
  const clock = createManualClock();
  const emitted = [];
  const player = model.createTimelinePlayer({
    stages: model.BUSINESS_STAGES,
    durationMs: 6_000,
    onStage: (stage) => emitted.push(stage),
    schedule: clock.schedule,
    cancel: clock.cancel,
  });

  player.play();
  clock.advanceBy(2_000);
  assert.deepEqual(emitted, ['request', 'safety-check']);

  player.replay();
  assert.deepEqual(emitted, ['request', 'safety-check', 'request']);
  assert.equal(clock.pendingCount(), 3);

  clock.advanceBy(6_000);
  assert.deepEqual(emitted, [
    'request',
    'safety-check',
    'request',
    'safety-check',
    'action',
    'customer-result',
  ]);
});

test('timeline cleanup removes every timer and reduced motion renders only the final state', () => {
  assert.equal(typeof model.createTimelinePlayer, 'function');
  const clock = createManualClock();
  const normal = [];
  const player = model.createTimelinePlayer({
    stages: model.BUSINESS_STAGES,
    onStage: (stage) => normal.push(stage),
    schedule: clock.schedule,
    cancel: clock.cancel,
  });

  player.play();
  assert.equal(clock.pendingCount(), 3);
  player.cleanup();
  assert.equal(clock.pendingCount(), 0);
  clock.advanceBy(20_000);
  assert.deepEqual(normal, ['request']);

  const reduced = [];
  model.createTimelinePlayer({
    stages: model.BUSINESS_STAGES,
    reducedMotion: true,
    onStage: (stage) => reduced.push(stage),
    schedule: clock.schedule,
    cancel: clock.cancel,
  }).play();
  assert.deepEqual(reduced, ['customer-result']);
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
