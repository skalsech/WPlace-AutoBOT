import { createCheckboxHandler, createSliderHandler } from '../checkbox-handlers.js';
import { state } from '../../../core/state.js';
import { overlayManager } from '../../../overlay/overlay-manager.js';
import { showAlert } from '../../alerts.js';
import { loadTranslations, t } from '../../../i18n/i18.js';
import { saveBotSettings } from '../../../core/settings-manager.js';
import { debounce } from '../../../utils/helpers.js';
import { createUI } from '../../panel.js';
import { saveToStorage } from '../../../core/storage.js';
import { switchTheme } from '../../theme.js';

export const handlePaintUnavailablePixelsToggle = createCheckboxHandler(
  'paintUnavailablePixels',
  'paintUnavailableEnabled',
  'paintUnavailableSkipped'
);

export const handlePaintTransparentPixelsToggle = createCheckboxHandler(
  'paintTransparentPixels',
  'paintTransparentEnabled',
  'paintTransparentSkipped'
);

export const handlePaintWhitePixelsToggle = createCheckboxHandler(
  'paintWhitePixels',
  'paintWhiteEnabled',
  'paintWhiteSkipped'
);

export const handleOverlayOpacityChange = createSliderHandler(
  'overlayOpacity',
  '#overlayOpacityValue'
);

export async function handleBlueMarbleToggle(e) {
  state.blueMarbleEnabled = e.target.checked;
  saveBotSettings();
  if (state.imageLoaded && overlayManager.imageBitmap) {
    showAlert(t('reprocessingOverlay'), 'info');
    await overlayManager.processImageIntoChunks();
    showAlert(t('overlayUpdated'), 'success');
  }
}

export function handleTokenSourceChange(e) {
  state.tokenSource = e.target.value;
  saveBotSettings();
  console.log(`🔑 Token source changed to: ${state.tokenSource}`);
  const sourceNames = {
    generator: 'Automatic Generator',
    hybrid: 'Generator + Auto Fallback',
    manual: 'Manual Pixel Placement',
  };
  showAlert(t('tokenSourceSet', { source: sourceNames[state.tokenSource] }), 'success');
}

export function handleBatchModeChange(e) {
  const value = e.target.value;
  state.batchMode = value;
  saveBotSettings();
  console.log(`📦 Batch mode changed to: ${value}`);

  const normalControls = document.querySelector('#normalBatchControls');
  const randomControls = document.querySelector('#randomBatchControls');

  if (normalControls && randomControls) {
    if (value === 'random') {
      normalControls.style.display = 'none';
      randomControls.style.display = 'block';
    } else {
      normalControls.style.display = 'block';
      randomControls.style.display = 'none';
    }
  }

  const modeLabel = value === 'random' ? t('randomRange') : t('normalFixedSize');
  showAlert(t('batchModeSet', { mode: modeLabel }), 'success');
}

export const handleSpeedSliderInput = createSliderHandler(
  'paintingSpeed',
  '#speedValue',
  (speed) => `${speed}`
);

let pendingMin = state.randomBatchMin;
let pendingMax = state.randomBatchMax;
let lastEdited = 'max';

function updateUIOnly() {
  const minInput = document.querySelector('#randomBatchMin');
  const maxInput = document.querySelector('#randomBatchMax');

  if (minInput) minInput.value = pendingMin;
  if (maxInput) maxInput.value = pendingMax;
}

const applyBatchRangeSettings = debounce(() => {
  if (lastEdited === 'max' && pendingMin > pendingMax) {
    pendingMin = pendingMax;
  } else if (lastEdited === 'min' && pendingMax < pendingMin) {
    pendingMax = pendingMin;
  }

  state.randomBatchMin = pendingMin;
  state.randomBatchMax = pendingMax;
  saveBotSettings();

  updateUIOnly();
}, 350);

export function handleRandomBatchMinInput(e) {
  const value = parseInt(e.target.value, 10);
  if (isNaN(value) || value < 1 || value > 1000) return;

  pendingMin = value;
  lastEdited = 'min';
  applyBatchRangeSettings();
}

export function handleRandomBatchMaxInput(e) {
  const value = parseInt(e.target.value, 10);
  if (isNaN(value) || value < 1 || value > 1000) return;

  pendingMax = value;
  lastEdited = 'max';
  applyBatchRangeSettings();
}

export const handlePaintSpeedToggle = createCheckboxHandler(
  'paintingSpeedLimitEnabled',
  'paintSpeedLimitEnabled',
  'paintSpeedLimitDisabled'
);

/**
 * Обработчик смены темы
 */
export function handleThemeChange(e) {
  const newThemeKey = e.target.value;
  switchTheme(newThemeKey);
}

export async function handleLanguageChange(e) {
  const newLanguageKey = e.target.value;
  state.languageKey = newLanguageKey;
  saveToStorage('wplace_language', newLanguageKey);

  await loadTranslations(newLanguageKey);

  const container = e.target.closest('.settings-container');
  setTimeout(() => {
    if (container) {
      container.style.display = 'none';
    }
    createUI();
  }, 100);
}

export function handleCloseSettingsClick(){
  const settingsContainer = document.getElementById('wplace-settings-container');
  if (!settingsContainer) return;

  settingsContainer.style.animation = 'settings-fade-out 0.3s ease-out forwards';
  settingsContainer.classList.remove('show');

  setTimeout(() => {
    settingsContainer.style.animation = '';
  }, 300);
}
