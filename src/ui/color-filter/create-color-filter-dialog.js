import { t } from '../../i18n/index.js';
import { state } from '../../core/state.js';

/**
 * Creates a draggable color filter dialog showing colors used in the image,
 * sorted by frequency.
 */
export function createColorFilterDialog() {
  const dialog = document.createElement('div');
  dialog.id = 'wplace-color-filter-dialog';
  dialog.className = 'wplace-dialog wplace-start-position-container';
  dialog.style.display = 'none';

  const hideFiltered = state.hideFiltered;

  dialog.innerHTML = `
    <div class="wplace-header">
      <div class="wplace-header-title">
        <i class="fas fa-palette" style="color: var(--wplace-icon-palette);"></i>
        <span data-i18n-key="colorFilter">${t('colorFilter')}</span>
      </div>
      <div class="wplace-header-controls">
        <button id="clearColorFilterBtn" class="wplace-header-btn" title="${t('clearFilter')}" style="margin-right: 5px;">
          <i class="fas fa-broom"></i>
        </button>
        <button id="toggleHideFilteredBtn" class="wplace-header-btn ${hideFiltered ? 'wplace-btn-primary' : ''}" title="${hideFiltered ? t('hideFilteredEnabled') : t('hideFilteredDisabled')}" style="margin-right: 5px;">
          <i class="fas fa-filter"></i>
        </button>
        <button id="closeColorFilterDialogBtn" class="wplace-header-btn" title="${t('close')}">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <div class="wplace-content">
      <!-- Search box -->
      <div class="wplace-search-container" style="padding: 8px 0; display: flex; gap: 6px; align-items: center;">
        <input 
          type="text" 
          id="colorFilterSearch" 
          placeholder="${t('searchColors')}" 
          style="flex: 1; padding: 4px 8px; font-size: 11px; border: 1px solid var(--wplace-border); border-radius: 4px;"
        />
        <button id="colorFilterSearchClear" class="wplace-btn" style="padding: 4px 8px; font-size: 10px;">${t('clear')}</button>
      </div>
      
      <!-- Sort controls -->
      <div class="wplace-color-filter-sort" style="padding: 8px 0; display: flex; gap: 6px; align-items: center; font-size: 11px;">
        <span>${t('sortBy')}:</span>
        <button id="sortByFrequencyBtn" class="wplace-btn wplace-btn-primary" style="padding: 4px 8px; font-size: 10px;">${t('frequency')}</button>
        <button id="sortByNameBtn" class="wplace-btn" style="padding: 4px 8px; font-size: 10px;">${t('name')}</button>
        <button id="sortByColorIdBtn" class="wplace-btn" style="padding: 4px 8px; font-size: 10px;">${t('id')}</button>
      </div>

      <!-- Color list -->
      <div id="wplace-color-list" class="wplace-color-grid" style="grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 10px; max-height: 300px; overflow-y: auto; padding-top: 8px;">
        <!-- populated dynamically -->
      </div>

      <div id="wplace-no-colors" class="wplace-colors-placeholder" style="display: none; padding: 20px; text-align: center; color: var(--wplace-text-muted); font-style: italic;">
        ${t('noColorsDetected')}
      </div>
    </div>
  `;

  return dialog;
}
