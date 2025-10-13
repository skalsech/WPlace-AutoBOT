import { state } from '../../../core/state.js';
import { showAlert } from '../../../shared/ui/alerts.js';
import { saveBotSettings } from '../../../storage/settings-manager.js';
import { t } from '../../../i18n/index.js';
import { updateStats, updateUI } from '../../../app/startup/create-ui.js';
import { createImageUploader } from '../../../utils/files.js';
import { ImageProcessor } from '../../../core/system/image-processor.js';
import { overlayManager } from '../../../core/overlay/overlay-manager.js';
import { updateDataButtons } from './handle-data-buttons.js';
import { APP_CONSTANTS } from '../../../app/config/app-constants.js';

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
    const artColorFrequency = processor.countColors();
    let totalValidPixels = 0;
    for (const [colorId, count] of artColorFrequency.entries()) {
      if (!state.paintTransparentPixels && colorId === APP_CONSTANTS.COLOR_IDS.TRANSPARENT) {
        continue;
      }
      totalValidPixels += count;
    }

    state.update({
      imageData: {
        width,
        height,
        pixels,
        totalPixels: totalValidPixels,
        processor,
      },
      artColorFrequency,
      artTotalPixels: totalValidPixels,
      totalPaintedPixels: 0,
      resizeSettings: null,
      resizeIgnoreMask: null,
      originalImage: { dataUrl: imageSrc, width, height },
    });

    saveBotSettings();

    const imageBitmap = await createImageBitmap(processor.img);
    await overlayManager.setImage(imageBitmap);
    overlayManager.enable();
    await overlayManager.waitForTiles(true);

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

    const controlBtn = document.getElementById('controlBtn');
    if (state.startPosition && controlBtn) {
      controlBtn.disabled = false;
    }

    await updateStats();
    updateDataButtons();
    updateUI('imageLoaded', 'success', { count: totalValidPixels });
  } catch (error) {
    console.error('Image upload error:', error);
    updateUI('imageError', 'error');
  }
}
