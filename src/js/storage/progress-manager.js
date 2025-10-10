import { state } from '../core/state.js';
import { createFileDownloader, createFileUploader } from '../utils/files.js';
import { ImageProcessor } from '../core/image-processor.js';
import {
  migrateProgressToV2,
  migrateProgressToV21,
  migrateProgressToV22,
  migrateProgressToV23,
  migrateProgressToV24,
} from './migrations.js';
import { clearIndexDBStorage, loadFromIndexDB, saveToIndexDB } from './indexed-db-storage.js';
import { setupStartPositionButton } from '../ui/listeners/start-position-dialog.js';

export function buildProgressData() {
  return {
    timestamp: Date.now(),
    version: '2.4',
    state: {
      artTotalPixels: state.artTotalPixels,
      startPosition: state.startPosition,
      region: state.region,
    },
    imageData: state.imageLoaded
      ? {
          width: state.imageData.width,
          height: state.imageData.height,
          totalPixels: state.imageData.totalPixels,
          pixels: state.imageData.pixels.buffer,
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

export async function saveProgress() {
  try {
    const progressData = buildProgressData();
    return await saveToIndexDB('wplace-bot-progress', progressData);
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
}

export async function loadProgress() {
  try {
    const savedData = await loadFromIndexDB('wplace-bot-progress');
    if (!savedData) return null;
    const migrated = migrateProgress(savedData);

    if (migrated && migrated !== savedData) {
      await saveToIndexDB('wplace-bot-progress', migrated);
    }
    return migrated;
  } catch (error) {
    console.error('Error loading progress:', error);
    return null;
  }
}

export async function clearProgress() {
  try {
    await clearIndexDBStorage();

    localStorage.removeItem('wplace-bot-progress');

    state.imageData = null;
    state.artColorFrequency = new Map();
    state._lastSavePixelCount = 0;
    state._lastSaveTime = 0;
    state.paintedMap = null; // legacy

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
    if (!migrated) return false;

    Object.assign(state, migrated.state);

    if (migrated.imageData) {
      const { width, height, totalPixels, pixels } = migrated.imageData;

      let pixelArray;
      if (pixels instanceof ArrayBuffer) {
        pixelArray = new Uint8ClampedArray(pixels);
      } else if (Array.isArray(pixels)) {
        pixelArray = new Uint8ClampedArray(pixels);
      } else {
        throw new Error('Invalid pixels format: expected ArrayBuffer or Array');
      }

      try {
        const proc = ImageProcessor.fromPixelData(
          width,
          height,
          pixelArray,
          !state.paintTransparentPixels
        );

        state.update({
          imageData: {
            width,
            height,
            pixels: pixelArray,
            totalPixels,
            processor: proc,
          },
          artColorFrequency: proc.countColors(!state.paintTransparentPixels),
          artTotalPixels: totalPixels,
        });
      } catch (e) {
        console.warn('Could not rebuild processor from saved image data:', e);
      }
    }

    setupStartPositionButton();
    return true;
  } catch (error) {
    console.error('Error restoring progress:', error);
    return false;
  }
}

export function saveProgressToFile() {
  try {
    const progressData = buildProgressData();

    if (progressData.imageData) {
      progressData.imageData.pixels = Array.from(
        new Uint8ClampedArray(progressData.imageData.pixels)
      );
    }

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

    if (data.imageData && Array.isArray(data.imageData.pixels)) {
      data.imageData.pixels = new Uint8ClampedArray(data.imageData.pixels).buffer;
    }

    return restoreProgress(data);
  } catch (error) {
    console.error('Error loading from file:', error);
    throw error;
  }
}
