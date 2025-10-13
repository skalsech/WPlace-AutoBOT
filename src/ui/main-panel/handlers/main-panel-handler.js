import { showAlert } from '../../../shared/ui/alerts.js';
import { t } from '../../../i18n/index.js';
import { state } from '../../../core/state.js';
import { showResizeDialog } from '../../resize-panel/components/resize-dialog.js';
import { updateUI } from '../../../app/startup/create-ui.js';
import { saveProgress } from '../../../storage/progress-manager.js';
import { overlayManager } from '../../../core/overlay/overlay-manager.js';
import { NotificationManager } from '../../../core/system/notification-manager.js';
import { saveBotSettings } from '../../../storage/settings-manager.js';
import {
  ensureToken,
  getTurnstileToken,
} from '../../../security/turnstile-token/turnstile-manager.js';
import { processImage } from '../../../core/painting/painting-controller.js';

export function handleResizeClick(e) {
  e?.preventDefault();
  if (state.imageLoaded && state.imageData.processor && state.hasAvailableColors) {
    const resizeContainer = document.querySelector('.resize-container');
    const resizeOverlay = document.querySelector('.resize-overlay');

    showResizeDialog(state.imageData.processor, resizeContainer, resizeOverlay);
  } else if (!state.hasAvailableColors) {
    showAlert(t('uploadImageFirstColors'), 'warning');
  }
}

export async function handleStopClick() {
  state.update({
    stopFlag: true,
    running: false,
  });
  updateControlButtonState();

  updateUI('paintingStoppedByUser', 'warning');

  if (state.imageLoaded && state.totalPaintedPixels > 0) {
    await saveProgress();
    showAlert(t('autoSaved'), 'success');
  }
}

function updateControlButtonState() {
  const controlBtn = document.getElementById('controlBtn');
  if (!state.imageLoaded || !state.startPosition || !state.region) {
    controlBtn.disabled = true;
    return;
  }

  controlBtn.disabled = false;
  if (state.running) {
    controlBtn.classList.remove('wplace-btn-start');
    controlBtn.classList.add('wplace-btn-stop');
    controlBtn.innerHTML = `
      <i class="fas fa-stop"></i>
      <span data-i18n-key="stopPainting">${t('stopPainting')}</span>
    `;
  } else {
    controlBtn.classList.remove('wplace-btn-stop');
    controlBtn.classList.add('wplace-btn-start');
    controlBtn.innerHTML = `
      <i class="fas fa-play"></i>
      <span data-i18n-key="startPainting">${t('startPainting')}</span>
    `;
  }
}

export async function handleStartPainting() {
  if (!state.imageLoaded || !state.startPosition || !state.region) {
    updateUI('missingRequirements', 'error');
    return;
  }
  await ensureToken();
  if (!getTurnstileToken()) return;

  state.update({
    running: true,
    stopFlag: false,
  });
  updateControlButtonState();

  const uploadBtn = document.getElementById('uploadBtn');
  const selectPosBtn = document.getElementById('selectPosBtn');
  const resizeBtn = document.getElementById('resizeBtn');
  const saveBtn = document.getElementById('saveBtn');
  const toggleOverlayBtn = document.getElementById('toggleOverlayBtn');

  if (uploadBtn) uploadBtn.disabled = true;
  if (selectPosBtn) selectPosBtn.disabled = true;
  if (resizeBtn) resizeBtn.disabled = true;
  if (saveBtn) saveBtn.disabled = true;
  if (toggleOverlayBtn) toggleOverlayBtn.disabled = true;

  updateUI('startPaintingMsg', 'success');

  try {
    await processImage();
  } catch (e) {
    console.error('Unexpected error:', e);
    updateUI('paintingError', 'error');
  } finally {
    state.update({
      running: false,
    });
    updateControlButtonState();

    if (saveBtn) saveBtn.disabled = false;
    if (!state.stopFlag) {
      if (uploadBtn) uploadBtn.disabled = false;
      if (selectPosBtn) selectPosBtn.disabled = false;
      if (resizeBtn) resizeBtn.disabled = false;
    }

    if (toggleOverlayBtn) toggleOverlayBtn.disabled = false;
  }
}

export async function handleTogglePainting() {
  const isRunning = state.running;

  if (isRunning) {
    await handleStopClick();
  } else {
    await handleStartPainting();
  }
  updateControlButtonState();
}

export async function handleToggleOverlayClick() {
  const isEnabled = await overlayManager.toggle();
  const btn = document.getElementById('toggleOverlayBtn');
  if (btn) {
    btn.classList.toggle('active', isEnabled);
    btn.setAttribute('aria-pressed', isEnabled ? 'true' : 'false');
  }
  showAlert(isEnabled ? t('overlayEnabled') : t('overlayDisabled'), 'info');
}

export function handleCooldownSliderInput(e) {
  const threshold = parseInt(e.target.value, 10);
  state.update({
    cooldownChargeThreshold: threshold,
  });
  const cooldownValue = document.getElementById('cooldownValue');
  if (cooldownValue) {
    cooldownValue.textContent = threshold.toString();
  }
  saveBotSettings();
  NotificationManager.resetEdgeTracking();
}
