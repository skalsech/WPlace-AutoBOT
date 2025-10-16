import { state } from '../state.js';
import { updateStats, updateUI } from '../../app/startup/create-ui.js';
import { sendBatchWithRetry } from './pixel-batch.js';
import { performSmartSave } from '../system/auto-save.js';
import { dynamicSleep } from '../../utils/helpers.js';
import {
  isTransparentPixel,
  isWhitePixel,
  resolveColor,
} from '../../utils/color-matching/color-matching.js';
import { generateCoordinates } from './coordinate-generator.js';
import { NotificationManager } from '../system/notification-manager.js';
import { overlayManager } from '../overlay/overlay-manager.js';
import { getMsToTargetCharges } from '../../utils/time.js';
import { wplaceService } from '../api/api-service.js';
import { saveProgress } from '../../storage/progress-service.js';

/**
 * @typedef {Object} PixelData
 * @property {number} x - Absolute X coordinate of the pixel, measured from the template origin (0,0).
 * @property {number} y - Absolute Y coordinate of the pixel, measured from the template origin (0,0).
 * @property {number} color - Mapped color ID of the pixel from template.
 * @property {number} localX - Local X coordinate within the region.
 * @property {number} localY - Local Y coordinate within the region.
 */

/**
 * @typedef {Object} PixelBatch
 * @property {number} regionX - Region X coordinate.
 * @property {number} regionY - Region Y coordinate.
 * @property {PixelData[]} pixels - List of pixels belonging to this region.
 */

/**
 * @param {PixelBatch} batch - The batch of pixels to flush.
 * @returns {Promise<boolean>} Resolves to true if the batch was flushed successfully.
 */
async function flushPixelBatch(batch) {
  if (!batch || batch.pixels.length === 0) return true;

  const batchSize = batch.pixels.length;
  const success = await sendBatchWithRetry(batch.pixels, batch.regionX, batch.regionY);
  if (success) {
    const ownsRegion = await wplaceService.ownsRegion(batch.regionX, batch.regionY);
    const chargesSpent = batchSize * (ownsRegion ? 0.9 : 1);
    let newFullChargeData = null;
    if (state.fullChargeData) {
      newFullChargeData = {
        ...state.fullChargeData,
        spentSinceShot: state.fullChargeData.spentSinceShot + chargesSpent,
      };
    }

    state.update({
      localPaintedOffset: state.localPaintedOffset + batchSize,
      fullChargeData: newFullChargeData,
    });

    await updateStats();
    await performSmartSave();
  } else {
    if (!state.stopFlag) {
      console.error(
        `❌ Batch for ${batch.regionX}, ${batch.regionY} with ${batch.pixels.length} pixels
         failed permanently after retries. Stopping painting.`
      );
      state.update({
        stopFlag: true,
      });
      updateUI('paintingBatchFailed', 'error');
    }
  }

  batch.pixels = [];
  return success;
}

export async function processImage() {
  const { width, height, pixels } = state.imageData;
  const { x: startX, y: startY } = state.startPosition;
  const { x: regionX, y: regionY } = state.region;

  // todo add option in settings ui to choose loud instant/silent delayed canvas update (instant cache persists no matter what)
  const tilesReady = await overlayManager.waitForTiles(false);

  if (!tilesReady) {
    updateUI('overlayTilesNotLoaded', 'error');
    state.update({
      stopFlag: true,
    });
    return;
  }

  /**
   * @type {Map<string, PixelBatch>}
   * Key - `${regionX},${regionY}`
   */
  const pixelBatches = new Map();

  let globalPixelBatchTotalCount = 0;
  let currentBatchSize = calculateBatchSize(state.batchMode);

  const skippedPixels = {
    transparent: 0,
    white: 0,
    alreadyPainted: 0,
    colorUnavailable: 0,
    colorFiltered: 0,
  };

  async function checkPixelEligibility(x, y, regionX, regionY, pixelX, pixelY) {
    const idx = (y * width + x) * 4;
    const r = pixels[idx],
      g = pixels[idx + 1],
      b = pixels[idx + 2],
      a = pixels[idx + 3];

    if (!state.paintTransparentPixels && isTransparentPixel(a, state.customTransparencyThreshold)) {
      return {
        eligible: false,
        reason: 'transparent',
      };
    }
    if (!state.paintWhitePixels && isWhitePixel(r, g, b, state.customWhiteThreshold)) {
      return {
        eligible: false,
        reason: 'white',
      };
    }

    /* 
     todo check to work with resize dialog because deprecated for readability and performance
      mappedTargetColor = resolveColor(
      findClosestColor(r, g, b, state.activeColorPalette),
      state.availableColors,
      !state.paintUnavailablePixels
      );
    */

    const mappedTargetColor = resolveColor(
      [r, g, b, a],
      state.availableColors,
      !state.paintUnavailablePixels
    );

    if (state.hasActiveColorFilter && state.filteredColorIds.has(mappedTargetColor.id)) {
      return {
        eligible: false,
        reason: 'colorFiltered',
        r,
        g,
        b,
        a,
        mappedColorId: mappedTargetColor.id,
      };
    }
    if (!state.availableColors.has(mappedTargetColor.id)) {
      return {
        eligible: false,
        reason: 'colorUnavailable',
        r,
        g,
        b,
        a,
        mappedColorId: mappedTargetColor.id,
      };
    }

    const tilePixelRGBA = await overlayManager.getTilePixelColor(regionX, regionY, pixelX, pixelY);

    if (!tilePixelRGBA) {
      throw new Error('Failed to get canvas pixel color');
    }
    const mappedCanvasColor = resolveColor(tilePixelRGBA, state.availableColors, true);
    const isMatch = mappedCanvasColor.id === mappedTargetColor.id;
    if (isMatch) {
      return {
        eligible: false,
        reason: 'alreadyPainted',
        r,
        g,
        b,
        a,
        mappedColorId: mappedTargetColor.id,
      };
    }

    return { eligible: true, r, g, b, a, mappedColorId: mappedTargetColor.id };
  }

  // eslint-disable-next-line no-unused-vars
  function skipPixel(reason, id, rgb, x, y) {
    /*if (reason === 'colorFiltered') {
      console.log(`Skipped pixel for ${reason} (id: ${id}, (${rgb.join(', ')})) at (${x}, ${y})`);
    }*/
    skippedPixels[reason]++;
  }

  try {
    const coords = generateCoordinates(
      width,
      height,
      pixels,
      state.coordinateMode,
      state.coordinateDirection,
      state.coordinateSnake,
      state.blockWidth,
      state.blockHeight,
      state.sortCoordinateByFrequency,
      state.artColorFrequency
    );
    const expected = width * height;
    if (coords.length !== expected) {
      const seen = new Set();
      const duplicates = [];
      for (const [x, y] of coords) {
        const key = `${x},${y}`;
        if (seen.has(key)) {
          if (duplicates.length < 10) duplicates.push(key);
        } else {
          seen.add(key);
        }
      }
      const uniqueCount = seen.size;
      const diff = coords.length - uniqueCount;

      console.warn(
        `[DIAG] Coordinate mismatch: expected=${expected}, actual=${coords.length}, duplicates=${diff}`,
        duplicates.length ? `first duplicates: ${duplicates.join(' | ')}` : ''
      );
    }
    outerLoop: for (const [x, y] of coords) {
      const absX = startX + x;
      const absY = startY + y;

      const adderX = Math.floor(absX / 1000);
      const adderY = Math.floor(absY / 1000);
      const pixelX = absX % 1000;
      const pixelY = absY % 1000;

      const key = `${regionX + adderX},${regionY + adderY}`;
      if (!pixelBatches.has(key)) {
        pixelBatches.set(key, {
          regionX: regionX + adderX,
          regionY: regionY + adderY,
          pixels: [],
        });
      }
      const batch = pixelBatches.get(key);

      try {
        const targetPixelInfo = await checkPixelEligibility(
          x,
          y,
          batch.regionX,
          batch.regionY,
          pixelX,
          pixelY
        );

        if (!targetPixelInfo.eligible) {
          skipPixel(
            targetPixelInfo.reason,
            targetPixelInfo.mappedColorId,
            [targetPixelInfo.r, targetPixelInfo.g, targetPixelInfo.b],
            pixelX,
            pixelY
          );
          continue;
        }

        batch.pixels.push({
          x: pixelX,
          y: pixelY,
          color: targetPixelInfo.mappedColorId,
          localX: x,
          localY: y,
        });
        globalPixelBatchTotalCount++;
      } catch (e) {
        console.error(`[DEBUG] Error checking existing pixel at (${pixelX}, ${pixelY}):`, e);
        updateUI('paintingPixelCheckFailed', 'error', { x: pixelX, y: pixelY });
        state.update({
          stopFlag: true,
        });
        // noinspection UnnecessaryLabelOnBreakStatementJS
        break outerLoop;
      }

      if (globalPixelBatchTotalCount >= currentBatchSize) {
        for (const b of pixelBatches.values()) {
          if (b.pixels.length > 0 && !state.stopFlag) {
            const success = await flushPixelBatch(b);

            if (!success || state.stopFlag) {
              // noinspection UnnecessaryLabelOnBreakStatementJS
              break outerLoop;
            }
            updateUI('paintingProgress', 'default', {
              painted: state.currentPaintedPixels,
              total: state.artTotalPixels,
            });
          }
        }

        globalPixelBatchTotalCount = 0;
        currentBatchSize = calculateBatchSize(state.batchMode);
      }

      if (state.preciseCurrentCharges < state.cooldownChargeThreshold && !state.stopFlag) {
        await dynamicSleep(() => {
          if (state.preciseCurrentCharges >= state.cooldownChargeThreshold) {
            NotificationManager.maybeNotifyChargesReached(true);
            return 0;
          }
          if (state.stopFlag) return 0;
          return getMsToTargetCharges(
            state.preciseCurrentCharges,
            state.cooldownChargeThreshold,
            state.cooldown
          );
        });
      }

      if (state.stopFlag) {
        // noinspection UnnecessaryLabelOnBreakStatementJS
        break outerLoop;
      }
    }

    for (const [key, batch] of pixelBatches.entries()) {
      if (batch.pixels.length > 0 && !state.stopFlag) {
        console.log(`🏁 Sending final batch`);
        const success = await flushPixelBatch(batch);

        if (!success) {
          console.warn(`⚠️ Final batch for ${key} failed with ${batch.pixels.length} pixels.`);
        }
      }
    }
  } catch (e) {
    state.update({
      stopFlag: true,
    });
    updateUI('paintingError', 'error');
    const err = e instanceof Error ? e : new Error(String(e));
    const groupStyle =
      'color: #d32f2f; font-weight: bold; background: #ffebee; padding: 2px 6px; border-radius: 3px;';

    console.groupCollapsed(`%cError: ${err.message}`, groupStyle);
    console.log('time:', new Date().toISOString());
    console.log('name:', err.name);
    console.log('message:', err.message);
    if (err.stack) console.log('stack:', err.stack);

    // useful context:
    // console.log('context:', { userId, input });
    console.groupEnd();
  }

  await saveProgress();
  if (state.stopFlag) {
    /* empty */
  } else {
    updateUI('paintingComplete', 'success', { count: state.currentPaintedPixels });

    overlayManager.disable();
    /*const toggleOverlayBtn = document.getElementById('toggleOverlayBtn');
    if (toggleOverlayBtn) {
      toggleOverlayBtn.classList.remove('active');
      toggleOverlayBtn.disabled = true;
    }*/
  }

  const groupStyle =
    'color: #5d4037; font-weight: bold; background: #efebe9; padding: 3px 8px; border-radius: 4px;';
  console.groupCollapsed(
    `%cSkipped Pixels Summary (not progress, only skipped reasons count)`,
    groupStyle
  );
  Object.entries(skippedPixels).forEach(([key, count]) => {
    console.log(`${key}: %c${count}`, 'font-weight: bold; color: #d2691e;');
  });
  console.groupEnd();
  await updateStats();
}

function calculateBatchSize(batchMode) {
  let targetBatchSize;

  if (batchMode === 'random') {
    const min = Math.max(1, state.randomBatchMin);
    const max = Math.max(min, state.randomBatchMax);
    targetBatchSize = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`🎲 Random batch size generated: ${targetBatchSize} (range: ${min}-${max})`);
  } else {
    targetBatchSize = state.paintingSpeed;
  }

  const maxAllowed = Math.floor(state.preciseCurrentCharges);
  return Math.min(targetBatchSize, maxAllowed);
}
