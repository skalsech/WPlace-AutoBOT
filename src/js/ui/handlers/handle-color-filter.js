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

  /** @type {Array<{id: number, name: string, rgb: [number, number, number], frequency: number}>} */
  const colorEntries = [];

  /**
   * Converts a Map of color frequencies into an array with color metadata.
   *
   * @param {Map<number, number>} colorFrequencyMap - Map of colorId → frequency.
   * @returns {Array<{id: number, name: string, rgb: [number, number, number], frequency: number}>}
   */
  for (const [colorId, frequency] of state.artColorFrequency.entries()) {
    const def = APP_CONSTANTS.COLOR_MAP[colorId];
    if (!def) continue;

    const { id, name, rgb } = def;
    colorEntries.push({
      id,
      name,
      rgb: [rgb.r, rgb.g, rgb.b],
      frequency,
    });
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
