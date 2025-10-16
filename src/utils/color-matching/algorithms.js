import { APP_CONSTANTS } from '../../app/config/app-constants.js';

/**
 * Returns the *squared* perceptual RGB distance (no square root).
 * Uses a weighted formula that approximates human color perception.
 * Intended **only for comparison** (smaller = closer).
 *
 * @param {[number, number, number]} target - RGB [r, g, b] in 0-255
 * @param {[number, number, number]} color  - RGB [r, g, b] in 0-255
 * @returns {number} Squared perceptual distance (not a true metric)
 */
export function calculateLegacyDistanceSquared(target, color) {
  const rmean = (target[0] + color[0]) * 0.5;
  const rdiff = color[0] - target[0];
  const gdiff = color[1] - target[1];
  const bdiff = color[2] - target[2];

  return (
    (512 + rmean) * rdiff * rdiff * 0.00390625 +
    4 * gdiff * gdiff +
    (767 - rmean) * bdiff * bdiff * 0.00390625
  );
}

/**
 * Returns the *squared* CIE Lab distance with optional chroma penalty.
 * Includes a perceptual penalty for undersaturated candidates.
 * Intended **only for comparison** (smaller = closer).
 *
 * @param {[number, number, number]} target - Lab [L, a, b]
 * @param {[number, number, number]} color  - Lab [L, a, b]
 * @param {boolean} enableChromaPenalty
 * @param {number} chromaPenaltyWeight - 0.00-0.50
 * @returns {number} Squared distance (with penalty if applied)
 */
export function calculateLabDistanceSquared(
  target,
  color,
  enableChromaPenalty,
  chromaPenaltyWeight
) {
  const dL = target[0] - color[0];
  const da = target[1] - color[1];
  const db = target[2] - color[2];

  let dist = dL * dL + da * da + db * db;

  if (enableChromaPenalty) {
    const targetChromaSq = target[1] * target[1] + target[2] * target[2];
    if (targetChromaSq > 400) {
      const candChromaSq = color[1] * color[1] + color[2] * color[2];
      if (candChromaSq < targetChromaSq) {
        const targetChroma = Math.sqrt(targetChromaSq);
        const candChroma = Math.sqrt(candChromaSq);
        const chromaDiff = targetChroma - candChroma;
        dist += chromaDiff * chromaDiff * chromaPenaltyWeight;
      }
    }
  }

  return dist;
}

const srgbLUT = Array.from({ length: 256 }, (_, v) => {
  const x = v / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
});

const _f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

export function _rgbToLab(r, g, b) {
  const rl = srgbLUT[r];
  const gl = srgbLUT[g];
  const bl = srgbLUT[b];

  // Linear RGB -> XYZ (D65)
  const X = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) / 0.95047;
  // noinspection PointlessArithmeticExpressionJS
  const Y = (rl * 0.2126 + gl * 0.7152 + bl * 0.0722) / 1.0;
  const Z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) / 1.08883;

  const fX = _f(X);
  const fY = _f(Y);
  const fZ = _f(Z);

  return [
    116 * fY - 16, // L
    500 * (fX - fY), // a
    200 * (fY - fZ), // b
  ];
}

const _labCache = new Map(); // key: (r<<16)|(g<<8)|b  value: [L,a,b]

for (const data of Object.values(APP_CONSTANTS.COLOR_MAP)) {
  const rgb = data.rgb;
  _lab(rgb.r, rgb.g, rgb.b);
}

export function _lab(r, g, b) {
  const key = (r << 16) | (g << 8) | b;
  let v = _labCache.get(key);
  if (v !== undefined) return v;

  v = _rgbToLab(r, g, b);
  _labCache.set(key, v);
  return v;
}
