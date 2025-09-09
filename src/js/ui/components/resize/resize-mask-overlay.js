/**
 * Manages mask overlay rendering: buffers, dirty regions, and canvas sync.
 * Decoupled from input logic; only handles visual representation of `state.resizeIgnoreMask`.
 */
export function createMaskOverlay({ maskCtx, baseCanvas, maskCanvas, state }) {
  let maskImageData = null;
  let maskData = null;
  let dirty = null;

  const resetDirty = () => {
    dirty = { minX: Infinity, minY: Infinity, maxX: -1, maxY: -1 };
  };

  const markDirty = (x, y) => {
    if (!dirty) resetDirty();
    dirty.minX = Math.min(dirty.minX, x);
    dirty.minY = Math.min(dirty.minY, y);
    dirty.maxX = Math.max(dirty.maxX, x);
    dirty.maxY = Math.max(dirty.maxY, y);
  };

  const flushDirty = () => {
    if (!dirty || dirty.maxX < dirty.minX || dirty.maxY < dirty.minY) return;

    const x = Math.max(0, dirty.minX);
    const y = Math.max(0, dirty.minY);
    const w = Math.min(maskCanvas.width - x, dirty.maxX - x + 1);
    const h = Math.min(maskCanvas.height - y, dirty.maxY - y + 1);

    if (w > 0 && h > 0) {
      maskCtx.putImageData(maskImageData, 0, 0, x, y, w, h);
    }
    resetDirty();
  };

  const ensureOverlayBuffers = (w, h, rebuildFromMask = false) => {
    const needsNewBuffer =
      !maskImageData || maskImageData.width !== w || maskImageData.height !== h;

    if (needsNewBuffer) {
      maskImageData = maskCtx.createImageData(w, h);
      maskData = maskImageData.data;
      rebuildFromMask = true;
    }

    if (rebuildFromMask) {
      const maskArray = state.resizeIgnoreMask;
      maskData.fill(0);

      if (maskArray) {
        for (let i = 0; i < maskArray.length; i++) {
          if (maskArray[i]) {
            const p = i * 4;
            maskData[p] = 255; // R
            maskData[p + 1] = 0; // G
            maskData[p + 2] = 0; // B
            maskData[p + 3] = 150; // A
          }
        }
      }
      maskCtx.putImageData(maskImageData, 0, 0);
      resetDirty();
    }
  };

  const ensureMaskArraySize = (w, h) => {
    const len = w * h;
    if (!state.resizeIgnoreMask || state.resizeIgnoreMask.length !== len) {
      state.resizeIgnoreMask = new Uint8Array(len);
    }
  };

  const ensureMaskSize = (w, h) => {
    ensureMaskArraySize(w, h);
    baseCanvas.width = w;
    baseCanvas.height = h;
    maskCanvas.width = w;
    maskCanvas.height = h;
    maskCtx.clearRect(0, 0, w, h);
    ensureOverlayBuffers(w, h, true);
  };

  const rebuildFromStateMask = () => {
    if (maskImageData) {
      ensureOverlayBuffers(maskCanvas.width, maskCanvas.height, true);
    }
  };

  const destroy = () => {
    maskImageData = null;
    maskData = null;
    dirty = null;
  };

  return {
    ensureOverlayBuffers,
    ensureMaskSize,
    resetDirty,
    markDirty,
    flushDirty,
    rebuildFromStateMask,
    getMaskData: () => maskData,
    getMaskImageData: () => maskImageData,
    destroy,
  };
}
