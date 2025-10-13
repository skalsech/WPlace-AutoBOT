import { state } from '../../../core/state.js';
import { showAlert } from '../../../shared/ui/alerts.js';
import { t } from '../../../i18n/index.js';
import {
  loadProgress,
  loadProgressFromFile,
  saveProgress,
  saveProgressToFile,
} from '../../../storage/progress-service.js';
import { updateStats, updateUI } from '../../../app/startup/create-ui.js';
import { overlayManager, restoreOverlayFromData } from '../../../core/overlay/overlay-manager.js';
import { restoreProgress } from '../../../storage/progress-serialize.js';

export function updateDataButtons() {
  const container = document.getElementById('wplace-image-bot-container');
  const saveToFileBtn = container.querySelector('#saveToFileBtn');
  const saveBtn = container.querySelector('#saveBtn');

  const hasImageData = state.imageLoaded;
  saveBtn.disabled = !hasImageData;
  saveToFileBtn.disabled = !hasImageData;
}

export function handleSaveToFileClick() {
  const success = saveProgressToFile();
  if (success) {
    updateUI('fileSaved', 'success');
    showAlert(t('fileSaved'), 'success');
  } else {
    showAlert(t('fileError'), 'error');
  }
}

export async function handleSaveClick() {
  if (!state.imageLoaded) {
    showAlert(t('missingRequirements'), 'error');
    return;
  }

  const success = await saveProgress();
  if (success) {
    updateUI('autoSaved', 'success');
    showAlert(t('autoSaved'), 'success');
  } else {
    showAlert(t('errorSavingProgress'), 'error');
  }
}

async function handleProgressLoadSuccess(savedData, source) {
  updateUI(source, 'success');
  showAlert(t(source), 'success');
  updateDataButtons();

  try {
    await restoreOverlayFromData();
    await overlayManager.waitForTiles(true);

    await updateStats();
  } catch (error) {
    console.error(`Failed to restore overlay from ${source}:`, error);
  }

  const uploadBtn = document.getElementById('uploadBtn');
  const selectPosBtn = document.getElementById('selectPosBtn');
  const resizeBtn = document.getElementById('resizeBtn');

  if (state.hasAvailableColors) {
    if (uploadBtn) uploadBtn.disabled = false;
    if (selectPosBtn) selectPosBtn.disabled = false;
    if (resizeBtn) resizeBtn.disabled = false;
  } else {
    if (uploadBtn) uploadBtn.disabled = false;
  }

  const controlBtn = document.getElementById('controlBtn');
  if (state.imageLoaded && state.startPosition && state.region && state.hasAvailableColors) {
    if (controlBtn) controlBtn.disabled = false;
  }
}

export async function handleLoadClick(needConfirm = false) {
  const savedData = await loadProgress();
  if (!savedData) {
    updateUI('noSavedData', 'warning');
    showAlert(t('noSavedData'), 'warning');
    return;
  }

  const savedDate = new Date(savedData.timestamp).toLocaleString();

  if (needConfirm) {
    const confirmLoad = confirm(
      `${t('savedDataFound')}\n\n` +
        `Timestamp: ${savedDate}\n` +
        `Art size: ${savedData.imageData.width} × ${savedData.imageData.height}\n` +
        `Start position (x, y): ${savedData.state.startPosition.x}, ${savedData.state.startPosition.y}\n` +
        `Region (x, y): ${savedData.state.region.x}, ${savedData.state.region.y}\n` +
        `Total: ${savedData.state.artTotalPixels} pixels`
    );

    if (!confirmLoad) return;
  }

  const success = restoreProgress(savedData);
  if (success) {
    await handleProgressLoadSuccess(savedData, 'dataLoaded');
  } else {
    showAlert(t('errorLoadingProgress'), 'error');
  }
}

export async function handleLoadFromFileClick() {
  try {
    const success = await loadProgressFromFile();
    if (success) {
      await handleProgressLoadSuccess(null, 'fileLoaded');
    }
  } catch (error) {
    if (error.message === 'Invalid JSON file') {
      showAlert(t('invalidFileFormat'), 'error');
    } else {
      showAlert(t('fileError'), 'error');
    }
  }
}
