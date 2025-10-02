import { state } from './state.js';

/**
 * @typedef {Object} UserData
 * @property {number} id - User ID
 * @property {string} name - User display name
 * @property {string} country - Country code (e.g., "RU")
 * @property {number} level - User level
 * @property {number} droplets - Number of droplets
 * @property {number} extraColorsBitmap - Bitmap of extra colors
 * @property {number} equippedFlag - Equipped flag ID
 * @property {number} pixelsPainted - Total pixels painted
 * @property {boolean} showLastPixel - Whether to show last pixel
 * @property {boolean} banned - Is user banned
 * @property {boolean} isCustomer - Is user a paying customer
 * @property {boolean} needsPhoneVerification - Requires phone verification
 * @property {string} picture - Profile picture URL
 * @property {string} discord - Discord username
 * @property {string} discordId - Discord user ID
 * @property {string} flagsBitmap - Flags bitmap string
 * @property {number} maxFavoriteLocations - Max allowed favorite locations
 * @property {Array<{id: number, name: string, latitude: number, longitude: number}>} favoriteLocations - List of favorite locations
 * @property {Object} experiments - Experiment flags and variants
 * @property {Object} charges - Charge limits and cooldown
 * @property {number} charges.count - Current charge count
 * @property {number} charges.max - Max charge limit
 * @property {number} charges.cooldownMs - Cooldown in milliseconds
 * @property {string} timeoutUntil - ISO timestamp of timeout
 * @property {string} allianceId - Alliance ID
 * @property {string} allianceRole - Role in alliance (e.g., "member")
 */

class WPlaceService {
  constructor() {
    this.cache = null;
    this.cacheTimestamp = 0;
    this.minUpdateInterval = 60_000;
    this.maxUpdateInterval = 90_000;
  }

  _generateRandomTTL() {
    return (
      this.minUpdateInterval + Math.random() * (this.maxUpdateInterval - this.minUpdateInterval)
    );
  }

  /**
   * Fetches user data from the server or returns cached data based on TTL.
   *
   * This method implements a randomized time-to-live (TTL) caching strategy:
   * - On first call or when the cache expires, it makes a fresh request to `/me`.
   * - If the cache is still valid (within the randomized TTL window), it returns the cached data.
   * - The TTL is randomly generated between `minUpdateInterval` and `maxUpdateInterval` (60s–90s).
   *
   * The returned object includes a `fromCache` flag to distinguish between
   * fresh server responses and cached responses. This allows calling code
   * (e.g., `updateStats`) to decide whether to update the local state (like `startTime`)
   * based on the source of the data.
   *
   * @returns {Promise<{ data: UserData, fromCache: boolean }>}
   *   - `data`: The parsed user data object from `/me` (same shape as API response).
   *   - `fromCache`: `true` if data was served from the internal cache (not fetched from server).
   *                  `false` if a fresh network request was made.
   *
   * @example
   * const result = await wplaceService.getUserData();
   * if (!result.fromCache) {
   *   // Update local state (e.g., startTime) because this is a fresh server snapshot
   *   state.fullChargeData = {
   *     current: result.data.charges.count,
   *     max: result.data.charges.max,
   *     cooldownMs: result.data.charges.cooldownMs,
   *     startTime: Date.now(), // ← Only update here!
   *     spentSinceShot: 0
   *   };
   * }
   * // Use result.data for display or other logic regardless of source
   */
  async getUserData() {
    const now = Date.now();

    if (!this.cache) {
      return { data: await this.fetchAndCache(), fromCache: false };
    }

    const randomThreshold = this._generateRandomTTL();

    if (now - this.cacheTimestamp >= randomThreshold) {
      return { data: await this.fetchAndCache(), fromCache: false };
    }

    return { data: this.cache, fromCache: true };
  }

  async fetchAndCache() {
    try {
      const res = await fetch('https://backend.wplace.live/me', {
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      this.cache = data;
      this.cacheTimestamp = Date.now();

      return data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  }

  invalidateCache() {
    this.cache = null;
    this.cacheTimestamp = 0;
    console.log('WPlaceService cache invalidated manually');
  }

  getCharges() {
    return this.getUserData().then((result) => ({
      count: result.data.charges?.count ?? 0,
      max: result.data.charges?.max ?? 1,
      cooldown: result.data.charges?.cooldownMs ?? state.cooldown,
      fromCache: result.fromCache,
    }));
  }

  getDroplets() {
    return this.getUserData().then((result) => ({
      value: result.data.droplets ?? 0,
      fromCache: result.fromCache,
    }));
  }

  getExtraColorsBitmap() {
    return this.getUserData().then((result) => ({
      value: result.data.extraColorsBitmap ?? 0,
      fromCache: result.fromCache,
    }));
  }

  getEquippedFlag() {
    return this.getUserData().then((result) => ({
      value: result.data.equippedFlag ?? 0,
      fromCache: result.fromCache,
    }));
  }

  getCountry() {
    return this.getUserData().then((result) => ({
      value: result.data.country ?? '',
      fromCache: result.fromCache,
    }));
  }

  getName() {
    return this.getUserData().then((result) => ({
      value: result.data.name ?? '',
      fromCache: result.fromCache,
    }));
  }

  getLevel() {
    return this.getUserData().then((result) => ({
      value: result.data.level ?? 0,
      fromCache: result.fromCache,
    }));
  }

  getTimeoutUntil() {
    return this.getUserData().then((result) => ({
      value: result.data.timeoutUntil ?? '1970-01-01T00:00:00Z',
      fromCache: result.fromCache,
    }));
  }

  getAll() {
    return this.getUserData().then((result) => ({
      data: result.data,
      fromCache: result.fromCache,
    }));
  }
}

export const wplaceService = new WPlaceService();
