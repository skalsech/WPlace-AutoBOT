import { ImageProcessor } from '../../../core/image-processor.js';
import { onColorSettingsChange, state } from '../../../core/state.js';
import {
  findClosestColor,
  invalidateColorCache,
  isTransparentPixel,
  isWhitePixel,
} from '../../../utils/color-matching.js';
import { saveBotSettings } from '../../../storage/settings-manager.js';
import { updateStats, updateUI } from '../../panel.js';
import { overlayManager } from '../../../tiles/overlay-manager.js';
import { initializeColorPalette } from './color-palette.js';
import {
  createDitherBuffers,
  applyFloydSteinbergPreview,
  applyFloydSteinbergFinal,
} from './resize-dither.js';
import { createPanZoomController } from './resize-panzoom-controller.js';
import { createMaskOverlay } from './resize-mask-overlay.js';
import { createSizeHandlers } from './resize-size-handlers.js';
import { createMaskEvents } from './resize-mask-events.js';
import { createPreviewController } from './resize-preview-controller.js';
import { syncSettingsUI } from '../../sync-ui.js';

/**
 * Resize dialog controller.
 * Manages UI, preview, mask, and final image generation.
 */
let colorSettingsUnsubscribe = null;
let resizeContainer, resizeOverlay;
let widthSlider, heightSlider, widthValue, heightValue, keepAspect;
let paintWhiteToggle, paintTransparentToggle;
let zoomSlider, zoomValue, zoomInBtn, zoomOutBtn, zoomFitBtn, zoomActualBtn, panModeBtn;
let panStage, canvasStack, baseCanvas, maskCanvas, baseCtx, maskCtx;
let confirmResize, cancelResize, downloadPreviewBtn, clearIgnoredBtn, toggleOverlayBtn;

let _resizeDialogCleanup = null;

const initializeDOMRefs = (container, overlay) => {
  resizeContainer = container;
  resizeOverlay = overlay;
  widthSlider = container.querySelector('#widthSlider');
  heightSlider = container.querySelector('#heightSlider');
  widthValue = container.querySelector('#widthValue');
  heightValue = container.querySelector('#heightValue');
  keepAspect = container.querySelector('#keepAspect');
  paintWhiteToggle = container.querySelector('#paintWhiteToggle');
  paintTransparentToggle = container.querySelector('#paintTransparentToggle');
  zoomSlider = container.querySelector('#zoomSlider');
  zoomValue = container.querySelector('#zoomValue');
  zoomInBtn = container.querySelector('#zoomInBtn');
  zoomOutBtn = container.querySelector('#zoomOutBtn');
  zoomFitBtn = container.querySelector('#zoomFitBtn');
  zoomActualBtn = container.querySelector('#zoomActualBtn');
  panModeBtn = container.querySelector('#panModeBtn');
  panStage = container.querySelector('#resizePanStage');
  canvasStack = container.querySelector('#resizeCanvasStack');
  baseCanvas = container.querySelector('#resizeCanvas');
  maskCanvas = container.querySelector('#maskCanvas');
  baseCtx = baseCanvas.getContext('2d', { alpha: true });
  maskCtx = maskCanvas.getContext('2d', { alpha: true });
  confirmResize = container.querySelector('#confirmResize');
  cancelResize = container.querySelector('#cancelResize');
  downloadPreviewBtn = container.querySelector('#downloadPreviewBtn');
  clearIgnoredBtn = container.querySelector('#clearIgnoredBtn');
  toggleOverlayBtn = container.querySelector('#toggleOverlayBtn');
};

/**
 * Shows the resize dialog with full interactivity.
 * @param {ImageProcessor} processor - Source image processor
 * @param {HTMLElement} container - Dialog container
 * @param {HTMLElement} overlay - Dialog overlay
 */
function showResizeDialog(processor, container, overlay) {
  initializeDOMRefs(container, overlay);

  let baseProcessor = processor;
  let width, height;

  if (state.originalImage?.dataUrl) {
    baseProcessor = new ImageProcessor(state.originalImage.dataUrl);
    width = state.originalImage.width;
    height = state.originalImage.height;
  } else {
    const dims = processor.getDimensions();
    width = dims.width;
    height = dims.height;
  }

  // Initialize sliders
  const rs = state.resizeSettings;
  const minSize = 10;
  const maxSize = width * 2;

  widthSlider.min = heightSlider.min = minSize;
  widthSlider.max = heightSlider.max = maxSize;

  const initialW = Math.max(minSize, Math.min(rs?.width ?? width, maxSize));
  const initialH = Math.max(minSize, Math.min(rs?.height ?? height, maxSize));

  widthSlider.value = initialW;
  heightSlider.value = initialH;
  widthValue.textContent = initialW;
  heightValue.textContent = initialH;

  zoomSlider.value = 1;
  if (zoomValue) zoomValue.textContent = '100%';

  paintWhiteToggle.checked = state.paintWhitePixels;
  paintTransparentToggle.checked = state.paintTransparentPixels;

  // Initialize core utilities
  const ditherBuffers = createDitherBuffers();
  const maskOverlay = createMaskOverlay({ maskCtx, baseCanvas, maskCanvas, state });

  const previewController = createPreviewController({
    baseProcessor,
    processor,
    state,
    baseCtx,
    maskCtx,
    baseCanvas,
    maskCanvas,
    canvasStack,
    widthSlider,
    heightSlider,
    widthValue,
    heightValue,
    ensureMaskSize: (w, h) => maskOverlay.ensureMaskSize(w, h),
    applyFloydSteinbergPreview,
    findClosestColor,
    isTransparentPixel,
    isWhitePixel,
    ensureDitherBuffers: (n) => ditherBuffers.ensure(n),
    updateZoomLayout: () => panZoomController.updateZoomLayout(),
    maskOverlay,
    isDraggingSize: () => sizeHandlers.isDraggingSize,
  });

  const panZoomController = createPanZoomController({
    panStage,
    canvasStack,
    baseCanvas,
    maskCanvas,
    zoomSlider,
    zoomValue,
    zoomInBtn,
    zoomOutBtn,
    zoomFitBtn,
    zoomActualBtn,
    panModeBtn,
  });

  const sizeHandlers = createSizeHandlers({
    widthSlider,
    heightSlider,
    keepAspect,
    baseWidth: width,
    baseHeight: height,
    state,
    saveBotSettings,
    updatePreview: () => {
      previewController.updateResizePreview();
      previewController.schedulePreview();
    },
    applyZoom: (z) => panZoomController.applyZoom(z),
    computeFitZoom: () => panZoomController.computeFitZoom(),
  });

  const mapClientToPixel = (clientX, clientY) => {
    const rect = baseCanvas.getBoundingClientRect();
    const scaleX = rect.width / baseCanvas.width;
    const scaleY = rect.height / baseCanvas.height;
    return {
      x: Math.floor((clientX - rect.left) / scaleX),
      y: Math.floor((clientY - rect.top) / scaleY),
    };
  };

  const maskEvents = createMaskEvents({
    resizeContainer,
    baseCanvas,
    maskCanvas,
    state,
    saveBotSettings,
    maskOverlay,
    mapClientToPixel,
  });

  // Bind event handlers
  const setupColorSettingsBindings = () => {
    if (colorSettingsUnsubscribe) {
      colorSettingsUnsubscribe();
    }

    const bindInput = (id, stateKey, transform = (v) => v, fromState = (v) => v) => {
      const el = resizeContainer.querySelector(`#${id}`);
      if (!el) return;

      // UI → State
      const handleChange = () => {
        let value = el.value;
        if (el.type === 'checkbox') value = el.checked;
        state.updateColorSettings({ [stateKey]: transform(value) });
      };

      el.addEventListener('change', handleChange);

      // State → UI
      const handleStateChange = (updates) => {
        if (updates[stateKey] !== undefined) {
          const value = fromState(updates[stateKey]);
          if (el.type === 'checkbox') {
            el.checked = value;
          } else {
            el.value = value;
          }
        }
      };

      handleStateChange({ [stateKey]: state[stateKey] });

      return () => {
        el.removeEventListener('change', handleChange);
      };
    };

    const unbinders = [
      bindInput('colorAlgorithmSelect', 'colorMatchingAlgorithm'),
      bindInput(
        'enableChromaPenaltyToggle',
        'enableChromaPenalty',
        (v) => v,
        (v) => v
      ),
      bindInput('chromaPenaltyWeightSlider', 'chromaPenaltyWeight', parseFloat),
      bindInput('transparencyThresholdInput', 'customTransparencyThreshold', (v) => {
        const num = parseInt(v, 10);
        if (isNaN(num)) return state.customTransparencyThreshold;
        return Math.min(255, Math.max(0, num));
      }),
      bindInput('whiteThresholdInput', 'customWhiteThreshold', (v) => {
        const num = parseInt(v, 10);
        if (isNaN(num)) return state.customWhiteThreshold;
        return Math.min(255, Math.max(200, num));
      }),
    ];

    const handleColorSettingsChange = (updates) => {
      invalidateColorCache(updates);
      previewController.updateResizePreview();
      // todo check the other ui elements work in dialog
      saveBotSettings();
    };

    colorSettingsUnsubscribe = () => {
      unbinders.forEach((unbind) => unbind && unbind());
      state._eventEmitter.off('colorSettingsChange', handleColorSettingsChange);
    };

    onColorSettingsChange(handleColorSettingsChange);
  };
  setupColorSettingsBindings();
  const unbindSize = sizeHandlers.bind();
  const unbindMask = maskEvents.bind();

  // Toggle handlers
  paintWhiteToggle.onchange = (e) => {
    state.paintWhitePixels = e.target.checked;
    previewController.updateResizePreview();
    saveBotSettings();
  };

  paintTransparentToggle.onchange = (e) => {
    state.paintTransparentPixels = e.target.checked;
    previewController.updateResizePreview();
    saveBotSettings();
  };

  // Finalize resize
  confirmResize.onclick = async () => {
    const newWidth = parseInt(widthSlider.value, 10);
    const newHeight = parseInt(heightSlider.value, 10);

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    tempCtx.imageSmoothingEnabled = false;

    if (baseProcessor !== processor && (!baseProcessor.img || !baseProcessor.canvas)) {
      await baseProcessor.load();
    }

    tempCtx.drawImage(baseProcessor.img, 0, 0, newWidth, newHeight);
    const imgData = tempCtx.getImageData(0, 0, newWidth, newHeight);
    const data = imgData.data;

    const mask =
      state.resizeIgnoreMask?.length === newWidth * newHeight ? state.resizeIgnoreMask : null;

    let totalValidPixels = 0;

    if (state.ditheringEnabled) {
      totalValidPixels = await applyFloydSteinbergFinal({
        data,
        width: newWidth,
        height: newHeight,
        state,
        mask,
        findClosestColor,
        isTransparentPixel,
        isWhitePixel,
        ensureDitherBuffers: (n) => ditherBuffers.ensure(n),
      });
    } else {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        const masked = mask && mask[i >> 2];

        if (
          (!state.paintTransparentPixels && isTransparentPixel(a)) ||
          masked ||
          (!state.paintWhitePixels && isWhitePixel(r, g, b))
        ) {
          data[i + 3] = 0;
          continue;
        }

        totalValidPixels++;
        const [nr, ng, nb] = findClosestColor(r, g, b, state.activeColorPalette);
        data[i] = nr;
        data[i + 1] = ng;
        data[i + 2] = nb;
        data[i + 3] = 255;
      }
    }

    tempCtx.putImageData(imgData, 0, 0);

    // Update state
    state.imageData = {
      pixels: new Uint8ClampedArray(imgData.data),
      width: newWidth,
      height: newHeight,
      totalPixels: totalValidPixels,
    };
    state.artTotalPixels = totalValidPixels;
    state.totalPaintedPixels = 0;
    state.resizeSettings = {
      baseWidth: width,
      baseHeight: height,
      width: newWidth,
      height: newHeight,
    };

    saveBotSettings();

    const finalImageBitmap = await createImageBitmap(tempCanvas);
    await overlayManager.setImage(finalImageBitmap);
    overlayManager.enable();

    toggleOverlayBtn.classList.add('active');
    toggleOverlayBtn.setAttribute('aria-pressed', 'true');

    await updateStats();
    updateUI('resizeSuccess', 'success', { width: newWidth, height: newHeight });
    closeResizeDialog();
  };

  // Download preview
  downloadPreviewBtn.onclick = () => {
    try {
      const out = document.createElement('canvas');
      out.width = baseCanvas.width;
      out.height = baseCanvas.height;
      const ctx = out.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(baseCanvas, 0, 0);
      ctx.drawImage(maskCanvas, 0, 0);
      const link = document.createElement('a');
      link.download = 'wplace-preview.png';
      link.href = out.toDataURL();
      link.click();
    } catch (e) {
      console.warn('Failed to download preview:', e);
    }
  };

  cancelResize.onclick = closeResizeDialog;

  // Show dialog
  resizeOverlay.style.display = 'block';
  resizeContainer.style.display = 'block';

  // Rebuild palette
  initializeColorPalette(resizeContainer, () => {
    previewController.updateResizePreview();
  });

  // Initial preview
  previewController.updateResizePreview();
  setTimeout(() => {
    const fitZoom = panZoomController.computeFitZoom();
    if (isFinite(fitZoom)) {
      panZoomController.applyZoom(fitZoom);
      panZoomController.centerInView();
    }
  }, 0);

  // Cleanup function
  _resizeDialogCleanup = () => {
    try {
      // Reset zoom controls
      zoomSlider.replaceWith(zoomSlider.cloneNode(true));
      [zoomInBtn, zoomOutBtn].forEach((btn) => {
        btn?.replaceWith(btn.cloneNode(true));
      });
    } catch {
      /* empty */
    }
    colorSettingsUnsubscribe?.();
    unbindSize?.();
    unbindMask?.();
    previewController.destroy();
    panZoomController.destroy();
    maskOverlay.destroy();
    ditherBuffers.reset();
  };
}

/**
 * Closes the resize dialog and cleans up resources.
 */
function closeResizeDialog() {
  _resizeDialogCleanup?.();
  resizeOverlay.style.display = 'none';
  resizeContainer.style.display = 'none';
  _resizeDialogCleanup = null;
}

export { showResizeDialog, closeResizeDialog };
