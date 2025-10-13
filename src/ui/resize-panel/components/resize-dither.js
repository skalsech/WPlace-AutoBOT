/**
 * @typedef {Object} DitherBuffers
 * @property {Float32Array} work - RGB float buffer for error diffusion
 * @property {Uint8Array} eligible - eligibility mask (1 if pixel is paintable)
 */

/**
 * Creates and manages reusable buffers for dithering.
 * Pure factory with no internal state persistence.
 */
export function createDitherBuffers() {
  let workBuffer = null;
  let eligibleBuffer = null;

  return {
    ensure: (numPixels) => {
      if (!workBuffer || workBuffer.length !== numPixels * 3) {
        workBuffer = new Float32Array(numPixels * 3);
      }
      if (!eligibleBuffer || eligibleBuffer.length !== numPixels) {
        eligibleBuffer = new Uint8Array(numPixels);
      }
      return { work: workBuffer, eligible: eligibleBuffer };
    },
    reset: () => {
      workBuffer = null;
      eligibleBuffer = null;
    },
  };
}

/**
 * Shared core dithering logic for both preview and final pass.
 * @param {ImageData|{data: Uint8ClampedArray, width: number, height: number}} input
 * @param {Object} state
 * @param {boolean} state.paintTransparentPixels
 * @param {boolean} state.paintWhitePixels
 * @param {number[][]} state.activeColorPalette
 * @param {Uint8Array|null} mask - optional mask (for final only)
 * @param {Function} findClosestColor
 * @param {Function} isTransparentPixel
 * @param {Function} isWhitePixel
 * @param {(numPixels: number) => DitherBuffers} ensureBuffers
 * @param {boolean} asyncProgress - whether to yield periodically
 * @returns {{pixelsProcessed: number}}
 */
async function applyFloydSteinbergCore({
  input,
  state,
  mask,
  findClosestColor,
  isTransparentPixel,
  isWhitePixel,
  ensureBuffers,
  asyncProgress,
}) {
  const w = input.width;
  const h = input.height;
  const numPixels = w * h;
  const { work, eligible } = ensureBuffers(numPixels);
  const data = input.data;
  let pixelsProcessed = 0;

  // Phase 1: Prepare eligibility and copy RGB to work buffer
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const i4 = idx * 4;
      const r = data[i4];
      const g = data[i4 + 1];
      const b = data[i4 + 2];
      const a = data[i4 + 3];
      const masked = mask && mask[idx];
      const isEligible =
        !masked &&
        (state.paintTransparentPixels || !isTransparentPixel(a)) &&
        (state.paintWhitePixels || !isWhitePixel(r, g, b));

      eligible[idx] = isEligible ? 1 : 0;
      work[idx * 3] = r;
      work[idx * 3 + 1] = g;
      work[idx * 3 + 2] = b;

      if (!isEligible) {
        data[i4 + 3] = 0; // make transparent in preview
      }
    }

    if (asyncProgress && (y & 15) === 0) {
      // Yield every 16 rows to avoid blocking UI
      await Promise.resolve();
    }
  }

  // Diffusion helper
  const diffuse = (nx, ny, er, eg, eb, factor) => {
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) return;
    const nidx = ny * w + nx;
    if (!eligible[nidx]) return;
    const base = nidx * 3;
    work[base] = Math.min(255, Math.max(0, work[base] + er * factor));
    work[base + 1] = Math.min(255, Math.max(0, work[base + 1] + eg * factor));
    work[base + 2] = Math.min(255, Math.max(0, work[base + 2] + eb * factor));
  };

  // Phase 2: Dither pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (!eligible[idx]) continue;

      const base = idx * 3;
      const r0 = work[base];
      const g0 = work[base + 1];
      const b0 = work[base + 2];
      const [nr, ng, nb] = findClosestColor(r0, g0, b0, state.activeColorPalette);
      const i4 = idx * 4;

      data[i4] = nr;
      data[i4 + 1] = ng;
      data[i4 + 2] = nb;
      data[i4 + 3] = 255;
      pixelsProcessed++;

      const er = r0 - nr;
      const eg = g0 - ng;
      const eb = b0 - nb;

      diffuse(x + 1, y, er, eg, eb, 7 / 16);
      diffuse(x - 1, y + 1, er, eg, eb, 3 / 16);
      diffuse(x, y + 1, er, eg, eb, 5 / 16);
      diffuse(x + 1, y + 1, er, eg, eb, 1 / 16);
    }

    if (asyncProgress) {
      // Yield every row

      await Promise.resolve();
    }
  }

  return { pixelsProcessed };
}

/**
 * Synchronous dithering for preview (no blocking concerns).
 */
export function applyFloydSteinbergPreview(args) {
  return applyFloydSteinbergCore({ ...args, input: args.imageData, asyncProgress: false });
}

/**
 * Asynchronous dithering for final processing (avoids UI freeze).
 */
export async function applyFloydSteinbergFinal(args) {
  return applyFloydSteinbergCore({
    ...args,
    input: { data: args.data, width: args.width, height: args.height },
    asyncProgress: true,
  });
}
