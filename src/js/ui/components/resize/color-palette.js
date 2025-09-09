import { state } from '../../../core/state.js';
import { APP_CONSTANTS } from '../../../config/APP_CONSTANTS.js';
import { createElement } from '../../../utils/dom.js';
import { t } from '../../../i18n/i18.js';

function toggleAllColors(select, updateActiveColorPalette, showingUnavailable = false) {
  const swatches = document.querySelectorAll('.wplace-color-swatch');
  if (swatches) {
    swatches.forEach((swatch) => {
      // Only toggle colors that are available or if we're showing unavailable colors
      const isUnavailable = swatch.classList.contains('unavailable');
      if (!isUnavailable || showingUnavailable) {
        // Don't try to select unavailable colors
        if (!isUnavailable) {
          swatch.classList.toggle('active', select);
        }
      }
    });
  }
  updateActiveColorPalette();
}

function unselectAllPaidColors(updateActiveColorPalette) {
  const swatches = document.querySelectorAll('.wplace-color-swatch');
  if (swatches) {
    swatches.forEach((swatch) => {
      const colorId = parseInt(swatch.getAttribute('data-color-id'), 10);
      if (!isNaN(colorId) && colorId >= 32) {
        swatch.classList.toggle('active', false);
      }
    });
  }
  updateActiveColorPalette();
}

export function initializeColorPalette(container, onPaletteChange) {
  const colorsContainer = container.querySelector('#colors-container');
  const showAllToggle = container.querySelector('#showAllColorsToggle');
  if (!colorsContainer) return;

  // Use already captured colors from state (captured during upload)
  // Don't re-fetch colors here, use what was captured when user clicked upload
  if (!state.availableColors || state.availableColors.length === 0) {
    // If no colors have been captured yet, show message
    colorsContainer.innerHTML = `<div class="wplace-colors-placeholder">${t(
      'uploadImageFirst'
    )}</div>`;
    return;
  }
  function updateActiveColorPalette(onPaletteChange) {
    const newPalette = [];
    const activeSwatches = document.querySelectorAll('.wplace-color-swatch.active');
    activeSwatches.forEach((swatch) => {
      const rgbStr = swatch.getAttribute('data-rgb');
      if (rgbStr) {
        const rgb = rgbStr.split(',').map(Number);
        newPalette.push(rgb);
      }
    });

    state.activeColorPalette = newPalette;

    if (typeof onPaletteChange === 'function') {
      onPaletteChange(newPalette);
    }
  }
  function populateColors(showUnavailable = false) {
    colorsContainer.innerHTML = '';
    let availableCount = 0;
    let totalCount = 0;

    const allColors = Object.values(APP_CONSTANTS.COLOR_MAP);

    allColors.forEach((colorData) => {
      const { id, name, rgb } = colorData;
      const rgbKey = `${rgb.r},${rgb.g},${rgb.b}`;
      totalCount++;

      // Check if this color is available in the captured colors
      const isAvailable = state.availableColors.some(
        (c) => c.rgb[0] === rgb.r && c.rgb[1] === rgb.g && c.rgb[2] === rgb.b
      );

      // If not showing all colors and this color is not available, skip it
      if (!showUnavailable && !isAvailable) {
        return;
      }

      if (isAvailable) availableCount++;

      const colorItem = createElement('div', {
        className: 'wplace-color-item',
      });
      const swatch = createElement('button', {
        className: `wplace-color-swatch ${!isAvailable ? 'unavailable' : ''}`,
        title: `${name} (ID: ${id})${!isAvailable ? ' (Unavailable)' : ''}`,
        'data-rgb': rgbKey,
        'data-color-id': id,
      });
      swatch.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

      // Make unavailable colors visually distinct
      if (!isAvailable) {
        swatch.style.opacity = '0.4';
        swatch.style.filter = 'grayscale(50%)';
        swatch.disabled = true;
      } else {
        // Select available colors by default
        swatch.classList.add('active');
      }

      const nameLabel = createElement(
        'span',
        {
          className: 'wplace-color-item-name',
          style: !isAvailable ? 'color: #888; font-style: italic;' : '',
        },
        name + (!isAvailable ? ' (N/A)' : '')
      );

      // Only add click listener for available colors
      if (isAvailable) {
        swatch.addEventListener('click', () => {
          swatch.classList.toggle('active');
          updateActiveColorPalette();
        });
      }

      colorItem.appendChild(swatch);
      colorItem.appendChild(nameLabel);
      colorsContainer.appendChild(colorItem);
    });

    updateActiveColorPalette();
  }

  // Initialize with only available colors
  populateColors(false);

  // Add toggle functionality
  if (showAllToggle) {
    showAllToggle.addEventListener('change', (e) => {
      populateColors(e.target.checked);
    });
  }

  container
    .querySelector('#selectAllBtn')
    ?.addEventListener('click', () =>
      toggleAllColors(true, updateActiveColorPalette, showAllToggle?.checked)
    );
  container
    .querySelector('#unselectAllBtn')
    ?.addEventListener('click', () =>
      toggleAllColors(false, updateActiveColorPalette, showAllToggle?.checked)
    );
  container
    .querySelector('#unselectPaidBtn')
    ?.addEventListener('click', () => unselectAllPaidColors(updateActiveColorPalette));
}
