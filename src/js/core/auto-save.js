// Smart save - only save if significant changes
import { state } from './state.js';
import { saveProgress } from './progress-manager.js';

function shouldAutoSave() {
  const now = Date.now();
  const pixelsSinceLastSave = state.userPaintedPixels - state._lastSavePixelCount;
  const timeSinceLastSave = now - state._lastSaveTime;

  // Save conditions:
  // 1. Every 25 pixels (reduced from 50 for more frequent saves)
  // 2. At least 30 seconds since last save (prevent spam)
  // 3. Not already saving
  return !state._saveInProgress && pixelsSinceLastSave >= 25 && timeSinceLastSave >= 30000;
}

export function performSmartSave() {
  if (!shouldAutoSave()) return false;

  state._saveInProgress = true;
  const success = saveProgress();

  if (success) {
    state._lastSavePixelCount = state.userPaintedPixels;
    state._lastSaveTime = Date.now();
    console.log(`💾 Auto-saved at ${state.userPaintedPixels} pixels`);
  }

  state._saveInProgress = false;
  return success;
}
