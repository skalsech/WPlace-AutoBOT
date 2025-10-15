export const colorDistance = (a, b) => {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2));
};

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

const _labCache = new Map(); // key: (r<<16)|(g<<8)|b  value: [L,a,b]

export function _rgbToLab(r, g, b) {
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
