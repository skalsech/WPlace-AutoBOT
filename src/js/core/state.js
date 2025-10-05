import { DEFAULT_SETTINGS } from '../config/DEFAULT_SETTINGS.js';
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
 * @property {Map<string, number>} artColorFrequency - Map of color keys (e.g., "r,g,b") to their occurrence count in the image.
 * @property {number} localPaintedOffset - Number of pixels painted in the current session (not yet saved to total).
 * @property {number} totalPaintedPixels - Cumulative number of pixels painted across all sessions.
 * @property {Array<{id: number, name: string, rgb: [number, number, number]}>} availableColors - List of available colors with metadata (ID, name, RGB).
 * @property {Array<Array<number>>} activeColorPalette - Array of RGB triplets representing the currently selected color palette.
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
 * @property {string} languageKey - Current UI language identifier (e.g., "en", "ru").
 * @property {Uint8Array|null} resizeIgnoreMask - Mask indicating which pixels should be ignored during resize (optional).
 * @property {number} _lastChargesNotifyAt - Timestamp of the last charges-related notification.
 * @property {boolean} _lastChargesBelow - Whether charges were below threshold at the last check.
 * @property {number} _lastSavePixelCount - Number of pixels saved during the last save operation.
 * @property {number} _lastSaveTime - Timestamp of the last save operation.
 * @property {boolean} _saveInProgress - Whether a save operation is currently running.
 * @property {any} paintedMap - Legacy map tracking painted pixels (deprecated; use totalPaintedPixels instead).
 * @property {boolean} hasAvailableColors - Whether any colors are available for painting (computed getter).
 * @property {boolean} imageLoaded - Whether an image has been successfully loaded (computed getter).
 * @property {number} currentPaintedPixels - Total painted pixels including local offset (computed getter).
 * @property {StateEventEmitter} _eventEmitter - Custom event emitter instance for state and color changes.
 * @property {function(updates: State) : void} update - Function to update state properties and emit 'stateChange'.
 * @property {function(updates: State) : void} updateColorSettings - Function to update color settings and emit 'colorSettingsChange'.
 */

/**
 * @type {DefaultSettings & State}
 * ⚠️ WARNING: When modifying state — update @typedef State!
 */
export const state = {
  ...DEFAULT_SETTINGS,

  // runtime-only (some progress also, todo to separate them)
  running: false,
  processing: false,
  artColorFrequency: new Map(),
  localPaintedOffset: 0,
  totalPaintedPixels: 0,
  availableColors: [],
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
  /**
   * @deprecated Painted map is account-specific and should not be saved.
   */
  paintedMap: null,

  artTotalPixels: 0,
  startPosition: null,
  region: null,
  imageData: null,

  get hasAvailableColors() {
    return !!this.availableColors.length;
  },
  get imageLoaded() {
    return !!this.imageData;
  },
  get currentPaintedPixels() {
    return state.totalPaintedPixels + state.localPaintedOffset;
  },

  _eventEmitter: new StateEventEmitter(),
  update(updates) {
    const changedKeys = [];

    for (const [key, value] of Object.entries(updates)) {
      if (this[key] !== value) {
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
};

export function onStateChange(callback) {
  state._eventEmitter.on('stateChange', callback);
}

export function onColorSettingsChange(callback) {
  state._eventEmitter.on('colorSettingsChange', callback);
}
