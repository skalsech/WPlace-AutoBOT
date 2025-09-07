import { loadFromStorage, saveToStorage } from './storage.js';
import { state } from './state.js';
import { CONFIG } from './config.js';

const SETTINGS_KEYS = [
  // main panel
  'minimized',
  'cooldownChargeThreshold',

  // settings
  'tokenSource',
  'overlayOpacity',

  // batch settings
  'batchMode',
  'randomBatchMin',
  'randomBatchMax',
  'paintingSpeed',
  'paintingSpeedLimitEnabled',

  // paint options
  'paintWhitePixels',
  'paintTransparentPixels',
  'paintUnavailablePixels',

  // generate coordinates
  'coordinateMode',
  'coordinateDirection',
  'coordinateSnake',
  'blockWidth',
  'blockHeight',

  // notifications
  'notificationsEnabled',
  'notifyOnChargesReached',
  'notifyOnlyWhenUnfocused',
  'notificationIntervalMinutes',

  // Color Matching - Resize settings
  'resizeSettings',
  'originalImage',
  'ditheringEnabled',
  'colorMatchingAlgorithm',
  'enableChromaPenalty',
  'chromaPenaltyWeight',
  'customTransparencyThreshold',
  'customWhiteThreshold',
];

export function saveBotSettings() {
  try {
    const settings = {};

    for (const key of SETTINGS_KEYS) {
      if (key in state) {
        settings[key] = state[key];
      }
    }

    if (
      state.resizeIgnoreMask &&
      state.resizeSettings &&
      state.resizeSettings.width * state.resizeSettings.height === state.resizeIgnoreMask.length
    ) {
      settings.resizeIgnoreMask = {
        w: state.resizeSettings.width,
        h: state.resizeSettings.height,
        data: btoa(String.fromCharCode(...state.resizeIgnoreMask)),
      };
    } else {
      settings.resizeIgnoreMask = null;
    }

    const toggle = document.getElementById('enableBlueMarbleToggle');
    if (toggle) {
      settings.blueMarbleEnabled = toggle.checked;
    } else {
      settings.blueMarbleEnabled = state.blueMarbleEnabled;
    }

    saveToStorage('wplace-bot-settings', settings);
  } catch (e) {
    console.warn('Could not save bot settings:', e);
  }
}

export function loadBotSettings() {
  try {
    const settings = loadFromStorage('wplace-bot-settings');
    if (!settings) return;

    // simple values with fallback to CONFIG
    for (const key of SETTINGS_KEYS) {
      if (settings[key] !== undefined) {
        state[key] = settings[key];
      } else if (CONFIG[key.toUpperCase()] !== undefined) {
        state[key] = CONFIG[key.toUpperCase()];
      }
    }

    // manual fallbacks (if there is no CONFIG value for that)
    state.minimized = settings.minimized ?? false;

    if (
      settings.resizeIgnoreMask &&
      settings.resizeIgnoreMask.data &&
      state.resizeSettings &&
      settings.resizeIgnoreMask.w === state.resizeSettings.width &&
      settings.resizeIgnoreMask.h === state.resizeSettings.height
    ) {
      try {
        const bin = atob(settings.resizeIgnoreMask.data);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        state.resizeIgnoreMask = arr;
      } catch (e) {
        console.warn('Failed to restore resizeIgnoreMask', e);
        state.resizeIgnoreMask = null;
      }
    } else {
      state.resizeIgnoreMask = null;
    }
  } catch (e) {
    console.warn('Could not load bot settings:', e);
  }
}
