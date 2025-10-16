import { DEFAULT_SETTINGS } from '../app/config/default-settings.js';
import { StateEventEmitter } from '../utils/StateEventEmitter.js';

/**
 * @typedef {Object} TemplateImageData
 * @property {number} width - Width of the image in pixels.
 * @property {number} height - Height of the image in pixels.
 * @property {number} totalPixels - Total number of pixels in the loaded image.
 * @property {ImageProcessor} processor - Image processing utility (e.g., for dithering/color matching).
 * @property {Uint8ClampedArray} pixels - Raw RGBA pixel data (width × height × 4).
 */

/**
 * @typedef {Object} FullChargeData
 * @property {number} current - Current charge value (e.g., 3.26587 out of 5).
 * @property {number} max - Maximum charge capacity.
 * @property {number} cooldownMs - Cooldown duration between charges (in milliseconds).
 * @property {number} startTime - Timestamp (Date.now()) when charging started.
 * @property {number} spentSinceShot - Number of charges spent since last shot or reset.
 */

/**
 * @typedef {Object} State
 * @property {boolean} running - Whether the painting process is currently running.
 * @property {boolean} processing - Whether the system is currently processing pixels (e.g., during batch operations).
 * @property {number} artTotalPixels - Total number of pixels in the artwork (excluding transparent/ignored).
 * @property {Map<number, number>} artColorFrequency - color ID → pixel count.
 * @property {number} localPaintedOffset - Number of pixels painted in the current session (not yet saved to total).
 * @property {number} totalPaintedPixels - Cumulative number of pixels painted across all sessions.
 * @property {Set<number>} availableColors - List of available colors ids.
 * @property {Array<Array<number>>} activeColorPalette - Array of RGB triplets representing the currently selected color palette. // todo refactor to use ids ?
 * @property {FullChargeData|null} fullChargeData - Current state of the charge system.
 * @property {number|null} fullChargeInterval - ID of the setInterval for charge regeneration, or null if inactive.
 * @property {number} displayCharges - Number of charges to display in UI (rounded).
 * @property {number} preciseCurrentCharges - Exact current charge value (decimal precision).
 * @property {number} cooldown - Global cooldown in milliseconds (e.g., for painting delay).
 * @property {TemplateImageData|null} imageData - Current loaded image data.
 * @property {boolean} stopFlag - Flag to signal an immediate stop of painting.
 * @property {{x: number, y: number}|null} startPosition - Starting coordinate for region selection, or null if none.
 * @property {boolean} selectingPosition - Whether the user is currently selecting a region.
 * @property {{x: number, y: number}|null} region - Selected region as {x, y} (top-left corner), or null if none.
 * @property {number} estimatedTime - Estimated time remaining to finish painting (in milliseconds).
 * @property {Uint8Array|null} resizeIgnoreMask - Mask indicating which pixels should be ignored during resize (optional).
 * @property {number} _lastChargesNotifyAt - Timestamp of the last charges-related notification.
 * @property {boolean} _lastChargesBelow - Whether charges were below threshold at the last check.
 * @property {number} _lastSavePixelCount - Number of pixels saved during the last save operation.
 * @property {number} _lastSaveTime - Timestamp of the last save operation.
 * @property {boolean} _saveInProgress - Whether a save operation is currently running.
 * @property {boolean} hasAvailableColors - Whether any colors are available for painting (computed getter).
 * @property {boolean} imageLoaded - Whether an image has been successfully loaded (computed getter).
 * @property {number} currentPaintedPixels - Total painted pixels including local offset (computed getter).
 * @property {Set<number>} filteredColorIds - Set of color IDs that are currently filtered (hidden).
 * @property {boolean} hideFiltered - Whether filtered colors should be hidden (default: false).
 * @property {Map<number, number>} filteredColorFrequency - color ID → pixel count after filter.
 * @property {StateEventEmitter} _eventEmitter - Custom event emitter instance for state and color changes.
 * @property {function(updates: Object) : void} update - Function to update state properties and emit 'stateChange'.
 * @property {function(updates: Object) : void} updateColorSettings - Function to update color settings and emit 'colorSettingsChange'.
 * @property {function(colorId: number) : void} toggleColorFilter - Toggle a color in the filter.
 * @property {function() : void} toggleHideFiltered - Toggle whether filtered colors are hidden.
 * @property {function() : void} clearColorFilter - Clear all color filters.
 * @property {function(colorId: number) : void} addColorToFilter - Adds a color to filter set.
 * @property {function(colorId: number) : void} removeColorFromFilter - Removes a color from filter set.
 */

/**
 * @type {DefaultSettings & State}
 * ⚠️ WARNING: When modifying state — update @typedef State!
 */
export const state = {
  ...DEFAULT_SETTINGS,

  running: false,
  processing: false,
  artColorFrequency: new Map(),
  localPaintedOffset: 0,
  totalPaintedPixels: 0,
  availableColors: new Set(),
  activeColorPalette: [],
  fullChargeData: null,
  fullChargeInterval: null,
  displayCharges: 0,
  preciseCurrentCharges: 0,
  cooldown: 31000,
  stopFlag: false,
  selectingPosition: false,
  estimatedTime: 0,
  resizeIgnoreMask: null,
  _lastChargesNotifyAt: 0,
  _lastChargesBelow: true,
  _lastSavePixelCount: 0,
  _lastSaveTime: 0,
  _saveInProgress: false,

  artTotalPixels: 0,
  startPosition: null,
  region: null,
  imageData: null,

  filteredColorIds: new Set(),
  hideFiltered: false,

  get hasAvailableColors() {
    return !!this.availableColors.size;
  },
  get imageLoaded() {
    return !!this.imageData;
  },
  get currentPaintedPixels() {
    return state.totalPaintedPixels + state.localPaintedOffset;
  },
  get filteredColorFrequency() {
    if (!this.hideFiltered || this.filteredColorIds.size === 0) {
      return this.artColorFrequency;
    }
    const filteredMap = new Map();
    for (const [colorId, frequency] of this.artColorFrequency.entries()) {
      if (!this.filteredColorIds.has(colorId)) {
        filteredMap.set(colorId, frequency);
      }
    }
    return filteredMap;
  },
  get hasActiveColorFilter() {
    return this.filteredColorIds.size > 0;
  },
  get hasActiveHiddenFilter() {
    return this.hideFiltered && this.filteredColorIds.size > 0;
  },

  _eventEmitter: new StateEventEmitter(),
  update(updates) {
    const changedKeys = [];

    for (const [key, value] of Object.entries(updates)) {
      const oldValue = this[key];

      if (
        (Array.isArray(value) || typeof value === 'object') &&
        value !== null &&
        oldValue === value
      ) {
        console.warn(`⚠️ update(): ${key} was passed by reference, no new copy was created!`);
      }

      if (oldValue !== value) {
        this[key] = value;
        changedKeys.push(key);
      }
    }

    if (changedKeys.length > 0) {
      this._eventEmitter.emit('stateChange', { keys: changedKeys, state: this });
    }
  },

  updateColorSettings(updates) {
    this.update(updates);
    this._eventEmitter.emit('colorSettingsChange', updates);
  },

  /**
   * Toggle a color in the filter
   * @param {number} colorId - The color ID to toggle
   */
  toggleColorFilter(colorId) {
    const newFilteredColorIds = new Set(this.filteredColorIds);

    if (newFilteredColorIds.has(colorId)) {
      newFilteredColorIds.delete(colorId);
    } else {
      newFilteredColorIds.add(colorId);
    }

    this.update({
      filteredColorIds: newFilteredColorIds,
    });

    this._eventEmitter.emit('colorFilterChange', {
      filteredColorIds: newFilteredColorIds,
      hideFiltered: this.hideFiltered,
    });
  },

  /**
   * Toggle whether filtered colors are hidden
   */
  toggleHideFiltered() {
    this.update({
      hideFiltered: !this.hideFiltered,
    });

    this._eventEmitter.emit('colorFilterChange', {
      filteredColorIds: this.filteredColorIds,
      hideFiltered: !this.hideFiltered,
    });
  },

  /**
   * Clear all color filters
   */
  clearColorFilter() {
    this.update({
      filteredColorIds: new Set(),
    });

    this._eventEmitter.emit('colorFilterChange', {
      filteredColorIds: new Set(),
      hideFiltered: this.hideFiltered,
    });
  },

  /**
   * Add color to filter
   * @param {number} colorId - The color ID to add to filter
   */
  addColorToFilter(colorId) {
    const newFilteredColorIds = new Set(this.filteredColorIds);

    if (!newFilteredColorIds.has(colorId)) {
      newFilteredColorIds.add(colorId);

      this.update({
        filteredColorIds: newFilteredColorIds,
      });

      this._eventEmitter.emit('colorFilterChange', {
        filteredColorIds: newFilteredColorIds,
        hideFiltered: this.hideFiltered,
      });
    }
  },

  /**
   * Remove color from filter
   * @param {number} colorId - The color ID to remove from filter
   */
  removeColorFromFilter(colorId) {
    const newFilteredColorIds = new Set(this.filteredColorIds);

    if (newFilteredColorIds.has(colorId)) {
      newFilteredColorIds.delete(colorId);

      this.update({
        filteredColorIds: newFilteredColorIds,
      });

      this._eventEmitter.emit('colorFilterChange', {
        filteredColorIds: newFilteredColorIds,
        hideFiltered: this.hideFiltered,
      });
    }
  },
};

export function onStateChange(callback) {
  state._eventEmitter.on('stateChange', callback);
}

export function onColorSettingsChange(callback) {
  state._eventEmitter.on('colorSettingsChange', callback);
}

export function onColorFilterChange(callback) {
  state._eventEmitter.on('colorFilterChange', callback);
}
