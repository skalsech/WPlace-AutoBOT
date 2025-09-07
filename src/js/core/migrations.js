import { CONFIG } from './config.js';
import { packPaintedMapToBase64 } from '../utils/data-packing.js';

export function migrateProgressToV2(saved) {
  if (!saved) return saved;
  const isV1 =
    !saved.version || saved.version === '1' || saved.version === '1.0' || saved.version === '1.1';
  if (!isV1) return saved;

  try {
    const migrated = { ...saved };
    const width = migrated.imageData?.width;
    const height = migrated.imageData?.height;
    if (migrated.paintedMap && width && height) {
      const data = packPaintedMapToBase64(migrated.paintedMap, width, height);
      migrated.paintedMapPacked = { width, height, data };
    }
    delete migrated.paintedMap;
    migrated.version = '2';
    return migrated;
  } catch (e) {
    console.warn('Migration to v2 failed, using original data:', e);
    return saved;
  }
}
export function migrateProgressToV21(saved) {
  if (!saved) return saved;
  if (saved.version === '2.1') return saved;
  const isV2 = saved.version === '2' || saved.version === '2.0';
  const isV1 =
    !saved.version || saved.version === '1' || saved.version === '1.0' || saved.version === '1.1';
  if (!isV2 && !isV1) return saved; // save this for future
  try {
    const migrated = { ...saved };
    // First migrate to v2 if needed
    if (isV1) {
      const width = migrated.imageData?.width;
      const height = migrated.imageData?.height;
      if (migrated.paintedMap && width && height) {
        const data = packPaintedMapToBase64(migrated.paintedMap, width, height);
        migrated.paintedMapPacked = { width, height, data };
      }
      delete migrated.paintedMap;
    }
    migrated.version = '2.1';
    return migrated;
  } catch (e) {
    console.warn('Migration to v2.1 failed, using original data:', e);
    return saved;
  }
}
export function migrateProgressToV22(data) {
  try {
    const migrated = { ...data };
    migrated.version = '2.2';

    // Add new fields with default values
    if (!migrated.state.coordinateMode) {
      migrated.state.coordinateMode = CONFIG.COORDINATE_MODE;
    }
    if (!migrated.state.coordinateDirection) {
      migrated.state.coordinateDirection = CONFIG.COORDINATE_DIRECTION;
    }
    if (!migrated.state.coordinateSnake) {
      migrated.state.coordinateSnake = CONFIG.COORDINATE_SNAKE;
    }
    if (!migrated.state.blockWidth) {
      migrated.state.blockWidth = CONFIG.COORDINATE_BLOCK_WIDTH;
    }
    if (!migrated.state.blockHeight) {
      migrated.state.blockHeight = CONFIG.COORDINATE_BLOCK_HEIGHT;
    }

    return migrated;
  } catch (e) {
    console.warn('Migration to v2.2 failed, using original data:', e);
    return data;
  }
}
export function migrateProgressToV23(data) {
  try {
    const migrated = { ...data };
    migrated.version = '2.3';

    if (migrated.state) {
      delete migrated.state.coordinateMode;
      delete migrated.state.coordinateDirection;
      delete migrated.state.coordinateSnake;
      delete migrated.state.blockWidth;
      delete migrated.state.blockHeight;
      delete migrated.state.paintedMapPacked;
      delete migrated.state.lastPosition;
      delete migrated.state.colorsChecked;
      delete migrated.state.imageLoaded;

      if (migrated.state.totalPixels != null) {
        migrated.state.artTotalPixels = migrated.state.totalPixels;
        delete migrated.state.totalPixels;
      }
      if (migrated.state.paintedPixels != null) {
        migrated.state.userPaintedPixels = migrated.state.paintedPixels;
        delete migrated.state.paintedPixels;
      }
    }

    return migrated;
  } catch (e) {
    console.warn('Migration to v2.3 failed, using original data:', e);
    return data;
  }
}
