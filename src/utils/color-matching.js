import { state } from '../core/state.js';
import { DEFAULT_SETTINGS } from '../app/config/default-settings.js';
import { APP_CONSTANTS } from '../app/config/app-constants.js';
import {
  _lab,
  calculateLabDistance,
  calculateLegacyDistance,
} from './color-matching/algorithms.js';
import { colorCache } from './color-matching/cache.js';

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
      const dist = calculateLegacyDistance([r, g, b], [pr, pg, pb]);
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
    const dist = calculateLabDistance(targetLab, colorLab, state);
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
  const oldSet = new Set(oldColors.map((c) => c.rgb.join(',')));
  const newSet = new Set(newColors.map((c) => c.rgb.join(',')));

  if (oldSet.size !== newSet.size) return true;

  for (const rgb of oldSet) {
    if (!newSet.has(rgb)) return true;
  }

  return false;
}

export function resolveColor(targetRgba, availableColors, exactMatch = false) {
  const targetRgb = targetRgba.slice(0, 3);
  if (!availableColors || availableColors.length === 0) {
    console.warn(
      `Couldn't resolve color (${targetRgba.join(',')}) because availableColors is empty`
    );
    return { id: null, rgb: targetRgb };
  }
  if (isTransparentPixel(targetRgba[3], state.customTransparencyThreshold)) {
    return { id: APP_CONSTANTS.COLOR_MAP['0'].id, rgb: APP_CONSTANTS.COLOR_MAP['0'].rgb };
  }
  const cacheKey = `${targetRgb[0]},${targetRgb[1]},${targetRgb[2]}|${state.colorMatchingAlgorithm}|${
    state.enableChromaPenalty ? 'c' : 'nc'
  }|${state.chromaPenaltyWeight}|${exactMatch ? 'exact' : 'closest'}`;

  if (colorCache.has(cacheKey)) return colorCache.get(cacheKey);

  // Check for an exact color match in availableColors.
  // If found, return the matched color with its ID.
  // If not found, return the target color with null ID.
  // Cache the result for future lookups.
  if (exactMatch) {
    const match = availableColors.find(
      (c) => c.rgb[0] === targetRgb[0] && c.rgb[1] === targetRgb[1] && c.rgb[2] === targetRgb[2]
    );
    const result = match
      ? { id: match.id, rgb: [...match.rgb] }
      : {
          id: null,
          rgb: targetRgb,
        };
    colorCache.set(cacheKey, result);
    return result;
  }

  // check for white using threshold
  const whiteThreshold = state.customWhiteThreshold || DEFAULT_SETTINGS.customWhiteThreshold;
  if (
    targetRgb[0] >= whiteThreshold &&
    targetRgb[1] >= whiteThreshold &&
    targetRgb[2] >= whiteThreshold
  ) {
    const whiteEntry = availableColors.find(
      (c) => c.rgb[0] >= whiteThreshold && c.rgb[1] >= whiteThreshold && c.rgb[2] >= whiteThreshold
    );
    if (whiteEntry) {
      const result = { id: whiteEntry.id, rgb: [...whiteEntry.rgb] };
      colorCache.set(cacheKey, result);
      return result;
    }
  }

  // find nearest color
  let bestId = availableColors[0].id;
  let bestRgb = [...availableColors[0].rgb];
  let bestScore = Infinity;

  if (state.colorMatchingAlgorithm === 'legacy') {
    for (let i = 0; i < availableColors.length; i++) {
      const c = availableColors[i];
      const dist = calculateLegacyDistance(c.rgb, [...c.rgb]);
      if (dist < bestScore) {
        bestScore = dist;
        bestId = c.id;
        bestRgb = [...c.rgb];
        if (dist === 0) break;
      }
    }
  } else {
    for (let i = 0; i < availableColors.length; i++) {
      const c = availableColors[i];
      const [r, g, b] = c.rgb;
      const targetLab = _lab(targetRgb[0], targetRgb[1], targetRgb[2]);
      const colorLab = _lab(r, g, b);
      const dist = calculateLabDistance(targetLab, colorLab, state);

      if (dist < bestScore) {
        bestScore = dist;
        bestId = c.id;
        bestRgb = [...c.rgb];
        if (dist === 0) break;
      }
    }
  }

  const result = { id: bestId, rgb: bestRgb };
  colorCache.set(cacheKey, result);

  // limit the size of the cache
  if (colorCache.size > 15000) {
    const firstKey = colorCache.keys().next().value;
    colorCache.delete(firstKey);
  }

  return result;
}
