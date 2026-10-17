/** Coalesce rapid callbacks (e.g. stream chunks) to at most once per `ms`. */
export function createThrottle(ms: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending = false;

  return (run: () => void) => {
    if (!timer) {
      run();
      timer = setTimeout(() => {
        timer = null;
        if (pending) {
          pending = false;
          run();
        }
      }, ms);
      return;
    }
    pending = true;
  };
}

export function scheduleScrollWork(run: () => void) {
  if (typeof window === 'undefined') return;
  if ('requestAnimationFrame' in window) {
    window.requestAnimationFrame(run);
    return;
  }
  run();
}
