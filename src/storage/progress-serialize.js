import { state } from '../core/state.js';
import { ImageProcessor } from '../core/system/image-processor.js';
import {
  migrateProgressToV2,
  migrateProgressToV21,
  migrateProgressToV22,
  migrateProgressToV23,
  migrateProgressToV24,
} from './migrations.js';
import { setupStartPositionButton } from '../ui/dialogs/start-position/setup-listeners.js';

/**
 * @returns {
 * {
 *  timestamp:number,
 *  version:string,
 *  state:{
 *      artTotalPixels:number,
 *      startPosition:{x: number, y: number} | null,
 *      region:{x: number, y: number} | null,
 *      filteredColorIds: Set<number>
 *  },
 *  imageData: null | {
 *      width:number,
 *      height:number,
 *      totalPixels:number,
 *      pixels:Uint8ClampedArray
 *   }
 *  }
 * }
 */
export function buildProgressData() {
  return {
    timestamp: Date.now(),
    version: '2.4',
    state: {
      artTotalPixels: state.artTotalPixels,
      startPosition: state.startPosition,
      region: state.region,
      filteredColorIds: state.filteredColorIds,
    },
    imageData: state.imageLoaded
      ? {
          width: state.imageData.width,
          height: state.imageData.height,
          totalPixels: state.imageData.totalPixels,
          pixels: state.imageData.pixels,
        }
      : null,
  };
}

export function migrateProgress(saved) {
  if (!saved) return null;

  let data = saved;
  const ver = data.version;

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
      } else if (pixels instanceof Uint8ClampedArray) {
        pixelArray = pixels;
      } else {
        throw new Error(
          'Invalid pixels format: expected ArrayBuffer or Array or Uint8ClampedArray'
        );
      }

      try {
        const proc = ImageProcessor.fromPixelData(width, height, pixelArray);

        state.update({
          imageData: {
            width,
            height,
            pixels: pixelArray,
            totalPixels,
            processor: proc,
          },
          artColorFrequency: proc.countColors(),
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
