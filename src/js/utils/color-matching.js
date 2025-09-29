import { state } from '../core/state.js';
import { DEFAULT_SETTINGS } from '../config/DEFAULT_SETTINGS.js';
import { APP_CONSTANTS } from '../config/APP_CONSTANTS.js';

const _labCache = new Map(); // key: (r<<16)|(g<<8)|b  value: [L,a,b]
export const colorCache = new Map();

export const colorDistance = (a, b) => {
  Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2));
};

function calculateLegacyDistance(target, color) {
  const [r, g, b] = target;
  const [pr, pg, pb] = color;
  const rmean = (pr + r) / 2;
  const rdiff = pr - r;
  const gdiff = pg - g;
  const bdiff = pb - b;
  return Math.sqrt(
    (((512 + rmean) * rdiff * rdiff) >> 8) +
      4 * gdiff * gdiff +
      (((767 - rmean) * bdiff * bdiff) >> 8)
  );
}

function calculateLabDistance(targetLab, colorLab, state) {
  const [Lt, at, bt] = targetLab;
  const [Lp, ap, bp] = colorLab;
  const dL = Lt - Lp,
    da = at - ap,
    db = bt - bp;
  let dist = dL * dL + da * da + db * db;

  if (state.enableChromaPenalty) {
    const targetChroma = Math.sqrt(at * at + bt * bt);
    const candChroma = Math.sqrt(ap * ap + bp * bp);
    if (targetChroma > 20 && candChroma < targetChroma) {
      const chromaDiff = targetChroma - candChroma;
      dist += chromaDiff * chromaDiff * state.chromaPenaltyWeight;
    }
  }
  return dist;
}

export function _rgbToLab(r, g, b) {
  // sRGB -> linear
  const srgbToLinear = (v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  let X = rl * 0.4124 + gl * 0.3576 + bl * 0.1805;
  let Y = rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
  let Z = rl * 0.0193 + gl * 0.1192 + bl * 0.9505;
  X /= 0.95047;
  Y /= 1.0;
  Z /= 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fX = f(X),
    fY = f(Y),
    fZ = f(Z);
  const L = 116 * fY - 16;
  const a = 500 * (fX - fY);
  const b2 = 200 * (fY - fZ);
  return [L, a, b2];
}

export function _lab(r, g, b) {
  const key = (r << 16) | (g << 8) | b;
  let v = _labCache.get(key);
  if (!v) {
    v = _rgbToLab(r, g, b);
    _labCache.set(key, v);
  }
  return v;
}

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

export function isWhitePixel(r, g, b) {
  const wt = state.customWhiteThreshold || DEFAULT_SETTINGS.customWhiteThreshold;
  return r >= wt && g >= wt && b >= wt;
}

export function isTransparentPixel(a) {
  const transparencyThreshold =
    state.customTransparencyThreshold || DEFAULT_SETTINGS.customTransparencyThreshold;
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

export function invalidateColorCache(changedParams = {}) {
  if (changedParams.availableColors) {
    colorCache.clear();
    return;
  }

  for (const key of colorCache.keys()) {
    const [_, algo, chromaFlag, chromaWeight] = key.split('|');

    if (changedParams.colorMatchingAlgorithm && algo !== changedParams.colorMatchingAlgorithm) {
      colorCache.delete(key);
      continue;
    }

    if (
      changedParams.enableChromaPenalty !== undefined &&
      chromaFlag !== (changedParams.enableChromaPenalty ? 'c' : 'nc')
    ) {
      colorCache.delete(key);
      continue;
    }

    if (
      changedParams.chromaPenaltyWeight !== undefined &&
      Number(chromaWeight) !== changedParams.chromaPenaltyWeight
    ) {
      colorCache.delete(key);
      // noinspection UnnecessaryContinueJS
      continue;
    }
  }
}

export function resolveColor(targetRgba, availableColors, exactMatch = false) {
  const targetRgb = targetRgba.slice(0, 3);
  if (!availableColors || availableColors.length === 0) {
    console.warn(
      `Couldn't resolve color (${targetRgba.join(',')}) because availableColors is empty`
    );
    return { id: null, rgb: targetRgb };
  }
  if (isTransparentPixel(targetRgba[3])) {
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
