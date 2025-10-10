import { beforeEach, describe, expect, it, vi } from 'vitest';
import { state } from '../src/js/core/state.js';
import { syncSettingsUI, UI_BINDINGS } from '../src/js/ui/sync-ui.js';
import { createSettingsContainer } from '../src/js/ui/components/create-settings.js';
import { createResizeContainer } from '../src/js/ui/components/create-resize.js';
import { updateCoordinateUI } from '../src/js/ui/handlers/settings/coordinate-ui.js';
import { cloneDeep } from 'lodash';
import { handleCoordinateModeChange } from '../src/js/ui/handlers/settings/coordinate-handler.js';

const initialState = cloneDeep(state);
beforeEach(() => {
  document.body.append(createSettingsContainer());
  document.body.append(createResizeContainer());
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, initialState);
});

describe('syncSettingsUI', () => {
  describe('UI_BINDINGS', () => {
    it('should apply all bindings from state to DOM', () => {
      state.coordinateMode = 'circle-in';
      state.coordinateDirection = 'top-left';
      state.coordinateSnake = true;
      state.paintingSpeed = 15;
      state.paintingSpeedLimitEnabled = true;
      state.batchMode = 'random';
      state.randomBatchMin = 5;
      state.randomBatchMax = 20;
      state.overlayOpacity = 0.75;
      state.tokenSource = 'manual';
      state.colorMatchingAlgorithm = 'legacy';
      state.enableChromaPenalty = true;
      state.chromaPenaltyWeight = 0.3;
      state.customTransparencyThreshold = 120;
      state.customWhiteThreshold = 240;
      state.notificationsEnabled = true;
      state.notifyOnChargesReached = false;
      state.notifyOnlyWhenUnfocused = true;
      state.notificationIntervalMinutes = 10;
      state.languageKey = 'ru';

      syncSettingsUI();

      UI_BINDINGS.forEach(({ key, selector, prop }) => {
        const el = document.querySelector(selector);
        expect(el, `Element not found for ${selector}`).not.toBeNull();

        const actual =
          prop === 'value' && typeof state[key] === 'number' ? Number(el[prop]) : el[prop];

        expect.soft(actual, `Binding failed for key: ${key}`).toBe(state[key]);
      });
    });
  });

  describe('SPECIAL_HANDLERS', () => {
    it('should update speedValue textContent', () => {
      state.paintingSpeed = 25;
      syncSettingsUI();
      const el = document.getElementById('speedValue');
      expect(el.textContent).toBe('25');
    });

    it('should update overlayOpacityValue with %', () => {
      state.overlayOpacity = 0.6;
      syncSettingsUI();
      const el = document.getElementById('overlayOpacityValue');
      expect(el.textContent).toBe('60%');
    });

    it('should update chromaWeightValue', () => {
      state.chromaPenaltyWeight = 0.25;
      syncSettingsUI();
      const el = document.getElementById('chromaWeightValue');
      expect(el.textContent).toBe('0.25');
    });

    it('should toggle batch mode controls', () => {
      const normal = document.getElementById('normalBatchControls');
      const random = document.getElementById('randomBatchControls');

      state.batchMode = 'random';
      syncSettingsUI();
      expect(normal.style.display).toBe('none');
      expect(random.style.display).toBe('block');

      state.batchMode = 'normal';
      syncSettingsUI();
      expect(normal.style.display).toBe('block');
      expect(random.style.display).toBe('none');
    });

    it('should call updateCoordinateUI on coordinateMode change', () => {
      const container = document.getElementById('wplace-settings-container');
      const directionControls = container.querySelector('#directionControls');
      const snakeControls = container.querySelector('#snakeControls');
      const blockControls = container.querySelector('#blockControls');

      handleCoordinateModeChange({ target: { value: 'circle-in' } });

      expect(directionControls.style.display).toBe('none');
      expect(snakeControls.style.display).toBe('none');
      expect(blockControls.style.display).toBe('none');
    });
  });

  describe('edge cases', () => {
    it('should not throw if element is missing', () => {
      const el = document.getElementById('speedSlider');
      el.remove();

      expect(() => syncSettingsUI()).not.toThrow();
    });

    it('should not update missing state key', () => {
      const el = document.getElementById('speedSlider');
      const originalValue = el.value;

      delete state.paintingSpeed;
      syncSettingsUI();

      expect(el.value).toBe(originalValue);
    });
  });
});
