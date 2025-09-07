export const randStr = (
  len,
  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
) => {
  const getRandomIndex = () => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return array[0] % chars.length;
    }
    return Math.floor(Math.random() * chars.length);
  };

  return [...Array(len)].map(() => chars[getRandomIndex()]).join('');
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Возвращает обёрнутую функцию, вызов которой откладывается на `delay` миллисекунд.
 * Если функция вызывается снова за это время — предыдущий таймер отменяется.
 *
 * @param {Function} fn - Функция, которую нужно "дебаунсить"
 * @param {number} delay - Задержка в миллисекундах
 * @returns {Function} - Дебаунсированная функция
 */
export function debounce(fn, delay) {
  let timeoutId = null;

  const debounced = function (...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };

  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      fn.apply(this, arguments);
    }
  };

  return debounced;
}
export const dynamicSleep = async function (tickAndGetRemainingMs) {
  let remaining = Math.max(0, await tickAndGetRemainingMs());
  while (remaining > 0) {
    const interval = remaining > 5000 ? 2000 : remaining > 1000 ? 500 : 100;
    await this.sleep(Math.min(interval, remaining));
    remaining = Math.max(0, await tickAndGetRemainingMs());
  }
};

export const appendLinkOnce = (href, attributes = {}) => {
  const exists = Array.from(document.head.querySelectorAll('link')).some(
    (link) => link.href === href
  );
  if (exists) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;

  // Add any additional attributes (e.g., data-* attributes)
  for (const [key, value] of Object.entries(attributes)) {
    link.setAttribute(key, value);
  }

  document.head.appendChild(link);
};

export const waitForSelector = async (selector, interval = 200, timeout = 5000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = document.querySelector(selector);
    if (el) return el;
    await sleep(interval);
  }
  return null;
};

export const msToTimeText = (ms) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

/**
 * Calculate the range of tile coordinates (in region space) that cover a given image area.
 * @param {number} startRegionX - Base region X
 * @param {number} startRegionY - Base region Y
 * @param {number} startPixelX - Starting pixel X within the region grid
 * @param {number} startPixelY - Starting pixel Y within the region grid
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @param {number} tileSize - Size of a tile (default 1000)
 * @returns {{ startTileX: number, startTileY: number, endTileX: number, endTileY: number }}
 */
export const calculateTileRange = (
  startRegionX,
  startRegionY,
  startPixelX,
  startPixelY,
  width,
  height,
  tileSize = 1000
) => {
  const endPixelX = startPixelX + width;
  const endPixelY = startPixelY + height;

  return {
    startTileX: startRegionX + Math.floor(startPixelX / tileSize),
    startTileY: startRegionY + Math.floor(startPixelY / tileSize),
    endTileX: startRegionX + Math.floor((endPixelX - 1) / tileSize),
    endTileY: startRegionY + Math.floor((endPixelY - 1) / tileSize),
  };
};
