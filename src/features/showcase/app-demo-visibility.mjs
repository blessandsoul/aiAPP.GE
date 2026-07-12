/** Start one existing app-demo timeline when its rendered box first becomes visible. */
export function createVisibilityGate({
  target,
  play,
  reducedMotion = false,
  Observer = globalThis.IntersectionObserver,
  threshold = 0.35,
}) {
  if (typeof play !== 'function') {
    throw new TypeError('createVisibilityGate requires a play function');
  }

  let active = true;
  let hasPlayed = false;
  let observer = null;

  const playOnce = () => {
    if (!active || hasPlayed) return;
    hasPlayed = true;
    play();
  };

  if (reducedMotion || !target || typeof Observer !== 'function') {
    playOnce();
  } else {
    observer = new Observer(
      ([entry]) => {
        if (
          hasPlayed ||
          !entry?.isIntersecting ||
          (entry.intersectionRatio ?? 0) < threshold
        ) {
          return;
        }
        playOnce();
        observer?.disconnect();
        observer = null;
      },
      { threshold },
    );
    observer.observe(target);
  }

  return function cleanupVisibilityGate() {
    active = false;
    observer?.disconnect();
    observer = null;
  };
}
