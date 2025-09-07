import { CONFIG } from './config.js';

export const state = {
  running: false,
  processing: false,
  artTotalPixels: 0,
  totalPaintedPixels: 0,
  userPaintedPixels: 0,
  availableColors: [],
  activeColorPalette: [], // User-selected colors for conversion
  paintWhitePixels: true, // Default to ON
  fullChargeData: null,
  fullChargeInterval: null,
  paintTransparentPixels: false, // Default to OFF
  displayCharges: 0,
  preciseCurrentCharges: 0,
  maxCharges: 1, // Default max charges
  cooldown: CONFIG.COOLDOWN_DEFAULT,
  imageData: null,
  stopFlag: false,
  startPosition: null,
  selectingPosition: false,
  region: null,
  minimized: false,
  estimatedTime: 0,
  languageKey: 'en',
  paintingSpeed: CONFIG.PAINTING_SPEED.DEFAULT, // pixels batch size
  paintingSpeedLimitEnabled: CONFIG.PAINTING_SPEED_LIMIT_ENABLED,
  batchMode: CONFIG.BATCH_MODE, // "normal" or "random"
  randomBatchMin: CONFIG.RANDOM_BATCH_RANGE.MIN, // Random range minimum
  randomBatchMax: CONFIG.RANDOM_BATCH_RANGE.MAX, // Random range maximum
  cooldownChargeThreshold: CONFIG.COOLDOWN_CHARGE_THRESHOLD,
  chargesThresholdInterval: null,
  tokenSource: CONFIG.TOKEN_SOURCE, // "generator" or "manual"
  initialSetupComplete: false, // Track if initial startup setup is complete (only happens once)
  overlayOpacity: CONFIG.OVERLAY.OPACITY_DEFAULT,
  blueMarbleEnabled: CONFIG.OVERLAY.BLUE_MARBLE_DEFAULT,
  ditheringEnabled: true, // Advanced color matching settings
  colorMatchingAlgorithm: 'lab',
  enableChromaPenalty: true,
  chromaPenaltyWeight: 0.15,
  customTransparencyThreshold: CONFIG.TRANSPARENCY_THRESHOLD,
  customWhiteThreshold: CONFIG.WHITE_THRESHOLD,
  resizeSettings: null,
  originalImage: null,
  resizeIgnoreMask: null,
  paintUnavailablePixels: CONFIG.PAINT_UNAVAILABLE, // Coordinate generation settings
  coordinateMode: CONFIG.COORDINATE_MODE,
  coordinateDirection: CONFIG.COORDINATE_DIRECTION,
  coordinateSnake: CONFIG.COORDINATE_SNAKE,
  blockWidth: CONFIG.COORDINATE_BLOCK_WIDTH,
  blockHeight: CONFIG.COORDINATE_BLOCK_HEIGHT,
  notificationsEnabled: CONFIG.NOTIFICATIONS.ENABLED,
  notifyOnChargesReached: CONFIG.NOTIFICATIONS.ON_CHARGES_REACHED,
  notifyOnlyWhenUnfocused: CONFIG.NOTIFICATIONS.ONLY_WHEN_UNFOCUSED,
  notificationIntervalMinutes: CONFIG.NOTIFICATIONS.REPEAT_MINUTES,
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
};
