// -----------------------------------------------------------------------------
// Cache system for color matching results
// -----------------------------------------------------------------------------
export const colorCache = new Map();

/**
 * Bit layout (total 34 bits used, all within JS 53-bit safe integer range):
 *
 * ┌───────────────┬─────────────┬────────────┬────────────┬──────────────┐
 * │ bits 16–39    │ bit 9       │ bit 8      │ bit 7      │ bits 0–6     │
 * │ rgbPacked     │ algoFlag    │ chromaFlag │ exactFlag  │ weightInt    │
 * └───────────────┴─────────────┴────────────┴────────────┴──────────────┘
 *
 * rgbPacked: combined RGB integer (24 bits)
 * algoFlag:  0 = legacy, 1 = lab
 * chromaFlag: 0 = off, 1 = on
 * exactFlag: 0 = nearest, 1 = exact match only
 * weightInt: chromaPenaltyWeight * 100 (0–127)
 */

/**
 * Encodes cache key fields into a unique 53-bit integer.
 * @param {number} rgbPacked - 24-bit RGB integer
 * @param {number} algoFlag - 0 or 1
 * @param {number} chromaFlag - 0 or 1
 * @param {number} exactFlag - 0 or 1
 * @param {number} weightInt - 0–127 (7 bits)
 * @returns {number} unique cache key
 */
export function encodeCacheKey(rgbPacked, algoFlag, chromaFlag, exactFlag, weightInt) {
  // Safety clamp to 7 bits
  const safeWeight = Math.min(Math.max(weightInt, 0), 127);

  return (
    (rgbPacked << 16) | (algoFlag << 9) | (chromaFlag << 8) | (exactFlag << 7) | (safeWeight & 0x7f)
  );
}

/**
 * Decodes a numeric cache key back into its components.
 * @param {number} key - Encoded cache key
 * @returns {{
 *   rgbPacked: number,
 *   algoFlag: number,
 *   chromaFlag: number,
 *   exactFlag: number,
 *   weightInt: number
 * }}
 */
export function decodeCacheKey(key) {
  return {
    rgbPacked: (key >> 16) & 0xffffff, // 24 bits
    algoFlag: (key >> 9) & 0b1,
    chromaFlag: (key >> 8) & 0b1,
    exactFlag: (key >> 7) & 0b1,
    weightInt: key & 0x7f, // bits 0–6
  };
}

/**
 * Invalidates entries in colorCache selectively, based on changed parameters.
 * If availableColors changed — full reset.
 */
export function invalidateColorCache(changedParams = {}) {
  if (changedParams.availableColors) {
    colorCache.clear();
    return;
  }

  for (const key of colorCache.keys()) {
    const decoded = decodeCacheKey(key);

    if (
      changedParams.chromaPenaltyWeight !== undefined &&
      decoded.weightInt !== Math.round(changedParams.chromaPenaltyWeight * 100)
    ) {
      colorCache.delete(key);
      continue;
    }

    if (
      changedParams.paintUnavailablePixels !== undefined &&
      decoded.exactFlag !== (changedParams.paintUnavailablePixels ? 0 : 1)
    ) {
      colorCache.delete(key);
      continue;
    }

    if (
      changedParams.enableChromaPenalty !== undefined &&
      decoded.chromaFlag !== (changedParams.enableChromaPenalty ? 1 : 0)
    ) {
      colorCache.delete(key);
      continue;
    }

    if (
      changedParams.colorMatchingAlgorithm !== undefined &&
      decoded.algoFlag !== (changedParams.colorMatchingAlgorithm === 'lab' ? 1 : 0)
    ) {
      colorCache.delete(key);
      continue;
    }
  }
}
