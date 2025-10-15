import { createColorFilterDialog } from './create-color-filter-dialog.js';
import { onColorFilterChange, state } from '../../core/state.js';
import { APP_CONSTANTS } from '../../app/config/app-constants.js';
import { showAlert } from '../../shared/ui/alerts.js';
import { t } from '../../i18n/index.js';
import { makeDraggable } from '../../shared/ui/drag.js';

/** @type {HTMLElement | null} */
let colorFilterDialog = null;

// Current sort method
let currentSortMethod = 'frequency';
let currentSearchQuery = '';

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

    // Setup event listeners
    setupColorFilterEventListeners();
  }

  // Render colors
  renderColorList();

  colorFilterDialog.style.display = 'block';
}

/**
 * Setup event listeners for the color filter dialog
 */
function setupColorFilterEventListeners() {
  // todo add refresh button, or somehow make content reactive to state
  // todo add search box
  const closeBtn = document.getElementById('closeColorFilterDialogBtn');
  const clearBtn = document.getElementById('clearColorFilterBtn');
  const toggleBtn = document.getElementById('toggleHideFilteredBtn');
  const sortByFrequencyBtn = document.getElementById('sortByFrequencyBtn');
  const sortByNameBtn = document.getElementById('sortByNameBtn');
  const sortByColorIdBtn = document.getElementById('sortByColorIdBtn');
  const searchInput = document.getElementById('colorFilterSearch');
  const searchClearBtn = document.getElementById('colorFilterSearchClear');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      colorFilterDialog.style.display = 'none';
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.clearColorFilter();
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      state.toggleHideFiltered();

      updateFilterToggleState();
    });
  }

  if (sortByFrequencyBtn) {
    sortByFrequencyBtn.addEventListener('click', () => {
      currentSortMethod = 'frequency';
      updateSortButtons();
      renderColorList();
    });
  }

  if (sortByNameBtn) {
    sortByNameBtn.addEventListener('click', () => {
      currentSortMethod = 'name';
      updateSortButtons();
      renderColorList();
    });
  }

  if (sortByColorIdBtn) {
    sortByColorIdBtn.addEventListener('click', () => {
      currentSortMethod = 'id';
      updateSortButtons();
      renderColorList();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      renderColorList();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      const searchInput = document.getElementById('colorFilterSearch');
      if (searchInput) {
        searchInput.value = '';
        currentSearchQuery = '';
        renderColorList();
      }
    });
  }

  // todo add reactive update for settings transparent/white paint option toggle
  onColorFilterChange(() => {
    updateFilterToggleState();
    renderColorList();
  });
}

/**
 * Update the visual state of the filter toggle button
 */
function updateFilterToggleState() {
  const toggleBtn = document.getElementById('toggleHideFilteredBtn');
  if (toggleBtn) {
    toggleBtn.classList.toggle('wplace-btn-primary', state.hideFiltered);
    toggleBtn.title = state.hideFiltered ? t('filteringEnabled') : t('filteringDisabled');
  }
}

/**
 * Update sort button visual states
 */
function updateSortButtons() {
  const sortByFrequencyBtn = document.getElementById('sortByFrequencyBtn');
  const sortByNameBtn = document.getElementById('sortByNameBtn');
  const sortByColorIdBtn = document.getElementById('sortByColorIdBtn');

  if (sortByFrequencyBtn) {
    sortByFrequencyBtn.classList.toggle('wplace-btn-primary', currentSortMethod === 'frequency');
  }

  if (sortByNameBtn) {
    sortByNameBtn.classList.toggle('wplace-btn-primary', currentSortMethod === 'name');
  }

  if (sortByColorIdBtn) {
    sortByColorIdBtn.classList.toggle('wplace-btn-primary', currentSortMethod === 'id');
  }
}

/**
 * Render the color list based on current state and filters
 */
function renderColorList() {
  const listContainer = document.getElementById('wplace-color-list');
  const noColorsEl = document.getElementById('wplace-no-colors');

  if (!listContainer || !noColorsEl) return;

  // Clear
  listContainer.innerHTML = '';

  // Use filtered or unfiltered color frequency based on hideFiltered state
  const colorFrequency = state.hasActiveHiddenFilter
    ? state.filteredColorFrequency
    : state.artColorFrequency;

  /** @type {Array<{id: number, name: string, rgb: [number, number, number], frequency: number}>} */
  const colorEntries = [];

  /**
   * Converts a Map of color frequencies into an array with color metadata.
   *
   * @param {Map<number, number>} colorFrequencyMap - Map of colorId → frequency.
   * @returns {Array<{id: number, name: string, rgb: [number, number, number], frequency: number}>}
   */
  for (const [colorId, frequency] of colorFrequency.entries()) {
    const def = APP_CONSTANTS.COLOR_MAP[colorId];
    if (!def) continue;

    // Apply search filter
    const name = def.name.toLowerCase();
    if (currentSearchQuery && !name.includes(currentSearchQuery)) {
      continue;
    }

    const { id, name: colorName, rgb } = def;
    colorEntries.push({
      id,
      name: colorName,
      rgb: [rgb.r, rgb.g, rgb.b],
      frequency,
    });
  }

  switch (currentSortMethod) {
    case 'frequency':
      colorEntries.sort((a, b) => b.frequency - a.frequency);
      break;
    case 'name':
      colorEntries.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'id':
      colorEntries.sort((a, b) => a.id - b.id);
      break;
  }

  if (colorEntries.length === 0) {
    noColorsEl.style.display = 'block';
  } else {
    noColorsEl.style.display = 'none';

    colorEntries.forEach((entry) => {
      const rgbStr = `rgb(${entry.rgb.join(',')})`;
      const item = document.createElement('div');
      item.className = 'wplace-color-item';

      const swatch = document.createElement('div');
      swatch.className = `wplace-filter-color-swatch ${state.filteredColorIds.has(entry.id) ? 'filtered' : 'active'}`;
      swatch.style.backgroundColor = rgbStr;
      swatch.title = `${entry.name} (${entry.frequency})`;

      swatch.addEventListener('click', (e) => {
        e.preventDefault();
        state.toggleColorFilter(entry.id);

        // Update visual state of the swatch
        swatch.classList.toggle('filtered', state.filteredColorIds.has(entry.id));
        swatch.classList.toggle('active', !state.filteredColorIds.has(entry.id));

        // Re-render if hideFiltered is enabled (to show/hide the color)
        if (state.hideFiltered) {
          renderColorList();
        }
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
}
