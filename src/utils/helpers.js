import { APP_CONSTANTS } from '../app/config/app-constants.js';

export { sleep, debounce, dynamicSleep } from './async-helpers.js';
export { appendResourceOnce, waitForSelector } from './dom-helpers.js';
export { msToTimeText } from './number-helpers.js';
export { deepFreeze } from './collection-helpers.js';

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
 * @returns {Set<number>}
 */
export function getAvailableColors(extraColorsBitmap) {
  /** @type {Set<number>} */
  const available = new Set();

  /** @type {number} */
  for (const colorId of Object.values(APP_CONSTANTS.COLOR_IDS)) {
    if (typeof colorId !== 'number' || isNaN(colorId) || colorId < 0 || colorId > 63) {
      console.warn(`Invalid color id in COLOR_MAP: ${colorId}`);
      continue;
    }

    if (hasColor(colorId, extraColorsBitmap)) {
      available.add(colorId);
    }
  }

  return available;
}
