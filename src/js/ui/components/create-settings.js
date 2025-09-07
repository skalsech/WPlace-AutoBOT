import { state } from '../../core/state.js';
import { t } from '../../i18n/i18.js';

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
            ${t('settings')}
          </h3>
          <button id="closeSettingsBtn" class="wplace-settings-close-btn">✕</button>
        </div>
      </div>

      <div class="wplace-settings-content">
        
        <!-- Token Source Selection -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-key wplace-icon-key"></i>
            Token Source
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="tokenSourceSelect" class="wplace-settings-select">
              <option value="generator" ${
                state.tokenSource === 'generator' ? 'selected' : ''
              } class="wplace-settings-option">🤖 Automatic Token Generator (Recommended)</option>
              <option value="hybrid" ${
                state.tokenSource === 'hybrid' ? 'selected' : ''
              } class="wplace-settings-option">🔄 Generator + Auto Fallback</option>
              <option value="manual" ${
                state.tokenSource === 'manual' ? 'selected' : ''
              } class="wplace-settings-option">🎯 Manual Pixel Placement</option>
            </select>
            <p class="wplace-settings-description">
              Generator mode creates tokens automatically. Hybrid mode falls back to manual when generator fails. Manual mode only uses pixel placement.
            </p>
          </div>
        </div>

        <!-- Automation Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-robot wplace-icon-robot"></i>
            ${t('automation')}
          </label>
          <!-- Token generator is always enabled - settings moved to Token Source above -->
        </div>

        <!-- Overlay Settings Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-eye wplace-icon-eye"></i>
            Overlay Settings
          </label>
          <div class="wplace-settings-section-wrapper wplace-overlay-wrapper">
              <!-- Opacity Slider -->
              <div class="wplace-overlay-opacity-control">
                <div class="wplace-overlay-opacity-header">
                   <span class="wplace-overlay-opacity-label">Overlay Opacity</span>
                   <div id="overlayOpacityValue" class="wplace-overlay-opacity-value">
                    ${Math.round(state.overlayOpacity * 100)}%
                   </div>
                </div>
                <input type="range" id="overlayOpacitySlider" min="0.1" max="1" step="0.05" value="${state.overlayOpacity}" class="wplace-overlay-opacity-slider">
              </div>
              <!-- Blue Marble Toggle -->
              <label for="enableBlueMarbleToggle" class="wplace-settings-toggle">
                  <div>
                      <span class="wplace-settings-toggle-title">Blue Marble Effect</span>
                      <p class="wplace-settings-toggle-description">Renders a dithered "shredded" overlay.</p>
                  </div>
                  <input type="checkbox" id="enableBlueMarbleToggle" ${
                    state.blueMarbleEnabled ? 'checked' : ''
                  } class="wplace-settings-checkbox"/>
              </label>
          </div>
        </div>

        <!-- Paint Options Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-paint-brush wplace-icon-paint"></i>
            ${t('paintOptions')}
          </label>
          <!-- Pixel Filter Toggles -->
          <div id="pixelFilterControls" class="wplace-settings-section-wrapper wplace-pixel-filter-controls">
            <!-- Paint White Pixels -->
            <label class="wplace-settings-toggle">
              <div>
                <span class="wplace-settings-toggle-title">
                  ${t('paintWhitePixels')}
                </span>
                <p class="wplace-settings-toggle-description">
                  ${t('paintWhitePixelsDescription')}
                </p>
              </div>
              <input type="checkbox" id="settingsPaintWhiteToggle" ${
                state.paintWhitePixels ? 'checked' : ''
              } 
                class="wplace-settings-checkbox"
              />
            </label>
            
            <!-- Paint Transparent Pixels -->
            <label class="wplace-settings-toggle">
              <div>
                <span class="wplace-settings-toggle-title">
                  ${t('paintTransparentPixels')}
                </span>
                <p class="wplace-settings-toggle-description">
                  ${t('paintTransparentPixelsDescription')}
                </p>
              </div>
              <input type="checkbox" id="settingsPaintTransparentToggle" ${
                state.paintTransparentPixels ? 'checked' : ''
              } 
                class="wplace-settings-checkbox"
              />
            </label>
            <label class="wplace-settings-toggle">
              <div>
                <span class="wplace-settings-toggle-title">${t(
                  'paintUnavailablePixels'
                )}</span>
                <p class="wplace-settings-toggle-description">${t(
                  'paintUnavailablePixelsDescription'
                )}</p>
              </div>
              <input type="checkbox" id="paintUnavailablePixelsToggle" ${
                state.paintUnavailablePixels ? 'checked' : ''
              } class="wplace-settings-checkbox"/>
            </label>
          </div>
        </div>

        <!-- Speed Control Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-tachometer-alt wplace-icon-speed"></i>
            ${t('paintingSpeed')}
          </label>
          
          <!-- Batch Mode Selection -->
          <div class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-dice wplace-icon-dice"></i>
              Batch Mode
            </label>
            <select id="batchModeSelect" class="wplace-settings-select">
              <option value="normal" class="wplace-settings-option">📦 Normal (Fixed Size)</option>
              <option value="random" class="wplace-settings-option">🎲 Random (Range)</option>
            </select>
          </div>
          
          <!-- Normal Mode: Fixed Size Slider -->
          <div id="normalBatchControls" class="wplace-batch-controls wplace-normal-batch-controls">
            <div class="wplace-speed-slider-container">
              <input type="range" id="speedSlider" min="${CONFIG.PAINTING_SPEED.MIN}" max="${CONFIG.PAINTING_SPEED.MAX}" value="${CONFIG.PAINTING_SPEED.DEFAULT}" class="wplace-speed-slider">
              <div id="speedValue" class="wplace-speed-value">${CONFIG.PAINTING_SPEED.DEFAULT} (batch size)</div>
            </div>
            <div class="wplace-speed-labels">
              <span class="wplace-speed-min"><i class="fas fa-turtle"></i> ${CONFIG.PAINTING_SPEED.MIN}</span>
              <span class="wplace-speed-max"><i class="fas fa-rabbit"></i> ${CONFIG.PAINTING_SPEED.MAX}</span>
            </div>
          </div>
          
          <!-- Random Mode: Range Controls -->
          <div id="randomBatchControls" class="wplace-batch-controls wplace-random-batch-controls">
            <div class="wplace-random-batch-grid">
              <div>
                <label class="wplace-random-batch-label">
                  <i class="fas fa-arrow-down wplace-icon-min"></i>
                  Minimum Batch Size
                </label>
                <input type="number" id="randomBatchMin" min="1" max="1000" value="${CONFIG.RANDOM_BATCH_RANGE.MIN}" class="wplace-settings-number-input">
              </div>
              <div>
                <label class="wplace-random-batch-label">
                  <i class="fas fa-arrow-up wplace-icon-max"></i>
                  Maximum Batch Size
                </label>
                <input type="number" id="randomBatchMax" min="1" max="1000" value="${CONFIG.RANDOM_BATCH_RANGE.MAX}" class="wplace-settings-number-input">
              </div>
            </div>
            <p class="wplace-random-batch-description">
              🎲 Random batch size between min and max values
            </p>
          </div>
          
          <!-- Speed Control Toggle -->
          <label class="wplace-speed-control-toggle">
            <input type="checkbox" id="enableSpeedToggle" ${state.paintingSpeedLimitEnabled ? 'checked' : ''} class="wplace-speed-checkbox"/>
            <span>${t('enablePaintingSpeedLimit')}</span>
          </label>
        </div>
        
        <!-- Coordinate Generation Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-route wplace-icon-route"></i>
            Coordinate Generation
          </label>
          
          <!-- Mode Selection -->
          <div class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-th wplace-icon-table"></i>
              Generation Mode
            </label>
            <select id="coordinateModeSelect" class="wplace-settings-select">
              <option value="rows" class="wplace-settings-option">📏 Rows (Horizontal Lines)</option>
              <option value="columns" class="wplace-settings-option">📐 Columns (Vertical Lines)</option>
              <option value="circle-out" class="wplace-settings-option">⭕ Circle Out (Center → Edges)</option>
              <option value="circle-in" class="wplace-settings-option">⭕ Circle In (Edges → Center)</option>
              <option value="blocks" class="wplace-settings-option">🟫 Blocks (Ordered)</option>
              <option value="shuffle-blocks" class="wplace-settings-option">🎲 Shuffle Blocks (Random)</option>
            </select>
          </div>
          
          <!-- Direction Selection (only for rows/columns) -->
          <div id="directionControls" class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-compass wplace-icon-compass"></i>
              Starting Direction
            </label>
            <select id="coordinateDirectionSelect" class="wplace-settings-select">
              <option value="top-left" class="wplace-settings-option">↖️ Top-Left</option>
              <option value="top-right" class="wplace-settings-option">↗️ Top-Right</option>
              <option value="bottom-left" class="wplace-settings-option">↙️ Bottom-Left</option>
              <option value="bottom-right" class="wplace-settings-option">↘️ Bottom-Right</option>
            </select>
          </div>
          
          <!-- Snake Pattern Toggle (only for rows/columns) -->
          <div id="snakeControls" class="wplace-snake-pattern-controls wplace-settings-section-wrapper">
            <label class="wplace-settings-toggle">
              <div>
                <span class="wplace-settings-toggle-title">Snake Pattern</span>
                <p class="wplace-settings-toggle-description">Alternate direction for each row/column (zigzag pattern)</p>
              </div>
              <input type="checkbox" id="coordinateSnakeToggle" ${
                state.coordinateSnake ? 'checked' : ''
              } class="wplace-settings-checkbox"/>
            </label>
          </div>
          
          <!-- Block Size Controls (only for blocks/shuffle-blocks) -->
          <div id="blockControls" class="wplace-block-size-controls wplace-settings-section-wrapper wplace-shuffle-block-size-controls">
            <div class="wplace-block-size-grid">
              <div>
                <label class="wplace-block-size-label">
                  <i class="fas fa-arrows-alt-h wplace-icon-width"></i>
                  Block Width
                </label>
                <input type="number" id="blockWidthInput" min="1" max="50" value="6" class="wplace-settings-number-input">
              </div>
              <div>
                <label style="display: block; color: rgba(255,255,255,0.8); font-size: 12px; margin-bottom: 8px;">
                  <i class="fas fa-arrows-alt-v wplace-icon-height"></i>
                  Block Height
                </label>
                <input type="number" id="blockHeightInput" min="1" max="50" value="2" class="wplace-settings-number-input">
              </div>
            </div>
            <p class="wplace-block-size-description">
              🧱 Block dimensions for block-based generation modes
            </p>
          </div>
        </div>
        
        <!-- Notifications Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-bell wplace-icon-bell"></i>
            Desktop Notifications
          </label>
          <div class="wplace-settings-section-wrapper wplace-notifications-wrapper">
            <label class="wplace-notification-toggle">
              <span>${t('enableNotifications')}</span>
              <input type="checkbox" id="notifEnabledToggle" ${
                state.notificationsEnabled ? 'checked' : ''
              } class="wplace-notification-checkbox" />
            </label>
            <label class="wplace-notification-toggle">
              <span>${t('notifyOnChargesThreshold')}</span>
              <input type="checkbox" id="notifOnChargesToggle" ${
                state.notifyOnChargesReached ? 'checked' : ''
              } class="wplace-notification-checkbox" />
            </label>
            <label class="wplace-notification-toggle">
              <span>${t('onlyWhenNotFocused')}</span>
              <input type="checkbox" id="notifOnlyUnfocusedToggle" ${
                state.notifyOnlyWhenUnfocused ? 'checked' : ''
              } class="wplace-notification-checkbox" />
            </label>
            <div class="wplace-notification-interval">
              <span>${t('repeatEvery')}</span>
              <input type="number" id="notifIntervalInput" min="1" max="60" value="${state.notificationIntervalMinutes}" class="wplace-notification-interval-input" />
              <span>${t('minutesPl')}</span>
            </div>
            <div class="wplace-notification-buttons">
              <button id="notifRequestPermBtn" class="wplace-btn wplace-btn-secondary wplace-notification-perm-btn"><i class="fas fa-unlock"></i><span>${t(
                'grantPermission'
              )}</span></button>
              <button id="notifTestBtn" class="wplace-btn wplace-notification-test-btn"><i class="fas fa-bell"></i><span>${t(
                'test'
              )}</span></button>
            </div>
          </div>
        </div>

        <!-- Theme Selection Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-palette wplace-icon-palette"></i>
            ${t('themeSettings')}
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="themeSelect" class="wplace-settings-select">
            ${Object.entries(CONFIG.THEMES)
              .map(
                ([key, theme]) =>
                  `<option value="${key}" ${
                    CONFIG.currentThemeKey === key ? 'selected' : ''
                  } class="wplace-settings-option">${theme.name}</option>`
              )
              .join('')}
            </select>
          </div>
        </div>

        <!-- Language Selection Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-globe wplace-icon-globe"></i>
            ${t('language')}
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="languageSelect" class="wplace-settings-select">
              <option value="vi" ${state.languageKey === 'vi' ? 'selected' : ''} class="wplace-settings-option">🇻🇳 Tiếng Việt</option>
              <option value="id" ${state.languageKey === 'id' ? 'selected' : ''} class="wplace-settings-option">🇮🇩 Bahasa Indonesia</option>
              <option value="ru" ${state.languageKey === 'ru' ? 'selected' : ''} class="wplace-settings-option">🇷🇺 Русский</option>
              <option value="uk" ${state.languageKey === 'uk' ? 'selected' : ''} class="wplace-settings-option">🇺🇦 Українська</option>
              <option value="en" ${state.languageKey === 'en' ? 'selected' : ''} class="wplace-settings-option">🇺🇸 English</option>
              <option value="pt" ${state.languageKey === 'pt' ? 'selected' : ''} class="wplace-settings-option">🇧🇷 Português</option>
              <option value="fr" ${state.languageKey === 'fr' ? 'selected' : ''} class="wplace-settings-option">🇫🇷 Français</option>
              <option value="tr" ${state.languageKey === 'tr' ? 'selected' : ''} class="wplace-settings-option">🇹🇷 Türkçe</option>
              <option value="zh-CN" ${
                state.languageKey === 'zh-CN' ? 'selected' : ''
              } class="wplace-settings-option">🇨🇳 简体中文</option>
              <option value="zh-TW" ${
                state.languageKey === 'zh-TW' ? 'selected' : ''
              } class="wplace-settings-option">🇹🇼 繁體中文</option>
              <option value="ja" ${state.languageKey === 'ja' ? 'selected' : ''} class="wplace-settings-option">🇯🇵 日本語</option>
              <option value="ko" ${state.languageKey === 'ko' ? 'selected' : ''} class="wplace-settings-option">🇰🇷 한국어</option>
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
