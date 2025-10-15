import { state } from '../core/state.js';
import { APP_CONSTANTS } from '../app/config/app-constants.js';
import {
  _lab,
  calculateLabDistanceSquared,
  calculateLegacyDistanceSquared,
} from './color-matching/algorithms.js';
import { colorCache, encodeCacheKey } from './color-matching/cache.js';

/**
 * Finds the color from the given list that is closest to the target color (r, g, b)
 * using CIE Lab color space distance (with optional chroma penalty).
 * If no colors list is provided, falls back to the application's default color set
 * defined in APP_CONSTANTS.COLOR_MAP (filtered for valid RGB entries).
 *
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @param {Array<Array<number>>} [colors] - Optional array of [r, g, b] color triplets.
 *   If omitted or empty, uses default colors from APP_CONSTANTS.COLOR_MAP.
 * @returns {Array<number>} [r, g, b, 255] of the closest color
 *
 * @example
 * // Uses default app colors
 * findClosestColor(255, 100, 50); // → picks from APP_CONSTANTS.COLOR_MAP
 *
 * // Uses custom list
 * findClosestColor(255, 100, 50, [[255,0,0], [0,255,0], [0,0,255]]);
 */
export function findClosestColor(r, g, b, colors) {
  if (!colors || colors.length === 0) {
    colors = Object.values(APP_CONSTANTS.COLOR_MAP)
      .filter((c) => c.rgb)
      .map((c) => [c.rgb.r, c.rgb.g, c.rgb.b]);
  }

  if (state.colorMatchingAlgorithm === 'legacy') {
    let menorDist = Infinity;
    let cor = [0, 0, 0, 255];
    for (let i = 0; i < colors.length; i++) {
      const [pr, pg, pb] = colors[i];
      const dist = calculateLegacyDistanceSquared([r, g, b], [pr, pg, pb]);
      if (dist < menorDist) {
        menorDist = dist;
        cor = [pr, pg, pb, 255];
      }
    }
    return cor;
  }

  // LAB algorithm
  let best = null;
  let bestDist = Infinity;
  for (let i = 0; i < colors.length; i++) {
    const [pr, pg, pb] = colors[i];
    const targetLab = _lab(r, g, b);
    const colorLab = _lab(pr, pg, pb);
    const dist = calculateLabDistanceSquared(
      targetLab,
      colorLab,
      state.enableChromaPenalty,
      state.chromaPenaltyWeight
    );
    if (dist < bestDist) {
      bestDist = dist;
      best = [pr, pg, pb, 255];
      if (bestDist === 0) break;
    }
  }
  return best || [0, 0, 0, 255];
}

export function isWhitePixel(r, g, b, whiteThreshold) {
  return r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold;
}

export function isTransparentPixel(a, transparencyThreshold) {
  if (a === undefined || a === null) {
    console.warn(`Expected to get alpha of pixel, but got ${a}`);
  }
  return a < transparencyThreshold;
}

export function colorsChanged(oldColors, newColors) {
  if (oldColors.size !== newColors.size) return true;

  for (const rgb of oldColors) {
    if (!newColors.has(rgb)) return true;
  }
  for (const rgb of newColors) {
    if (!oldColors.has(rgb)) return true;
  }
  return false;
}

/**
 * Resolves a target RGBA color to the nearest or exact match from a set of available color IDs.
 *
 * The function performs the following steps:
 * 1. Returns the raw RGB if `availableColors` is empty.
 * 2. Detects transparent pixels via `isTransparentPixel` and returns the predefined transparent color.
 * 3. Detects near-white pixels using `isWhitePixel` and normalizes them to the white color entry.
 * 4. Checks an internal cache (up to 15,000 entries) to avoid redundant calculations.
 * 5. If `exactMatch = true`, returns only an exact RGB match (lookup via `APP_CONSTANTS.RGB_KEY_TO_ID`).
 *
 * 6. Finds the closest color in `availableColors` using:
 *    - **Legacy RGB distance** (`calculateLegacyDistanceSquared`), or
 *    - **CIE Lab distance** (`calculateLabDistanceSquared`) with optional chroma penalty,
 *      depending on `state.colorMatchingAlgorithm`.
 * 7. Stores the result in the cache and evicts the oldest entry if cache size exceeds 15k.
 *
 * The cache key encodes RGB, algorithm flags, chroma penalty, and match mode into a 53-bit integer.
 *
 * @param {number[]} targetRgba - Target color `[r, g, b, a]` with channels 0–255.
 * @param {Set<number>} availableColors - Set of available color IDs. RGB values are read from `APP_CONSTANTS.COLOR_MAP`.
 * @param {boolean} [exactMatch=false] - If `true`, only exact RGB matches are returned; otherwise the nearest color is selected.
 *
 * @returns {{ id: number | null, rgb: [number, number, number] }}
 * - `id`: The ID of the resolved color, or `null` if no exact match is found in exact mode.
 * - `rgb`: The RGB triplet of the matched color or the original target color.
 *
 * @example
 * // Exact match mode — returns null if color not found
 * resolveColor([128, 128, 128, 255], new Set([1, 2, 3]), true);
 * // → { id: null, rgb: [128, 128, 128] }
 *
 * @example
 * // Nearest color mode — uses closest match from availableColors
 * resolveColor([120, 130, 135, 255], new Set([1, 2, 3]), false);
 * // → { id: 2, rgb: [115, 125, 130] }
 *
 * @remarks
 * Internal behavior depends on `state`:
 * - `state.colorMatchingAlgorithm`: `'legacy'` or `'lab'`
 * - `state.enableChromaPenalty`: boolean
 * - `state.chromaPenaltyWeight`: numeric (6-bit masked)
 * - `state.customTransparencyThreshold` and `state.customWhiteThreshold`: threshold values
 *
 * Cache eviction policy: FIFO — oldest entries removed after 15,000 keys.
 */
export function resolveColor(targetRgba, availableColors, exactMatch = false) {
  const targetRgb = [targetRgba[0], targetRgba[1], targetRgba[2]];
  if (availableColors.size === 0) {
    console.warn(
      `Couldn't resolve color (${targetRgba.join(',')}) because availableColors is empty`
    );
    return { id: null, rgb: targetRgb };
  }

  const rgbPacked = (targetRgb[0] << 16) | (targetRgb[1] << 8) | targetRgb[2];
  const chromaFlag = state.enableChromaPenalty ? 1 : 0;
  const exactFlag = exactMatch ? 1 : 0;
  const algoFlag = state.colorMatchingAlgorithm === 'legacy' ? 0 : 1;
  const weightInt = Math.round(state.chromaPenaltyWeight * 100); // 0-50
  const cacheKey = encodeCacheKey(rgbPacked, algoFlag, chromaFlag, exactFlag, weightInt);

  if (colorCache.has(cacheKey)) return colorCache.get(cacheKey);

  if (isTransparentPixel(targetRgba[3], state.customTransparencyThreshold)) {
    const result = {
      id: APP_CONSTANTS.COLOR_IDS.TRANSPARENT,
      rgb: Object.values(APP_CONSTANTS.COLOR_MAP[APP_CONSTANTS.COLOR_IDS.TRANSPARENT].rgb),
    };
    colorCache.set(cacheKey, result);
    return result;
  }
  if (isWhitePixel(targetRgb, state.customWhiteThreshold)) {
    const result = {
      id: APP_CONSTANTS.COLOR_IDS.WHITE,
      rgb: Object.values(APP_CONSTANTS.COLOR_MAP[APP_CONSTANTS.COLOR_IDS.WHITE].rgb),
    };
    colorCache.set(cacheKey, result);
    return result;
  }

  // Check for an exact color match in availableColors.
  // If found, return the rgb with its ID.
  // If not found, return the rgb with null ID.
  if (exactMatch) {
    /** @type {number | undefined} */
    const colorId = APP_CONSTANTS.RGB_KEY_TO_ID.get(rgbPacked);
    const result = colorId ? { id: colorId, rgb: targetRgb } : { id: null, rgb: targetRgb };
    colorCache.set(cacheKey, result);
    return result;
  }

  let bestId = null;
  let bestScore = Infinity;

  let targetLab = null;
  if (state.colorMatchingAlgorithm !== 'legacy') {
    targetLab = _lab(targetRgb[0], targetRgb[1], targetRgb[2]);
  }

  for (const colorId of availableColors) {
    const colorData = APP_CONSTANTS.COLOR_MAP[colorId];
    if (!colorData) continue;
    const colorRgb = colorData.rgb;

    let dist;
    if (state.colorMatchingAlgorithm !== 'legacy') {
      const colorLab = _lab(colorRgb.r, colorRgb.g, colorRgb.b);
      dist = calculateLabDistanceSquared(
        targetLab,
        colorLab,
        state.enableChromaPenalty,
        state.chromaPenaltyWeight
      );
    } else {
      dist = calculateLegacyDistanceSquared(targetRgb, [colorRgb.r, colorRgb.g, colorRgb.b]);
    }

    if (dist < bestScore) {
      bestScore = dist;
      bestId = colorId;
      if (dist === 0) break;
    }
  }

  let result;
  if (bestId !== null && APP_CONSTANTS.COLOR_MAP[bestId]) {
    result = {
      id: bestId,
      rgb: Object.values(APP_CONSTANTS.COLOR_MAP[bestId].rgb),
    };
  } else {
    result = { id: null, rgb: targetRgb };
  }

  colorCache.set(cacheKey, result);

  if (colorCache.size > 15000) {
    const firstKey = colorCache.keys().next().value;
    colorCache.delete(firstKey);
  }

  return result;
}
