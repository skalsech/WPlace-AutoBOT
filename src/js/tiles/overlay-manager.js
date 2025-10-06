import { state } from '../core/state.js';
import { calculateTileRange, sleep } from '../utils/helpers.js';
import { isTransparentPixel } from '../utils/color-matching.js';
import { TileLoader } from './tile-loader.js';

class OverlayManager {
  constructor() {
    this.isEnabled = false;

    /** @type {{ region: {x: number, y: number} | null, pixel: {x: number, y: number} | null } | null} */
    this.startCoords = null;

    /** @type {ImageBitmap | null} */
    this.imageBitmap = null;

    /** @type {Map<string, ImageBitmap>}
     * Key "tileX,tileY"
     */
    this.chunkedTiles = new Map();

    /** @type {Map<string, ImageBitmap>}
     * Key "tileX,tileY"
     */
    this.originalTiles = new Map();

    /** @type {Map<string, {w: number, h: number, data: Uint8ClampedArray}>}
     * Key "tileX,tileY"
     */
    this.originalTilesData = new Map();

    /** @type {number} */
    this.tileSize = 1000;

    /** @type {Promise<any> | null} */
    this.processPromise = null;

    /** @type {string | null} */
    this.lastProcessedHash = null;

    /** @type {any} */
    this.workerPool = null;

    /**
     * @type {Map<string, {painted: number, required: number, wrong: number}>}
     * Key "tileX,tileY"
     */
    this.tileProgress = new Map();

    this.totalRequired = 0;
    this.totalPainted = 0;
    this.totalWrong = 0;
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    console.log(`Overlay ${this.isEnabled ? 'enabled' : 'disabled'}.`);
    return this.isEnabled;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  clear() {
    this.disable();
    this.imageBitmap = null;
    this.chunkedTiles.clear();
    this.originalTiles.clear();
    this.originalTilesData.clear();
    this.tileProgress.clear();
    this.lastProcessedHash = null;
    if (this.processPromise) {
      this.processPromise = null;
    }
  }

  async setImage(imageBitmap) {
    this.imageBitmap = imageBitmap;
    this.lastProcessedHash = null;
    this.tileProgress.clear();
    if (this.imageBitmap && this.startCoords) {
      await this.processImageIntoChunks();
    }
  }

  async setPosition(startPosition, region) {
    if (!startPosition || !region) {
      this.startCoords = null;
      this.chunkedTiles.clear();
      this.lastProcessedHash = null;
      return;
    }
    this.startCoords = { region, pixel: startPosition };
    this.lastProcessedHash = null; // Invalidate cache
    if (this.imageBitmap) {
      await this.processImageIntoChunks();
    }
  }

  // Generate hash for cache invalidation
  _generateProcessHash() {
    if (!this.imageBitmap || !this.startCoords) return null;
    const { width, height } = this.imageBitmap;
    const { x: px, y: py } = this.startCoords.pixel;
    const { x: rx, y: ry } = this.startCoords.region;
    return `${width}x${height}_${px},${py}_${rx},${ry}_${state.blueMarbleEnabled}_${state.overlayOpacity}`;
  }

  // --- OVERLAY UPDATE: Optimized chunking with caching and batch processing ---
  async processImageIntoChunks() {
    if (!this.imageBitmap || !this.startCoords) return;

    // Check if we're already processing to avoid duplicate work
    if (this.processPromise) {
      return this.processPromise;
    }

    // Check cache validity
    const currentHash = this._generateProcessHash();
    if (this.lastProcessedHash === currentHash && this.chunkedTiles.size > 0) {
      console.log(`📦 Using cached overlay chunks (${this.chunkedTiles.size} tiles)`);
      return;
    }

    // Start processing
    this.processPromise = this._doProcessImageIntoChunks();
    try {
      await this.processPromise;
      this.lastProcessedHash = currentHash;
    } finally {
      this.processPromise = null;
    }
  }

  async _doProcessImageIntoChunks() {
    const startTime = performance.now();
    this.chunkedTiles.clear();

    const { width: imageWidth, height: imageHeight } = this.imageBitmap;
    const { x: startPixelX, y: startPixelY } = this.startCoords.pixel;
    const { x: startRegionX, y: startRegionY } = this.startCoords.region;

    const { startTileX, startTileY, endTileX, endTileY } = calculateTileRange(
      startRegionX,
      startRegionY,
      startPixelX,
      startPixelY,
      imageWidth,
      imageHeight,
      this.tileSize
    );

    const totalTiles = (endTileX - startTileX + 1) * (endTileY - startTileY + 1);
    console.log(`🔄 Processing ${totalTiles} overlay tiles...`);

    // Process tiles in batches to avoid blocking the main thread
    const batchSize = 4; // Process 4 tiles at a time
    const tilesToProcess = [];

    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        tilesToProcess.push({ tx, ty });
      }
    }

    // Process tiles in batches with yielding
    for (let i = 0; i < tilesToProcess.length; i += batchSize) {
      const batch = tilesToProcess.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async ({ tx, ty }) => {
          const tileKey = `${tx},${ty}`;
          const chunkBitmap = await this._processTile(
            tx,
            ty,
            imageWidth,
            imageHeight,
            startPixelX,
            startPixelY,
            startRegionX,
            startRegionY
          );
          if (chunkBitmap) {
            this.chunkedTiles.set(tileKey, chunkBitmap);
          }
        })
      );

      // Yield control to prevent blocking
      if (i + batchSize < tilesToProcess.length) {
        await sleep(0);
      }
    }

    const processingTime = performance.now() - startTime;
    console.log(
      `✅ Overlay processed ${this.chunkedTiles.size} tiles in ${Math.round(processingTime)}ms`
    );
  }

  async _processTile(
    tx,
    ty,
    imageWidth,
    imageHeight,
    startPixelX,
    startPixelY,
    startRegionX,
    startRegionY
  ) {
    const tileKey = `${tx},${ty}`;

    // Calculate the portion of the image that overlaps with this tile
    const imgStartX = (tx - startRegionX) * this.tileSize - startPixelX;
    const imgStartY = (ty - startRegionY) * this.tileSize - startPixelY;

    // Crop coordinates within the source image
    const sX = Math.max(0, imgStartX);
    const sY = Math.max(0, imgStartY);
    const sW = Math.min(imageWidth - sX, this.tileSize - (sX - imgStartX));
    const sH = Math.min(imageHeight - sY, this.tileSize - (sY - imgStartY));

    if (sW <= 0 || sH <= 0) return null;

    // Destination coordinates on the new chunk canvas
    const dX = Math.max(0, -imgStartX);
    const dY = Math.max(0, -imgStartY);

    const chunkCanvas = new OffscreenCanvas(this.tileSize, this.tileSize);
    const chunkCtx = chunkCanvas.getContext('2d');
    chunkCtx.imageSmoothingEnabled = false;

    chunkCtx.drawImage(this.imageBitmap, sX, sY, sW, sH, dX, dY, sW, sH);

    // --- OPTIMIZED: Blue marble effect with faster pixel manipulation ---
    if (state.blueMarbleEnabled) {
      const imageData = chunkCtx.getImageData(dX, dY, sW, sH);
      const data = imageData.data;

      // Faster pixel manipulation using typed arrays
      for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = i / 4;
        const pixelY = Math.floor(pixelIndex / sW);
        const pixelX = pixelIndex % sW;

        if ((pixelX + pixelY) % 2 === 0 && data[i + 3] > 0) {
          data[i + 3] = 0; // Set alpha to 0
        }
      }

      chunkCtx.putImageData(imageData, dX, dY);
    }

    return chunkCanvas.transferToImageBitmap();
  }

  async processAndRespondToTileRequest(eventData) {
    const { endpoint, blobID, blobData } = eventData;

    let finalBlob = blobData;

    if (this.isEnabled && this.chunkedTiles.size > 0) {
      const tileMatch = endpoint.match(/(\d+)\/(\d+)\.png/);
      if (tileMatch) {
        const tileX = parseInt(tileMatch[1], 10);
        const tileY = parseInt(tileMatch[2], 10);
        const tileKey = `${tileX},${tileY}`;

        const chunkBitmap = this.chunkedTiles.get(tileKey);
        // Also store the original tile bitmap for later pixel color checks
        try {
          const originalBitmap = await createImageBitmap(blobData);
          this.originalTiles.set(tileKey, originalBitmap);
          // Cache full ImageData for fast pixel access (avoid repeated drawImage/getImageData)
          try {
            let canvas, ctx;
            if (typeof OffscreenCanvas !== 'undefined') {
              canvas = new OffscreenCanvas(originalBitmap.width, originalBitmap.height);
              ctx = canvas.getContext('2d');
            } else {
              canvas = document.createElement('canvas');
              canvas.width = originalBitmap.width;
              canvas.height = originalBitmap.height;
              ctx = canvas.getContext('2d');
            }
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(originalBitmap, 0, 0);
            const imgData = ctx.getImageData(0, 0, originalBitmap.width, originalBitmap.height);
            // Store typed array copy to avoid retaining large canvas
            this.originalTilesData.set(tileKey, {
              w: originalBitmap.width,
              h: originalBitmap.height,
              data: new Uint8ClampedArray(imgData.data),
            });

            await this._analyzeTileProgress(tileKey);
          } catch (e) {
            // If ImageData extraction fails, still keep the bitmap as fallback
            console.warn('OverlayManager: could not cache ImageData for', tileKey, e);
          }
        } catch (e) {
          console.warn('OverlayManager: could not create original bitmap for', tileKey, e);
        }
        if (chunkBitmap) {
          try {
            // Use faster compositing for better performance
            finalBlob = await this._compositeTileOptimized(blobData, chunkBitmap);
          } catch (e) {
            console.error('Error compositing overlay:', e);
            // Fallback to original tile on error
            finalBlob = blobData;
          }
        }
      }
    }

    // Send the (possibly modified) blob back to the injected script
    window.postMessage(
      {
        source: 'auto-image-overlay',
        blobID,
        blobData: finalBlob,
      },
      '*'
    );
  }

  // Returns [r,g,b,a] for a pixel inside a region tile (tileX, tileY are region coords)
  async getTilePixelColor(tileX, tileY, pixelX, pixelY) {
    const tileKey = `${tileX},${tileY}`;

    // 1. Prefer cached ImageData if available
    const cached = this.originalTilesData.get(tileKey);
    if (cached && cached.data && cached.w > 0 && cached.h > 0) {
      const x = Math.max(0, Math.min(cached.w - 1, pixelX));
      const y = Math.max(0, Math.min(cached.h - 1, pixelY));
      const idx = (y * cached.w + x) * 4;
      const pixelData = cached.data;
      const r = pixelData[idx];
      const g = pixelData[idx + 1];
      const b = pixelData[idx + 2];
      const a = pixelData[idx + 3];

      return [r, g, b, a];
    }

    // 2. Fallback: use bitmap, with retry
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const bitmap = this.originalTiles.get(tileKey);
      if (!bitmap) {
        if (attempt === maxRetries) {
          console.warn('OverlayManager: no bitmap for', tileKey, 'after', maxRetries, 'attempts');
        } else {
          await sleep(50 * attempt); // exponential delay
        }
        continue;
      }

      try {
        let canvas, ctx;
        if (typeof OffscreenCanvas !== 'undefined') {
          canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
          ctx = canvas.getContext('2d');
        } else {
          canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          ctx = canvas.getContext('2d');
        }
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(bitmap, 0, 0);

        const x = Math.max(0, Math.min(bitmap.width - 1, pixelX));
        const y = Math.max(0, Math.min(bitmap.height - 1, pixelY));
        const data = ctx.getImageData(x, y, 1, 1).data;
        const a = data[3];

        if (!state.paintTransparentPixels && isTransparentPixel(a)) {
          if (window._overlayDebug)
            console.debug('OverlayManager: pixel transparent (fallback)', tileKey, x, y, a);
          return null;
        }

        return [data[0], data[1], data[2], a];
      } catch (e) {
        console.warn('OverlayManager: failed to read pixel (attempt', attempt, ')', tileKey, e);
        if (attempt < maxRetries) {
          await sleep(50 * attempt);
        } else {
          console.error(
            'OverlayManager: failed to read pixel after',
            maxRetries,
            'attempts',
            tileKey
          );
        }
      }
    }

    // 3. If everything fails — you can return null or [0,0,0,0]
    // Prefer null — to avoid misleading
    return null;
  }

  /**
   * Analyze a single tile's progress by comparing template data with actual tile data.
   * Updates this.tileProgress for the given tileKey.
   * @param {string} tileKey - Key "tileX,tileY" of the tile to analyze.
   */
  async _analyzeTileProgress(tileKey) {
    if (!this.imageBitmap || !this.startCoords) {
      console.warn(`[OverlayManager] Cannot analyze progress: image or startCoords missing.`);
      return;
    }

    const [tileX, tileY] = tileKey.split(',').map(Number);
    const { x: startRegionX, y: startRegionY } = this.startCoords.region;
    const { x: startPixelX, y: startPixelY } = this.startCoords.pixel;

    // Compute template area inside this tile
    const imgStartX = (tileX - startRegionX) * this.tileSize - startPixelX;
    const imgStartY = (tileY - startRegionY) * this.tileSize - startPixelY;

    const sX = Math.max(0, imgStartX);
    const sY = Math.max(0, imgStartY);
    const sW = Math.min(this.imageBitmap.width - sX, this.tileSize - (sX - imgStartX));
    const sH = Math.min(this.imageBitmap.height - sY, this.tileSize - (sY - imgStartY));

    if (sW <= 0 || sH <= 0) {
      // Tile does not intersect with template, clear progress
      this.tileProgress.delete(tileKey);
      return;
    }

    // Draw template section onto offscreen canvas
    const tempCanvas = new OffscreenCanvas(this.tileSize, this.tileSize);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.drawImage(this.imageBitmap, sX, sY, sW, sH, 0, 0, sW, sH);

    const templateData = tempCtx.getImageData(0, 0, sW, sH).data;

    // Get original tile data from cache
    const tileData = this.originalTilesData.get(tileKey);
    if (!tileData) {
      console.warn(`[OverlayManager] No cached ImageData for tile ${tileKey}.`);
      this.tileProgress.delete(tileKey);
      return;
    }

    const actualData = tileData.data;
    const actualWidth = tileData.w;
    const actualHeight = tileData.h;

    let painted = 0;
    let required = 0;
    let wrong = 0;

    // Offset inside tile where template starts
    const dX = Math.max(0, -imgStartX);
    const dY = Math.max(0, -imgStartY);

    for (let ty = 0; ty < sH; ty++) {
      for (let tx = 0; tx < sW; tx++) {
        const templateIdx = (ty * sW + tx) * 4;
        const tr = templateData[templateIdx];
        const tg = templateData[templateIdx + 1];
        const tb = templateData[templateIdx + 2];
        const ta = templateData[templateIdx + 3];

        if (ta < 64) continue; // Skip transparent template pixels

        required++;

        const actualTx = dX + tx;
        const actualTy = dY + ty;

        if (actualTx >= actualWidth || actualTy >= actualHeight) continue;

        const actualIdx = (actualTy * actualWidth + actualTx) * 4;
        const ar = actualData[actualIdx];
        const ag = actualData[actualIdx + 1];
        const ab = actualData[actualIdx + 2];
        const aa = actualData[actualIdx + 3];

        // Compare colors
        if (ar === tr && ag === tg && ab === tb && aa === ta) {
          painted++;
        } else if (aa > 0) {
          wrong++;
        }
        // Transparent actual pixels are ignored
      }
    }

    this.tileProgress.set(tileKey, { painted, required, wrong });
    state.localPaintedOffset = 0;

    console.debug(
      `[OverlayManager] Analyzed tile ${tileKey}: painted=${painted}, required=${required}, wrong=${wrong}`
    );
  }

  async _compositeTileOptimized(originalBlob, overlayBitmap) {
    const originalBitmap = await createImageBitmap(originalBlob);
    const canvas = new OffscreenCanvas(originalBitmap.width, originalBitmap.height);
    const ctx = canvas.getContext('2d');

    // Disable antialiasing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;

    // Draw original tile first
    ctx.drawImage(originalBitmap, 0, 0);

    // Set opacity and draw overlay with optimized blend mode
    ctx.globalAlpha = state.overlayOpacity;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(overlayBitmap, 0, 0);

    // Use faster blob conversion with compression settings
    return await canvas.convertToBlob({
      type: 'image/png',
      quality: 0.95, // Slight compression for faster processing
    });
  }

  /**
   * Wait until all required tiles are loaded and cached
   * @param {number} timeoutMs
   * @param {number} [concurrency = 4]
   * @returns {Promise<boolean>} true if tiles are ready
   */
  async waitForTiles(timeoutMs = 10000, concurrency = 4) {
    if (!this.startCoords || !this.startCoords.region || !this.startCoords.pixel) {
      console.warn('OverlayManager: startCoords not set, cannot calculate tile range');
      return false;
    }
    if (!this.imageBitmap || !this.imageBitmap.width || !this.imageBitmap.height) {
      console.warn('OverlayManager: imageBitmap not set or invalid, cannot calculate tile range');
      return false;
    }

    const { x: startPixelX, y: startPixelY } = this.startCoords.pixel;
    const { x: startRegionX, y: startRegionY } = this.startCoords.region;
    const { width: imageWidth, height: imageHeight } = this.imageBitmap;

    const { startTileX, startTileY, endTileX, endTileY } = calculateTileRange(
      startRegionX,
      startRegionY,
      startPixelX,
      startPixelY,
      imageWidth,
      imageHeight,
      this.tileSize
    );

    const requiredTiles = [];
    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        requiredTiles.push({ x: tx, y: ty });
      }
    }

    if (requiredTiles.length === 0) return true;

    const tileLoader = new TileLoader(this);
    const results = await tileLoader.loadTilesBatch(requiredTiles, concurrency);
    const failed = results.filter((r) => !r.result.success);

    if (failed.length > 0) {
      console.warn(`❌ Some tiles failed to load:`, failed);
    }

    const requiredTileKeys = requiredTiles.map((t) => `${t.x},${t.y}`);
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      if (state.stopFlag) {
        console.log('waitForTiles: stopped by user');
        return false;
      }

      const missing = requiredTileKeys.filter((key) => !this.originalTiles.has(key));
      if (missing.length === 0) {
        console.log(`✅ All ${requiredTiles.length} required tiles are loaded and cached`);
        return true;
      }

      await sleep(100);
    }

    console.warn(`❌ Timeout waiting for tiles: ${requiredTileKeys.length} required, 
      ${requiredTileKeys.filter((k) => this.originalTiles.has(k)).length} loaded`);
    return false;
  }

  /**
   * Calculates overall progress statistics based on cached tile data.
   * @returns {Object} { painted: number, required: number, wrong: number }
   */
  getOverallProgress() {
    let totalPainted = 0;
    let totalRequired = 0;
    let totalWrong = 0;

    for (const stats of this.tileProgress.values()) {
      totalPainted += stats.painted;
      totalRequired += stats.required;
      totalWrong += stats.wrong;
    }

    this.totalPainted = totalPainted;
    this.totalRequired = totalRequired;
    this.totalWrong = totalWrong;

    return {
      painted: totalPainted,
      required: totalRequired,
      wrong: totalWrong,
    };
  }

  getTileProgress(tileKey) {
    return this.tileProgress.get(tileKey) || { painted: 0, required: 0, wrong: 0 };
  }
}

export async function restoreOverlayFromData() {
  if (!state.imageLoaded || !state.imageLoaded || !state.startPosition || !state.region) {
    return false;
  }

  try {
    const { width, height, pixels } = state.imageData;

    if (!pixels || !(pixels instanceof Uint8ClampedArray)) {
      console.error('Invalid pixel data: expected Uint8ClampedArray');
      return false;
    }

    if (width <= 0 || height <= 0) {
      console.error('Invalid image dimensions:', { width, height });
      return false;
    }

    if (pixels.length !== width * height * 4) {
      console.error('Pixel data length mismatch:', {
        expected: width * height * 4,
        actual: pixels.length,
      });
      return false;
    }

    const imageData = new ImageData(pixels, width, height);
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { willReadFrequently: false });

    if (!ctx) {
      console.error('Could not get 2D context from OffscreenCanvas');
      return false;
    }

    ctx.putImageData(imageData, 0, 0);
    const imageBitmap = await canvas.transferToImageBitmap();

    // Set up overlay with restored data
    await overlayManager.setImage(imageBitmap);
    await overlayManager.setPosition(state.startPosition, state.region);
    overlayManager.enable();

    // Update overlay button state
    const toggleOverlayBtn = document.getElementById('toggleOverlayBtn');
    if (toggleOverlayBtn) {
      toggleOverlayBtn.disabled = false;
      toggleOverlayBtn.classList.add('active');
    }

    console.log('Overlay restored from data');
    return true;
  } catch (error) {
    console.error('Failed to restore overlay from data:', error);
    return false;
  }
}

export const overlayManager = new OverlayManager();
