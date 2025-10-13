import { state } from '../../../core/state.js';
import { saveBotSettings } from '../../../storage/settings-manager.js';
import { t } from '../../../i18n/index.js';
import { showAlert } from '../alerts.js';

export function createCheckboxHandler(settingKey, onMessageKey, offMessageKey) {
  return function (e) {
    const isChecked = e.target.checked;
    state[settingKey] = isChecked;
    saveBotSettings();
    console.log(`🎨 ${settingKey}: ${isChecked ? 'ON' : 'OFF'}`);

    const message = t(isChecked ? onMessageKey : offMessageKey);
    showAlert(message, 'success');
  };
}

/**
 * Creates an event handler for an input[type="range"] element that:
 * - Updates state[settingKey]
 * - Persists the settings
 * - Updates the display element with the current value (if provided)
 * - Logs the change to the console
 *
 * @param {string} settingKey - The key in the state object to update
 * @param {string} [valueElementSelector] - A CSS selector for the element that displays the value (optional)
 * @param {function} [formatFn] - A function to format the displayed value (default: (v) => Math.round(v * 100) + '%')
 * @returns {function} - The event handler function
 */
export function createSliderHandler(settingKey, valueElementSelector, formatFn = null) {
  const defaultFormat = (value) => `${Math.round(value * 100)}%`;
  const formatter = formatFn || defaultFormat;

  return function (e) {
    const value = parseFloat(e.target.value);
    state[settingKey] = value;
    saveBotSettings();
    console.log(`🎚️ ${settingKey}: ${value}`);

    if (valueElementSelector) {
      const valueEl = document.querySelector(valueElementSelector);
      if (valueEl) {
        valueEl.textContent = formatter(value);
      }
    }
  };
}
