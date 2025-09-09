import { state } from '../../core/state.js';
import { t } from '../../i18n/i18.js';
import { DEFAULT_SETTINGS } from '../../config/DEFAULT_SETTINGS.js';
import { APP_CONSTANTS } from '../../config/APP_CONSTANTS.js';

export function createSettingsContainer() {
  const settingsContainer = document.createElement('div');
  settingsContainer.id = 'wplace-settings-container';
  settingsContainer.className = 'wplace-settings-container-base';
  // noinspection CssInvalidFunction
  settingsContainer.innerHTML = `
      <div class="wplace-settings-header">
        <div class="wplace-settings-title-wrapper">
          <h3 class="wplace-settings-title">
            <i class="fas fa-cog wplace-settings-icon"></i>
          <span data-i18n-key="settings">${t('settings')}</span>
          </h3>
        <button id="closeSettingsBtn" class="wplace-settings-close-btn" title="${t(
          'close'
        )}" data-i18n-key="close" data-i18n-attr="title">✕</button>
        </div>
      </div>

      <div class="wplace-settings-content">
        
        <!-- Token Source Selection -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-key wplace-icon-key"></i>
          <span data-i18n-key="tokenSource">Token Source</span>
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="tokenSourceSelect" class="wplace-settings-select">
            <option value="generator" ${
              DEFAULT_SETTINGS.tokenSource === 'generator' ? 'selected' : ''
            } data-i18n-key="tokenSourceGenerator" class="wplace-settings-option">🤖 Automatic Token Generator (Recommended)</option>
            <option value="hybrid" ${
              DEFAULT_SETTINGS.tokenSource === 'hybrid' ? 'selected' : ''
            } data-i18n-key="tokenSourceHybrid" class="wplace-settings-option">🔄 Generator + Auto Fallback</option>
            <option value="manual" ${
              DEFAULT_SETTINGS.tokenSource === 'manual' ? 'selected' : ''
            } data-i18n-key="tokenSourceManual" class="wplace-settings-option">🎯 Manual Pixel Placement</option>
            </select>
          <p class="wplace-settings-description" data-i18n-key="tokenSourceDescription">
              Generator mode creates tokens automatically. Hybrid mode falls back to manual when generator fails. Manual mode only uses pixel placement.
            </p>
          </div>
        </div>

        <!-- Automation Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-robot wplace-icon-robot"></i>
          <span data-i18n-key="automation">${t('automation')}</span>
          </label>
          <!-- Token generator is always enabled - settings moved to Token Source above -->
        </div>

        <!-- Overlay Settings Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-eye wplace-icon-eye"></i>
          <span data-i18n-key="overlaySettings">Overlay Settings</span>
          </label>
          <div class="wplace-settings-section-wrapper wplace-overlay-wrapper">
              <!-- Opacity Slider -->
              <div class="wplace-overlay-opacity-control">
                <div class="wplace-overlay-opacity-header">
                 <span class="wplace-overlay-opacity-label" data-i18n-key="overlayOpacity">Overlay Opacity</span>
                   <div id="overlayOpacityValue" class="wplace-overlay-opacity-value">
                    ${Math.round(DEFAULT_SETTINGS.overlayOpacity * 100)}%
                   </div>
                </div>
                <input type="range" id="overlayOpacitySlider" min="0.1" max="1" step="0.05" value="${DEFAULT_SETTINGS.overlayOpacity}" class="wplace-overlay-opacity-slider">
              </div>
              <!-- Blue Marble Toggle -->
              <label for="enableBlueMarbleToggle" class="wplace-settings-toggle">
                  <div>
                    <span class="wplace-settings-toggle-title" data-i18n-key="blueMarbleEffect">Blue Marble Effect</span>
                    <p class="wplace-settings-toggle-description" data-i18n-key="blueMarbleDescription">Renders a dithered "shredded" overlay.</p>
                  </div>
                <input type="checkbox" id="enableBlueMarbleToggle" ${
                  DEFAULT_SETTINGS.blueMarbleEnabled ? 'checked' : ''
                } class="wplace-settings-checkbox"/>
              </label>
          </div>
        </div>

        <!-- Paint Options Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-paint-brush wplace-icon-paint"></i>
          <span data-i18n-key="paintOptions">${t('paintOptions')}</span>
          </label>
          <!-- Pixel Filter Toggles -->
          <div id="pixelFilterControls" class="wplace-settings-section-wrapper wplace-pixel-filter-controls">
            <!-- Paint White Pixels -->
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="paintWhitePixels">${t(
                'paintWhitePixels'
              )}</span>
              <p class="wplace-settings-toggle-description" data-i18n-key="paintWhitePixelsDescription">${t(
                'paintWhitePixelsDescription'
              )}</p>
              </div>
            <input type="checkbox" id="settingsPaintWhiteToggle" ${
              DEFAULT_SETTINGS.paintWhitePixels ? 'checked' : ''
            } class="wplace-settings-checkbox"/>
            </label>
            
            <!-- Paint Transparent Pixels -->
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="paintTransparentPixels">${t(
                'paintTransparentPixels'
              )}</span>
              <p class="wplace-settings-toggle-description" data-i18n-key="paintTransparentPixelsDescription">${t(
                'paintTransparentPixelsDescription'
              )}</p>
              </div>
            <input type="checkbox" id="settingsPaintTransparentToggle" ${
              DEFAULT_SETTINGS.paintTransparentPixels ? 'checked' : ''
            } class="wplace-settings-checkbox"/>
            </label>
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="paintUnavailablePixels">${t(
                'paintUnavailablePixels'
              )}</span>
              <p class="wplace-settings-toggle-description" data-i18n-key="paintUnavailablePixelsDescription">${t(
                'paintUnavailablePixelsDescription'
              )}</p>
              </div>
            <input type="checkbox" id="paintUnavailablePixelsToggle" ${
              DEFAULT_SETTINGS.paintUnavailablePixels ? 'checked' : ''
            } class="wplace-settings-checkbox"/>
            </label>
          </div>
        </div>

        <!-- Speed Control Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-tachometer-alt wplace-icon-speed"></i>
          <span data-i18n-key="paintingSpeed">${t('paintingSpeed')}</span>
          </label>
          
          <!-- Batch Mode Selection -->
          <div class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-dice wplace-icon-dice"></i>
            <span data-i18n-key="batchMode">Batch Mode</span>
            </label>
            <select id="batchModeSelect" class="wplace-settings-select">
              <option value="normal" data-i18n-key="batchModeNormal" class="wplace-settings-option">📦 Normal (Fixed Size)</option>
              <option value="random" data-i18n-key="batchModeRandom" class="wplace-settings-option">🎲 Random (Range)</option>
            </select>
          </div>
          
          <!-- Normal Mode: Fixed Size Slider -->
          <div id="normalBatchControls" class="wplace-batch-controls wplace-normal-batch-controls">
            <div class="wplace-speed-slider-container">
              <input type="range" id="speedSlider" min="${APP_CONSTANTS.PAINTING_SPEED.MIN}" max="${APP_CONSTANTS.PAINTING_SPEED.MAX}" value="${DEFAULT_SETTINGS.paintingSpeed}" class="wplace-speed-slider">
              <div id="speedValue" class="wplace-speed-value">${DEFAULT_SETTINGS.paintingSpeed}</div>
            </div>
            <div class="wplace-speed-labels">
              <span class="wplace-speed-min"><i class="fas fa-turtle"></i> ${APP_CONSTANTS.PAINTING_SPEED.MIN}</span>
              <span class="wplace-speed-max"><i class="fas fa-rabbit"></i> ${APP_CONSTANTS.PAINTING_SPEED.MAX}</span>
            </div>
          </div>
          
          <!-- Random Mode: Range Controls -->
          <div id="randomBatchControls" class="wplace-batch-controls wplace-random-batch-controls">
            <div class="wplace-random-batch-grid">
              <div>
                <label class="wplace-random-batch-label">
                  <i class="fas fa-arrow-down wplace-icon-min"></i>
                <span data-i18n-key="minimumBatchSize">Minimum Batch Size</span>
                </label>
                <input type="number" id="randomBatchMin" min="1" max="1000" value="${DEFAULT_SETTINGS.randomBatchMin}" class="wplace-settings-number-input">
              </div>
              <div>
                <label class="wplace-random-batch-label">
                  <i class="fas fa-arrow-up wplace-icon-max"></i>
                <span data-i18n-key="maximumBatchSize">Maximum Batch Size</span>
                </label>
                <input type="number" id="randomBatchMax" min="1" max="1000" value="${DEFAULT_SETTINGS.randomBatchMax}" class="wplace-settings-number-input">
              </div>
            </div>
          <p class="wplace-random-batch-description" data-i18n-key="randomBatchDescription">🎲 Random batch size between min and max values</p>
          </div>
          
          <!-- Speed Control Toggle -->
          <label class="wplace-speed-control-toggle">
            <input type="checkbox" id="enableSpeedToggle" ${
              DEFAULT_SETTINGS.paintingSpeedLimitEnabled ? 'checked' : ''
            } class="wplace-speed-checkbox"/>
          <span data-i18n-key="enablePaintingSpeedLimit">${t('enablePaintingSpeedLimit')}</span>
          </label>
        </div>
        
        <!-- Coordinate Generation Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-route wplace-icon-route"></i>
          <span data-i18n-key="coordinateGeneration">Coordinate Generation</span>
          </label>
          
          <!-- Mode Selection -->
          <div class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-th wplace-icon-table"></i>
            <span data-i18n-key="generationMode">Generation Mode</span>
            </label>
            <select id="coordinateModeSelect" class="wplace-settings-select">
            <option value="rows" data-i18n-key="modeRows" class="wplace-settings-option">📏 Rows (Horizontal Lines)</option>
            <option value="columns" data-i18n-key="modeColumns" class="wplace-settings-option">📐 Columns (Vertical Lines)</option>
            <option value="circle-out" data-i18n-key="modeCircleOut" class="wplace-settings-option">⭕ Circle Out (Center → Edges)</option>
            <option value="circle-in" data-i18n-key="modeCircleIn" class="wplace-settings-option">⭕ Circle In (Edges → Center)</option>
            <option value="blocks" data-i18n-key="modeBlocks" class="wplace-settings-option">🟫 Blocks (Ordered)</option>
            <option value="shuffle-blocks" data-i18n-key="modeShuffleBlocks" class="wplace-settings-option">🎲 Shuffle Blocks (Random)</option>
            </select>
          </div>
          
          <!-- Direction Selection (only for rows/columns) -->
          <div id="directionControls" class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-compass wplace-icon-compass"></i>
            <span data-i18n-key="startingDirection">Starting Direction</span>
            </label>
            <select id="coordinateDirectionSelect" class="wplace-settings-select">
            <option value="top-left" data-i18n-key="topLeft" class="wplace-settings-option">↖️ Top-Left</option>
            <option value="top-right" data-i18n-key="topRight" class="wplace-settings-option">↗️ Top-Right</option>
            <option value="bottom-left" data-i18n-key="bottomLeft" class="wplace-settings-option">↙️ Bottom-Left</option>
            <option value="bottom-right" data-i18n-key="bottomRight" class="wplace-settings-option">↘️ Bottom-Right</option>
            </select>
          </div>
          
          <!-- Snake Pattern Toggle (only for rows/columns) -->
          <div id="snakeControls" class="wplace-snake-pattern-controls wplace-settings-section-wrapper">
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="snakePattern">Snake Pattern</span>
              <p class="wplace-settings-toggle-description" data-i18n-key="snakePatternDescription">Alternate direction for each row/column (zigzag pattern)</p>
              </div>
            <input type="checkbox" id="coordinateSnakeToggle" ${
              DEFAULT_SETTINGS.coordinateSnake ? 'checked' : ''
            } class="wplace-settings-checkbox"/>
            </label>
          </div>
          
          <!-- Block Size Controls (only for blocks/shuffle-blocks) -->
          <div id="blockControls" class="wplace-block-size-controls wplace-settings-section-wrapper wplace-shuffle-block-size-controls">
            <div class="wplace-block-size-grid">
              <div>
                <label class="wplace-block-size-label">
                  <i class="fas fa-arrows-alt-h wplace-icon-width"></i>
                <span data-i18n-key="blockWidth">Block Width</span>
                </label>
                <input type="number" id="blockWidthInput" min="1" max="50" value="6" class="wplace-settings-number-input">
              </div>
              <div>
                <label style="display: block; color: rgba(255,255,255,0.8); font-size: 12px; margin-bottom: 8px;">
                  <i class="fas fa-arrows-alt-v wplace-icon-height"></i>
                <span data-i18n-key="blockHeight">Block Height</span>
                </label>
                <input type="number" id="blockHeightInput" min="1" max="50" value="2" class="wplace-settings-number-input">
              </div>
            </div>
          <p class="wplace-block-size-description" data-i18n-key="blockSizeDescription">🧱 Block dimensions for block-based generation modes</p>
          </div>
        </div>
        
        <!-- Notifications Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-bell wplace-icon-bell"></i>
          <span data-i18n-key="desktopNotifications">Desktop Notifications</span>
          </label>
          <div class="wplace-settings-section-wrapper wplace-notifications-wrapper">
            <label class="wplace-notification-toggle">
            <span data-i18n-key="enableNotifications">${t('enableNotifications')}</span>
            <input type="checkbox" id="notifEnabledToggle" ${
              DEFAULT_SETTINGS.notificationsEnabled ? 'checked' : ''
            } class="wplace-notification-checkbox" />
            </label>
            <label class="wplace-notification-toggle">
            <span data-i18n-key="notifyOnChargesThreshold">${t('notifyOnChargesThreshold')}</span>
            <input type="checkbox" id="notifOnChargesToggle" ${
              DEFAULT_SETTINGS.notifyOnChargesReached ? 'checked' : ''
            } class="wplace-notification-checkbox" />
            </label>
            <label class="wplace-notification-toggle">
            <span data-i18n-key="onlyWhenNotFocused">${t('onlyWhenNotFocused')}</span>
            <input type="checkbox" id="notifOnlyUnfocusedToggle" ${
              DEFAULT_SETTINGS.notifyOnlyWhenUnfocused ? 'checked' : ''
            } class="wplace-notification-checkbox" />
            </label>
            <div class="wplace-notification-interval">
            <span data-i18n-key="repeatEvery">${t('repeatEvery')}</span>
              <input type="number" id="notifIntervalInput" min="1" max="60" value="${DEFAULT_SETTINGS.notificationIntervalMinutes}" class="wplace-notification-interval-input" />
            <span data-i18n-key="minutesPl">${t('minutesPl')}</span>
            </div>
            <div class="wplace-notification-buttons">
            <button id="notifRequestPermBtn" class="wplace-btn wplace-btn-secondary wplace-notification-perm-btn">
              <i class="fas fa-unlock"></i>
              <span data-i18n-key="grantPermission">${t('grantPermission')}</span>
            </button>
            <button id="notifTestBtn" class="wplace-btn wplace-notification-test-btn">
              <i class="fas fa-bell"></i>
              <span data-i18n-key="test">${t('test')}</span>
            </button>
            </div>
          </div>
        </div>

        <!-- Theme Selection Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-palette wplace-icon-palette"></i>
          <span data-i18n-key="themeSettings">${t('themeSettings')}</span>
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="themeSelect" class="wplace-settings-select">
            ${Object.entries(APP_CONSTANTS.THEMES)
              .map(
                ([key, theme]) =>
                  `<option value="${key}" ${
                    state.themeKey === key ? 'selected' : ''
                  } data-i18n-key="theme_${key}" class="wplace-settings-option">${theme.name}</option>`
              )
              .join('')}
            </select>
          </div>
        </div>

        <!-- Language Selection Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-globe wplace-icon-globe"></i>
          <span data-i18n-key="language">${t('language')}</span>
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="languageSelect" class="wplace-settings-select">
            <option value="zh-CN" ${state.languageKey === 'zh-CN' ? 'selected' : ''} class="wplace-settings-option">🇨🇳 简体中文</option>
            <option value="es-MX" ${state.languageKey === 'es-MX' ? 'selected' : ''} class="wplace-settings-option">🇲🇽 Español mexicano</option>
            <option value="en" ${state.languageKey === 'en' ? 'selected' : ''} class="wplace-settings-option">🇺🇸 English</option>
            <option value="ru" ${state.languageKey === 'ru' ? 'selected' : ''} class="wplace-settings-option">🇷🇺 Русский</option>
            <option value="pt" ${state.languageKey === 'pt' ? 'selected' : ''} class="wplace-settings-option">🇧🇷 Português</option>
            <option value="id" ${state.languageKey === 'id' ? 'selected' : ''} class="wplace-settings-option">🇮🇩 Bahasa Indonesia</option>
            <option value="fr" ${state.languageKey === 'fr' ? 'selected' : ''} class="wplace-settings-option">🇫🇷 Français</option>
            <option value="tr" ${state.languageKey === 'tr' ? 'selected' : ''} class="wplace-settings-option">🇹🇷 Türkçe</option>
            <option value="ja" ${state.languageKey === 'ja' ? 'selected' : ''} class="wplace-settings-option">🇯🇵 日本語</option>
            <option value="vi" ${state.languageKey === 'vi' ? 'selected' : ''} class="wplace-settings-option">🇻🇳 Tiếng Việt</option>
            <option value="ko" ${state.languageKey === 'ko' ? 'selected' : ''} class="wplace-settings-option">🇰🇷 한국어</option>
            <option value="uk" ${state.languageKey === 'uk' ? 'selected' : ''} class="wplace-settings-option">🇺🇦 Українська</option>
            <option value="zh-TW" ${state.languageKey === 'zh-TW' ? 'selected' : ''} class="wplace-settings-option">🇹🇼 繁體中文</option>
            </select>
          </div>
        </div>
      </div>

      <style>
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes settings-slide-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes settings-fade-out {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
        }

        #speedSlider::-webkit-slider-thumb, #overlayOpacitySlider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3), 0 0 0 2px #4facfe;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        #speedSlider::-webkit-slider-thumb:hover, #overlayOpacitySlider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 0 3px #4facfe;
        }

        #speedSlider::-moz-range-thumb, #overlayOpacitySlider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3), 0 0 0 2px #4facfe;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        #themeSelect:hover, #languageSelect:hover {
          border-color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.2);
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }

        #themeSelect:focus, #languageSelect:focus {
          border-color: #4facfe;
          box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.3);
        }

        #themeSelect option, #languageSelect option {
          background: #2d3748;
          color: white;
          padding: 10px;
          border-radius: 6px;
        }

        #themeSelect option:hover, #languageSelect option:hover {
          background: #4a5568;
        }

        .wplace-dragging {
          opacity: 0.9;
          box-shadow: 0 30px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.2);
          transition: none;
        }

        .wplace-settings-header:hover {
          background: rgba(255,255,255,0.15) !important;
        }

        .wplace-settings-header:active {
          background: rgba(255,255,255,0.2) !important;
        }
      </style>
    `;
  return settingsContainer;
}
