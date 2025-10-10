import { makeDraggable } from '../panel.js';
import { createColorFilterDialog } from '../components/create-color-filter-dialog.js';
import { state } from '../../core/state.js';
import { APP_CONSTANTS } from '../../config/APP_CONSTANTS.js';
import { showAlert } from '../alerts.js';
import { t } from '../../i18n/i18.js';

/** @type {HTMLElement | null} */
let colorFilterDialog = null;

/**
 * Opens the color filter dialog showing image colors sorted by frequency.
 */
export async function handleColorFilter() {
  if (!state.artColorFrequency || state.artColorFrequency.size === 0) {
    showAlert(t('noColorsDetected'), 'warning');
    return;
  }

  if (!colorFilterDialog) {
    colorFilterDialog = createColorFilterDialog();
    document.body.appendChild(colorFilterDialog);
    makeDraggable(colorFilterDialog);
    // todo add refresh button, or somehow make content reactive to state
    const closeBtn = document.getElementById('closeColorFilterDialogBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        colorFilterDialog.style.display = 'none';
      });
    }
  }

  // Render colors
  const listContainer = document.getElementById('wplace-color-list');
  const noColorsEl = document.getElementById('wplace-no-colors');

  if (!listContainer || !noColorsEl) return;

  // Clear
  listContainer.innerHTML = '';

  const colorEntries = [];

  // Convert Map<string, number> → array with metadata
  for (const [colorKey, frequency] of state.artColorFrequency.entries()) {
    const [r, g, b] = colorKey.split(',').map(Number);
    if ([r, g, b].some(isNaN)) continue;

    // Find matching color in palette
    let matchedColor = null;
    for (const [idStr, def] of Object.entries(APP_CONSTANTS.COLOR_MAP)) {
      const id = Number(idStr);
      if (def.rgb.r === r && def.rgb.g === g && def.rgb.b === b) {
        matchedColor = { id, name: def.name, rgb: [r, g, b] };
        break;
      }
    }

    if (matchedColor) {
      colorEntries.push({ ...matchedColor, frequency });
    }
  }

  // Sort by frequency (desc)
  colorEntries.sort((a, b) => b.frequency - a.frequency);

  if (colorEntries.length === 0) {
    noColorsEl.style.display = 'block';
  } else {
    noColorsEl.style.display = 'none';

    colorEntries.forEach((entry) => {
      const rgbStr = `rgb(${entry.rgb.join(',')})`;
      const item = document.createElement('div');
      item.className = 'wplace-color-item';

      const swatch = document.createElement('div');
      swatch.className = 'wplace-color-swatch active';
      swatch.style.backgroundColor = rgbStr;
      swatch.style.width = '22px';
      swatch.style.height = '22px';
      swatch.style.cursor = 'pointer';

      swatch.addEventListener('click', (e) => {
        e.preventDefault();
        // TODO: later — toggle filter
      });

      const nameEl = document.createElement('div');
      nameEl.className = 'wplace-color-item-name';
      nameEl.title = `${entry.name} (${entry.frequency})`;
      nameEl.textContent = entry.name;

      const freqEl = document.createElement('div');
      freqEl.style.fontSize = '10px';
      freqEl.style.color = 'var(--wplace-text-muted)';
      freqEl.style.textAlign = 'center';
      freqEl.textContent = entry.frequency.toString();

      item.appendChild(swatch);
      item.appendChild(nameEl);
      item.appendChild(freqEl);

      listContainer.appendChild(item);
    });
  }

  colorFilterDialog.style.display = 'block';
}
