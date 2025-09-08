import { state } from './state.js';
import { updateStats, updateUI } from '../ui/panel.js';
import { sendBatchWithRetry } from './pixel-batch.js';
import { performSmartSave } from './auto-save.js';
import { dynamicSleep, sleep } from '../utils/helpers.js';
import {
  findClosestPaletteColor,
  isTransparentPixel,
  isWhitePixel,
  resolveColor,
} from '../utils/color-matching.js';
import { generateCoordinates } from './coordinate-generator.js';
import { getMsToTargetCharges } from '../utils/painting-helpers.js';
import { NotificationManager } from './notification-manager.js';
import { saveProgress } from './progress-manager.js';
import { APP_CONSTANTS } from '../config/APP_CONSTANTS.js';
import { overlayManager } from '../overlay/overlay-manager.js';

async function flushPixelBatch(batch) {
  if (!batch || batch.pixels.length === 0) return true;

  const batchSize = batch.pixels.length;
  console.log(
    `📦 Sending batch with ${batchSize} pixels (region: ${batch.regionX},${batch.regionY})`
  );
  const success = await sendBatchWithRetry(batch.pixels, batch.regionX, batch.regionY);
  if (success) {
    state.userPaintedPixels += batchSize;
    state.fullChargeData = {
      ...state.fullChargeData,
      spentSinceShot: state.fullChargeData.spentSinceShot + batchSize,
    };
    await updateStats();
    updateUI('paintingProgress', 'default', {
      painted: state.userPaintedPixels,
      total: state.artTotalPixels,
    });
    performSmartSave();

    if (state.paintingSpeedLimitEnabled && state.paintingSpeed > 0 && batchSize > 0) {
      const delayPerPixel = 1000 / state.paintingSpeed;
      const totalDelay = Math.max(100, delayPerPixel * batchSize);
      await sleep(totalDelay);
    }
  } else {
    console.error(
      `❌ Batch for ${batch.regionX}, ${batch.regionY} with ${batch.pixels.length} pixels
         failed permanently after retries. Stopping painting.`
    );
    state.stopFlag = true;
    updateUI('paintingBatchFailed', 'error');
  }

  batch.pixels = [];
  return success;
}

export async function processImage() {
  const { width, height, pixels } = state.imageData;
  const { x: startX, y: startY } = state.startPosition;
  const { x: regionX, y: regionY } = state.region;

  // todo force load tiles
  const tilesReady = await overlayManager.waitForTiles(
    regionX,
    regionY,
    width,
    height,
    startX,
    startY,
    10000
  );

  if (!tilesReady) {
    updateUI('overlayTilesNotLoaded', 'error');
    state.stopFlag = true;
    return;
  }

  // key: `${regionX},${regionY}`, value: { regionX, regionY, pixels: [] }
  const pixelBatches = new Map();

  const skippedPixels = {
    transparent: 0,
    white: 0,
    alreadyPainted: 0,
    colorUnavailable: 0,
  };

  function checkPixelEligibility(x, y) {
    const idx = (y * width + x) * 4;
    const r = pixels[idx],
      g = pixels[idx + 1],
      b = pixels[idx + 2],
      a = pixels[idx + 3];

    if (!state.paintTransparentPixels && isTransparentPixel(a))
      return {
        eligible: false,
        reason: 'transparent',
      };
    if (!state.paintWhitePixels && isWhitePixel(r, g, b))
      return {
        eligible: false,
        reason: 'white',
      };

    // Template color, normalized/mapped to the nearest available / exact color in our palette,
    // depending on `state.paintUnavailablePixels`
    // Example: template requires "Slate", but we only have "Dark Gray" available
    //
    // If `state.paintUnavailablePixels` is enabled, null will be returned
    // because "Slate" was not found.
    // → mappedTargetColor = null.
    //
    // Else, the template "Slate" is mapped to the closest available color (e.g., "Dark Gray"),
    // and we proceed with painting using that mapped color.
    // → mappedTargetColor = Dark Gray.
    //
    // In this case, if the canvas pixel is already Slate (mapped to available Dark Gray),
    // we skip painting, since template and canvas both resolve to the same available color (Dark Gray).
    let mappedTargetColor;
    if (isWhitePixel(r, g, b)) {
      mappedTargetColor = APP_CONSTANTS.COLOR_MAP['5'];
    } else if (isTransparentPixel(a)) {
      mappedTargetColor = APP_CONSTANTS.COLOR_MAP['0'];
    } else {
      mappedTargetColor = resolveColor(
        findClosestPaletteColor(r, g, b, state.activeColorPalette),
        state.availableColors,
        !state.paintUnavailablePixels
      );

      // Technically, checking only `!mappedTargetColor.id` would be enough,
      // but combined with `state.paintUnavailablePixels` it makes the logic explicit:
      // we only skip when the template color cannot be mapped AND strict mode is on.
      if (!state.paintUnavailablePixels && !mappedTargetColor.id) {
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
    }

    return { eligible: true, r, g, b, a, mappedColorId: mappedTargetColor.id };
  }

  function skipPixel(reason, id, rgb, x, y) {
    if (reason !== 'transparent') {
      console.log(`Skipped pixel for ${reason} (id: ${id}, (${rgb.join(', ')})) at (${x}, ${y})`);
    }
    skippedPixels[reason]++;
  }

  try {
    const coords = generateCoordinates(
      width,
      height,
      state.coordinateMode,
      state.coordinateDirection,
      state.coordinateSnake,
      state.blockWidth,
      state.blockHeight
    );

    outerLoop: for (const [x, y] of coords) {
      if (state.stopFlag) {
        for (const [_, batch] of pixelBatches.entries()) {
          if (batch.pixels.length > 0) {
            console.log(`🎯 Sending last batch before user-stop`);
            await flushPixelBatch(batch);
          }
        }
        // noinspection UnnecessaryLabelOnBreakStatementJS
        break outerLoop;
      }

      const targetPixelInfo = checkPixelEligibility(x, y);
      let absX = startX + x;
      let absY = startY + y;

      let adderX = Math.floor(absX / 1000);
      let adderY = Math.floor(absY / 1000);
      let pixelX = absX % 1000;
      let pixelY = absY % 1000;

      // Template color ID, normalized/mapped to the nearest available color in our palette.
      // Example: template requires "Slate", but we only have "Dark Gray" available
      // → mappedTargetColorId = ID of Dark Gray.
      //
      // If `state.paintUnavailablePixels` is enabled, the painting would stop earlier
      // because "Slate" was not found (null returned).
      //
      // Else, the template "Slate" is mapped to the closest available color (e.g., "Dark Gray"),
      // and we proceed with painting using that mapped color.
      //
      // In this case, if the canvas pixel is already Slate (mapped to available Dark Gray),
      // we skip painting, since template and canvas both resolve to the same available color (Dark Gray).
      const targetMappedColorId = targetPixelInfo.mappedColorId;

      if (!targetPixelInfo.eligible) {
        skipPixel(
          targetPixelInfo.reason,
          targetMappedColorId,
          [targetPixelInfo.r, targetPixelInfo.g, targetPixelInfo.b],
          pixelX,
          pixelY
        );
        continue;
      }

      // console.log(`[DEBUG] Pixel at (${pixelX}, ${pixelY}) eligible: RGB=${targetPixelInfo.r}, ${targetPixelInfo.g}, ${targetPixelInfo.b},
      //  alpha=${targetPixelInfo.a}, mappedColorId=${targetMappedColorId}`);

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
        const tileKeyParts = [batch.regionX, batch.regionY];

        const tilePixelRGBA = await overlayManager.getTilePixelColor(
          tileKeyParts[0],
          tileKeyParts[1],
          pixelX,
          pixelY
        );

        if (tilePixelRGBA && Array.isArray(tilePixelRGBA)) {
          // Resolve the actual canvas pixel color to the closest available color.
          // (The raw canvas RGB [er, eg, eb] is mapped into state.availableColors)
          // so that comparison is consistent with targetMappedColorId.
          const mappedCanvasColor = resolveColor(tilePixelRGBA, state.availableColors);
          const isMatch = mappedCanvasColor.id === targetMappedColorId;
          if (isMatch) {
            skipPixel(
              'alreadyPainted',
              targetMappedColorId,
              [targetPixelInfo.r, targetPixelInfo.g, targetPixelInfo.b],
              pixelX,
              pixelY
            );
            continue;
          }
          console.debug(
            `[COMPARE] Pixel at 📍 (${pixelX}, ${pixelY}) in region (${
              regionX + adderX
            }, ${regionY + adderY})\n` +
              `  ├── Current color: rgb(${tilePixelRGBA.join(
                ', '
              )}) (id: ${mappedCanvasColor.id})\n` +
              `  ├── Target color:  rgb(${targetPixelInfo.r}, ${targetPixelInfo.g}, ${targetPixelInfo.b}, ${targetPixelInfo.a}) (id: ${targetMappedColorId})\n` +
              `  └── Status: ${isMatch ? '✅ Already painted → SKIP' : '🔴 Needs paint → PAINT'}\n`
          );
        }
      } catch (e) {
        console.error(`[DEBUG] Error checking existing pixel at (${pixelX}, ${pixelY}):`, e);
        updateUI('paintingPixelCheckFailed', 'error', { x: pixelX, y: pixelY });
        state.stopFlag = true;
        // noinspection UnnecessaryLabelOnBreakStatementJS
        break outerLoop;
      }

      batch.pixels.push({
        x: pixelX,
        y: pixelY,
        color: targetMappedColorId,
        localX: x,
        localY: y,
      });

      const maxBatchSize = calculateBatchSize();
      if (batch.pixels.length >= maxBatchSize) {
        const success = await flushPixelBatch(batch);
        if (!success) {
          // noinspection UnnecessaryLabelOnBreakStatementJS
          break outerLoop;
        }

        batch.pixels = [];
      }

      if (state.displayCharges < state.cooldownChargeThreshold && !state.stopFlag) {
        await dynamicSleep(() => {
          if (state.displayCharges >= state.cooldownChargeThreshold) {
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
  } finally {
    if (window._chargesInterval) clearInterval(window._chargesInterval);
    window._chargesInterval = null;
  }

  if (state.stopFlag) {
    // Save progress when stopped to preserve painted map
    saveProgress();
  } else {
    updateUI('paintingComplete', 'success', { count: state.userPaintedPixels });

    saveProgress();
    overlayManager.clear();
    const toggleOverlayBtn = document.getElementById('toggleOverlayBtn');
    if (toggleOverlayBtn) {
      toggleOverlayBtn.classList.remove('active');
      toggleOverlayBtn.disabled = true;
    }
  }

  // Log skip statistics
  console.log(`📊 Pixel Statistics:`);
  console.log(`   Painted: ${state.userPaintedPixels}`);
  console.log(`   Skipped - Transparent: ${skippedPixels.transparent}`);
  console.log(`   Skipped - White (disabled): ${skippedPixels.white}`);
  console.log(`   Skipped - Already painted: ${skippedPixels.alreadyPainted}`);
  console.log(`   Skipped - Color Unavailable: ${skippedPixels.colorUnavailable}`);
  console.log(
    `   Total processed: ${
      state.userPaintedPixels +
      skippedPixels.transparent +
      skippedPixels.white +
      skippedPixels.alreadyPainted +
      skippedPixels.colorUnavailable
    }`
  );

  updateStats();
}

// Helper function to calculate batch size based on mode
function calculateBatchSize() {
  let targetBatchSize;

  if (state.batchMode === 'random') {
    // Generate random batch size within the specified range
    const min = Math.max(1, state.randomBatchMin);
    const max = Math.max(min, state.randomBatchMax);
    targetBatchSize = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`🎲 Random batch size generated: ${targetBatchSize} (range: ${min}-${max})`);
  } else {
    // Normal mode - use the fixed paintingSpeed value
    targetBatchSize = state.paintingSpeed;
  }

  // Always limit by available charges
  const maxAllowed = state.displayCharges;
  const finalBatchSize = Math.min(targetBatchSize, maxAllowed);

  return finalBatchSize;
}
