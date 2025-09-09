import { t } from '../../i18n/i18.js';
import { state } from '../../core/state.js';

export function createMainContainer() {
  const container = document.createElement('div');
  container.id = 'wplace-image-bot-container';
  container.innerHTML = `
      <div class="wplace-header">
        <div class="wplace-header-title">
          <i class="fas fa-image"></i>
        <span data-i18n-key="title">${t('title')}</span>
        </div>
        <div class="wplace-header-controls">
        <button id="settingsBtn" class="wplace-header-btn" title="${t(
          'settings'
        )}" data-i18n-key="settings" data-i18n-attr="title">
            <i class="fas fa-cog"></i>
          </button>
        <button id="statsBtn" class="wplace-header-btn" title="${t('showStats')}" data-i18n-key="showStats" data-i18n-attr="title">
            <i class="fas fa-chart-bar"></i>
          </button>
        <button id="compactBtn" class="wplace-header-btn" title="${t(
          'compactMode'
        )}" data-i18n-key="compactMode" data-i18n-attr="title">
            <i class="fas fa-compress"></i>
          </button>
        <button id="minimizeBtn" class="wplace-header-btn" title="${t(
          'minimize'
        )}" data-i18n-key="minimize" data-i18n-attr="title">
            <i class="fas fa-minus"></i>
          </button>
        </div>
      </div>
      <div class="wplace-content">
        <!-- Status Section - Always visible -->
        <div class="wplace-status-section">
        <div id="statusText" class="wplace-status status-default" data-i18n-key="initMessage">
            ${t('initMessage')}
          </div>
          <div class="wplace-progress">
            <div id="progressBar" class="wplace-progress-bar" style="width: 0;"></div>
          </div>
        </div>

        <!-- Image Section -->
        <div class="wplace-section">
        <div class="wplace-section-title" data-i18n-key="imageManagement">${t(
          'imageManagement'
        )}</div>
          <div class="wplace-controls">
            <div class="wplace-row">
            <button id="uploadBtn" class="wplace-btn wplace-btn-upload" disabled title="${t(
              'waitingSetupComplete'
            )}" data-i18n-key="waitingSetupComplete" data-i18n-attr="title">
                <i class="fas fa-upload"></i>
              <span data-i18n-key="uploadImage">${t('uploadImage')}</span>
              </button>
              <button id="resizeBtn" class="wplace-btn wplace-btn-primary" disabled>
                <i class="fas fa-expand"></i>
              <span data-i18n-key="resizeImage">${t('resizeImage')}</span>
              </button>
            </div>
            <div class="wplace-row single">
              <button id="selectPosBtn" class="wplace-btn wplace-btn-select" disabled>
                <i class="fas fa-crosshairs"></i>
              <span data-i18n-key="selectPosition">${t('selectPosition')}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Control Section -->
        <div class="wplace-section">
        <div class="wplace-section-title" data-i18n-key="paintingControl">${t(
          'paintingControl'
        )}</div>
          <div class="wplace-controls">
            <div class="wplace-row">
              <button id="startBtn" class="wplace-btn wplace-btn-start" disabled>
                <i class="fas fa-play"></i>
              <span data-i18n-key="startPainting">${t('startPainting')}</span>
              </button>
              <button id="stopBtn" class="wplace-btn wplace-btn-stop" disabled>
                <i class="fas fa-stop"></i>
              <span data-i18n-key="stopPainting">${t('stopPainting')}</span>
              </button>
            </div>
            <div class="wplace-row single">
                <button id="toggleOverlayBtn" class="wplace-btn wplace-btn-overlay" disabled>
                    <i class="fas fa-eye"></i>
              <span data-i18n-key="toggleOverlay">${t('toggleOverlay')}</span>
                </button>
            </div>
          </div>
        </div>

        <!-- Cooldown Section -->
        <div class="wplace-section">
        <div class="wplace-section-title" data-i18n-key="cooldownSettings">${t(
          'cooldownSettings'
        )}</div>
            <div class="wplace-cooldown-control">
          <label id="cooldownLabel" data-i18n-key="waitCharges">${t('waitCharges')}:</label>
                <div class="wplace-slider-container">
                    <input type="range" id="cooldownSlider" class="wplace-slider" min="1" max="1" value="${state.cooldownChargeThreshold}">
                    <span id="cooldownValue" class="wplace-cooldown-value">${state.cooldownChargeThreshold}</span>
                </div>
            </div>
        </div>

        <!-- Data Section -->
        <div class="wplace-section">
        <div class="wplace-section-title" data-i18n-key="dataManagement">${t(
          'dataManagement'
        )}</div>
          <div class="wplace-controls">
            <div class="wplace-row">
              <button id="saveBtn" class="wplace-btn wplace-btn-primary" disabled>
                <i class="fas fa-save"></i>
              <span data-i18n-key="saveData">${t('saveData')}</span>
              </button>
            <button id="loadBtn" class="wplace-btn wplace-btn-primary" disabled title="${t(
              'waitingTokenGenerator'
            )}" data-i18n-key="waitingTokenGenerator" data-i18n-attr="title">
                <i class="fas fa-folder-open"></i>
              <span data-i18n-key="loadData">${t('loadData')}</span>
              </button>
            </div>
            <div class="wplace-row">
              <button id="saveToFileBtn" class="wplace-btn wplace-btn-file" disabled>
                <i class="fas fa-download"></i>
              <span data-i18n-key="saveToFile">${t('saveToFile')}</span>
              </button>
            <button id="loadFromFileBtn" class="wplace-btn wplace-btn-file" disabled title="${t(
              'waitingTokenGenerator'
            )}" data-i18n-key="waitingTokenGenerator" data-i18n-attr="title">
                <i class="fas fa-upload"></i>
              <span data-i18n-key="loadFromFile">${t('loadFromFile')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  return container;
}
