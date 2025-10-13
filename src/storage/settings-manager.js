import { loadFromStorage, saveToStorage } from './storage.js';
import { state } from '../core/state.js';
import { DEFAULT_SETTINGS } from '../app/config/default-settings.js';

export function saveBotSettings() {
  try {
    const settings = {};

    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      settings[key] = state[key];
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

    saveToStorage('wplace-bot-settings', settings);
  } catch (e) {
    console.warn('Could not save bot settings:', e);
  }
}

export function isSavedSettingsEmpty() {
  const settings = loadFromStorage('wplace-bot-settings');
  return !settings;
}

export function loadBotSettings() {
  try {
    const settings = loadFromStorage('wplace-bot-settings');
    if (!settings) return;

    Object.assign(state, DEFAULT_SETTINGS, settings);

    // special cases
    function parseResizeIgnoreMask(mask, current) {
      if (!mask?.data) {
        return null;
      }

      if (!current) {
        console.debug('[Settings] parseResizeIgnoreMask: no state.resizeSettings');
        return null;
      }

      if (mask.w !== current.width || mask.h !== current.height) {
        console.warn(
          `[Settings] parseResizeIgnoreMask: dimensions mismatch: ${mask.w}x${mask.h} != ${current.width}x${current.height}`
        );
        return null;
      }

      const expectedMaskSize = mask.w * mask.h;

      let bin;
      try {
        bin = atob(mask.data);
      } catch (e) {
        console.warn('[Settings] parseResizeIgnoreMask: failed to decode base64', e);
        return null;
      }

      if (bin.length !== expectedMaskSize) {
        console.warn(
          `[Settings] parseResizeIgnoreMask: size mismatch: got ${bin.length}, expected ${expectedMaskSize}`
        );
        return null;
      }

      const arr = new Uint8Array(expectedMaskSize);
      for (let i = 0; i < expectedMaskSize; i++) {
        const code = bin.charCodeAt(i);
        // atob chars are guaranteed to be 0–255 range, but just in case check
        if (code < 0 || code > 255) {
          console.warn(`[Settings] parseResizeIgnoreMask: invalid byte at index ${i}: ${code}`);
          return null;
        }
        arr[i] = code;
      }

      return arr;
    }
    state.update({
      resizeIgnoreMask:
        parseResizeIgnoreMask(settings.resizeIgnoreMask, state.resizeSettings) ?? null,
    });
  } catch (e) {
    console.warn('Could not load bot settings:', e);
  }
}
