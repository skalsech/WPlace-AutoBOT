import { state } from '../../core/state.js';
import { saveBotSettings } from '../../core/settings-manager.js';
import { t } from '../../i18n/i18.js';
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
 * Создаёт обработчик для input[type="range"], который:
 * - Обновляет state[settingKey]
 * - Сохраняет настройки
 * - Обновляет элемент отображения значения (если передан)
 * - Показывает лог
 *
 * @param {string} settingKey - Ключ в state
 * @param {string} [valueElementSelector] - CSS-селектор элемента, куда выводить значение (опционально)
 * @param {function} [formatFn] - Функция форматирования значения (по умолчанию: (v) => Math.round(v * 100) + '%')
 * @returns {function}
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
