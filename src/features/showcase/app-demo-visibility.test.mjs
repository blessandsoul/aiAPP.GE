import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { createVisibilityGate } from './app-demo-visibility.mjs';

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
      callback([{ isIntersecting, intersectionRatio }]);
    },
    snapshot() {
      return { disconnectCount, observedTarget, options };
    },
  };
}

test('normal motion stays idle below fold and plays once on first visibility', () => {
  const harness = observerHarness();
  const target = { id: 'app-demo-box' };
  let playCount = 0;

  const cleanup = createVisibilityGate({
    target,
    play: () => {
      playCount += 1;
    },
    Observer: harness.FakeIntersectionObserver,
  });

  assert.equal(playCount, 0);
  assert.equal(harness.snapshot().observedTarget, target);
  assert.deepEqual(harness.snapshot().options, { threshold: 0.35 });

  harness.emit(false);
  assert.equal(playCount, 0);

  harness.emit(true, 0.34);
  assert.equal(playCount, 0);

  harness.emit(true, 0.35);
  harness.emit(true);
  assert.equal(playCount, 1);
  assert.equal(harness.snapshot().disconnectCount, 1);

  cleanup();
  assert.equal(harness.snapshot().disconnectCount, 1);
});

test('queued observer callback after cleanup cannot start the timeline', () => {
  const harness = observerHarness();
  let playCount = 0;

  const cleanup = createVisibilityGate({
    target: { id: 'removed-app-demo' },
    play: () => {
      playCount += 1;
    },
    Observer: harness.FakeIntersectionObserver,
  });

  cleanup();
  cleanup();
  harness.emit(true);

  assert.equal(playCount, 0);
  assert.equal(harness.snapshot().disconnectCount, 1);
});

test('Strict Mode-like cleanup isolates an old setup from the replacement setup', () => {
  const firstHarness = observerHarness();
  const secondHarness = observerHarness();
  const plays = [];

  const cleanupFirst = createVisibilityGate({
    target: { id: 'first-app-demo' },
    play: () => plays.push('first'),
    Observer: firstHarness.FakeIntersectionObserver,
  });
  cleanupFirst();

  const cleanupSecond = createVisibilityGate({
    target: { id: 'second-app-demo' },
    play: () => plays.push('second'),
    Observer: secondHarness.FakeIntersectionObserver,
  });

  firstHarness.emit(true);
  secondHarness.emit(true);

  assert.deepEqual(plays, ['second']);
  assert.equal(firstHarness.snapshot().disconnectCount, 1);
  assert.equal(secondHarness.snapshot().disconnectCount, 1);
  cleanupSecond();
});

test('reduced motion plays immediately without constructing an observer', () => {
  let observerConstructed = false;
  let playCount = 0;

  class UnexpectedObserver {
    constructor() {
      observerConstructed = true;
    }
  }

  const cleanup = createVisibilityGate({
    target: { id: 'reduced-app-demo' },
    play: () => {
      playCount += 1;
    },
    reducedMotion: true,
    Observer: UnexpectedObserver,
  });

  assert.equal(playCount, 1);
  assert.equal(observerConstructed, false);
  cleanup();
});

test('missing IntersectionObserver falls back to immediate playback', () => {
  let playCount = 0;

  const cleanup = createVisibilityGate({
    target: { id: 'fallback-app-demo' },
    play: () => {
      playCount += 1;
    },
    Observer: undefined,
  });

  assert.equal(playCount, 1);
  cleanup();
});

test('both app demos wire the guarded gate to real rendered boxes', () => {
  for (const component of ['AppTraceReplay.tsx', 'AppSafeHandoff.tsx']) {
    const source = readFileSync(new URL(component, import.meta.url), 'utf8');

    assert.match(source, /import \{ createVisibilityGate \} from '.\/app-demo-visibility\.mjs';/u);
    assert.match(source, /const visibilityRef = useRef<HTMLDivElement>\(null\);/u);
    assert.match(source, /<div\s+ref=\{visibilityRef\}/u);
    assert.match(source, /target: visibilityRef\.current/u);
    assert.match(source, /play: player\.play/u);
    assert.match(source, /const cleanupVisibility = createVisibilityGate/u);
    assert.match(source, /cleanupVisibility\(\);/u);
    assert.doesNotMatch(source, /player\.play\(\);/u);
    assert.match(source, /_DURATION_MS = 7_200/u);
  }
});
