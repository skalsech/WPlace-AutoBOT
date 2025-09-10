import { beforeEach, describe, expect, it, vi } from 'vitest';
import { state } from '../src/js/core/state.js';
import {
  isSavedSettingsEmpty,
  loadBotSettings,
  saveBotSettings,
} from '../src/js/core/settings-manager.js';
import { createTestMask, encodeMask } from './helpers.js';
import { DEFAULT_SETTINGS } from '../src/js/config/DEFAULT_SETTINGS.js';
import { cloneDeep } from 'lodash';

const getElementByIdMock = vi.fn();
global.document = {
  getElementById: getElementByIdMock,
};

const initialState = cloneDeep(state);

beforeEach(() => {
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, initialState);

  global.localStorage.clear();
  getElementByIdMock.mockClear();
});

describe('Settings Manager', () => {
  describe('saveBotSettings', () => {
    it('should save all SETTINGS_KEYS from state', () => {
      state.minimized = true;
      state.paintingSpeed = 10;
      state.tokenSource = 'manual';

      saveBotSettings();

      const saved = JSON.parse(localStorage.getItem('wplace-bot-settings'));

      expect(saved.minimized).toBe(true);
      expect(saved.paintingSpeed).toBe(10);
      expect(saved.tokenSource).toBe('manual');

      const savedKeys = Object.keys(saved);
      const defaultKeys = Object.keys(DEFAULT_SETTINGS);
      expect(savedKeys).toEqual(expect.arrayContaining(defaultKeys));
    });

    it('should handle resizeIgnoreMask correctly', () => {
      state.resizeSettings = { width: 2, height: 2 };
      const testMask = new Uint8Array([1, 0, 1, 0]);
      state.resizeIgnoreMask = testMask;

      saveBotSettings();

      const saved = JSON.parse(localStorage.getItem('wplace-bot-settings'));
      const bin = atob(saved.resizeIgnoreMask.data);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);

      expect(arr).toEqual(testMask);
    });

    it('should not save resizeIgnoreMask if dimensions mismatch', () => {
      state.resizeSettings = { width: 2, height: 2 };
      state.resizeIgnoreMask = new Uint8Array([1, 0, 1, 0, 0, 1]);

      saveBotSettings();

      const saved = JSON.parse(localStorage.getItem('wplace-bot-settings'));
      expect(saved.resizeIgnoreMask).toBeNull();
    });
  });

  describe('loadBotSettings', () => {
    it('should load values from storage', () => {
      const testValues = {};

      Object.keys(DEFAULT_SETTINGS).forEach((key) => {
        const defaultValue = DEFAULT_SETTINGS[key];

        if (typeof defaultValue === 'boolean') {
          testValues[key] = !defaultValue;
        } else if (typeof defaultValue === 'number') {
          testValues[key] = defaultValue + 1000;
        } else if (typeof defaultValue === 'string') {
          if (key === 'tokenSource') {
            testValues[key] = 'manual';
          } else if (key === 'batchMode') {
            testValues[key] = 'random';
          } else if (key === 'coordinateMode') {
            testValues[key] = 'column';
          } else {
            testValues[key] = defaultValue + '_test';
          }
        }
      });

      localStorage.setItem('wplace-bot-settings', JSON.stringify(testValues));

      loadBotSettings();

      Object.keys(testValues).forEach((key) => {
        if (key === 'resizeIgnoreMask') return;
        expect(state[key]).toEqual(testValues[key]);
      });
    });

    it('should fallback to DEFAULT_SETTINGS if not in storage', () => {
      localStorage.setItem('wplace-bot-settings', JSON.stringify({ tokenSource: 'testValue1' }));

      loadBotSettings();

      Object.keys(DEFAULT_SETTINGS).forEach((key) => {
        if (key === 'tokenSource') {
          expect(state[key]).toBe('testValue1');
        } else {
          expect.soft(state[key], `❌ ${key}`).toBe(DEFAULT_SETTINGS[key]);
        }
      });
    });

    describe('resizeIgnoreMask', () => {
      it('should restore resizeIgnoreMask if dimensions match', () => {
        state.resizeSettings = { width: 2, height: 2 };
        const testMask = createTestMask(2, 2);
        const data = encodeMask(testMask);
        state.resizeIgnoreMask = {
          w: 2,
          h: 2,
          data: data,
        };
        localStorage.setItem(
          'wplace-bot-settings',
          JSON.stringify({
            resizeIgnoreMask: state.resizeIgnoreMask,
            resizeSettings: state.resizeSettings,
          })
        );

        loadBotSettings();

        expect(state.resizeIgnoreMask).toEqual(testMask);
      });

      it('should skip resizeIgnoreMask if data is invalid base64', () => {
        state.resizeSettings = { width: 2, height: 2 };

        localStorage.setItem(
          'wplace-bot-settings',
          JSON.stringify({
            resizeIgnoreMask: {
              w: 2,
              h: 2,
              data: '!!!invalid-base64!!!',
            },
            resizeSettings: state.resizeSettings,
          })
        );

        loadBotSettings();

        expect(state.resizeIgnoreMask).toBeNull();
      });

      it('should skip resizeIgnoreMask if decoded data length does not match expected size', () => {
        state.resizeSettings = { width: 2, height: 2 };

        const largeMask = new Uint8Array([1, 0, 1, 0, 1, 0]);
        const data = encodeMask(largeMask);

        localStorage.setItem(
          'wplace-bot-settings',
          JSON.stringify({
            resizeIgnoreMask: {
              w: 2,
              h: 2,
              data,
            },
            resizeSettings: state.resizeSettings,
          })
        );

        loadBotSettings();

        expect(state.resizeIgnoreMask).toBeNull();
      });

      it('should skip resizeIgnoreMask if settings and saved data dimensions mismatch', () => {
        state.resizeSettings = { width: 2, height: 2 };

        const testMask = createTestMask(2, 2);
        const data = encodeMask(testMask);
        state.resizeIgnoreMask = {
          w: 3,
          h: 3,
          data: data,
        };
        localStorage.setItem(
          'wplace-bot-settings',
          JSON.stringify({
            resizeIgnoreMask: state.resizeIgnoreMask,
            resizeSettings: state.resizeSettings,
          })
        );

        loadBotSettings();

        expect(state.resizeIgnoreMask).toBeNull();
      });
    });
  });

  describe('DEFAULT_SETTINGS and state consistency', () => {
    it('should have all DEFAULT_SETTINGS keys in state', () => {
      const missing = Object.keys(DEFAULT_SETTINGS).filter((key) => !(key in state));
      expect(missing).toEqual([]);
    });

    it('should initialize state with DEFAULT_SETTINGS values', () => {
      Object.keys(DEFAULT_SETTINGS).forEach((key) => {
        expect.soft(state[key], `❌ ${key}`).toBe(DEFAULT_SETTINGS[key]);
      });
    });
  });

  describe('isSavedSettingsEmpty', () => {
    it('should return true if no settings saved', () => {
      expect(isSavedSettingsEmpty()).toBe(true);
    });

    it('should return false if settings exist', () => {
      localStorage.setItem('wplace-bot-settings', JSON.stringify({ minimized: true }));
      expect(isSavedSettingsEmpty()).toBe(false);
    });
  });
});
