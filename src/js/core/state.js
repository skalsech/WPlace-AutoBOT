import { DEFAULT_SETTINGS } from '../config/DEFAULT_SETTINGS.js';
import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * @typedef {DefaultSettings & {
 *   // runtime-only
 *   running: boolean,
 *   processing: boolean,
 *   artTotalPixels: number,
 *   totalPaintedPixels: number,
 *   userPaintedPixels: number,
 *   availableColors: any[],
 *   activeColorPalette: any[],
 *   fullChargeData: any,
 *   fullChargeInterval: any,
 *   displayCharges: number,
 *   preciseCurrentCharges: number,
 *   maxCharges: number,
 *   cooldown: number,
 *   imageData: {   totalPixels: number,   pixels: Uint8ClampedArray,   width: number,   height: number },
 *   stopFlag: boolean,
 *   startPosition: any,
 *   selectingPosition: boolean,
 *   region: any,
 *   estimatedTime: number,
 *   languageKey: string,
 *   chargesThresholdInterval: any,
 *   initialSetupComplete: boolean,
 *   resizeIgnoreMask: any,
 *   _lastChargesNotifyAt: number,
 *   _lastChargesBelow: boolean,
 *   _lastSavePixelCount: number,
 *   _lastSaveTime: number,
 *   _saveInProgress: boolean,
 *   paintedMap: any,
 *   hasAvailableColors: boolean,
 *   imageLoaded: boolean
 *   _eventEmitter: EventEmitter
 *   update: (updates: object) => void,
 *   updateColorSettings: (updates: object) => void
 * }} State
 */

/**
 * @type {State}
 * ⚠️ WARNING: When modifying state — update @typedef State!
 */
export const state = {
  ...DEFAULT_SETTINGS,

  // runtime-only (todo some progress also, to be separated)
  running: false,
  processing: false,
  artTotalPixels: 0,
  totalPaintedPixels: 0,
  userPaintedPixels: 0,
  availableColors: [],
  activeColorPalette: [], // User-selected colors for conversion
  fullChargeData: null,
  fullChargeInterval: null,
  displayCharges: 0,
  preciseCurrentCharges: 0,
  maxCharges: 1,
  cooldown: 31000,
  imageData: null,
  stopFlag: false,
  startPosition: null,
  selectingPosition: false,
  region: null,
  estimatedTime: 0,
  chargesThresholdInterval: null,
  initialSetupComplete: false, // Track if initial startup setup is complete (only happens once)
  resizeIgnoreMask: null,
  _lastChargesNotifyAt: 0,
  _lastChargesBelow: true, // Smart save tracking
  _lastSavePixelCount: 0,
  _lastSaveTime: 0,
  _saveInProgress: false,
  /**
   * @deprecated Painted map is account-specific and should not be saved.
   */
  paintedMap: null,

  get hasAvailableColors() {
    return !!this.availableColors.length;
  },
  get imageLoaded() {
    return !!this.imageData;
  },

  _eventEmitter: new EventEmitter(),
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
