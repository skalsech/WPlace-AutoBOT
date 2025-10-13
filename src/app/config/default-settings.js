import { deepFreeze } from '../../utils/helpers.js';
/**
 * @typedef {Object} DefaultSettings
 * @property {boolean} minimized
 * @property {number} cooldownChargeThreshold
 * @property {string} tokenSource
 * @property {number} overlayOpacity
 * @property {boolean} blueMarbleEnabled
 * @property {string} batchMode
 * @property {number} randomBatchMin
 * @property {number} randomBatchMax
 * @property {number} paintingSpeed
 * @property {boolean} paintingSpeedLimitEnabled
 * @property {boolean} paintWhitePixels
 * @property {boolean} paintTransparentPixels
 * @property {boolean} paintUnavailablePixels
 * @property {string} coordinateMode
 * @property {string} coordinateDirection
 * @property {boolean} coordinateSnake
 * @property {number} blockWidth
 * @property {number} blockHeight
 * @property {boolean} sortCoordinateByFrequency
 * @property {boolean} notificationsEnabled
 * @property {boolean} notifyOnChargesReached
 * @property {boolean} notifyOnlyWhenUnfocused
 * @property {number} notificationIntervalMinutes
 * @property {null} resizeSettings
 * @property {null} originalImage
 * @property {boolean} ditheringEnabled
 * @property {string} colorMatchingAlgorithm
 * @property {boolean} enableChromaPenalty
 * @property {number} chromaPenaltyWeight
 * @property {number} customTransparencyThreshold
 * @property {number} customWhiteThreshold
 * @property {string} themeKey
 * @property {string} languageKey
 */
/** @type {DefaultSettings}
 * ⚠️ WARNING: When modifying DEFAULT_SETTINGS — update @typedef DefaultSettings!
 * */
export const DEFAULT_SETTINGS = deepFreeze({
  // main panel
  minimized: false,
  cooldownChargeThreshold: 30,

  // settings
  tokenSource: 'generator',
  overlayOpacity: 0.2,
  blueMarbleEnabled: false,

  // batch settings
  batchMode: 'random',
  randomBatchMin: 30,
  randomBatchMax: 60,
  paintingSpeed: 20,
  paintingSpeedLimitEnabled: true,

  // paint options
  paintWhitePixels: true,
  paintTransparentPixels: false,
  paintUnavailablePixels: false,

  // generate coordinates
  coordinateMode: 'rows',
  coordinateDirection: 'top-left',
  coordinateSnake: true,
  blockWidth: 6,
  blockHeight: 2,
  sortCoordinateByFrequency: true,

  // notifications
  notificationsEnabled: false,
  notifyOnChargesReached: true,
  notifyOnlyWhenUnfocused: true,
  notificationIntervalMinutes: 5,

  // Color Matching - Resize settings
  resizeSettings: null,
  originalImage: null,
  ditheringEnabled: true,
  colorMatchingAlgorithm: 'lab',
  enableChromaPenalty: true,
  chromaPenaltyWeight: 0.15,
  customTransparencyThreshold: 100,
  customWhiteThreshold: 250,

  // Theme + Language
  themeKey: 'classic',
  languageKey: 'en',
});
// ⚠️ WARNING: When modifying DEFAULT_SETTINGS — update @typedef DefaultSettings!
