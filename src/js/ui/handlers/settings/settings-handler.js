import { createCheckboxHandler, createSliderHandler } from '../checkbox-handlers.js';
import { state } from '../../../core/state.js';
import { overlayManager } from '../../../tiles/overlay-manager.js';
import { showAlert } from '../../alerts.js';
import { loadTranslations, t, updateTranslations } from '../../../i18n/i18.js';
import { saveBotSettings } from '../../../storage/settings-manager.js';
import { debounce } from '../../../utils/helpers.js';
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
  state.update({
    blueMarbleEnabled: e.target.checked,
  });
  saveBotSettings();
  if (state.imageLoaded && overlayManager.imageBitmap) {
    showAlert(t('reprocessingOverlay'), 'info');
    await overlayManager.processImageIntoChunks();
    showAlert(t('overlayUpdated'), 'success');
  }
}

export function handleTokenSourceChange(e) {
  state.update({
    tokenSource: e.target.value,
  });
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
  state.update({
    batchMode: value,
  });
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

let pendingMin, pendingMax;
let lastEdited = 'max';

export function resetPendingBatchRangeToState() {
  pendingMin = state.randomBatchMin;
  pendingMax = state.randomBatchMax;
}

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

  state.update({
    randomBatchMin: pendingMin,
    randomBatchMax: pendingMax,
  });
  saveBotSettings();

  updateUIOnly();
}, 350);

export function handleRandomBatchMinInput(e) {
  resetPendingBatchRangeToState();
  const input = e.target;
  const rawValue = input.value;
  const numValue = parseInt(rawValue, 10);

  if (!isNaN(numValue)) {
    const clamped = Math.min(Math.max(1, numValue), 1000);
    pendingMin = clamped;
    lastEdited = 'min';
    applyBatchRangeSettings();
    if (clamped !== numValue) {
      input.value = clamped;
    }
  } else {
    input.value = state.randomBatchMin;
  }
}

export function handleRandomBatchMaxInput(e) {
  resetPendingBatchRangeToState();
  const input = e.target;
  const rawValue = input.value;
  const numValue = parseInt(rawValue, 10);

  if (!isNaN(numValue)) {
    const clamped = Math.min(Math.max(1, numValue), 1000);
    pendingMax = clamped;
    lastEdited = 'max';
    applyBatchRangeSettings();
    if (clamped !== numValue) {
      input.value = clamped;
    }
  } else {
    input.value = state.randomBatchMax;
  }
}

export const handlePaintSpeedToggle = createCheckboxHandler(
  'paintingSpeedLimitEnabled',
  'paintSpeedLimitEnabled',
  'paintSpeedLimitDisabled'
);

export async function handleThemeChange(e) {
  const newThemeKey = e.target.value;
  await switchTheme(newThemeKey);
  state.update({
    themeKey: newThemeKey,
  });
  saveBotSettings();
}

export async function handleLanguageChange(e) {
  const newLanguageKey = e.target.value;
  const oldLanguageKey = state.languageKey;

  state.update({
    languageKey: newLanguageKey,
  });
  saveBotSettings();
  await loadTranslations(newLanguageKey);
  updateTranslations();

  console.log(`🔄 Language switched to ${newLanguageKey} (was ${oldLanguageKey})`);
}

export function handleCloseSettingsClick() {
  const settingsContainer = document.getElementById('wplace-settings-container');
  if (!settingsContainer) return;

  settingsContainer.style.animation = 'settings-fade-out 0.3s ease-out forwards';
  settingsContainer.classList.remove('show');

  setTimeout(() => {
    settingsContainer.style.animation = '';
  }, 300);
}
