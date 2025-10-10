import { state } from '../core/state.js';
import { updateCoordinateUI } from './handlers/settings/coordinate-ui.js';

export const UI_BINDINGS = [
  // Coordinate Mode
  { key: 'coordinateMode', selector: '#coordinateModeSelect', prop: 'value' },
  {
    key: 'coordinateDirection',
    selector: '#coordinateDirectionSelect',
    prop: 'value',
  },
  {
    key: 'coordinateSnake',
    selector: '#coordinateSnakeToggle',
    prop: 'checked',
  },
  {
    key: 'sortCoordinateByFrequency',
    selector: '#sortCoordinateByFrequencyToggle',
    prop: 'checked',
  },

  // Paint Filters
  {
    key: 'paintUnavailablePixels',
    selector: '#paintUnavailablePixelsToggle',
    prop: 'checked',
  },
  {
    key: 'paintWhitePixels',
    selector: '#settingsPaintWhiteToggle',
    prop: 'checked',
  },
  {
    key: 'paintTransparentPixels',
    selector: '#settingsPaintTransparentToggle',
    prop: 'checked',
  },

  // Speed
  { key: 'paintingSpeed', selector: '#speedSlider', prop: 'value' },
  {
    key: 'paintingSpeedLimitEnabled',
    selector: '#enableSpeedToggle',
    prop: 'checked',
  },

  // Batch Mode
  { key: 'batchMode', selector: '#batchModeSelect', prop: 'value' },
  { key: 'randomBatchMin', selector: '#randomBatchMin', prop: 'value' },
  { key: 'randomBatchMax', selector: '#randomBatchMax', prop: 'value' },

  // Overlay
  { key: 'overlayOpacity', selector: '#overlayOpacitySlider', prop: 'value' },
  {
    key: 'blueMarbleEnabled',
    selector: '#enableBlueMarbleToggle',
    prop: 'checked',
  },

  // Token Source
  { key: 'tokenSource', selector: '#tokenSourceSelect', prop: 'value' },

  // Color Matching - Resize settings
  {
    key: 'colorMatchingAlgorithm',
    selector: '#colorAlgorithmSelect',
    prop: 'value',
  },
  {
    key: 'enableChromaPenalty',
    selector: '#enableChromaPenaltyToggle',
    prop: 'checked',
  },
  {
    key: 'chromaPenaltyWeight',
    selector: '#chromaPenaltyWeightSlider',
    prop: 'value',
  },
  {
    key: 'customTransparencyThreshold',
    selector: '#transparencyThresholdInput',
    prop: 'value',
  },
  {
    key: 'customWhiteThreshold',
    selector: '#whiteThresholdInput',
    prop: 'value',
  },

  // Notifications
  {
    key: 'notificationsEnabled',
    selector: '#notifEnabledToggle',
    prop: 'checked',
  },
  {
    key: 'notifyOnChargesReached',
    selector: '#notifOnChargesToggle',
    prop: 'checked',
  },
  {
    key: 'notifyOnlyWhenUnfocused',
    selector: '#notifOnlyUnfocusedToggle',
    prop: 'checked',
  },
  {
    key: 'notificationIntervalMinutes',
    selector: '#notifIntervalInput',
    prop: 'value',
  },

  // Themes + Language
  {
    key: 'themeKey',
    selector: '#themeSelect',
    prop: 'value',
  },
  {
    key: 'languageKey',
    selector: '#languageSelect',
    prop: 'value',
  },
];

export const SPECIAL_HANDLERS = [
  {
    keys: ['paintingSpeed'],
    update: (state) => {
      const el = document.getElementById('speedValue');
      if (el) el.textContent = `${state.paintingSpeed}`;
    },
  },
  {
    keys: ['overlayOpacity'],
    update: (state) => {
      const el = document.getElementById('overlayOpacityValue');
      if (el) el.textContent = `${Math.round(state.overlayOpacity * 100)}%`;
    },
  },
  {
    keys: ['chromaPenaltyWeight'],
    update: (state) => {
      const el = document.getElementById('chromaWeightValue');
      if (el) el.textContent = state.chromaPenaltyWeight;
    },
  },
  {
    keys: ['batchMode'],
    update: (state) => {
      const normal = document.getElementById('normalBatchControls');
      const random = document.getElementById('randomBatchControls');
      if (normal && random) {
        if (state.batchMode === 'random') {
          normal.style.display = 'none';
          random.style.display = 'block';
        } else {
          normal.style.display = 'block';
          random.style.display = 'none';
        }
      }
    },
  },
  {
    keys: ['coordinateMode'],
    update: (state) => {
      const container = document.getElementById('wplace-settings-container');
      if (!container) return;
      updateCoordinateUI({
        mode: state.coordinateMode,
        directionControls: container.querySelector('#directionControls'),
        snakeControls: container.querySelector('#snakeControls'),
        blockControls: container.querySelector('#blockControls'),
      });
    },
  },
  {
    keys: ['blockHeight', 'blockWidth'],
    update: (state) => {
      const blockHeightInput = document.getElementById('blockHeightInput');
      const blockWidthInput = document.getElementById('blockWidthInput');

      if (blockHeightInput) blockHeightInput.value = state.blockHeight;
      if (blockWidthInput) blockWidthInput.value = state.blockWidth;
    },
  },
];

export function syncSettingsUI() {
  for (const binding of UI_BINDINGS) {
    const el = document.querySelector(binding.selector);
    if (el && Object.prototype.hasOwnProperty.call(state, binding.key)) {
      el[binding.prop] = state[binding.key];
    }
  }

  for (const handler of SPECIAL_HANDLERS) {
    if (handler.keys.some((key) => Object.prototype.hasOwnProperty.call(state, key))) {
      handler.update(state);
    }
  }
}
