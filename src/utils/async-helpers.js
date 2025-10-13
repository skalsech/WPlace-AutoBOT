export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function debounce(fn, delay) {
  let timeoutId = null;

  const debounced = function (...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };

  debounced.flush = function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      fn.apply(this, args);
    }
  };

  return debounced;
}

export const dynamicSleep = async function (tickAndGetRemainingMs) {
  let remaining = Math.max(0, await tickAndGetRemainingMs());
  while (remaining > 0) {
    const interval = remaining > 5000 ? 2000 : remaining > 1000 ? 500 : 100;
    await sleep(Math.min(interval, remaining));
    remaining = Math.max(0, await tickAndGetRemainingMs());
  }
};
