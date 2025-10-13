import { state } from '../state.js';
import { saveProgress } from '../../storage/progress-manager.js';

function shouldAutoSave() {
  return false;
  // eslint-disable-next-line no-unreachable
  const now = Date.now();
  const pixelsSinceLastSave = state.currentPaintedPixels - state._lastSavePixelCount;
  const timeSinceLastSave = now - state._lastSaveTime;

  return !state._saveInProgress && pixelsSinceLastSave >= 25 && timeSinceLastSave >= 30000;
}

export async function performSmartSave() {
  if (!shouldAutoSave()) return false;

  state.update({
    _saveInProgress: true,
  });
  const success = await saveProgress();

  if (success) {
    state.update({
      _lastSavePixelCount: state.currentPaintedPixels,
      _lastSaveTime: Date.now(),
    });
    console.log(`💾 Auto-saved at ${state.currentPaintedPixels} pixels`);
  }
  state.update({
    _saveInProgress: false,
  });
  return success;
}
