import { state } from '../../core/state.js';

export const colorDistance = (a, b) => {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2));
};

export function calculateLegacyDistance(target, color) {
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

export function calculateLabDistance(targetLab, colorLab, s = state) {
  const [Lt, at, bt] = targetLab;
  const [Lp, ap, bp] = colorLab;
  const dL = Lt - Lp,
    da = at - ap,
    db = bt - bp;
  let dist = dL * dL + da * da + db * db;

  if (s.enableChromaPenalty) {
    const targetChroma = Math.sqrt(at * at + bt * bt);
    const candChroma = Math.sqrt(ap * ap + bp * bp);
    if (targetChroma > 20 && candChroma < targetChroma) {
      const chromaDiff = targetChroma - candChroma;
      dist += chromaDiff * chromaDiff * s.chromaPenaltyWeight;
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
