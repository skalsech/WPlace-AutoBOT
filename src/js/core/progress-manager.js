import { state } from './state.js';
import { loadFromStorage, saveToStorage } from './storage.js';
import { createFileDownloader, createFileUploader } from '../utils/files.js';
import { ImageProcessor } from './image-processor.js';
import {
  migrateProgressToV2,
  migrateProgressToV21,
  migrateProgressToV22,
  migrateProgressToV23,
  migrateProgressToV24,
} from './migrations.js';

// todo refactor progress and progress related state part
export function buildProgressData() {
  return {
    timestamp: Date.now(),
    version: '2.4',
    state: {
      artTotalPixels: state.artTotalPixels,
      startPosition: state.startPosition,
      region: state.region,
    },
    imageData: state.imageData
      ? {
          width: state.imageData.width,
          height: state.imageData.height,
          pixels: Array.from(state.imageData.pixels),
          totalPixels: state.imageData.totalPixels,
        }
      : null,
  };
}

export function migrateProgress(saved) {
  if (!saved) return null;

  let data = saved;
  const ver = data.version;

  // If version is missing or ≤ 1.x → first migrate to v2
  if (!ver || ver === '1' || ver === '1.0' || ver === '1.1') {
    data = migrateProgressToV2(data);
  }

  if (data.version === '2' || data.version === '2.0') {
    data = migrateProgressToV21(data);
  }

  if (data.version === '2.1') {
    data = migrateProgressToV22(data);
  }

  if (data.version === '2.2') {
    data = migrateProgressToV23(data);
  }

  if (data.version === '2.3') {
    data = migrateProgressToV24(data);
  }

  return data;
}

export function saveProgress() {
  try {
    const progressData = buildProgressData(state);

    return saveToStorage('wplace-bot-progress', progressData);
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
}

export function loadProgress() {
  try {
    const savedData = loadFromStorage('wplace-bot-progress');
    if (!savedData) return null;
    const migrated = migrateProgress(savedData);

    if (migrated && migrated !== savedData) {
      saveToStorage('wplace-bot-progress', migrated);
    }
    return migrated;
  } catch (error) {
    console.error('Error loading progress:', error);
    return null;
  }
}

export function clearProgress() {
  try {
    localStorage.removeItem('wplace-bot-progress');
    // Also clear painted map from memory
    //state.paintedMap = null;
    state._lastSavePixelCount = 0;
    state._lastSaveTime = 0;

    console.log('📋 Progress and painted map cleared');
    return true;
  } catch (error) {
    console.error('Error clearing progress:', error);
    return false;
  }
}

export function restoreProgress(savedData) {
  try {
    const migrated = migrateProgress(savedData);
    Object.assign(state, migrated.state);

    if (migrated.imageData) {
      state.imageData = {
        ...migrated.imageData,
        pixels: new Uint8ClampedArray(migrated.imageData.pixels),
      };

      try {
        const canvas = document.createElement('canvas');
        canvas.width = state.imageData.width;
        canvas.height = state.imageData.height;
        const ctx = canvas.getContext('2d');
        const imageData = new ImageData(
          state.imageData.pixels,
          state.imageData.width,
          state.imageData.height
        );
        ctx.putImageData(imageData, 0, 0);
        const proc = new ImageProcessor('');
        proc.img = canvas;
        proc.canvas = canvas;
        proc.ctx = ctx;
        state.imageData.processor = proc;
        state.artColorFrequency = proc.countColors(!state.paintTransparentPixels);
      } catch (e) {
        console.warn('Could not rebuild processor from saved image data:', e);
      }
    }

    return true;
  } catch (error) {
    console.error('Error restoring progress:', error);
    return false;
  }
}

export function saveProgressToFile() {
  try {
    const progressData = buildProgressData();
    const filename = `wplace-bot-progress-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, '-')}.json`;
    createFileDownloader(JSON.stringify(progressData, null, 2), filename);
    return true;
  } catch (error) {
    console.error('Error saving to file:', error);
    return false;
  }
}

export async function loadProgressFromFile() {
  try {
    const data = await createFileUploader();
    if (!data || !data.state) {
      throw new Error('Invalid file format');
    }

    return restoreProgress(data);
  } catch (error) {
    console.error('Error loading from file:', error);
    throw error;
  }
}
