/**
 * Manages preview rendering with debounced updates and dithering.
 * Cancels stale jobs and integrates mask overlay.
 */
export function createPreviewController({
  baseProcessor,
  processor,
  state,
  baseCtx,
  maskCtx,
  // eslint-disable-next-line no-unused-vars
  baseCanvas,
  maskCanvas,
  canvasStack,
  widthSlider,
  heightSlider,
  widthValue,
  heightValue,
  ensureMaskSize,
  applyFloydSteinbergPreview,
  findClosestColor,
  isTransparentPixel,
  isWhitePixel,
  ensureDitherBuffers,
  updateZoomLayout,
  maskOverlay,
  isDraggingSize,
}) {
  let previewTimer = null;
  let previewJobId = 0;

  /**
   * Full preview render with resize, dithering, and mask.
   * Skipped if job is outdated.
   */
  async function updateResizePreview() {
    const jobId = ++previewJobId;
    const newWidth = parseInt(widthSlider.value, 10);
    const newHeight = parseInt(heightSlider.value, 10);

    widthValue.textContent = newWidth;
    heightValue.textContent = newHeight;

    ensureMaskSize(newWidth, newHeight);
    canvasStack.style.width = `${newWidth}px`;
    canvasStack.style.height = `${newHeight}px`;
    baseCtx.imageSmoothingEnabled = false;

    // Fallback: draw without dithering if no palette
    if (state.availableColors.size === 0) {
      if (baseProcessor !== processor && (!baseProcessor.img || !baseProcessor.canvas)) {
        await baseProcessor.load();
      }
      baseCtx.clearRect(0, 0, newWidth, newHeight);
      baseCtx.drawImage(baseProcessor.img, 0, 0, newWidth, newHeight);
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      const maskImg = maskOverlay.getMaskImageData();
      if (maskImg) maskCtx.putImageData(maskImg, 0, 0);
      updateZoomLayout();
      return;
    }

    // Load source if needed
    if (baseProcessor !== processor && (!baseProcessor.img || !baseProcessor.canvas)) {
      await baseProcessor.load();
    }

    // Draw resized base image
    baseCtx.clearRect(0, 0, newWidth, newHeight);
    baseCtx.drawImage(baseProcessor.img, 0, 0, newWidth, newHeight);
    const imgData = baseCtx.getImageData(0, 0, newWidth, newHeight);

    // Apply color quantization
    if (state.ditheringEnabled && !isDraggingSize) {
      applyFloydSteinbergPreview({
        imageData: imgData,
        state,
        findClosestColor,
        isTransparentPixel,
        isWhitePixel,
        ensureDitherBuffers,
      });
    } else {
      const { data } = imgData;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (
          (!state.paintTransparentPixels && isTransparentPixel(a)) ||
          (!state.paintWhitePixels && isWhitePixel(r, g, b))
        ) {
          data[i + 3] = 0;
        } else {
          const [nr, ng, nb] = findClosestColor(r, g, b, state.activeColorPalette);
          data[i] = nr;
          data[i + 1] = ng;
          data[i + 2] = nb;
          data[i + 3] = 255;
        }
      }
    }

    // Only apply if this job is still current
    if (jobId !== previewJobId) return;

    baseCtx.putImageData(imgData, 0, 0);
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    const maskImg = maskOverlay.getMaskImageData();
    if (maskImg) maskCtx.putImageData(maskImg, 0, 0);

    updateZoomLayout();
  }

  /**
   * Schedules preview update with idle/debounce strategy.
   */
  function schedulePreview() {
    if (previewTimer) clearTimeout(previewTimer);
    const run = () => {
      previewTimer = null;
      updateResizePreview();
    };

    if (window.requestIdleCallback) {
      previewTimer = setTimeout(() => requestIdleCallback(run, { timeout: 150 }), 50);
    } else {
      previewTimer = setTimeout(() => requestAnimationFrame(run), 50);
    }
  }

  /**
   * Cleans up pending timers.
   */
  function destroy() {
    if (previewTimer) {
      clearTimeout(previewTimer);
      previewTimer = null;
    }
  }

  return {
    updateResizePreview,
    schedulePreview,
    destroy,
  };
}
