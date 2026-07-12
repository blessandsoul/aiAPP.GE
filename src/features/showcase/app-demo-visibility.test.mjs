import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import * as visibility from './app-demo-visibility.mjs';

test('the aiAPP wrapper delegates to the canonical family loop', () => {
  const source = readFileSync(new URL('./app-demo-visibility.mjs', import.meta.url), 'utf8');

  assert.equal(typeof visibility.createAppDemoLoop, 'function');
  assert.match(source, /import \{ createDemoLoop \} from '\.\.\/home\/components\/lib\/demo-loop\.mjs';/u);
  assert.match(source, /const VISIBILITY_THRESHOLD = 0\.35;/u);
  assert.match(source, /const FINAL_HOLD_MS = 2000;/u);
  assert.match(source, /threshold: VISIBILITY_THRESHOLD/u);
  assert.match(source, /holdMs: FINAL_HOLD_MS/u);
});

test('a visible story starts at 0.35 and repeats after an exact 2,000 ms final hold', () => {
  if (typeof visibility.createAppDemoLoop !== 'function') return;
  const observer = observerHarness();
  const clock = createManualClock();
  const events = [];

  const loop = visibility.createAppDemoLoop({
    target: { id: 'business-story' },
    cycleMs: 6_000,
    play: () => events.push('play'),
    showFinal: () => events.push('final'),
    reset: () => events.push('reset'),
    stop: () => events.push('stop'),
    Observer: observer.FakeIntersectionObserver,
    pageDocument: documentHarness(),
    schedule: clock.schedule,
    cancelScheduled: clock.cancel,
  });

  observer.emit(true, 0.34);
  assert.deepEqual(events, []);
  observer.emit(true, 0.35);
  assert.deepEqual(events, ['play']);

  clock.advanceBy(7_999);
  assert.deepEqual(events, ['play']);
  clock.advanceBy(1);
  assert.deepEqual(events, ['play', 'stop', 'reset', 'play']);

  loop.cleanup();
});

test('leaving the viewport resets the story and re-entry starts a clean pass', () => {
  if (typeof visibility.createAppDemoLoop !== 'function') return;
  const observer = observerHarness();
  const clock = createManualClock();
  const events = [];
  const loop = visibility.createAppDemoLoop({
    target: { id: 'offscreen-story' },
    cycleMs: 6_000,
    play: () => events.push('play'),
    showFinal: () => events.push('final'),
    reset: () => events.push('reset'),
    stop: () => events.push('stop'),
    Observer: observer.FakeIntersectionObserver,
    pageDocument: documentHarness(),
    schedule: clock.schedule,
    cancelScheduled: clock.cancel,
  });

  observer.emit(true, 1);
  observer.emit(false, 0);
  assert.deepEqual(events, ['play', 'stop', 'reset']);
  assert.equal(clock.pendingCount(), 0);

  observer.emit(true, 1);
  assert.deepEqual(events, ['play', 'stop', 'reset', 'play']);
  loop.cleanup();
});

test('manual ownership survives timers until Replay explicitly restarts the sample', () => {
  if (typeof visibility.createAppDemoLoop !== 'function') return;
  const observer = observerHarness();
  const clock = createManualClock();
  const events = [];
  const loop = visibility.createAppDemoLoop({
    target: { id: 'controlled-story' },
    cycleMs: 6_000,
    play: () => events.push('play'),
    showFinal: () => events.push('final'),
    reset: () => events.push('reset'),
    stop: () => events.push('stop'),
    Observer: observer.FakeIntersectionObserver,
    pageDocument: documentHarness(),
    schedule: clock.schedule,
    cancelScheduled: clock.cancel,
  });

  observer.emit(true, 1);
  loop.takeControl();
  assert.deepEqual(events, ['play', 'stop']);
  clock.advanceBy(20_000);
  assert.deepEqual(events, ['play', 'stop']);

  loop.replay();
  assert.deepEqual(events, ['play', 'stop', 'stop', 'reset', 'play']);
  assert.equal(clock.pendingCount(), 1);
  loop.cleanup();
});

test('reduced motion renders a stable final state without observers or timers', () => {
  if (typeof visibility.createAppDemoLoop !== 'function') return;
  const clock = createManualClock();
  let observerConstructed = false;
  const events = [];

  class UnexpectedObserver {
    constructor() {
      observerConstructed = true;
    }
  }

  const loop = visibility.createAppDemoLoop({
    target: { id: 'reduced-story' },
    reducedMotion: true,
    cycleMs: 6_000,
    play: () => events.push('play'),
    showFinal: () => events.push('final'),
    reset: () => events.push('reset'),
    stop: () => events.push('stop'),
    Observer: UnexpectedObserver,
    pageDocument: documentHarness(),
    schedule: clock.schedule,
    cancelScheduled: clock.cancel,
  });

  assert.equal(observerConstructed, false);
  assert.deepEqual(events, ['final']);
  assert.equal(clock.pendingCount(), 0);
  loop.cleanup();
  assert.deepEqual(events, ['final', 'stop']);
});

test('cleanup is idempotent and retained observer callbacks cannot restart a story', () => {
  if (typeof visibility.createAppDemoLoop !== 'function') return;
  const observer = observerHarness();
  const events = [];
  const loop = visibility.createAppDemoLoop({
    target: { id: 'removed-story' },
    cycleMs: 6_000,
    play: () => events.push('play'),
    showFinal: () => events.push('final'),
    reset: () => events.push('reset'),
    stop: () => events.push('stop'),
    Observer: observer.FakeIntersectionObserver,
    pageDocument: documentHarness(),
  });

  loop.cleanup();
  loop.cleanup();
  observer.emit(true, 1);
  assert.deepEqual(events, ['stop']);
  assert.equal(observer.snapshot().disconnectCount, 1);
});

test('all five product demos and the hero use the managed loop with Replay', () => {
  for (const component of [
    'AppEval.tsx',
    'AppTraceReplay.tsx',
    'AppCost.tsx',
    'AppLadder.tsx',
    'AppSafeHandoff.tsx',
    'HeroProof.tsx',
  ]) {
    const source = readFileSync(new URL(component, import.meta.url), 'utf8');

    assert.match(source, /import \{ createAppDemoLoop \} from '\.\/app-demo-visibility\.mjs';/u, component);
    assert.match(source, /createAppDemoLoop\(\{/u, component);
    assert.match(source, /cycleMs:/u, component);
    assert.match(source, /showFinal:/u, component);
    assert.match(source, /reset:/u, component);
    assert.match(source, /stop:/u, component);
    assert.match(source, /\.replay\(\)/u, component);
  }
});

test('Cost and Ladder give control to the visitor until Replay', () => {
  for (const component of ['AppCost.tsx', 'AppLadder.tsx']) {
    const source = readFileSync(new URL(component, import.meta.url), 'utf8');
    assert.match(source, /\.takeControl\(\)/u, component);
    assert.match(source, /onClick=\{replay\}|onClick=\{\(\) => loopRef\.current\?\.replay\(\)\}/u, component);
  }
});

function observerHarness() {
  let callback;
  let observedTarget;
  let disconnectCount = 0;
  let options;

  class FakeIntersectionObserver {
    constructor(nextCallback, nextOptions) {
      callback = nextCallback;
      options = nextOptions;
    }

    observe(target) {
      observedTarget = target;
    }

    disconnect() {
      disconnectCount += 1;
    }
  }

  return {
    FakeIntersectionObserver,
    emit(isIntersecting, intersectionRatio = isIntersecting ? 1 : 0) {
      callback([{ target: observedTarget, isIntersecting, intersectionRatio }]);
    },
    snapshot() {
      return { disconnectCount, observedTarget, options };
    },
  };
}

function documentHarness() {
  return {
    hidden: false,
    addEventListener() {},
    removeEventListener() {},
  };
}

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
