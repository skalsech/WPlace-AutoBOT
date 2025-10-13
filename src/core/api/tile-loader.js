export class TileLoader {
  constructor(overlayManager) {
    this.overlayManager = overlayManager;
    this.baseTileUrl = 'https://backend.wplace.live/files/s0/tiles';
    /**
     * @type {Map<string, AbortController>}
     * Key "tileX,tileY" - Value AbortController
     */
    this.activeRequests = new Map();
    /**
     * @type {Map<string, number>}
     * Key "tileX,tileY" - Value timestamp
     */
    this.recentlyRequested = new Map();
    this.requestCacheTimeout = 5000;
  }

  isRecentlyRequested(tileKey) {
    const lastTime = this.recentlyRequested.get(tileKey);
    return lastTime && Date.now() - lastTime < this.requestCacheTimeout;
  }

  markAsRequested(tileKey) {
    this.recentlyRequested.set(tileKey, Date.now());
    setTimeout(() => {
      if (this.recentlyRequested.get(tileKey) === Date.now()) {
        this.recentlyRequested.delete(tileKey);
      }
    }, this.requestCacheTimeout);
  }

  /**
   * Loads a tile and updates the overlay cache
   * @param {number} tileX
   * @param {number} tileY
   * @param {AbortSignal} [signal]
   * @returns {Promise<{success: boolean, skipped?: boolean, error?: string}>}
   */
  async loadTile(tileX, tileY, signal = null) {
    const tileKey = `${tileX},${tileY}`;

    // Check if the tile was requested recently
    if (this.isRecentlyRequested(tileKey)) {
      return { success: true, skipped: true, reason: 'Recently requested' };
    }

    // Abort previous active request
    if (this.activeRequests.has(tileKey)) {
      this.activeRequests.get(tileKey).abort();
    }

    const controller = new AbortController();
    this.activeRequests.set(tileKey, controller);

    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const url = `${this.baseTileUrl}/${tileX}/${tileY}.png`;
      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'reload',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // fetch interceptor will:
      // - handle via processAndRespondToTileRequest
      // - apply overlay if enabled
      // - update cache and progress
      // - return the modified tile to the map

      this.markAsRequested(tileKey);

      return { success: true };
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request aborted' };
      }
      return { success: false, error: error.message };
    } finally {
      this.activeRequests.delete(tileKey);
    }
  }

  /**
   * Batch loads tiles
   * @param {Array<{x: number, y: number}>} tiles
   * @param {number} [concurrency = 4]
   * @returns {Promise<Array<{tile: {x, y}, result: {success: boolean, skipped?: boolean, error?: string}}>>}
   */
  async loadTilesBatch(tiles, concurrency = 4) {
    const results = [];
    const queue = [...tiles];

    while (queue.length > 0) {
      const batch = queue.splice(0, concurrency);
      const promises = batch.map(async (tile) => {
        const result = await this.loadTile(tile.x, tile.y);
        return { tile, result };
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Cancels all active requests
   */
  cancelAll() {
    for (const controller of this.activeRequests.values()) {
      controller.abort();
    }
    this.activeRequests.clear();
  }
}
