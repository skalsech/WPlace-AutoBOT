import { state } from '../../../core/state.js';
import { updateUI } from '../../panel.js';
import { ensureToken, getTurnstileToken } from '../../../security/turnstile-manager.js';
import { processImage } from '../../../core/painting-controller.js';

export async function handleStartPainting() {
  if (!state.imageLoaded || !state.startPosition || !state.region) {
    updateUI('missingRequirements', 'error');
    return;
  }
  await ensureToken();
  if (!getTurnstileToken()) return;

  state.running = true;
  state.stopFlag = false;

  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const uploadBtn = document.getElementById('uploadBtn');
  const selectPosBtn = document.getElementById('selectPosBtn');
  const resizeBtn = document.getElementById('resizeBtn');
  const saveBtn = document.getElementById('saveBtn');
  const toggleOverlayBtn = document.getElementById('toggleOverlayBtn');

  if (startBtn) startBtn.disabled = true;
  if (stopBtn) stopBtn.disabled = false;
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
    state.running = false;
    if (stopBtn) stopBtn.disabled = true;
    if (saveBtn) saveBtn.disabled = false;

    if (state.stopFlag) {
      if (startBtn) startBtn.disabled = false;
    } else {
      if (startBtn) startBtn.disabled = true;
      if (uploadBtn) uploadBtn.disabled = false;
      if (selectPosBtn) selectPosBtn.disabled = false;
      if (resizeBtn) resizeBtn.disabled = false;
    }
    if (toggleOverlayBtn) toggleOverlayBtn.disabled = false;
  }
}
