import { APP_CONSTANTS } from '../config/APP_CONSTANTS.js';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Returns a debounced version of the given function.
 * The function call will be delayed by `delay` milliseconds.
 * If the debounced function is called again within this time,
 * the previous timer will be cleared and restarted.
 *
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - The debounced function
 */
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

export const appendResourceOnce = (src, options = {}) => {
  src = src.trim();
  const { type, attributes = {}, async = true } = options;

  const inferredType = src.endsWith('.css') ? 'link' : src.endsWith('.js') ? 'script' : type;

  if (!inferredType) {
    console.warn(
      `Failed to determine the resource type for: ${src}. Specify type: 'link' or 'script' in options.`
    );
    return Promise.reject(new Error('Unknown resource type'));
  }

  let exists = false;
  if (inferredType === 'link') {
    exists = Array.from(document.head.querySelectorAll('link')).some(
      (link) => link.href === src && link.rel === 'stylesheet'
    );
  } else if (inferredType === 'script') {
    exists = Array.from(document.head.querySelectorAll('script')).some(
      (script) => script.src === src
    );
  }

  if (exists) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const element = document.createElement(inferredType);

    if (inferredType === 'link') {
      element.rel = 'stylesheet';
      element.href = src;
    } else if (inferredType === 'script') {
      element.src = src;
      element.async = async;
    }

    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }

    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error(`Failed to load resource: ${src}`));

    document.head.appendChild(element);
  });
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
 * @param {number} tileSize - Size of a tile
 * @returns {{ startTileX: number, startTileY: number, endTileX: number, endTileY: number }}
 */
export const calculateTileRange = (
  startRegionX,
  startRegionY,
  startPixelX,
  startPixelY,
  width,
  height,
  tileSize
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

export function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (
      obj[prop] !== null &&
      (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') &&
      !Object.isFrozen(obj[prop])
    ) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
}

export function decodeBase64ToBytes(base64String) {
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Checks if a color with the given index is available.
 * Free colors (0–31) are always available.
 * Paid colors (32–63) are available if their bit is set in extraColorsBitmap.
 *
 * @param {number} colorId color index (0–63)
 * @param {number} extraColorsBitmap bitmask from /me API
 * @returns {boolean} true if the color is available, otherwise false
 */
export function hasColor(colorId, extraColorsBitmap) {
  if (colorId < 32) {
    return true;
  }

  const bitPosition = colorId - 32;
  return (extraColorsBitmap & (1 << bitPosition)) !== 0;
}

/**
 * Returns an array of color objects available to the user.
 * Free colors (0–31) are always available.
 * Paid colors (32–63) are available if their bit is set in extraColorsBitmap.
 *
 * @param {number} extraColorsBitmap bitmask from /me API
 * @returns {Array<{id: number, name: string, rgb: [number, number, number]}>}
 */
export function getAvailableColors(extraColorsBitmap) {
  const available = [];

  for (const colorIdStr of Object.keys(APP_CONSTANTS.COLOR_MAP)) {
    const colorId = Number(colorIdStr);

    if (isNaN(colorId) || colorId < 0 || colorId > 63) {
      console.warn(`Invalid color id in COLOR_MAP: ${colorId}`);
      continue;
    }

    if (hasColor(colorId, extraColorsBitmap)) {
      const color = APP_CONSTANTS.COLOR_MAP[colorId];
      if (color && color.id === colorId) {
        available.push({
          id: color.id,
          name: color.name,
          rgb: [color.rgb.r, color.rgb.g, color.rgb.b],
        });
      } else if (color) {
        console.warn(
          `COLOR_MAP[${colorId}] has an invalid id: ${color.id}. Expected ${colorId}.`,
          color
        );
      }
    }
  }

  return available;
}
