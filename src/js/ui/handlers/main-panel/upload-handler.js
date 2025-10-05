import { state } from '../../../core/state.js';
import { showAlert } from '../../alerts.js';
import { saveBotSettings } from '../../../core/settings-manager.js';
import { t } from '../../../i18n/i18.js';
import { updateStats, updateUI } from '../../panel.js';
import { createImageUploader } from '../../../utils/files.js';
import { ImageProcessor } from '../../../core/image-processor.js';
import { overlayManager } from '../../../overlay/overlay-manager.js';
import { updateDataButtons } from './handle-data-buttons.js';

export async function handleUploadClick() {
  await updateStats(true);

  if (!state.hasAvailableColors) {
    updateUI('noColorsKnown', 'error');
    showAlert(t('noColorsKnown'), 'error');
    return;
  }

  const selectPosBtn = document.getElementById('selectPosBtn');
  const resizeBtn = document.getElementById('resizeBtn');
  if (selectPosBtn) selectPosBtn.disabled = false;

  try {
    updateUI('loadingImage', 'default');
    const imageSrc = await createImageUploader();
    if (!imageSrc) {
      updateUI('colorsFound', 'success', { count: state.availableColors.length });
      return;
    }

    const processor = new ImageProcessor(imageSrc);
    await processor.load();

    const { width, height } = processor.getDimensions();
    const pixels = processor.getPixelData();
    const artColorFrequency = processor.countColors(!state.paintTransparentPixels);
    let totalValidPixels = 0;
    for (const count of artColorFrequency.values()) {
      totalValidPixels += count;
    }

    state.imageData = {
      width,
      height,
      pixels,
      totalPixels: totalValidPixels,
      processor,
    };
    state.artTotalPixels = totalValidPixels;
    state.artColorFrequency = artColorFrequency;
    state.totalPaintedPixels = 0;

    state.resizeSettings = null;
    state.resizeIgnoreMask = null;
    state.originalImage = { dataUrl: imageSrc, width, height };
    saveBotSettings();

    const imageBitmap = await createImageBitmap(processor.img);
    await overlayManager.setImage(imageBitmap);
    overlayManager.enable();

    const toggleOverlayBtn = document.getElementById('toggleOverlayBtn');
    if (toggleOverlayBtn) {
      toggleOverlayBtn.disabled = false;
      toggleOverlayBtn.classList.add('active');
      toggleOverlayBtn.setAttribute('aria-pressed', 'true');
    }

    if (state.hasAvailableColors) {
      if (resizeBtn) resizeBtn.disabled = false;
    }

    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.disabled = false;

    const startBtn = document.getElementById('startBtn');
    if (state.startPosition && startBtn) {
      startBtn.disabled = false;
    }

    await updateStats();
    updateDataButtons();
    updateUI('imageLoaded', 'success', { count: totalValidPixels });
  } catch (error) {
    console.error('Image upload error:', error);
    updateUI('imageError', 'error');
  }
}
