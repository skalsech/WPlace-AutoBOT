import { state } from './state.js';
import { saveProgress } from './progress-manager.js';

function shouldAutoSave() {
  return false;
  // eslint-disable-next-line no-unreachable
  const now = Date.now();
  const pixelsSinceLastSave = state.currentPaintedPixels - state._lastSavePixelCount;
  const timeSinceLastSave = now - state._lastSaveTime;

  return !state._saveInProgress && pixelsSinceLastSave >= 25 && timeSinceLastSave >= 30000;
}

export function performSmartSave() {
  if (!shouldAutoSave()) return false;

  state._saveInProgress = true;
  const success = saveProgress();

  if (success) {
    state._lastSavePixelCount = state.currentPaintedPixels;
    state._lastSaveTime = Date.now();
    console.log(`💾 Auto-saved at ${state.currentPaintedPixels} pixels`);
  }

  state._saveInProgress = false;
  return success;
}
