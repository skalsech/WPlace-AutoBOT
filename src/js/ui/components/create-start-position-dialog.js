import { t } from '../../i18n/i18.js';

// todo add new button to dialog to enable interactive coords choose when editing start position
/**
 * Creates a draggable dialog for setting starting position (region + pixel).
 */
export function createStartPositionDialog() {
  const dialog = document.createElement('div');
  dialog.id = 'wplace-start-position-dialog';
  dialog.className = 'wplace-dialog wplace-start-position-container';
  dialog.style.display = 'none';

  dialog.innerHTML = `
    <div class="wplace-header">
      <div class="wplace-header-title">
        <i class="fas fa-crosshairs"></i>
        <span data-i18n-key="startPositionSettings">Starting Position Settings</span>
      </div>
      <div class="wplace-header-controls">
        <button id="closeStartPositionDialogBtn" class="wplace-header-btn" title="" data-i18n-key="close" data-i18n-attr="title">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <div class="wplace-content">
      <!-- Tile Coordinates Section -->
      <div class="wplace-coordinate-group">
        <div class="wplace-coordinate-group-title">
          <i class="fas fa-layer-group"></i>
          <span data-i18n-key="tileCoordinates">Tile Coordinates</span>
        </div>
        <div class="wplace-coordinate-row">
      <div class="wplace-input-group">
        <label for="startPosTileX">${t('tileX')}:</label>
        <input type="number" id="startPosTileX" class="wplace-start-settings-number-input" min="0" step="1">
      </div>
      <div class="wplace-input-group">
        <label for="startPosTileY">${t('tileY')}:</label>
        <input type="number" id="startPosTileY" class="wplace-start-settings-number-input" min="0" step="1">
      </div>
        </div>
      </div>

      <!-- Pixel Coordinates Section -->
      <div class="wplace-coordinate-group">
        <div class="wplace-coordinate-group-title">
          <i class="fas fa-dot-circle"></i>
          <span data-i18n-key="pixelCoordinates">Pixel Coordinates</span>
        </div>
        <div class="wplace-coordinate-row">
      <div class="wplace-input-group">
        <label for="startPosPixelX">${t('pixelX')}:</label>
        <input type="number" id="startPosPixelX" class="wplace-start-settings-number-input" min="0" step="1">
      </div>
      <div class="wplace-input-group">
        <label for="startPosPixelY">${t('pixelY')}:</label>
        <input type="number" id="startPosPixelY" class="wplace-start-settings-number-input" min="0" step="1">
      </div>
        </div>
      </div>

      <div class="wplace-dialog-actions" style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;">
        <button id="applyStartPositionBtn" class="wplace-btn wplace-btn-primary">
          <i class="fas fa-check"></i>
          <span data-i18n-key="apply">Apply</span>
        </button>
      </div>
    </div>
  `;

  return dialog;
}
