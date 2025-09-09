import { state } from './state.js';

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
function initializePaintedMap(width, height) {
  if (!state.paintedMap || state.paintedMap.length !== height) {
    state.paintedMap = Array(height)
      .fill()
      .map(() => Array(width).fill(false));
    console.log(`📋 Initialized painted map: ${width}x${height}`);
  }
}

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
function markPixelPainted(x, y, regionX = 0, regionY = 0) {
  const actualX = x + regionX;
  const actualY = y + regionY;

  if (
    state.paintedMap &&
    state.paintedMap[actualY] &&
    actualX >= 0 &&
    actualX < state.paintedMap[actualY].length
  ) {
    state.paintedMap[actualY][actualX] = true;
  }
}

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
function isPixelPainted(x, y, regionX = 0, regionY = 0) {
  const actualX = x + regionX;
  const actualY = y + regionY;

  if (
    state.paintedMap &&
    state.paintedMap[actualY] &&
    actualX >= 0 &&
    actualX < state.paintedMap[actualY].length
  ) {
    return state.paintedMap[actualY][actualX];
  }
  return false;
}
