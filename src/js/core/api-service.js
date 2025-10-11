import { state } from './state.js';
import { decodeBase64ToBytes } from '../utils/helpers.js';
import { FlagsBitmap } from '../utils/flags.js';

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
 * @property {boolean} experiments["2025-09_discord_linking"].enabled - Whether Discord linking is enabled
 * @property {string} experiments["2025-09_pawtect"].variant - Variant of Pawtect experiment (e.g., "koala")
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
    /**
     * @private
     * @type {Map<string, boolean>}
     * @description Cache for region ownership results. Key: "regionX,regionY", Value: true/false
     */
    this._regionOwnershipCache = new Map();
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

  getFlagsBitmap() {
    return this.getUserData().then((result) => ({
      value: result.data.flagsBitmap ?? 'AA==',
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

  /**
   * Returns the raw experiments object from user data.
   * @returns {Promise<{ value: Object, fromCache: boolean }>}
   */
  getExperiments() {
    return this.getUserData().then((result) => ({
      value: result.data.experiments ?? {},
      fromCache: result.fromCache,
    }));
  }

  getAll() {
    return this.getUserData().then((result) => ({
      data: result.data,
      fromCache: result.fromCache,
    }));
  }

  /**
   * Checks if a region (regionX, regionY) belongs to a country owned by the current user.
   * Results are cached locally to avoid redundant network requests.
   * If the region was checked recently, returns the cached result without making a request.
   * @param {number} regionX - X-coordinate of the region (0-based grid index)
   * @param {number} regionY - Y-coordinate of the region (0-based grid index)
   * @returns {Promise<boolean>} - `true` if the current user owns the country of this region, `false` otherwise
   * @note Results are cached indefinitely until the cache reaches 100 entries (FIFO eviction).
   */
  async ownsRegion(regionX, regionY) {
    if (!Number.isInteger(regionX) || !Number.isInteger(regionY) || regionX < 0 || regionY < 0) {
      return false;
    }

    const key = `${regionX},${regionY}`;

    if (this._regionOwnershipCache.has(key)) {
      return this._regionOwnershipCache.get(key);
    }

    const result = await (async () => {
      const response = await fetch(
        `https://backend.wplace.live/s0/pixel/${regionX}/${regionY}?x=0&y=0`,
        { method: 'GET', credentials: 'omit' }
      );

      const data = await response.json();
      const countryId = data.region?.countryId;
      if (typeof countryId !== 'number') return false;

      const flagsBitmap = await this.getFlagsBitmap();
      const flags = new FlagsBitmap(decodeBase64ToBytes(flagsBitmap.value));
      return flags.get(countryId);
    })();

    this._regionOwnershipCache.set(key, result);

    if (this._regionOwnershipCache.size > 100) {
      const firstKey = this._regionOwnershipCache.keys().next().value;
      this._regionOwnershipCache.delete(firstKey);
    }

    return result;
  }

  /**
   * Returns the current Pawtect experiment variant (e.g., "koala").
   * Returns null if the experiment is not present or malformed.
   *
   * @returns {Promise<{ value: string | null, fromCache: boolean }>}
   *   - `value`: The variant string (e.g., "koala"), or `null` if unavailable
   *   - `fromCache`: Whether the data came from cache
   */
  getPawtectVariant() {
    return this.getUserData().then((result) => {
      const experiments = result.data.experiments ?? {};
      const pawtect = experiments['2025-09_pawtect'] ?? {};

      return {
        value: typeof pawtect.variant === 'string' ? pawtect.variant : null,
        fromCache: result.fromCache,
      };
    });
  }

  /**
   * Validates that the experiments object matches the exact expected structure.
   * Allows specific keys with exact or multiple allowed values.
   * Throws an error if validation fails.
   *
   * @param {Object} experiments - The experiments object from user data
   * @throws {Error} If experiments structure is invalid or unexpected
   */
  validateExperiments(experiments) {
    const expected = {
      '2025-09_discord_linking': { enabled: true },
      '2025-09_pawtect': { variant: ['koala', 'disabled'] },
    };

    if (!experiments || typeof experiments !== 'object') {
      throw new Error('Experiments must be a non-null object');
    }

    const keys = Object.keys(experiments);
    const expectedKeys = Object.keys(expected);

    if (keys.length !== expectedKeys.length) {
      throw new Error(
        `Experiments must have exactly ${expectedKeys.length} keys, found ${keys.length}: ${keys.join(', ')}`
      );
    }

    for (const [key, expectedValue] of Object.entries(expected)) {
      if (!Object.prototype.hasOwnProperty.call(experiments, key)) {
        throw new Error(`Missing required experiment key: ${key}`);
      }

      const actual = experiments[key];
      if (typeof actual !== 'object' || actual === null) {
        throw new Error(`Experiment ${key} must be an object`);
      }

      for (const [prop, expectedPropVal] of Object.entries(expectedValue)) {
        if (!Object.prototype.hasOwnProperty.call(actual, prop)) {
          throw new Error(`Experiment ${key}.${prop} is required`);
        }

        const actualVal = actual[prop];

        if (Array.isArray(expectedPropVal)) {
          if (!expectedPropVal.includes(actualVal)) {
            throw new Error(
              `Experiment ${key}.${prop} must be one of 
              [${expectedPropVal.map((v) => JSON.stringify(v)).join(', ')}], 
              got ${JSON.stringify(actualVal)}`
            );
          }
        } else {
          if (actualVal !== expectedPropVal) {
            throw new Error(
              `Experiment ${key}.${prop} must be ${JSON.stringify(expectedPropVal)}, 
              got ${JSON.stringify(actualVal)}`
            );
          }
        }
      }

      const allowedProps = Object.keys(expectedValue);
      const actualProps = Object.keys(actual);
      const unexpectedProps = actualProps.filter((p) => !allowedProps.includes(p));
      if (unexpectedProps.length > 0) {
        throw new Error(
          `Experiment ${key} has unexpected properties: ${unexpectedProps.join(', ')}`
        );
      }
    }

    const unexpectedKeys = keys.filter((k) => !Object.prototype.hasOwnProperty.call(expected, k));
    if (unexpectedKeys.length > 0) {
      throw new Error(`Unexpected experiment keys detected: ${unexpectedKeys.join(', ')}`);
    }

    return true;
  }

  /**
   * Fetches and validates experiments. Blocks app startup if experiments are tampered with.
   * Call this at app startup to ensure the environment is trusted.
   *
   * @returns {Promise<void>}
   * @throws {Error} If experiments structure is invalid
   * @see {@link this.validateExperiments} — performs the actual validation and throws on failure
   */
  async requireValidExperiments() {
    const { value: experiments } = await this.getExperiments();
    this.validateExperiments(experiments);
  }
}

export const wplaceService = new WPlaceService();
