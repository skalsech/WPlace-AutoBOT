import { state } from '../core/state.js';
import { createFileDownloader, createFileUploader } from '../utils/files.js';
import { buildProgressData, migrateProgress, restoreProgress } from './progress-serialize.js';
import { clearAllProgress, loadProgressRecord, saveProgressRecord } from './progress-io.js';

const STORAGE_KEY = 'wplace-bot-progress';

export async function saveProgress() {
  const progressData = buildProgressData();
  return await saveProgressRecord(STORAGE_KEY, progressData);
}

export async function loadProgress() {
  const savedData = await loadProgressRecord(STORAGE_KEY);
  if (!savedData) return null;
  const migrated = migrateProgress(savedData);
  if (migrated && migrated !== savedData) {
    await saveProgressRecord(STORAGE_KEY, migrated);
  }
  return migrated;
}

export async function clearProgress() {
  const ok = await clearAllProgress();
  if (ok) {
    state.update({
      imageData: null,
      artColorFrequency: new Map(),
      _lastSavePixelCount: 0,
      _lastSaveTime: 0,
    });
  }
  return ok;
}

export function saveProgressToFile() {
  const progressData = buildProgressData();
  if (progressData.imageData) {
    progressData.imageData.pixels = Array.from(
      new Uint8ClampedArray(progressData.imageData.pixels)
    );
  }
  const filename = `wplace-bot-progress-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  createFileDownloader(JSON.stringify(progressData, null, 2), filename);
  return true;
}

export async function loadProgressFromFile() {
  const data = await createFileUploader();
  if (!data || !data.state) {
    throw new Error('Invalid file format');
  }
  if (data.imageData && Array.isArray(data.imageData.pixels)) {
    data.imageData.pixels = new Uint8ClampedArray(data.imageData.pixels).buffer;
  }
  return restoreProgress(data);
}
