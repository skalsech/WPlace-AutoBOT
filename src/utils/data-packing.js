/**
 * @deprecated The painted map / paintedMapPacked should **not be persisted or relied upon**.
 *
 * Reason:
 * - Painted map is account-specific; restoring it from saved progress across different accounts
 *   causes inconsistent or incorrect drawing results.
 * - Storing it slows down rendering and provides no practical benefit.
 * - Use live state from the current account/session instead.
 *
 * ⚠️ Recommendation:
 * - Do not save paintedMap / paintedMapPacked in progress data.
 * - Avoid using this field for inter-account operations.
 *
 * @example
 * // Deprecated usage (avoid):
 * const packed = buildPaintedMapPacked();
 *
 * @returns { { width: number, height: number, data: string } | null }
 */
export function packPaintedMapToBase64(paintedMap, width, height) {
  if (!paintedMap || !width || !height) return null;
  const totalBits = width * height;
  const byteLen = Math.ceil(totalBits / 8);
  const bytes = new Uint8Array(byteLen);
  let bitIndex = 0;
  for (let y = 0; y < height; y++) {
    const row = paintedMap[y];
    for (let x = 0; x < width; x++) {
      const bit = row && row[x] ? 1 : 0;
      const b = bitIndex >> 3; // byte index
      const o = bitIndex & 7; // bit offset
      if (bit) bytes[b] |= 1 << o;
      bitIndex++;
    }
  }
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  }
  return btoa(binary);
}
