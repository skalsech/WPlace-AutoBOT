import { showAlert } from '../../alerts.js';
import { t } from '../../../i18n/i18.js';
import { state } from '../../../core/state.js';
import { showResizeDialog } from '../../components/resize/resize-dialog.js';
import { updateUI } from '../../panel.js';
import { saveProgress } from '../../../core/progress-manager.js';
import { overlayManager } from '../../../overlay/overlay-manager.js';
import { NotificationManager } from '../../../core/notification-manager.js';
import { saveBotSettings } from '../../../core/settings-manager.js';

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

export function handleStopClick() {
  state.stopFlag = true;
  state.running = false;

  const stopBtn = document.getElementById('stopBtn');
  if (stopBtn) stopBtn.disabled = true;

  updateUI('paintingStoppedByUser', 'warning');

  if (state.imageLoaded && state.totalPaintedPixels > 0) {
    saveProgress();
    showAlert(t('autoSaved'), 'success');
  }
}

export function handleToggleOverlayClick() {
  const isEnabled = overlayManager.toggle();
  const btn = document.getElementById('toggleOverlayBtn');
  if (btn) {
    btn.classList.toggle('active', isEnabled);
    btn.setAttribute('aria-pressed', isEnabled ? 'true' : 'false');
  }
  showAlert(isEnabled ? t('overlayEnabled') : t('overlayDisabled'), 'info');
}

export function handleCooldownSliderInput(e) {
  const threshold = parseInt(e.target.value, 10);
  state.cooldownChargeThreshold = threshold;
  const cooldownValue = document.getElementById('cooldownValue');
  if (cooldownValue) {
    cooldownValue.textContent = threshold.toString();
  }
  saveBotSettings();
  NotificationManager.resetEdgeTracking();
}
