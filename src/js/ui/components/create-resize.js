import { state } from '../../core/state.js';

export function createResizeContainer() {
  const resizeContainer = document.createElement('div');
  resizeContainer.className = 'resize-container';
  resizeContainer.innerHTML = `
    <h3 class="resize-dialog-title" data-i18n-key="resizeImage"></h3>
    <div class="resize-controls">
      <label class="resize-control-label">
        Width: <span id="widthValue">0</span>px
        <input type="range" id="widthSlider" class="resize-slider" min="10" max="500" value="100">
      </label>
      <label class="resize-control-label">
        Height: <span id="heightValue">0</span>px
        <input type="range" id="heightSlider" class="resize-slider" min="10" max="500" value="100">
      </label>
      <label class="resize-checkbox-label">
        <input type="checkbox" id="keepAspect" checked>
        <span data-i18n-key="keepAspectRatio"></span>
      </label>
      <label class="resize-checkbox-label">
        <input type="checkbox" id="paintWhiteToggle" checked>
        <span data-i18n-key="paintWhitePixels"></span>
      </label>
      <label class="resize-checkbox-label">
        <input type="checkbox" id="paintTransparentToggle" checked>
        <span data-i18n-key="paintTransparentPixels"></span>
      </label>
      <div class="resize-zoom-controls">
        <button id="zoomOutBtn" class="wplace-btn resize-zoom-btn" title="" data-i18n-key="zoomOut" data-i18n-attr="title">
          <i class="fas fa-search-minus"></i>
        </button>
        <input type="range" id="zoomSlider" class="resize-slider resize-zoom-slider" min="0.1" max="20" value="1" step="0.05">
        <button id="zoomInBtn" class="wplace-btn resize-zoom-btn" title="" data-i18n-key="zoomIn" data-i18n-attr="title">
          <i class="fas fa-search-plus"></i>
        </button>
        <button id="zoomFitBtn" class="wplace-btn resize-zoom-btn" title="" data-i18n-key="fitToView" data-i18n-attr="title">
          
        </button>
        <button id="zoomActualBtn" class="wplace-btn resize-zoom-btn" title="" data-i18n-key="actualSize" data-i18n-attr="title">
          
        </button>
        <button id="panModeBtn" class="wplace-btn resize-zoom-btn" title="" data-i18n-key="panMode" data-i18n-attr="title">
          <i class="fas fa-hand-paper"></i>
        </button>
        <span id="zoomValue" class="resize-zoom-value">100%</span>
        <div id="cameraHelp" class="resize-camera-help">
          Drag to pan • Pinch to zoom • Double‑tap to zoom
        </div>
      </div>
    </div>

    <div class="resize-preview-wrapper">
      <div id="resizePanStage" class="resize-pan-stage">
        <div id="resizeCanvasStack" class="resize-canvas-stack resize-canvas-positioned">
          <canvas id="resizeCanvas" class="resize-base-canvas"></canvas>
          <canvas id="maskCanvas" class="resize-mask-canvas"></canvas>
        </div>
      </div>
    </div>

    <div class="resize-tools">
      <div class="resize-tools-container">
        <div class="resize-brush-controls">
          <div class="resize-brush-control">
            <label class="resize-tool-label">Brush</label>
            <div class="resize-tool-input-group">
              <input id="maskBrushSize" type="range" min="1" max="7" step="1" value="1" class="resize-tool-slider">
              <span id="maskBrushSizeValue" class="resize-tool-value">1</span>
            </div>
          </div>
          <div class="resize-brush-control">
            <label class="resize-tool-label">Row/col size</label>
            <div class="resize-tool-input-group">
              <input id="rowColSize" type="range" min="1" max="7" step="1" value="1" class="resize-tool-slider">
              <span id="rowColSizeValue" class="resize-tool-value">1</span>
            </div>
          </div>
        </div>
        <div class="resize-mode-controls">
          <label class="resize-tool-label">Mode</label>
          <div class="mask-mode-group resize-mode-group">
            <button id="maskModeIgnore" class="wplace-btn resize-mode-btn">Ignore</button>
            <button id="maskModeUnignore" class="wplace-btn resize-mode-btn">Unignore</button>
            <button id="maskModeToggle" class="wplace-btn wplace-btn-primary resize-mode-btn">Toggle</button>
          </div>
        </div>
        <button id="clearIgnoredBtn" class="wplace-btn resize-clear-btn" title="Clear all ignored pixels" data-i18n-key="clearAllIgnored" data-i18n-attr="title"></button>
        <button id="invertMaskBtn" class="wplace-btn resize-invert-btn" title="Invert mask" data-i18n-key="invertMask" data-i18n-attr="title"></button>
        <span class="resize-shortcut-help">Shift = Row • Alt = Column</span>
      </div>
    </div>

    <div class="wplace-section resize-color-palette-section" id="color-palette-section">
      <div class="wplace-section-title">
        <i class="fas fa-palette"></i>&nbsp;Color Palette
      </div>
      <div class="wplace-controls">
        <div class="wplace-row single">
          <label class="resize-color-toggle-label">
            <input type="checkbox" id="showAllColorsToggle" class="resize-color-checkbox">
            <span data-i18n-key="showAllColorsIncluding"></span>
          </label>
        </div>
        <div class="wplace-row" style="display: flex;">
          <button id="selectAllBtn" class="wplace-btn" style="flex: 1;" data-i18n-key="selectAll"></button>
          <button id="unselectAllBtn" class="wplace-btn" style="flex: 1;" data-i18n-key="unselectAll"></button>
          <button id="unselectPaidBtn" class="wplace-btn" data-i18n-key="unselectPaid"></button>
        </div>
        <div id="colors-container" class="wplace-color-grid"></div>
      </div>
    </div>

    <div class="wplace-section resize-advanced-color-section" id="advanced-color-section">
      <div class="wplace-section-title">
        <i class="fas fa-flask"></i>&nbsp;Advanced Color Matching
      </div>
      <div class="resize-advanced-controls">
        <label class="resize-advanced-label">
          <span class="resize-advanced-label-text">Algorithm</span>
          <select id="colorAlgorithmSelect" class="resize-advanced-select">
            <option value="lab" ${
              state.colorMatchingAlgorithm === 'lab' ? 'selected' : ''
            } data-i18n-key="perceptualLab"></option>
            <option value="legacy" ${
              state.colorMatchingAlgorithm === 'legacy' ? 'selected' : ''
            } data-i18n-key="legacyRgb"></option>
          </select>
        </label>
        <label class="resize-advanced-toggle">
          <div class="resize-advanced-toggle-content">
            <span class="resize-advanced-label-text">Chroma Penalty</span>
            <div class="resize-advanced-description">Preserve vivid colors (Lab only)</div>
          </div>
          <input type="checkbox" id="enableChromaPenaltyToggle" ${
            state.enableChromaPenalty ? 'checked' : ''
          } class="resize-advanced-checkbox" />
        </label>
        <div class="resize-chroma-weight-control">
          <div class="resize-chroma-weight-header">
            <span data-i18n-key="chromaWeight"></span>
            <span id="chromaWeightValue" class="resize-chroma-weight-value">${state.chromaPenaltyWeight}</span>
          </div>
          <input type="range" id="chromaPenaltyWeightSlider" min="0" max="0.5" step="0.01" value="${state.chromaPenaltyWeight}" class="resize-chroma-weight-slider" />
        </div>
        <label class="resize-advanced-toggle">
          <div class="resize-advanced-toggle-content">
            <span class="resize-advanced-label-text">Enable Dithering</span>
            <div class="resize-advanced-description">Floyd–Steinberg error diffusion in preview and applied output</div>
          </div>
          <input type="checkbox" id="enableDitheringToggle" ${
            state.ditheringEnabled ? 'checked' : ''
          } class="resize-advanced-checkbox" />
        </label>
        <div class="resize-threshold-controls">
          <label class="resize-threshold-label">
            <span class="resize-advanced-label-text">Transparency</span>
            <input type="number" id="transparencyThresholdInput" min="0" max="255" value="${state.customTransparencyThreshold}" class="resize-threshold-input" />
          </label>
          <label class="resize-threshold-label">
            <span class="resize-advanced-label-text">White Thresh</span>
            <input type="number" id="whiteThresholdInput" min="200" max="255" value="${state.customWhiteThreshold}" class="resize-threshold-input" />
          </label>
        </div>
        <button id="resetAdvancedColorBtn" class="wplace-btn resize-reset-advanced-btn" data-i18n-key="resetAdvanced"></button>
      </div>
    </div>

    <div class="resize-buttons">
      <button id="downloadPreviewBtn" class="wplace-btn wplace-btn-primary">
        <i class="fas fa-download"></i>
        <span data-i18n-key="downloadPreview"></span>
      </button>
      <button id="confirmResize" class="wplace-btn wplace-btn-start">
        <i class="fas fa-check"></i>
        <span data-i18n-key="confirm"></span>
      </button>
      <button id="cancelResize" class="wplace-btn wplace-btn-stop">
        <i class="fas fa-times"></i>
        <span data-i18n-key="cancel"></span>
      </button>
    </div>
  `;
  return resizeContainer;
}
