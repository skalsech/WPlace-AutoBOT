// ==UserScript==
// @name         WPlace AutoBOT UserScript
// @namespace    https://github.com/skalsech/WPlace-AutoBOT
// @version      0.0.1
// @description  A safe, developer-friendly Tampermonkey script for WPlace.live — no fake fingerprints, live reload, real browser profiles.
// @author       skalsech
// @match        https://wplace.live/*
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/skalsech/WPlace-AutoBOT/custom-main/dist/script.user.js
// @downloadURL  https://raw.githubusercontent.com/skalsech/WPlace-AutoBOT/custom-main/dist/script.user.js
// ==/UserScript==

(() => {
  // src/js/utils/helpers.js
  var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function debounce(fn, delay) {
    let timeoutId = null;
    const debounced = function(...args) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
    debounced.flush = function(...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
        fn.apply(this, args);
      }
    };
    return debounced;
  }
  var dynamicSleep = async function(tickAndGetRemainingMs) {
    let remaining = Math.max(0, await tickAndGetRemainingMs());
    while (remaining > 0) {
      const interval = remaining > 5e3 ? 2e3 : remaining > 1e3 ? 500 : 100;
      await sleep(Math.min(interval, remaining));
      remaining = Math.max(0, await tickAndGetRemainingMs());
    }
  };
  var appendResourceOnce = (src, options = {}) => {
    src = src.trim();
    const { type, attributes = {}, async = true } = options;
    const inferredType = src.endsWith(".css") ? "link" : src.endsWith(".js") ? "script" : type;
    if (!inferredType) {
      console.warn(
        `Failed to determine the resource type for: ${src}. Specify type: 'link' or 'script' in options.`
      );
      return Promise.reject(new Error("Unknown resource type"));
    }
    let exists = false;
    if (inferredType === "link") {
      exists = Array.from(document.head.querySelectorAll("link")).some(
        (link) => link.href === src && link.rel === "stylesheet"
      );
    } else if (inferredType === "script") {
      exists = Array.from(document.head.querySelectorAll("script")).some(
        (script) => script.src === src
      );
    }
    if (exists) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const element = document.createElement(inferredType);
      if (inferredType === "link") {
        element.rel = "stylesheet";
        element.href = src;
      } else if (inferredType === "script") {
        element.src = src;
        element.async = async;
      }
      for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
      }
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error(`Failed to load resource: ${src}`));
      document.head.appendChild(element);
    });
  };
  var waitForSelector = async (selector, interval = 200, timeout = 5e3) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(selector);
      if (el) return el;
      await sleep(interval);
    }
    return null;
  };
  var msToTimeText = (ms) => {
    const totalSeconds = Math.ceil(ms / 1e3);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };
  var calculateTileRange = (startRegionX, startRegionY, startPixelX, startPixelY, width, height, tileSize) => {
    const endPixelX = startPixelX + width;
    const endPixelY = startPixelY + height;
    return {
      startTileX: startRegionX + Math.floor(startPixelX / tileSize),
      startTileY: startRegionY + Math.floor(startPixelY / tileSize),
      endTileX: startRegionX + Math.floor((endPixelX - 1) / tileSize),
      endTileY: startRegionY + Math.floor((endPixelY - 1) / tileSize)
    };
  };
  function deepFreeze(obj) {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      if (obj[prop] !== null && (typeof obj[prop] === "object" || typeof obj[prop] === "function") && !Object.isFrozen(obj[prop])) {
        deepFreeze(obj[prop]);
      }
    });
    return Object.freeze(obj);
  }
  function decodeBase64ToBytes(base64String) {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // src/js/config/DEFAULT_SETTINGS.js
  var DEFAULT_SETTINGS = deepFreeze({
    // main panel
    minimized: false,
    cooldownChargeThreshold: 30,
    // settings
    tokenSource: "generator",
    overlayOpacity: 0.2,
    blueMarbleEnabled: false,
    // batch settings
    batchMode: "random",
    randomBatchMin: 30,
    randomBatchMax: 60,
    paintingSpeed: 20,
    paintingSpeedLimitEnabled: true,
    // paint options
    paintWhitePixels: true,
    paintTransparentPixels: false,
    paintUnavailablePixels: false,
    // generate coordinates
    coordinateMode: "rows",
    coordinateDirection: "top-left",
    coordinateSnake: true,
    blockWidth: 6,
    blockHeight: 2,
    sortCoordinateByFrequency: true,
    // notifications
    notificationsEnabled: false,
    notifyOnChargesReached: true,
    notifyOnlyWhenUnfocused: true,
    notificationIntervalMinutes: 5,
    // Color Matching - Resize settings
    resizeSettings: null,
    originalImage: null,
    ditheringEnabled: true,
    colorMatchingAlgorithm: "lab",
    enableChromaPenalty: true,
    chromaPenaltyWeight: 0.15,
    customTransparencyThreshold: 100,
    customWhiteThreshold: 250,
    // Theme + Language
    themeKey: "classic",
    languageKey: "en"
  });

  // src/js/utils/StateEventEmitter.js
  var StateEventEmitter = class {
    constructor() {
      this.events = /* @__PURE__ */ new Map();
    }
    on(event, listener) {
      if (!this.events.has(event)) {
        this.events.set(event, /* @__PURE__ */ new Set());
      }
      this.events.get(event).add(listener);
    }
    off(event, listener) {
      const listeners = this.events.get(event);
      if (listeners) {
        listeners.delete(listener);
      }
    }
    emit(event, data) {
      const listeners = this.events.get(event);
      if (listeners) {
        listeners.forEach((fn) => fn(data));
      }
    }
  };

  // src/js/core/state.js
  var state = {
    ...DEFAULT_SETTINGS,
    running: false,
    processing: false,
    artColorFrequency: /* @__PURE__ */ new Map(),
    localPaintedOffset: 0,
    totalPaintedPixels: 0,
    availableColors: [],
    activeColorPalette: [],
    fullChargeData: null,
    fullChargeInterval: null,
    displayCharges: 0,
    preciseCurrentCharges: 0,
    cooldown: 31e3,
    stopFlag: false,
    selectingPosition: false,
    estimatedTime: 0,
    resizeIgnoreMask: null,
    _lastChargesNotifyAt: 0,
    _lastChargesBelow: true,
    _lastSavePixelCount: 0,
    _lastSaveTime: 0,
    _saveInProgress: false,
    /**
     * @deprecated Painted map is account-specific and should not be saved.
     */
    paintedMap: null,
    artTotalPixels: 0,
    startPosition: null,
    region: null,
    imageData: null,
    get hasAvailableColors() {
      return !!this.availableColors.length;
    },
    get imageLoaded() {
      return !!this.imageData;
    },
    get currentPaintedPixels() {
      return state.totalPaintedPixels + state.localPaintedOffset;
    },
    _eventEmitter: new StateEventEmitter(),
    update(updates) {
      const changedKeys = [];
      for (const [key, value] of Object.entries(updates)) {
        if (this[key] !== value) {
          this[key] = value;
          changedKeys.push(key);
        }
      }
      if (changedKeys.length > 0) {
        this._eventEmitter.emit("stateChange", { keys: changedKeys, state: this });
      }
    },
    updateColorSettings(updates) {
      this.update(updates);
      this._eventEmitter.emit("colorSettingsChange", updates);
    }
  };
  function onColorSettingsChange(callback) {
    state._eventEmitter.on("colorSettingsChange", callback);
  }

  // src/js/config/AUTO_GENERATED_LANGUAGES.js
  var GENERATED_LANGUAGES = [
    "en",
    "es-MX",
    "fr",
    "id",
    "ja",
    "ko",
    "pt",
    "ru",
    "tr",
    "uk",
    "vi",
    "zh-CN",
    "zh-TW"
  ];

  // src/js/config/APP_CONSTANTS.js
  var APP_CONSTANTS = {
    LANGUAGES: GENERATED_LANGUAGES,
    PAINTING_SPEED: {
      MIN: 1,
      MAX: 1e3
    },
    THEMES: {
      classic: {
        name: "Classic",
        cssClass: "wplace-theme-classic"
      },
      "classic-light": {
        name: "Classic Light",
        cssClass: "wplace-theme-classic-light"
      },
      "neon-retro": {
        name: "Neon Retro",
        cssClass: "wplace-theme-neon"
      }
    },
    // --- START: Color data from colour-converter.js ---
    COLOR_MAP: {
      0: { id: 0, name: "Transparent", rgb: { r: 222, g: 250, b: 206 } },
      //deface
      1: { id: 1, name: "Black", rgb: { r: 0, g: 0, b: 0 } },
      2: { id: 2, name: "Dark Gray", rgb: { r: 60, g: 60, b: 60 } },
      3: { id: 3, name: "Gray", rgb: { r: 120, g: 120, b: 120 } },
      4: { id: 4, name: "Light Gray", rgb: { r: 210, g: 210, b: 210 } },
      5: { id: 5, name: "White", rgb: { r: 255, g: 255, b: 255 } },
      6: { id: 6, name: "Deep Red", rgb: { r: 96, g: 0, b: 24 } },
      7: { id: 7, name: "Red", rgb: { r: 237, g: 28, b: 36 } },
      8: { id: 8, name: "Orange", rgb: { r: 255, g: 127, b: 39 } },
      9: { id: 9, name: "Gold", rgb: { r: 246, g: 170, b: 9 } },
      10: { id: 10, name: "Yellow", rgb: { r: 249, g: 221, b: 59 } },
      11: { id: 11, name: "Light Yellow", rgb: { r: 255, g: 250, b: 188 } },
      12: { id: 12, name: "Dark Green", rgb: { r: 14, g: 185, b: 104 } },
      13: { id: 13, name: "Green", rgb: { r: 19, g: 230, b: 123 } },
      14: { id: 14, name: "Light Green", rgb: { r: 135, g: 255, b: 94 } },
      15: { id: 15, name: "Dark Teal", rgb: { r: 12, g: 129, b: 110 } },
      16: { id: 16, name: "Teal", rgb: { r: 16, g: 174, b: 166 } },
      17: { id: 17, name: "Light Teal", rgb: { r: 19, g: 225, b: 190 } },
      18: { id: 18, name: "Dark Blue", rgb: { r: 40, g: 80, b: 158 } },
      19: { id: 19, name: "Blue", rgb: { r: 64, g: 147, b: 228 } },
      20: { id: 20, name: "Cyan", rgb: { r: 96, g: 247, b: 242 } },
      21: { id: 21, name: "Indigo", rgb: { r: 107, g: 80, b: 246 } },
      22: { id: 22, name: "Light Indigo", rgb: { r: 153, g: 177, b: 251 } },
      23: { id: 23, name: "Dark Purple", rgb: { r: 120, g: 12, b: 153 } },
      24: { id: 24, name: "Purple", rgb: { r: 170, g: 56, b: 185 } },
      25: { id: 25, name: "Light Purple", rgb: { r: 224, g: 159, b: 249 } },
      26: { id: 26, name: "Dark Pink", rgb: { r: 203, g: 0, b: 122 } },
      27: { id: 27, name: "Pink", rgb: { r: 236, g: 31, b: 128 } },
      28: { id: 28, name: "Light Pink", rgb: { r: 243, g: 141, b: 169 } },
      29: { id: 29, name: "Dark Brown", rgb: { r: 104, g: 70, b: 52 } },
      30: { id: 30, name: "Brown", rgb: { r: 149, g: 104, b: 42 } },
      31: { id: 31, name: "Beige", rgb: { r: 248, g: 178, b: 119 } },
      32: { id: 32, name: "Medium Gray", rgb: { r: 170, g: 170, b: 170 } },
      33: { id: 33, name: "Dark Red", rgb: { r: 165, g: 14, b: 30 } },
      34: { id: 34, name: "Light Red", rgb: { r: 250, g: 128, b: 114 } },
      35: { id: 35, name: "Dark Orange", rgb: { r: 228, g: 92, b: 26 } },
      36: { id: 36, name: "Light Tan", rgb: { r: 214, g: 181, b: 148 } },
      37: { id: 37, name: "Dark Goldenrod", rgb: { r: 156, g: 132, b: 49 } },
      38: { id: 38, name: "Goldenrod", rgb: { r: 197, g: 173, b: 49 } },
      39: { id: 39, name: "Light Goldenrod", rgb: { r: 232, g: 212, b: 95 } },
      40: { id: 40, name: "Dark Olive", rgb: { r: 74, g: 107, b: 58 } },
      41: { id: 41, name: "Olive", rgb: { r: 90, g: 148, b: 74 } },
      42: { id: 42, name: "Light Olive", rgb: { r: 132, g: 197, b: 115 } },
      43: { id: 43, name: "Dark Cyan", rgb: { r: 15, g: 121, b: 159 } },
      44: { id: 44, name: "Light Cyan", rgb: { r: 187, g: 250, b: 242 } },
      45: { id: 45, name: "Light Blue", rgb: { r: 125, g: 199, b: 255 } },
      46: { id: 46, name: "Dark Indigo", rgb: { r: 77, g: 49, b: 184 } },
      47: { id: 47, name: "Dark Slate Blue", rgb: { r: 74, g: 66, b: 132 } },
      48: { id: 48, name: "Slate Blue", rgb: { r: 122, g: 113, b: 196 } },
      49: { id: 49, name: "Light Slate Blue", rgb: { r: 181, g: 174, b: 241 } },
      50: { id: 50, name: "Light Brown", rgb: { r: 219, g: 164, b: 99 } },
      51: { id: 51, name: "Dark Beige", rgb: { r: 209, g: 128, b: 81 } },
      52: { id: 52, name: "Light Beige", rgb: { r: 255, g: 197, b: 165 } },
      53: { id: 53, name: "Dark Peach", rgb: { r: 155, g: 82, b: 73 } },
      54: { id: 54, name: "Peach", rgb: { r: 209, g: 128, b: 120 } },
      55: { id: 55, name: "Light Peach", rgb: { r: 250, g: 182, b: 164 } },
      56: { id: 56, name: "Dark Tan", rgb: { r: 123, g: 99, b: 82 } },
      57: { id: 57, name: "Tan", rgb: { r: 156, g: 132, b: 107 } },
      58: { id: 58, name: "Dark Slate", rgb: { r: 51, g: 57, b: 65 } },
      59: { id: 59, name: "Slate", rgb: { r: 109, g: 117, b: 141 } },
      60: { id: 60, name: "Light Slate", rgb: { r: 179, g: 185, b: 209 } },
      61: { id: 61, name: "Dark Stone", rgb: { r: 109, g: 100, b: 63 } },
      62: { id: 62, name: "Stone", rgb: { r: 148, g: 140, b: 107 } },
      63: { id: 63, name: "Light Stone", rgb: { r: 205, g: 197, b: 158 } }
    }
  };

  // src/js/ui/components/create-settings.js
  function createSettingsContainer() {
    const settingsContainer = document.createElement("div");
    settingsContainer.id = "wplace-settings-container";
    settingsContainer.className = "wplace-settings-container-base";
    settingsContainer.innerHTML = `
      <div class="wplace-settings-header">
        <div class="wplace-settings-title-wrapper">
          <h3 class="wplace-settings-title">
            <i class="fas fa-cog wplace-settings-icon"></i>
          <span data-i18n-key="settings"></span>
          </h3>
        <button id="closeSettingsBtn" class="wplace-settings-close-btn" title="" data-i18n-key="close" data-i18n-attr="title">\u2715</button>
        </div>
      </div>

      <div class="wplace-settings-content">
        
        <!-- Token Source Selection -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-key wplace-icon-key"></i>
          <span data-i18n-key="tokenSource"></span>
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="tokenSourceSelect" class="wplace-settings-select">
            <option value="generator" ${DEFAULT_SETTINGS.tokenSource === "generator" ? "selected" : ""} data-i18n-key="tokenSourceGenerator" class="wplace-settings-option"></option>
            <option value="hybrid" ${DEFAULT_SETTINGS.tokenSource === "hybrid" ? "selected" : ""} data-i18n-key="tokenSourceHybrid" class="wplace-settings-option"></option>
            <option value="manual" ${DEFAULT_SETTINGS.tokenSource === "manual" ? "selected" : ""} data-i18n-key="tokenSourceManual" class="wplace-settings-option"></option>
            </select>
          <p class="wplace-settings-description" data-i18n-key="tokenSourceDescription"></p>
          </div>
        </div>

        <!-- Automation Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-robot wplace-icon-robot"></i>
          <span data-i18n-key="automation"></span>
          </label>
          <!-- Token generator is always enabled - settings moved to Token Source above -->
        </div>

        <!-- Overlay Settings Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-eye wplace-icon-eye"></i>
          <span data-i18n-key="overlaySettings"></span>
          </label>
          <div class="wplace-settings-section-wrapper wplace-overlay-wrapper">
              <!-- Opacity Slider -->
              <div class="wplace-overlay-opacity-control">
                <div class="wplace-overlay-opacity-header">
                 <span class="wplace-overlay-opacity-label" data-i18n-key="overlayOpacity"></span>
                   <div id="overlayOpacityValue" class="wplace-overlay-opacity-value">
                    ${Math.round(DEFAULT_SETTINGS.overlayOpacity * 100)}%
                   </div>
                </div>
                <input type="range" id="overlayOpacitySlider" min="0.1" max="1" step="0.05" value="${DEFAULT_SETTINGS.overlayOpacity}" class="wplace-overlay-opacity-slider">
              </div>
              <!-- Blue Marble Toggle -->
              <label for="enableBlueMarbleToggle" class="wplace-settings-toggle">
                  <div>
                    <span class="wplace-settings-toggle-title" data-i18n-key="blueMarbleEffect"></span>
                    <p class="wplace-settings-toggle-description" data-i18n-key="blueMarbleDescription"></p>
                  </div>
                <input type="checkbox" id="enableBlueMarbleToggle" ${DEFAULT_SETTINGS.blueMarbleEnabled ? "checked" : ""} class="wplace-settings-checkbox"/>
              </label>
          </div>
        </div>

        <!-- Paint Options Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-paint-brush wplace-icon-paint"></i>
          <span data-i18n-key="paintOptions"></span>
          </label>
          <!-- Pixel Filter Toggles -->
          <div id="pixelFilterControls" class="wplace-settings-section-wrapper wplace-pixel-filter-controls">
            <!-- Paint White Pixels -->
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="paintWhitePixels"></span>
              <p class="wplace-settings-toggle-description" data-i18n-key="paintWhitePixelsDescription"></p>
              </div>
            <input type="checkbox" id="settingsPaintWhiteToggle" ${DEFAULT_SETTINGS.paintWhitePixels ? "checked" : ""} class="wplace-settings-checkbox"/>
            </label>
            
            <!-- Paint Transparent Pixels -->
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="paintTransparentPixels"></span>
              <p class="wplace-settings-toggle-description" data-i18n-key="paintTransparentPixelsDescription"></p>
              </div>
            <input type="checkbox" id="settingsPaintTransparentToggle" ${DEFAULT_SETTINGS.paintTransparentPixels ? "checked" : ""} class="wplace-settings-checkbox"/>
            </label>
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="paintUnavailablePixels"></span>
              <p class="wplace-settings-toggle-description" data-i18n-key="paintUnavailablePixelsDescription"></p>
              </div>
            <input type="checkbox" id="paintUnavailablePixelsToggle" ${DEFAULT_SETTINGS.paintUnavailablePixels ? "checked" : ""} class="wplace-settings-checkbox"/>
            </label>
          </div>
        </div>

        <!-- Speed Control Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-tachometer-alt wplace-icon-speed"></i>
          <span data-i18n-key="paintingSpeed"></span>
          </label>
          
          <!-- Batch Mode Selection -->
          <div class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-dice wplace-icon-dice"></i>
            <span data-i18n-key="batchMode"></span>
            </label>
            <select id="batchModeSelect" class="wplace-settings-select">
              <option value="normal" data-i18n-key="batchModeNormal" class="wplace-settings-option"></option>
              <option value="random" data-i18n-key="batchModeRandom" class="wplace-settings-option"></option>
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
                <span data-i18n-key="minimumBatchSize"></span>
                </label>
                <input type="number" id="randomBatchMin" min="1" max="1000" value="${DEFAULT_SETTINGS.randomBatchMin}" class="wplace-settings-number-input">
              </div>
              <div>
                <label class="wplace-random-batch-label">
                  <i class="fas fa-arrow-up wplace-icon-max"></i>
                <span data-i18n-key="maximumBatchSize"></span>
                </label>
                <input type="number" id="randomBatchMax" min="1" max="1000" value="${DEFAULT_SETTINGS.randomBatchMax}" class="wplace-settings-number-input">
              </div>
            </div>
          <p class="wplace-random-batch-description" data-i18n-key="randomBatchDescription"></p>
          </div>
          
          <!-- Speed Control Toggle -->
          <label class="wplace-speed-control-toggle">
            <input type="checkbox" id="enableSpeedToggle" ${DEFAULT_SETTINGS.paintingSpeedLimitEnabled ? "checked" : ""} class="wplace-speed-checkbox"/>
          <span data-i18n-key="enablePaintingSpeedLimit"></span>
          </label>
        </div>
        
        <!-- Coordinate Generation Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-route wplace-icon-route"></i>
          <span data-i18n-key="coordinateGeneration"></span>
          </label>
          
          <!-- Mode Selection -->
          <div class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-th wplace-icon-table"></i>
            <span data-i18n-key="generationMode"></span>
            </label>
            <select id="coordinateModeSelect" class="wplace-settings-select">
            <option value="rows" data-i18n-key="modeRows" class="wplace-settings-option"></option>
            <option value="columns" data-i18n-key="modeColumns" class="wplace-settings-option"></option>
            <option value="circle-out" data-i18n-key="modeCircleOut" class="wplace-settings-option"></option>
            <option value="circle-in" data-i18n-key="modeCircleIn" class="wplace-settings-option"></option>
            <option value="blocks" data-i18n-key="modeBlocks" class="wplace-settings-option"></option>
            <option value="shuffle-blocks" data-i18n-key="modeShuffleBlocks" class="wplace-settings-option"></option>
            </select>
          </div>
          
          <!-- Direction Selection (only for rows/columns) -->
          <div id="directionControls" class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-compass wplace-icon-compass"></i>
            <span data-i18n-key="startingDirection"></span>
            </label>
            <select id="coordinateDirectionSelect" class="wplace-settings-select">
            <option value="top-left" data-i18n-key="topLeft" class="wplace-settings-option"></option>
            <option value="top-right" data-i18n-key="topRight" class="wplace-settings-option"></option>
            <option value="bottom-left" data-i18n-key="bottomLeft" class="wplace-settings-option"></option>
            <option value="bottom-right" data-i18n-key="bottomRight" class="wplace-settings-option"></option>
            </select>
          </div>
          
          <!-- Snake Pattern Toggle (only for rows/columns) -->
          <div id="snakeControls" class="wplace-snake-pattern-controls wplace-settings-section-wrapper">
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="snakePattern"></span>
              <p class="wplace-settings-toggle-description" data-i18n-key="snakePatternDescription"></p>
              </div>
            <input type="checkbox" id="coordinateSnakeToggle" ${DEFAULT_SETTINGS.coordinateSnake ? "checked" : ""} class="wplace-settings-checkbox"/>
            </label>
          </div>
          
          <!-- Sort by color frequency Toggle -->
          <div id="snakeControls" class="wplace-snake-pattern-controls wplace-settings-section-wrapper">
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="sortCoordinateByFrequency"></span>
              <p class="wplace-settings-toggle-description" data-i18n-key="sortCoordinateByFrequencyDescription"></p>
              </div>
            <input type="checkbox" id="sortCoordinateByFrequencyToggle" ${DEFAULT_SETTINGS.sortCoordinateByFrequency ? "checked" : ""} class="wplace-settings-checkbox"/>
            </label>
          </div>
          
          <!-- Block Size Controls (only for blocks/shuffle-blocks) -->
          <div id="blockControls" class="wplace-block-size-controls wplace-settings-section-wrapper wplace-shuffle-block-size-controls">
            <div class="wplace-block-size-grid">
              <div>
                <label class="wplace-block-size-label">
                  <i class="fas fa-arrows-alt-h wplace-icon-width"></i>
                <span data-i18n-key="blockWidth"></span>
                </label>
                <input type="number" id="blockWidthInput" min="1" max="50" value="6" class="wplace-settings-number-input">
              </div>
              <div>
                <label style="display: block; color: rgba(255,255,255,0.8); font-size: 12px; margin-bottom: 8px;">
                  <i class="fas fa-arrows-alt-v wplace-icon-height"></i>
                <span data-i18n-key="blockHeight"></span>
                </label>
                <input type="number" id="blockHeightInput" min="1" max="50" value="2" class="wplace-settings-number-input">
              </div>
            </div>
          <p class="wplace-block-size-description" data-i18n-key="blockSizeDescription"></p>
          </div>
        </div>
        
        <!-- Notifications Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-bell wplace-icon-bell"></i>
          <span data-i18n-key="desktopNotifications"></span>
          </label>
          <div class="wplace-settings-section-wrapper wplace-notifications-wrapper">
            <label class="wplace-notification-toggle">
            <span data-i18n-key="enableNotifications"></span>
            <input type="checkbox" id="notifEnabledToggle" ${DEFAULT_SETTINGS.notificationsEnabled ? "checked" : ""} class="wplace-notification-checkbox" />
            </label>
            <label class="wplace-notification-toggle">
            <span data-i18n-key="notifyOnChargesThreshold"></span>
            <input type="checkbox" id="notifOnChargesToggle" ${DEFAULT_SETTINGS.notifyOnChargesReached ? "checked" : ""} class="wplace-notification-checkbox" />
            </label>
            <label class="wplace-notification-toggle">
            <span data-i18n-key="onlyWhenNotFocused"></span>
            <input type="checkbox" id="notifOnlyUnfocusedToggle" ${DEFAULT_SETTINGS.notifyOnlyWhenUnfocused ? "checked" : ""} class="wplace-notification-checkbox" />
            </label>
            <div class="wplace-notification-interval">
            <span data-i18n-key="repeatEvery"></span>
              <input type="number" id="notifIntervalInput" min="1" max="60" value="${DEFAULT_SETTINGS.notificationIntervalMinutes}" class="wplace-notification-interval-input" />
            <span data-i18n-key="minutesPl"></span>
            </div>
            <div class="wplace-notification-buttons">
            <button id="notifRequestPermBtn" class="wplace-btn wplace-btn-secondary wplace-notification-perm-btn">
              <i class="fas fa-unlock"></i>
              <span data-i18n-key="grantPermission"></span>
            </button>
            <button id="notifTestBtn" class="wplace-btn wplace-notification-test-btn">
              <i class="fas fa-bell"></i>
              <span data-i18n-key="test"></span>
            </button>
            </div>
          </div>
        </div>

        <!-- Theme Selection Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-palette wplace-icon-palette"></i>
          <span data-i18n-key="themeSettings"></span>
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="themeSelect" class="wplace-settings-select">
            ${Object.entries(APP_CONSTANTS.THEMES).map(
      ([key, theme]) => `<option value="${key}" ${state.themeKey === key ? "selected" : ""} data-i18n-key="theme_${key}" class="wplace-settings-option">${theme.name}</option>`
    ).join("")}
            </select>
          </div>
        </div>

        <!-- Language Selection Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-globe wplace-icon-globe"></i>
          <span data-i18n-key="language"></span>
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="languageSelect" class="wplace-settings-select">
            <option value="zh-CN" ${state.languageKey === "zh-CN" ? "selected" : ""} class="wplace-settings-option">\u{1F1E8}\u{1F1F3} \u7B80\u4F53\u4E2D\u6587</option>
            <option value="es-MX" ${state.languageKey === "es-MX" ? "selected" : ""} class="wplace-settings-option">\u{1F1F2}\u{1F1FD} Espa\xF1ol mexicano</option>
            <option value="en" ${state.languageKey === "en" ? "selected" : ""} class="wplace-settings-option">\u{1F1FA}\u{1F1F8} English</option>
            <option value="ru" ${state.languageKey === "ru" ? "selected" : ""} class="wplace-settings-option">\u{1F1F7}\u{1F1FA} \u0420\u0443\u0441\u0441\u043A\u0438\u0439</option>
            <option value="pt" ${state.languageKey === "pt" ? "selected" : ""} class="wplace-settings-option">\u{1F1E7}\u{1F1F7} Portugu\xEAs</option>
            <option value="id" ${state.languageKey === "id" ? "selected" : ""} class="wplace-settings-option">\u{1F1EE}\u{1F1E9} Bahasa Indonesia</option>
            <option value="fr" ${state.languageKey === "fr" ? "selected" : ""} class="wplace-settings-option">\u{1F1EB}\u{1F1F7} Fran\xE7ais</option>
            <option value="tr" ${state.languageKey === "tr" ? "selected" : ""} class="wplace-settings-option">\u{1F1F9}\u{1F1F7} T\xFCrk\xE7e</option>
            <option value="ja" ${state.languageKey === "ja" ? "selected" : ""} class="wplace-settings-option">\u{1F1EF}\u{1F1F5} \u65E5\u672C\u8A9E</option>
            <option value="vi" ${state.languageKey === "vi" ? "selected" : ""} class="wplace-settings-option">\u{1F1FB}\u{1F1F3} Ti\u1EBFng Vi\u1EC7t</option>
            <option value="ko" ${state.languageKey === "ko" ? "selected" : ""} class="wplace-settings-option">\u{1F1F0}\u{1F1F7} \uD55C\uAD6D\uC5B4</option>
            <option value="uk" ${state.languageKey === "uk" ? "selected" : ""} class="wplace-settings-option">\u{1F1FA}\u{1F1E6} \u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430</option>
            <option value="zh-TW" ${state.languageKey === "zh-TW" ? "selected" : ""} class="wplace-settings-option">\u{1F1F9}\u{1F1FC} \u7E41\u9AD4\u4E2D\u6587</option>
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

  // src/js/ui/components/create-panel.js
  function createMainContainer() {
    const container = document.createElement("div");
    container.id = "wplace-image-bot-container";
    container.innerHTML = `
      <div class="wplace-header">
        <div class="wplace-header-title">
          <i class="fas fa-image"></i>
        <span data-i18n-key="title"></span>
        </div>
        <div class="wplace-header-controls">
        <button id="settingsBtn" class="wplace-header-btn" title="" data-i18n-key="settings" data-i18n-attr="title">
            <i class="fas fa-cog"></i>
          </button>
        <button id="statsBtn" class="wplace-header-btn" title="" data-i18n-key="showStats" data-i18n-attr="title">
            <i class="fas fa-chart-line"></i>
          </button>
        <button id="compactBtn" class="wplace-header-btn" title="" data-i18n-key="compactMode" data-i18n-attr="title">
            <i class="fas fa-compress"></i>
          </button>
        <button id="minimizeBtn" class="wplace-header-btn" title="" data-i18n-key="minimize" data-i18n-attr="title">
            <i class="fas fa-chevron-up"></i>
          </button>
        </div>
      </div>
      <div class="wplace-content">
        <!-- Status Section - Always visible -->
        <div class="wplace-status-section">
        <div id="statusText" class="wplace-status status-default" data-i18n-key="initMessage"></div>
          <div class="wplace-progress">
            <div id="progressBar" class="wplace-progress-bar" style="width: 0;"></div>
          </div>
        </div>

        <!-- Image Section -->
        <div class="wplace-section">
        <div class="wplace-section-title"><span data-i18n-key="imageManagement"></span></div>
          <div class="wplace-controls">
            <div class="wplace-row">
            <button id="uploadBtn" class="wplace-btn wplace-btn-upload" disabled title="" data-i18n-key="waitingSetupComplete" data-i18n-attr="title">
                <i class="fas fa-upload"></i>
              <span data-i18n-key="uploadImage"></span>
              </button>
              <button id="resizeBtn" class="wplace-btn wplace-btn-primary" disabled>
                <i class="fas fa-expand"></i>
              <span data-i18n-key="resizeImage"></span>
              </button>
            </div>
            <div class="wplace-row single">
              <button id="selectPosBtn" class="wplace-btn wplace-btn-select" disabled>
                <i class="fas fa-crosshairs"></i>
              <span data-i18n-key="selectPosition"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Control Section -->
        <div class="wplace-section">
        <div class="wplace-section-title"><span data-i18n-key="paintingControl"></span></div>
          <div class="wplace-controls">
            <div class="wplace-row">
              <button id="controlBtn" class="wplace-btn wplace-btn-start" disabled>
                <i class="fas fa-play"></i>
                <span data-i18n-key="startPainting"></span>
              </button>
              <button id="colorFilterBtn" class="wplace-btn wplace-btn-filter" disabled>
                <i class="fas fa-sliders-h"></i>
                <span data-i18n-key="colorFilter"></span>
              </button>
            </div>
            <div class="wplace-row single">
              <button id="toggleOverlayBtn" class="wplace-btn wplace-btn-overlay" disabled>
                <i class="fas fa-eye"></i>
                <span data-i18n-key="toggleOverlay"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Cooldown Section -->
        <div class="wplace-section">
        <div class="wplace-section-title"><span data-i18n-key="cooldownSettings"></span></div>
            <div class="wplace-cooldown-control">
          <label id="cooldownLabel" data-i18n-key="waitCharges">:</label>
                <div class="wplace-slider-container">
                    <input type="range" id="cooldownSlider" class="wplace-slider" min="1" max="1" value="${state.cooldownChargeThreshold}">
                    <span id="cooldownValue" class="wplace-cooldown-value">${state.cooldownChargeThreshold}</span>
                </div>
            </div>
        </div>

        <!-- Data Section -->
        <div class="wplace-section">
        <div class="wplace-section-title"><span data-i18n-key="dataManagement"></span></div>
          <div class="wplace-controls">
            <div class="wplace-row">
              <button id="saveBtn" class="wplace-btn wplace-btn-primary" disabled>
                <i class="fas fa-save"></i>
              <span data-i18n-key="saveData"></span>
              </button>
            <button id="loadBtn" class="wplace-btn wplace-btn-primary" disabled title="" data-i18n-key="waitingTokenGenerator" data-i18n-attr="title">
                <i class="fas fa-folder-open"></i>
              <span data-i18n-key="loadData"></span>
              </button>
            </div>
            <div class="wplace-row">
              <button id="saveToFileBtn" class="wplace-btn wplace-btn-file" disabled>
                <i class="fas fa-download"></i>
              <span data-i18n-key="saveToFile"></span>
              </button>
            <button id="loadFromFileBtn" class="wplace-btn wplace-btn-file" disabled title="" data-i18n-key="waitingTokenGenerator" data-i18n-attr="title">
                <i class="fas fa-upload"></i>
              <span data-i18n-key="loadFromFile"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    return container;
  }

  // src/js/ui/components/create-stats.js
  function createStatsContainer() {
    const statsContainer = document.createElement("div");
    statsContainer.id = "wplace-stats-container";
    statsContainer.style.display = "block";
    statsContainer.innerHTML = `
    <div class="wplace-header">
      <div class="wplace-header-title">
        <i class="fas fa-chart-bar"></i>
        <span data-i18n-key="paintingStats"></span>
      </div>
      <div class="wplace-header-controls">
        <button id="refreshChargesBtn" class="wplace-header-btn" title="" data-i18n-key="refreshCharges" data-i18n-attr="title">
          <i class="fas fa-sync"></i>
        </button>
        <button id="closeStatsBtn" class="wplace-header-btn" title="" data-i18n-key="closeStats" data-i18n-attr="title">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <div class="wplace-content">
      <div class="wplace-stats">
        <div id="statsArea">
          <div id="wplace-init-msg" class="wplace-stat-item">
            <div class="wplace-stat-label">
              <i class="fas fa-info-circle"></i>
              <span data-i18n-key="initMessage"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
    return statsContainer;
  }
  function isStatsFullyRendered() {
    const blocks = ["wplace-charge-stats", "wplace-image-stats", "wplace-colors-section"];
    return blocks.every((id) => {
      const el = document.getElementById(id);
      return el && getComputedStyle(el).display !== "none";
    });
  }
  function tryRemoveStatsInitMessage() {
    if (isStatsFullyRendered()) {
      const msg = document.getElementById("wplace-init-msg");
      if (msg) msg.remove();
    }
  }

  // src/js/ui/components/create-resize.js
  function createResizeContainer() {
    const resizeContainer2 = document.createElement("div");
    resizeContainer2.className = "resize-container";
    resizeContainer2.innerHTML = `
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
          Drag to pan \u2022 Pinch to zoom \u2022 Double\u2011tap to zoom
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
        <span class="resize-shortcut-help">Shift = Row \u2022 Alt = Column</span>
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
            <option value="lab" ${state.colorMatchingAlgorithm === "lab" ? "selected" : ""} data-i18n-key="perceptualLab"></option>
            <option value="legacy" ${state.colorMatchingAlgorithm === "legacy" ? "selected" : ""} data-i18n-key="legacyRgb"></option>
          </select>
        </label>
        <label class="resize-advanced-toggle">
          <div class="resize-advanced-toggle-content">
            <span class="resize-advanced-label-text">Chroma Penalty</span>
            <div class="resize-advanced-description">Preserve vivid colors (Lab only)</div>
          </div>
          <input type="checkbox" id="enableChromaPenaltyToggle" ${state.enableChromaPenalty ? "checked" : ""} class="resize-advanced-checkbox" />
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
            <div class="resize-advanced-description">Floyd\u2013Steinberg error diffusion in preview and applied output</div>
          </div>
          <input type="checkbox" id="enableDitheringToggle" ${state.ditheringEnabled ? "checked" : ""} class="resize-advanced-checkbox" />
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
    return resizeContainer2;
  }

  // src/js/ui/alerts.js
  function showAlert(message, type = "info") {
    const validTypes = ["info", "success", "warning", "error"];
    const alertType = validTypes.includes(type) ? type : "info";
    let container = document.querySelector(".wplace-alert-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "wplace-alert-container";
      document.body.appendChild(container);
    }
    const alertDiv = document.createElement("div");
    alertDiv.className = `wplace-alert-base wplace-alert-${alertType}`;
    alertDiv.textContent = message;
    alertDiv.addEventListener("click", () => {
      alertDiv.classList.add("fade-out");
      setTimeout(() => {
        if (alertDiv.parentElement) {
          alertDiv.parentElement.removeChild(alertDiv);
        }
      }, 300);
    });
    if (container.firstChild) {
      container.insertBefore(alertDiv, container.firstChild);
    } else {
      container.appendChild(alertDiv);
    }
    if (container.children.length > 6) {
      const oldest = container.lastChild;
      oldest.classList.add("fade-out");
      setTimeout(() => {
        if (oldest.parentElement) {
          oldest.parentElement.removeChild(oldest);
        }
      }, 300);
    }
    setTimeout(() => {
      alertDiv.classList.add("fade-out");
      setTimeout(() => {
        if (alertDiv.parentElement) {
          alertDiv.parentElement.removeChild(alertDiv);
        }
      }, 300);
    }, 4e3);
  }

  // src/js/storage/storage.js
  var createStorageSaver = (options = {}) => {
    const { maxLength = 100, shouldLog = false, label = "LocalStorage" } = options;
    return (key, value) => {
      let serializedValue;
      try {
        serializedValue = JSON.stringify(value);
      } catch (e) {
        console.groupCollapsed(`\u26A0\uFE0F ${label}: Could not serialize value`);
        console.log("%cKey:", "font-weight: bold; color: #4a90e2;", key);
        console.log("%cValue (failed to serialize):", "font-weight: bold; color: #d6333f;", value);
        console.log("%cError:", "color: #999;", e);
        console.groupEnd();
        return false;
      }
      try {
        localStorage.setItem(key, serializedValue);
        if (shouldLog) {
          const displayValue = serializedValue.length > maxLength ? serializedValue.slice(0, maxLength) + "..." : serializedValue;
          console.groupCollapsed(`\u{1F4BE} ${label}: Saved to localStorage`);
          console.log("%cKey:", "font-weight: bold; color: #4a90e2;", key);
          console.log("%cValue:", "font-weight: bold; color: #50c878;", displayValue);
          if (serializedValue.length > maxLength) {
            console.log("%cFull serialized value:", "color: #999;", serializedValue);
          }
          console.groupEnd();
        }
      } catch (e) {
        console.groupCollapsed(`\u274C ${label}: Could not save to localStorage`);
        console.log("%cKey:", "font-weight: bold; color: #4a90e2;", key);
        console.log("%cValue (failed to save):", "font-weight: bold; color: #d6333f;", value);
        console.log("%cSerialized (partial):", "color: #999;", serializedValue);
        console.log("%cError:", "color: #999;", e);
        console.groupEnd();
        return false;
      }
      return true;
    };
  };
  var createStorageLoader = (options = {}) => {
    const { shouldLog = false, label = "Storage" } = options;
    return (key, defaultValue = null) => {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        if (shouldLog) {
          console.groupCollapsed(`\u{1F50D} ${label}: Key not found`);
          console.log("%cKey:", "font-weight: bold; color: #4a90e2;", key);
          console.log("%cUsing default:", "color: #999;", defaultValue);
          console.groupEnd();
        }
        return defaultValue;
      }
      let parsed = raw;
      let isParsed = false;
      try {
        parsed = JSON.parse(raw);
        isParsed = true;
      } catch (e) {
        if (typeof raw === "string") {
          const isSuspicious = raw.length > 100 || // eslint-disable-next-line no-control-regex
          /[\x00-\x1F\x7F-\x9F]/.test(raw) || // control chars
          /[\uFFFD]/.test(raw) || // replacement character
          raw.trim() === "";
          if (isSuspicious) {
            if (shouldLog) {
              console.groupCollapsed(`\u274C ${label}: Invalid or corrupted data`);
              console.log("%cKey:", "font-weight: bold; color: #4a90e2;", key);
              console.log("%cRaw value:", "color: #d6333f;", raw);
              console.log("%cError:", "color: #999;", e);
              console.log("%cUsing default:", "color: #666;", defaultValue);
              console.groupEnd();
            }
            return defaultValue;
          }
          if (shouldLog) {
            console.groupCollapsed(`\u{1F7E1} ${label}: Raw string (not JSON)`);
            console.log("%cKey:", "font-weight: bold; color: #4a90e2;", key);
            console.log("%cValue:", "color: #50c878;", raw);
            console.groupEnd();
          }
        }
      }
      if (isParsed && shouldLog) {
        console.groupCollapsed(`\u2705 ${label}: Loaded (JSON)`);
        console.log("%cKey:", "font-weight: bold; color: #4a90e2;", key);
        console.log("%cValue:", "font-weight: bold; color: #50c878;", parsed);
        console.groupEnd();
      }
      return parsed;
    };
  };
  var saveToStorage = createStorageSaver({
    maxLength: 80
  });
  var loadFromStorage = createStorageLoader();

  // src/js/storage/settings-manager.js
  function saveBotSettings() {
    try {
      const settings = {};
      for (const key of Object.keys(DEFAULT_SETTINGS)) {
        settings[key] = state[key];
      }
      if (state.resizeIgnoreMask && state.resizeSettings && state.resizeSettings.width * state.resizeSettings.height === state.resizeIgnoreMask.length) {
        settings.resizeIgnoreMask = {
          w: state.resizeSettings.width,
          h: state.resizeSettings.height,
          data: btoa(String.fromCharCode(...state.resizeIgnoreMask))
        };
      } else {
        settings.resizeIgnoreMask = null;
      }
      saveToStorage("wplace-bot-settings", settings);
    } catch (e) {
      console.warn("Could not save bot settings:", e);
    }
  }
  function isSavedSettingsEmpty() {
    const settings = loadFromStorage("wplace-bot-settings");
    return !settings;
  }
  function loadBotSettings() {
    try {
      let parseResizeIgnoreMask = function(mask, current) {
        if (!mask?.data) {
          return null;
        }
        if (!current) {
          console.debug("[Settings] parseResizeIgnoreMask: no state.resizeSettings");
          return null;
        }
        if (mask.w !== current.width || mask.h !== current.height) {
          console.warn(
            `[Settings] parseResizeIgnoreMask: dimensions mismatch: ${mask.w}x${mask.h} != ${current.width}x${current.height}`
          );
          return null;
        }
        const expectedMaskSize = mask.w * mask.h;
        let bin;
        try {
          bin = atob(mask.data);
        } catch (e) {
          console.warn("[Settings] parseResizeIgnoreMask: failed to decode base64", e);
          return null;
        }
        if (bin.length !== expectedMaskSize) {
          console.warn(
            `[Settings] parseResizeIgnoreMask: size mismatch: got ${bin.length}, expected ${expectedMaskSize}`
          );
          return null;
        }
        const arr = new Uint8Array(expectedMaskSize);
        for (let i = 0; i < expectedMaskSize; i++) {
          const code = bin.charCodeAt(i);
          if (code < 0 || code > 255) {
            console.warn(`[Settings] parseResizeIgnoreMask: invalid byte at index ${i}: ${code}`);
            return null;
          }
          arr[i] = code;
        }
        return arr;
      };
      const settings = loadFromStorage("wplace-bot-settings");
      if (!settings) return;
      Object.assign(state, DEFAULT_SETTINGS, settings);
      state.resizeIgnoreMask = parseResizeIgnoreMask(settings.resizeIgnoreMask, state.resizeSettings) ?? null;
    } catch (e) {
      console.warn("Could not load bot settings:", e);
    }
  }

  // src/js/i18n/fallback.js
  var FALLBACK_TEXT = {
    en: {
      title: "Auto-Image",
      toggleOverlay: "Toggle Overlay",
      scanColors: "Scan Colors",
      uploadImage: "Upload Image",
      resizeImage: "Resize Image",
      selectPosition: "Select Position",
      startPainting: "Start Painting",
      stopPainting: "Stop Painting",
      progress: "Progress",
      pixels: "Pixels",
      charges: "Charges",
      initMessage: "Click 'Upload Image' to begin"
    }
  };

  // src/js/i18n/i18.js
  var loadedTranslations = {};
  var loadTranslations = async (languageKey, retryCount = 0) => {
    if (loadedTranslations[languageKey]) {
      return loadedTranslations[languageKey];
    }
    const url = `https://skalsech.github.io/WPlace-AutoBOT/custom-main/dist/i18n/${languageKey}.json`.trim();
    const maxRetries = 3;
    const baseDelay = 1e3;
    try {
      if (retryCount === 0) {
        console.log(`\u{1F504} Loading ${languageKey} translations from CDN...`);
      } else {
        console.log(
          `\u{1F504} Retrying ${languageKey} translations (attempt ${retryCount + 1}/${maxRetries + 1})...`
        );
      }
      const response = await fetch(url);
      if (response.ok) {
        const translations = await response.json();
        if (typeof translations === "object" && translations !== null && Object.keys(translations).length > 0) {
          loadedTranslations[languageKey] = translations;
          console.log(
            `\u{1F4DA} Loaded ${languageKey} translations successfully from CDN (${Object.keys(translations).length} keys)`
          );
          return translations;
        } else {
          console.warn(`\u274C Invalid translation format for ${languageKey}`);
          throw new Error("Invalid translation format");
        }
      } else {
        console.warn(
          `\u274C CDN returned HTTP ${response.status}: ${response.statusText} for ${languageKey} translations`
        );
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(
        `\u274C Failed to load ${languageKey} translations from CDN (attempt ${retryCount + 1}):`,
        error
      );
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount);
        console.log(`\u23F3 Retrying in ${delay}ms...`);
        await sleep(delay);
        return loadTranslations(languageKey, retryCount + 1);
      }
    }
    return null;
  };
  var resolvePreferredLanguage = () => {
    const browserLocale = navigator.language;
    const browserLanguage = browserLocale.split("-")[0];
    if (APP_CONSTANTS.LANGUAGES.includes(browserLocale)) {
      return browserLocale;
    }
    if (APP_CONSTANTS.LANGUAGES.includes(browserLanguage)) {
      return browserLanguage;
    }
    return "en";
  };
  var showTranslationWarning = (message) => {
    try {
      const warning = document.createElement("div");
      warning.style.cssText = `
        position: fixed; top: 10px; right: 10px; z-index: 10001;
        background: rgba(255, 193, 7, 0.95); color: #212529; padding: 12px 16px;
        border-radius: 8px; font-size: 14px; font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1px solid rgba(255, 193, 7, 0.8);
        max-width: 300px; word-wrap: break-word;
      `;
      warning.textContent = message;
      document.body.appendChild(warning);
      setTimeout(() => {
        if (warning.parentNode) {
          warning.remove();
        }
      }, 8e3);
    } catch (e) {
      console.warn("Failed to show translation warning UI:", e);
    }
  };
  var initializeTranslations = async () => {
    if (!loadedTranslations["en"]) {
      const englishLoaded = await loadTranslations("en");
      if (!englishLoaded) {
        console.warn("\u26A0\uFE0F Failed to load English translations from CDN, using fallback");
        showTranslationWarning("\u26A0\uFE0F Translation loading failed, using basic fallbacks");
      }
    }
    if (isSavedSettingsEmpty()) {
      const bestLanguage = resolvePreferredLanguage();
      if (!loadedTranslations[bestLanguage]) {
        await loadTranslations(bestLanguage);
        state.languageKey = bestLanguage;
      }
    } else {
      await loadTranslations(state.languageKey);
      updateTranslations();
    }
    console.log(`\u2705 Translation system initialized. Active language: ${state.languageKey}`);
  };
  function t(key, params = {}) {
    let text = loadedTranslations[state.languageKey]?.[key];
    if ((!text || text === key) && state.languageKey !== "en") {
      text = loadedTranslations["en"]?.[key];
    }
    if (!text) {
      text = FALLBACK_TEXT[state.languageKey]?.[key] || FALLBACK_TEXT.en?.[key] || key;
      if (text === key) {
        console.warn(`\u26A0\uFE0F Missing translation for key: ${key} (language: ${state.languageKey})`);
      }
    }
    const formatter = new window.IntlMessageFormat.IntlMessageFormat(text, state.languageKey);
    return formatter.format(params);
  }
  function updateTranslations() {
    document.querySelectorAll("[data-i18n-key]").forEach((el) => {
      const key = el.dataset.i18nKey;
      const params = el.dataset.i18nParams ? JSON.parse(el.dataset.i18nParams) : {};
      const newText = t(key, params);
      if (el.dataset.i18nAttr === "title") {
        el.title = newText;
      } else if (el.dataset.i18nAttr === "placeholder") {
        el.placeholder = newText;
      } else {
        const textNodes = [...el.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE);
        if (textNodes.length > 0) {
          textNodes[textNodes.length - 1].textContent = newText;
        } else {
          el.innerText = newText;
        }
      }
    });
  }

  // src/js/utils/flags.js
  var FlagsBitmap = class {
    /**
     * Creates a bit flag manager backed by a Uint8Array.
     * @param {Uint8Array} [bytes] - Initial byte data. Defaults to empty array.
     */
    constructor(bytes) {
      this.bytes = bytes || new Uint8Array(0);
    }
    /**
     * Sets a bit at the given index.
     * @param {number} bitIndex - Zero-based index of the bit to set.
     * @param {boolean} value - Value to set (true or false).
     */
    set(bitIndex, value) {
      const byteIndex = Math.floor(bitIndex / 8);
      const bitOffset = bitIndex % 8;
      if (byteIndex >= this.bytes.length) {
        const newBytes = new Uint8Array(byteIndex + 1);
        const offset = newBytes.length - this.bytes.length;
        for (let i = 0; i < this.bytes.length; i++) {
          newBytes[i + offset] = this.bytes[i];
        }
        this.bytes = newBytes;
      }
      const actualByteIndex = this.bytes.length - 1 - byteIndex;
      if (value) {
        this.bytes[actualByteIndex] |= 1 << bitOffset;
      } else {
        this.bytes[actualByteIndex] &= ~(1 << bitOffset);
      }
    }
    /**
     * Gets the value of a bit at the given index.
     * @param {number} bitIndex - Zero-based index of the bit to get.
     * @returns {boolean} - True if the bit is set, false otherwise.
     */
    get(bitIndex) {
      const byteIndex = Math.floor(bitIndex / 8);
      const bitOffset = bitIndex % 8;
      const totalBytes = this.bytes.length;
      if (byteIndex >= totalBytes) {
        return false;
      }
      const actualByteIndex = totalBytes - 1 - byteIndex;
      return (this.bytes[actualByteIndex] & 1 << bitOffset) !== 0;
    }
  };

  // src/js/core/api-service.js
  var WPlaceService = class {
    constructor() {
      this.cache = null;
      this.cacheTimestamp = 0;
      this.minUpdateInterval = 6e4;
      this.maxUpdateInterval = 9e4;
      this._regionOwnershipCache = /* @__PURE__ */ new Map();
    }
    _generateRandomTTL() {
      return this.minUpdateInterval + Math.random() * (this.maxUpdateInterval - this.minUpdateInterval);
    }
    /**
     * Fetches user data from the server or returns cached data based on TTL.
     *
     * This method implements a randomized time-to-live (TTL) caching strategy:
     * - On first call or when the cache expires, it makes a fresh request to `/me`.
     * - If the cache is still valid (within the randomized TTL window), it returns the cached data.
     * - The TTL is randomly generated between `minUpdateInterval` and `maxUpdateInterval` (60s–90s).
     *
     * The returned object includes a `fromCache` flag to distinguish between
     * fresh server responses and cached responses. This allows calling code
     * (e.g., `updateStats`) to decide whether to update the local state (like `startTime`)
     * based on the source of the data.
     *
     * @returns {Promise<{ data: UserData, fromCache: boolean }>}
     *   - `data`: The parsed user data object from `/me` (same shape as API response).
     *   - `fromCache`: `true` if data was served from the internal cache (not fetched from server).
     *                  `false` if a fresh network request was made.
     *
     * @example
     * const result = await wplaceService.getUserData();
     * if (!result.fromCache) {
     *   // Update local state (e.g., startTime) because this is a fresh server snapshot
     *   state.fullChargeData = {
     *     current: result.data.charges.count,
     *     max: result.data.charges.max,
     *     cooldownMs: result.data.charges.cooldownMs,
     *     startTime: Date.now(), // ← Only update here!
     *     spentSinceShot: 0
     *   };
     * }
     * // Use result.data for display or other logic regardless of source
     */
    async getUserData() {
      const now = Date.now();
      if (!this.cache) {
        return { data: await this.fetchAndCache(), fromCache: false };
      }
      const randomThreshold = this._generateRandomTTL();
      if (now - this.cacheTimestamp >= randomThreshold) {
        return { data: await this.fetchAndCache(), fromCache: false };
      }
      return { data: this.cache, fromCache: true };
    }
    async fetchAndCache() {
      try {
        const res = await fetch("https://backend.wplace.live/me", {
          credentials: "include"
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.cache = data;
        this.cacheTimestamp = Date.now();
        return data;
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        throw error;
      }
    }
    invalidateCache() {
      this.cache = null;
      this.cacheTimestamp = 0;
      console.log("WPlaceService cache invalidated manually");
    }
    getCharges() {
      return this.getUserData().then((result) => ({
        count: result.data.charges?.count ?? 0,
        max: result.data.charges?.max ?? 1,
        cooldown: result.data.charges?.cooldownMs ?? state.cooldown,
        fromCache: result.fromCache
      }));
    }
    getDroplets() {
      return this.getUserData().then((result) => ({
        value: result.data.droplets ?? 0,
        fromCache: result.fromCache
      }));
    }
    getExtraColorsBitmap() {
      return this.getUserData().then((result) => ({
        value: result.data.extraColorsBitmap ?? 0,
        fromCache: result.fromCache
      }));
    }
    getFlagsBitmap() {
      return this.getUserData().then((result) => ({
        value: result.data.flagsBitmap ?? "AA==",
        fromCache: result.fromCache
      }));
    }
    getEquippedFlag() {
      return this.getUserData().then((result) => ({
        value: result.data.equippedFlag ?? 0,
        fromCache: result.fromCache
      }));
    }
    getCountry() {
      return this.getUserData().then((result) => ({
        value: result.data.country ?? "",
        fromCache: result.fromCache
      }));
    }
    getName() {
      return this.getUserData().then((result) => ({
        value: result.data.name ?? "",
        fromCache: result.fromCache
      }));
    }
    getLevel() {
      return this.getUserData().then((result) => ({
        value: result.data.level ?? 0,
        fromCache: result.fromCache
      }));
    }
    getTimeoutUntil() {
      return this.getUserData().then((result) => ({
        value: result.data.timeoutUntil ?? "1970-01-01T00:00:00Z",
        fromCache: result.fromCache
      }));
    }
    /**
     * Returns the raw experiments object from user data.
     * @returns {Promise<{ value: Object, fromCache: boolean }>}
     */
    getExperiments() {
      return this.getUserData().then((result) => ({
        value: result.data.experiments ?? {},
        fromCache: result.fromCache
      }));
    }
    getAll() {
      return this.getUserData().then((result) => ({
        data: result.data,
        fromCache: result.fromCache
      }));
    }
    /**
     * Checks if a region (regionX, regionY) belongs to a country owned by the current user.
     * Results are cached locally to avoid redundant network requests.
     * If the region was checked recently, returns the cached result without making a request.
     * @param {number} regionX - X-coordinate of the region (0-based grid index)
     * @param {number} regionY - Y-coordinate of the region (0-based grid index)
     * @returns {Promise<boolean>} - `true` if the current user owns the country of this region, `false` otherwise
     * @note Results are cached indefinitely until the cache reaches 100 entries (FIFO eviction).
     */
    async ownsRegion(regionX, regionY) {
      if (!Number.isInteger(regionX) || !Number.isInteger(regionY) || regionX < 0 || regionY < 0) {
        return false;
      }
      const key = `${regionX},${regionY}`;
      if (this._regionOwnershipCache.has(key)) {
        return this._regionOwnershipCache.get(key);
      }
      const result = await (async () => {
        const response = await fetch(
          `https://backend.wplace.live/s0/pixel/${regionX}/${regionY}?x=0&y=0`,
          { method: "GET", credentials: "omit" }
        );
        const data = await response.json();
        const countryId = data.region?.countryId;
        if (typeof countryId !== "number") return false;
        const flagsBitmap = await this.getFlagsBitmap();
        const flags = new FlagsBitmap(decodeBase64ToBytes(flagsBitmap.value));
        return flags.get(countryId);
      })();
      this._regionOwnershipCache.set(key, result);
      if (this._regionOwnershipCache.size > 100) {
        const firstKey = this._regionOwnershipCache.keys().next().value;
        this._regionOwnershipCache.delete(firstKey);
      }
      return result;
    }
    /**
     * Returns the current Pawtect experiment variant (e.g., "koala").
     * Returns null if the experiment is not present or malformed.
     *
     * @returns {Promise<{ value: string | null, fromCache: boolean }>}
     *   - `value`: The variant string (e.g., "koala"), or `null` if unavailable
     *   - `fromCache`: Whether the data came from cache
     */
    getPawtectVariant() {
      return this.getUserData().then((result) => {
        const experiments = result.data.experiments ?? {};
        const pawtect = experiments["2025-09_pawtect"] ?? {};
        return {
          value: typeof pawtect.variant === "string" ? pawtect.variant : null,
          fromCache: result.fromCache
        };
      });
    }
    /**
     * Validates that the experiments object matches the exact expected structure.
     * Allows specific keys with exact or multiple allowed values.
     * Throws an error if validation fails.
     *
     * @param {Object} experiments - The experiments object from user data
     * @throws {Error} If experiments structure is invalid or unexpected
     */
    validateExperiments(experiments) {
      const expected = {
        "2025-09_discord_linking": { enabled: true },
        "2025-09_pawtect": { variant: ["koala", "disabled"] }
      };
      if (!experiments || typeof experiments !== "object") {
        throw new Error("Experiments must be a non-null object");
      }
      const keys = Object.keys(experiments);
      const expectedKeys = Object.keys(expected);
      if (keys.length !== expectedKeys.length) {
        throw new Error(
          `Experiments must have exactly ${expectedKeys.length} keys, found ${keys.length}: ${keys.join(", ")}`
        );
      }
      for (const [key, expectedValue] of Object.entries(expected)) {
        if (!Object.prototype.hasOwnProperty.call(experiments, key)) {
          throw new Error(`Missing required experiment key: ${key}`);
        }
        const actual = experiments[key];
        if (typeof actual !== "object" || actual === null) {
          throw new Error(`Experiment ${key} must be an object`);
        }
        for (const [prop, expectedPropVal] of Object.entries(expectedValue)) {
          if (!Object.prototype.hasOwnProperty.call(actual, prop)) {
            throw new Error(`Experiment ${key}.${prop} is required`);
          }
          const actualVal = actual[prop];
          if (Array.isArray(expectedPropVal)) {
            if (!expectedPropVal.includes(actualVal)) {
              throw new Error(
                `Experiment ${key}.${prop} must be one of 
              [${expectedPropVal.map((v) => JSON.stringify(v)).join(", ")}], 
              got ${JSON.stringify(actualVal)}`
              );
            }
          } else {
            if (actualVal !== expectedPropVal) {
              throw new Error(
                `Experiment ${key}.${prop} must be ${JSON.stringify(expectedPropVal)}, 
              got ${JSON.stringify(actualVal)}`
              );
            }
          }
        }
        const allowedProps = Object.keys(expectedValue);
        const actualProps = Object.keys(actual);
        const unexpectedProps = actualProps.filter((p) => !allowedProps.includes(p));
        if (unexpectedProps.length > 0) {
          throw new Error(
            `Experiment ${key} has unexpected properties: ${unexpectedProps.join(", ")}`
          );
        }
      }
      const unexpectedKeys = keys.filter((k) => !Object.prototype.hasOwnProperty.call(expected, k));
      if (unexpectedKeys.length > 0) {
        throw new Error(`Unexpected experiment keys detected: ${unexpectedKeys.join(", ")}`);
      }
      return true;
    }
    /**
     * Fetches and validates experiments. Blocks app startup if experiments are tampered with.
     * Call this at app startup to ensure the environment is trusted.
     *
     * @returns {Promise<void>}
     * @throws {Error} If experiments structure is invalid
     * @see {@link this.validateExperiments} — performs the actual validation and throws on failure
     */
    async requireValidExperiments() {
      const { value: experiments } = await this.getExperiments();
      this.validateExperiments(experiments);
    }
  };
  var wplaceService = new WPlaceService();

  // src/js/core/notification-manager.js
  var NotificationManager = {
    pollTimer: null,
    pollIntervalMs: 6e4,
    icon() {
      const link = document.querySelector("link[rel~='icon']");
      return link?.href || location.origin + "/favicon.ico";
    },
    async requestPermission() {
      if (!("Notification" in window)) {
        showAlert(t("notificationsNotSupported"), "warning");
        return "denied";
      }
      if (Notification.permission === "granted") return "granted";
      try {
        return await Notification.requestPermission();
      } catch {
        return Notification.permission;
      }
    },
    canNotify() {
      return state.notificationsEnabled && typeof Notification !== "undefined" && Notification.permission === "granted";
    },
    notify(title, body, tag = "wplace-charges", force = false) {
      if (!this.canNotify()) return false;
      if (!force && state.notifyOnlyWhenUnfocused && document.hasFocus()) return false;
      try {
        new Notification(title, {
          body,
          tag,
          renotify: true,
          icon: this.icon(),
          badge: this.icon(),
          silent: false
        });
        return true;
      } catch {
        showAlert(body, "info");
        return false;
      }
    },
    resetEdgeTracking() {
      state._lastChargesBelow = state.displayCharges < state.cooldownChargeThreshold;
      state._lastChargesNotifyAt = 0;
    },
    maybeNotifyChargesReached(force = false) {
      if (!state.notificationsEnabled || !state.notifyOnChargesReached) return;
      const reached = state.displayCharges >= state.cooldownChargeThreshold;
      const now = Date.now();
      const repeatMs = Math.max(1, Number(state.notificationIntervalMinutes || 5)) * 6e4;
      if (reached) {
        const shouldEdge = state._lastChargesBelow || force;
        const shouldRepeat = now - (state._lastChargesNotifyAt || 0) >= repeatMs;
        if (shouldEdge || shouldRepeat) {
          const msg = t("chargesReadyMessage", {
            current: state.displayCharges,
            max: state.fullChargeData.max,
            threshold: state.cooldownChargeThreshold
          });
          this.notify(t("chargesReadyNotification"), msg, "wplace-notify-charges");
          state._lastChargesNotifyAt = now;
        }
        state._lastChargesBelow = false;
      } else {
        state._lastChargesBelow = true;
      }
    },
    startPolling() {
      this.stopPolling();
      if (!state.notificationsEnabled || !state.notifyOnChargesReached) return;
      this.pollTimer = setInterval(async () => {
        try {
          const { charges, cooldown } = await wplaceService.getCharges();
          state.displayCharges = Math.floor(charges);
          state.cooldown = cooldown;
          this.maybeNotifyChargesReached();
        } catch {
        }
      }, this.pollIntervalMs);
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },
    syncFromState() {
      this.resetEdgeTracking();
      if (state.notificationsEnabled && state.notifyOnChargesReached) this.startPolling();
      else this.stopPolling();
    }
  };

  // src/js/utils/files.js
  var createImageUploader = () => new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg";
    input.onchange = () => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.readAsDataURL(input.files[0]);
    };
    input.click();
  });
  var createFileDownloader = (data, filename) => {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  var createFileUploader = () => new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result);
            resolve(data);
          } catch (_) {
            reject(new Error("Invalid JSON file"));
          }
        };
        reader.onerror = () => reject(new Error("File reading error"));
        reader.readAsText(file);
      } else {
        reject(new Error("No file selected"));
      }
    };
    input.click();
  });

  // src/js/core/image-processor.js
  var ImageProcessor = class _ImageProcessor {
    constructor(imageSrcOrData) {
      if (typeof imageSrcOrData === "string") {
        this.imageSrc = imageSrcOrData;
        this.img = null;
        this.canvas = null;
        this.ctx = null;
      } else if (imageSrcOrData && typeof imageSrcOrData === "object") {
        const { width, height, pixels } = imageSrcOrData;
        if (width && height && pixels) {
          this.imageSrc = null;
          this.img = null;
          this.canvas = null;
          this.ctx = null;
          this.createFromPixelData(width, height, pixels);
        } else {
          throw new Error("Invalid image data object: missing width, height, or pixels");
        }
      } else {
        this.imageSrc = null;
        this.img = null;
        this.canvas = null;
        this.ctx = null;
      }
    }
    /**
     * Creates canvas and context from pixel data
     * @param {number} width
     * @param {number} height
     * @param {Uint8ClampedArray | ArrayBuffer} pixels
     */
    createFromPixelData(width, height, pixels) {
      if (pixels instanceof ArrayBuffer) {
        pixels = new Uint8ClampedArray(pixels);
      }
      if (!(pixels instanceof Uint8ClampedArray)) {
        throw new Error("pixels must be Uint8ClampedArray or ArrayBuffer");
      }
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.canvas.width = width;
      this.canvas.height = height;
      const imageData = new ImageData(pixels, width, height);
      this.ctx.putImageData(imageData, 0, 0);
      this.img = this.canvas;
    }
    async load() {
      if (this.imageSrc) {
        return new Promise((resolve, reject) => {
          this.img = new Image();
          this.img.crossOrigin = "anonymous";
          this.img.onload = () => {
            this.canvas = document.createElement("canvas");
            this.ctx = this.canvas.getContext("2d");
            this.canvas.width = this.img.width;
            this.canvas.height = this.img.height;
            this.ctx.drawImage(this.img, 0, 0);
            resolve();
          };
          this.img.onerror = reject;
          this.img.src = this.imageSrc;
        });
      } else {
        if (this.canvas && this.ctx) {
          return Promise.resolve();
        } else {
          return Promise.reject(new Error("No image source or pixel data available"));
        }
      }
    }
    getDimensions() {
      return {
        width: this.canvas?.width || 0,
        height: this.canvas?.height || 0
      };
    }
    getPixelData() {
      if (!this.ctx) return null;
      return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
    }
    /**
     * Counts color frequency in the uploaded art.
     * Transparent pixels (a=0) are skipped if shouldSkipTransparent is true,
     * otherwise replaced with APP_CONSTANTS.COLOR_MAP['0'].rgb.
     * @param {boolean} shouldSkipTransparent - Whether to skip or replace transparent pixels.
     * @returns {Map<string, number>} RGB color string (e.g., "255,255,255") → pixel count.
     */
    countColors(shouldSkipTransparent) {
      const data = this.getPixelData();
      if (!data) return /* @__PURE__ */ new Map();
      const colorCounts = /* @__PURE__ */ new Map();
      const defaceColorObj = APP_CONSTANTS.COLOR_MAP["0"].rgb;
      const defaceTransparentColor = [defaceColorObj.r, defaceColorObj.g, defaceColorObj.b].join(",");
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b, a] = data.slice(i, i + 4);
        if (a === 0 && shouldSkipTransparent) continue;
        const key = a === 0 ? defaceTransparentColor : `${r},${g},${b}`;
        colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
      }
      return colorCounts;
    }
    /**
     * Static helper to create ImageProcessor from pixel data
     * @param {number} width
     * @param {number} height
     * @param {Uint8ClampedArray | ArrayBuffer} pixels
     * @param {boolean} shouldSkipTransparent
     * @returns {ImageProcessor}
     */
    static fromPixelData(width, height, pixels, shouldSkipTransparent = false) {
      const proc = new _ImageProcessor({ width, height, pixels });
      return proc;
    }
  };

  // src/js/utils/data-packing.js
  function packPaintedMapToBase64(paintedMap, width, height) {
    if (!paintedMap || !width || !height) return null;
    const totalBits = width * height;
    const byteLen = Math.ceil(totalBits / 8);
    const bytes = new Uint8Array(byteLen);
    let bitIndex = 0;
    for (let y = 0; y < height; y++) {
      const row = paintedMap[y];
      for (let x = 0; x < width; x++) {
        const bit = row && row[x] ? 1 : 0;
        const b = bitIndex >> 3;
        const o = bitIndex & 7;
        if (bit) bytes[b] |= 1 << o;
        bitIndex++;
      }
    }
    let binary = "";
    const chunk = 32768;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunk, bytes.length)));
    }
    return btoa(binary);
  }

  // src/js/storage/migrations.js
  function migrateProgressToV2(saved) {
    if (!saved) return saved;
    const isV1 = !saved.version || saved.version === "1" || saved.version === "1.0" || saved.version === "1.1";
    if (!isV1) return saved;
    try {
      const migrated = { ...saved };
      const width = migrated.imageData?.width;
      const height = migrated.imageData?.height;
      if (migrated.paintedMap && width && height) {
        const data = packPaintedMapToBase64(migrated.paintedMap, width, height);
        migrated.paintedMapPacked = { width, height, data };
      }
      delete migrated.paintedMap;
      migrated.version = "2";
      return migrated;
    } catch (e) {
      console.warn("Migration to v2 failed, using original data:", e);
      return saved;
    }
  }
  function migrateProgressToV21(saved) {
    if (!saved) return saved;
    if (saved.version === "2.1") return saved;
    const isV2 = saved.version === "2" || saved.version === "2.0";
    const isV1 = !saved.version || saved.version === "1" || saved.version === "1.0" || saved.version === "1.1";
    if (!isV2 && !isV1) return saved;
    try {
      const migrated = { ...saved };
      if (isV1) {
        const width = migrated.imageData?.width;
        const height = migrated.imageData?.height;
        if (migrated.paintedMap && width && height) {
          const data = packPaintedMapToBase64(migrated.paintedMap, width, height);
          migrated.paintedMapPacked = { width, height, data };
        }
        delete migrated.paintedMap;
      }
      migrated.version = "2.1";
      return migrated;
    } catch (e) {
      console.warn("Migration to v2.1 failed, using original data:", e);
      return saved;
    }
  }
  function migrateProgressToV22(data) {
    try {
      const migrated = { ...data };
      migrated.version = "2.2";
      if (!migrated.state.coordinateMode) {
        migrated.state.coordinateMode = DEFAULT_SETTINGS.coordinateMode;
      }
      if (!migrated.state.coordinateDirection) {
        migrated.state.coordinateDirection = DEFAULT_SETTINGS.coordinateDirection;
      }
      if (!migrated.state.coordinateSnake) {
        migrated.state.coordinateSnake = DEFAULT_SETTINGS.coordinateSnake;
      }
      if (!migrated.state.blockWidth) {
        migrated.state.blockWidth = DEFAULT_SETTINGS.blockWidth;
      }
      if (!migrated.state.blockHeight) {
        migrated.state.blockHeight = DEFAULT_SETTINGS.blockHeight;
      }
      return migrated;
    } catch (e) {
      console.warn("Migration to v2.2 failed, using original data:", e);
      return data;
    }
  }
  function migrateProgressToV23(data) {
    try {
      const migrated = { ...data };
      migrated.version = "2.3";
      if (migrated.state) {
        delete migrated.state.coordinateMode;
        delete migrated.state.coordinateDirection;
        delete migrated.state.coordinateSnake;
        delete migrated.state.blockWidth;
        delete migrated.state.blockHeight;
        delete migrated.state.paintedMapPacked;
        delete migrated.state.lastPosition;
        delete migrated.state.colorsChecked;
        delete migrated.state.imageLoaded;
        if (migrated.state.totalPixels != null) {
          migrated.state.artTotalPixels = migrated.state.totalPixels;
          delete migrated.state.totalPixels;
        }
        if (migrated.state.paintedPixels != null) {
          migrated.state.userPaintedPixels = migrated.state.paintedPixels;
          delete migrated.state.paintedPixels;
        }
      }
      return migrated;
    } catch (e) {
      console.warn("Migration to v2.3 failed, using original data:", e);
      return data;
    }
  }
  function migrateProgressToV24(data) {
    try {
      const migrated = { ...data };
      migrated.version = "2.4";
      if (migrated.state) {
        delete migrated.state.userPaintedPixels;
        delete migrated.state.totalPaintedPixels;
        delete migrated.state.availableColors;
      }
      return migrated;
    } catch (e) {
      console.warn("Migration to v2.4 failed, using original data:", e);
      return data;
    }
  }

  // src/js/storage/indexed-db-storage.js
  var DB_NAME = "WplaceDB";
  var DB_VERSION = 1;
  var STORE_NAME = "progress-store";
  var dbPromise = null;
  function promisifyRequest(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function getDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
    return dbPromise;
  }
  async function transactionComplete(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("transaction error"));
      tx.onabort = () => reject(tx.error || new Error("transaction aborted"));
    });
  }
  function normalizeForStorage(value) {
    if (value?.imageData?.pixels instanceof Uint8ClampedArray) {
      value = {
        ...value,
        imageData: {
          ...value.imageData,
          pixels: value.imageData.pixels.buffer
        }
      };
    }
    return value;
  }
  function normalizeAfterLoad(value) {
    if (value?.imageData?.pixels instanceof Array) {
      value.imageData.pixels = new Uint8ClampedArray(value.imageData.pixels).buffer;
    }
    return value;
  }
  var saveToIndexDB = async (key, value) => {
    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const normalized = normalizeForStorage(value);
      store.put(normalized, key);
      await transactionComplete(tx);
      return true;
    } catch (error) {
      console.error("\u274C IndexedDB save failed:", error);
      return false;
    }
  };
  var loadFromIndexDB = async (key, defaultValue = null) => {
    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const record = await promisifyRequest(store.get(key));
      await transactionComplete(tx);
      if (!record) return defaultValue;
      return normalizeAfterLoad(record);
    } catch (error) {
      console.error("\u274C IndexedDB load failed:", error);
      return defaultValue;
    }
  };

  // src/js/storage/progress-manager.js
  function buildProgressData() {
    return {
      timestamp: Date.now(),
      version: "2.4",
      state: {
        artTotalPixels: state.artTotalPixels,
        startPosition: state.startPosition,
        region: state.region
      },
      imageData: state.imageLoaded ? {
        width: state.imageData.width,
        height: state.imageData.height,
        totalPixels: state.imageData.totalPixels,
        pixels: state.imageData.pixels.buffer
      } : null
    };
  }
  function migrateProgress(saved) {
    if (!saved) return null;
    let data = saved;
    const ver = data.version;
    if (!ver || ver === "1" || ver === "1.0" || ver === "1.1") {
      data = migrateProgressToV2(data);
    }
    if (data.version === "2" || data.version === "2.0") {
      data = migrateProgressToV21(data);
    }
    if (data.version === "2.1") {
      data = migrateProgressToV22(data);
    }
    if (data.version === "2.2") {
      data = migrateProgressToV23(data);
    }
    if (data.version === "2.3") {
      data = migrateProgressToV24(data);
    }
    return data;
  }
  async function saveProgress() {
    try {
      const progressData = buildProgressData();
      return await saveToIndexDB("wplace-bot-progress", progressData);
    } catch (error) {
      console.error("Error saving progress:", error);
      return false;
    }
  }
  async function loadProgress() {
    try {
      const savedData = await loadFromIndexDB("wplace-bot-progress");
      if (!savedData) return null;
      const migrated = migrateProgress(savedData);
      if (migrated && migrated !== savedData) {
        await saveToIndexDB("wplace-bot-progress", migrated);
      }
      return migrated;
    } catch (error) {
      console.error("Error loading progress:", error);
      return null;
    }
  }
  function restoreProgress(savedData) {
    try {
      const migrated = migrateProgress(savedData);
      if (!migrated) return false;
      Object.assign(state, migrated.state);
      if (migrated.imageData) {
        const { width, height, totalPixels, pixels } = migrated.imageData;
        let pixelArray;
        if (pixels instanceof ArrayBuffer) {
          pixelArray = new Uint8ClampedArray(pixels);
        } else if (Array.isArray(pixels)) {
          pixelArray = new Uint8ClampedArray(pixels);
        } else {
          throw new Error("Invalid pixels format: expected ArrayBuffer or Array");
        }
        state.imageData = {
          width,
          height,
          totalPixels,
          pixels: pixelArray
        };
        try {
          const proc = ImageProcessor.fromPixelData(
            state.imageData.width,
            state.imageData.height,
            state.imageData.pixels,
            !state.paintTransparentPixels
          );
          state.imageData.processor = proc;
          state.artColorFrequency = proc.countColors(!state.paintTransparentPixels);
        } catch (e) {
          console.warn("Could not rebuild processor from saved image data:", e);
        }
      }
      return true;
    } catch (error) {
      console.error("Error restoring progress:", error);
      return false;
    }
  }
  function saveProgressToFile() {
    try {
      const progressData = buildProgressData();
      if (progressData.imageData) {
        progressData.imageData.pixels = Array.from(
          new Uint8ClampedArray(progressData.imageData.pixels)
        );
      }
      const filename = `wplace-bot-progress-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
      createFileDownloader(JSON.stringify(progressData, null, 2), filename);
      return true;
    } catch (error) {
      console.error("Error saving to file:", error);
      return false;
    }
  }
  async function loadProgressFromFile() {
    try {
      const data = await createFileUploader();
      if (!data || !data.state) {
        throw new Error("Invalid file format");
      }
      if (data.imageData && Array.isArray(data.imageData.pixels)) {
        data.imageData.pixels = new Uint8ClampedArray(data.imageData.pixels).buffer;
      }
      return restoreProgress(data);
    } catch (error) {
      console.error("Error loading from file:", error);
      throw error;
    }
  }

  // src/js/utils/time.js
  function formatTime(ms) {
    const seconds = Math.floor(ms / 1e3 % 60);
    const minutes = Math.floor(ms / (1e3 * 60) % 60);
    const hours = Math.floor(ms / (1e3 * 60 * 60) % 24);
    const days = Math.floor(ms / (1e3 * 60 * 60 * 24));
    let result = "";
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m `;
    result += `${seconds}s`;
    return result;
  }
  function calculateEstimatedTime(intervalMs = 0, efficientAccountsCount = 1, normalAccountsCount = 9) {
    const totalAccounts = normalAccountsCount + efficientAccountsCount;
    const remainingPixels = state.artTotalPixels - state.currentPaintedPixels - state.preciseCurrentCharges * totalAccounts;
    const efficiencyRatio = (normalAccountsCount + efficientAccountsCount * 0.9) / totalAccounts;
    const totalChargeCost = efficiencyRatio * remainingPixels;
    const result = totalChargeCost * state.cooldown / totalAccounts;
    return Math.max(0, result - intervalMs);
  }
  function getMsToTargetCharges(current, target, cooldown, intervalMs = 0) {
    const remainingCharges = target - current;
    return Math.max(0, remainingCharges * cooldown - intervalMs);
  }

  // src/js/utils/painting-helpers.js
  function updateChargesThresholdUI(intervalMs) {
    if (state.stopFlag) return;
    const threshold = state.cooldownChargeThreshold;
    const remainingMs = getMsToTargetCharges(
      state.preciseCurrentCharges,
      threshold,
      state.cooldown,
      intervalMs
    );
    const timeText = msToTimeText(remainingMs);
    updateUI(
      "noChargesThreshold",
      "warning",
      {
        threshold,
        current: state.displayCharges,
        time: timeText
      },
      true
    );
  }

  // src/js/utils/dom.js
  function createElement(tag, props = {}, children = []) {
    const element = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (key === "style" && typeof value === "object") {
        Object.assign(element.style, value);
      } else if (key === "className") {
        element.className = value;
      } else if (key === "innerHTML") {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    if (typeof children === "string") {
      element.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach((child) => {
        if (typeof child === "string") {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
    }
    return element;
  }
  function hasColor(colorId, extraColorsBitmap) {
    if (colorId < 32) {
      return true;
    }
    const bitPosition = colorId - 32;
    return (extraColorsBitmap & 1 << bitPosition) !== 0;
  }
  function getAvailableColors(extraColorsBitmap) {
    const available = [];
    for (const colorIdStr of Object.keys(APP_CONSTANTS.COLOR_MAP)) {
      const colorId = Number(colorIdStr);
      if (isNaN(colorId) || colorId < 0 || colorId > 63) {
        console.warn(`Invalid color id in COLOR_MAP: ${colorId}`);
        continue;
      }
      if (hasColor(colorId, extraColorsBitmap)) {
        const color = APP_CONSTANTS.COLOR_MAP[colorId];
        if (color && color.id === colorId) {
          available.push({
            id: color.id,
            name: color.name,
            rgb: [color.rgb.r, color.rgb.g, color.rgb.b]
          });
        } else if (color) {
          console.warn(
            `COLOR_MAP[${colorId}] has an invalid id: ${color.id}. Expected ${colorId}.`,
            color
          );
        }
      }
    }
    return available;
  }
  function safeOn(el, event, handler) {
    if (el) el.addEventListener(event, handler);
  }

  // src/js/utils/color-matching.js
  var _labCache = /* @__PURE__ */ new Map();
  var colorCache = /* @__PURE__ */ new Map();
  function calculateLegacyDistance(target, color) {
    const [r, g, b] = target;
    const [pr, pg, pb] = color;
    const rmean = (pr + r) / 2;
    const rdiff = pr - r;
    const gdiff = pg - g;
    const bdiff = pb - b;
    return Math.sqrt(
      ((512 + rmean) * rdiff * rdiff >> 8) + 4 * gdiff * gdiff + ((767 - rmean) * bdiff * bdiff >> 8)
    );
  }
  function calculateLabDistance(targetLab, colorLab, state2) {
    const [Lt, at, bt] = targetLab;
    const [Lp, ap, bp] = colorLab;
    const dL = Lt - Lp, da = at - ap, db = bt - bp;
    let dist = dL * dL + da * da + db * db;
    if (state2.enableChromaPenalty) {
      const targetChroma = Math.sqrt(at * at + bt * bt);
      const candChroma = Math.sqrt(ap * ap + bp * bp);
      if (targetChroma > 20 && candChroma < targetChroma) {
        const chromaDiff = targetChroma - candChroma;
        dist += chromaDiff * chromaDiff * state2.chromaPenaltyWeight;
      }
    }
    return dist;
  }
  function _rgbToLab(r, g, b) {
    const srgbToLinear = (v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const rl = srgbToLinear(r);
    const gl = srgbToLinear(g);
    const bl = srgbToLinear(b);
    let X = rl * 0.4124 + gl * 0.3576 + bl * 0.1805;
    let Y = rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
    let Z = rl * 0.0193 + gl * 0.1192 + bl * 0.9505;
    X /= 0.95047;
    Y /= 1;
    Z /= 1.08883;
    const f = (t2) => t2 > 8856e-6 ? Math.cbrt(t2) : 7.787 * t2 + 16 / 116;
    const fX = f(X), fY = f(Y), fZ = f(Z);
    const L = 116 * fY - 16;
    const a = 500 * (fX - fY);
    const b2 = 200 * (fY - fZ);
    return [L, a, b2];
  }
  function _lab(r, g, b) {
    const key = r << 16 | g << 8 | b;
    let v = _labCache.get(key);
    if (!v) {
      v = _rgbToLab(r, g, b);
      _labCache.set(key, v);
    }
    return v;
  }
  function findClosestColor(r, g, b, colors) {
    if (!colors || colors.length === 0) {
      colors = Object.values(APP_CONSTANTS.COLOR_MAP).filter((c) => c.rgb).map((c) => [c.rgb.r, c.rgb.g, c.rgb.b]);
    }
    if (state.colorMatchingAlgorithm === "legacy") {
      let menorDist = Infinity;
      let cor = [0, 0, 0, 255];
      for (let i = 0; i < colors.length; i++) {
        const [pr, pg, pb] = colors[i];
        const dist = calculateLegacyDistance([r, g, b], [pr, pg, pb]);
        if (dist < menorDist) {
          menorDist = dist;
          cor = [pr, pg, pb, 255];
        }
      }
      return cor;
    }
    let best = null;
    let bestDist = Infinity;
    for (let i = 0; i < colors.length; i++) {
      const [pr, pg, pb] = colors[i];
      const targetLab = _lab(r, g, b);
      const colorLab = _lab(pr, pg, pb);
      const dist = calculateLabDistance(targetLab, colorLab, state);
      if (dist < bestDist) {
        bestDist = dist;
        best = [pr, pg, pb, 255];
        if (bestDist === 0) break;
      }
    }
    return best || [0, 0, 0, 255];
  }
  function isWhitePixel(r, g, b) {
    const wt = state.customWhiteThreshold || DEFAULT_SETTINGS.customWhiteThreshold;
    return r >= wt && g >= wt && b >= wt;
  }
  function isTransparentPixel(a) {
    const transparencyThreshold = state.customTransparencyThreshold || DEFAULT_SETTINGS.customTransparencyThreshold;
    if (a === void 0 || a === null) {
      console.warn(`Expected to get alpha of pixel, but got ${a}`);
    }
    return a < transparencyThreshold;
  }
  function colorsChanged(oldColors, newColors) {
    const oldSet = new Set(oldColors.map((c) => c.rgb.join(",")));
    const newSet = new Set(newColors.map((c) => c.rgb.join(",")));
    if (oldSet.size !== newSet.size) return true;
    for (const rgb of oldSet) {
      if (!newSet.has(rgb)) return true;
    }
    return false;
  }
  function invalidateColorCache(changedParams = {}) {
    if (changedParams.availableColors) {
      colorCache.clear();
      return;
    }
    for (const key of colorCache.keys()) {
      const [_, algo, chromaFlag, chromaWeight] = key.split("|");
      if (changedParams.colorMatchingAlgorithm && algo !== changedParams.colorMatchingAlgorithm) {
        colorCache.delete(key);
        continue;
      }
      if (changedParams.enableChromaPenalty !== void 0 && chromaFlag !== (changedParams.enableChromaPenalty ? "c" : "nc")) {
        colorCache.delete(key);
        continue;
      }
      if (changedParams.chromaPenaltyWeight !== void 0 && Number(chromaWeight) !== changedParams.chromaPenaltyWeight) {
        colorCache.delete(key);
        continue;
      }
    }
  }
  function resolveColor(targetRgba, availableColors, exactMatch = false) {
    const targetRgb = targetRgba.slice(0, 3);
    if (!availableColors || availableColors.length === 0) {
      console.warn(
        `Couldn't resolve color (${targetRgba.join(",")}) because availableColors is empty`
      );
      return { id: null, rgb: targetRgb };
    }
    if (isTransparentPixel(targetRgba[3])) {
      return { id: APP_CONSTANTS.COLOR_MAP["0"].id, rgb: APP_CONSTANTS.COLOR_MAP["0"].rgb };
    }
    const cacheKey = `${targetRgb[0]},${targetRgb[1]},${targetRgb[2]}|${state.colorMatchingAlgorithm}|${state.enableChromaPenalty ? "c" : "nc"}|${state.chromaPenaltyWeight}|${exactMatch ? "exact" : "closest"}`;
    if (colorCache.has(cacheKey)) return colorCache.get(cacheKey);
    if (exactMatch) {
      const match = availableColors.find(
        (c) => c.rgb[0] === targetRgb[0] && c.rgb[1] === targetRgb[1] && c.rgb[2] === targetRgb[2]
      );
      const result2 = match ? { id: match.id, rgb: [...match.rgb] } : {
        id: null,
        rgb: targetRgb
      };
      colorCache.set(cacheKey, result2);
      return result2;
    }
    const whiteThreshold = state.customWhiteThreshold || DEFAULT_SETTINGS.customWhiteThreshold;
    if (targetRgb[0] >= whiteThreshold && targetRgb[1] >= whiteThreshold && targetRgb[2] >= whiteThreshold) {
      const whiteEntry = availableColors.find(
        (c) => c.rgb[0] >= whiteThreshold && c.rgb[1] >= whiteThreshold && c.rgb[2] >= whiteThreshold
      );
      if (whiteEntry) {
        const result2 = { id: whiteEntry.id, rgb: [...whiteEntry.rgb] };
        colorCache.set(cacheKey, result2);
        return result2;
      }
    }
    let bestId = availableColors[0].id;
    let bestRgb = [...availableColors[0].rgb];
    let bestScore = Infinity;
    if (state.colorMatchingAlgorithm === "legacy") {
      for (let i = 0; i < availableColors.length; i++) {
        const c = availableColors[i];
        const dist = calculateLegacyDistance(c.rgb, [...c.rgb]);
        if (dist < bestScore) {
          bestScore = dist;
          bestId = c.id;
          bestRgb = [...c.rgb];
          if (dist === 0) break;
        }
      }
    } else {
      for (let i = 0; i < availableColors.length; i++) {
        const c = availableColors[i];
        const [r, g, b] = c.rgb;
        const targetLab = _lab(targetRgb[0], targetRgb[1], targetRgb[2]);
        const colorLab = _lab(r, g, b);
        const dist = calculateLabDistance(targetLab, colorLab, state);
        if (dist < bestScore) {
          bestScore = dist;
          bestId = c.id;
          bestRgb = [...c.rgb];
          if (dist === 0) break;
        }
      }
    }
    const result = { id: bestId, rgb: bestRgb };
    colorCache.set(cacheKey, result);
    if (colorCache.size > 15e3) {
      const firstKey = colorCache.keys().next().value;
      colorCache.delete(firstKey);
    }
    return result;
  }

  // src/js/ui/handlers/settings/coordinate-ui.js
  function updateCoordinateUI({ mode, directionControls, snakeControls, blockControls }) {
    const isLinear = mode === "rows" || mode === "columns";
    const isBlock = mode === "blocks" || mode === "shuffle-blocks";
    if (directionControls) directionControls.style.display = isLinear ? "block" : "none";
    if (snakeControls) snakeControls.style.display = isLinear ? "block" : "none";
    if (blockControls) blockControls.style.display = isBlock ? "block" : "none";
  }

  // src/js/ui/handlers/settings/coordinate-handler.js
  function handleCoordinateModeChange(e) {
    state.coordinateMode = e.target.value;
    updateCoordinateUI({
      mode: state.coordinateMode,
      directionControls: document.getElementById("directionControls"),
      snakeControls: document.getElementById("snakeControls"),
      blockControls: document.getElementById("blockControls")
    });
    saveBotSettings();
    console.log(`\u{1F504} Coordinate mode changed to: ${state.coordinateMode}`);
    showAlert(
      t("coordinateModeSet", { mode: t(`mode${capitalize(state.coordinateMode)}`) }),
      "success"
    );
  }
  function handleCoordinateDirectionChange(e) {
    state.coordinateDirection = e.target.value;
    saveBotSettings();
    console.log(`\u{1F9ED} Coordinate direction changed to: ${state.coordinateDirection}`);
    showAlert(t("coordinateDirectionSet", { direction: t(state.coordinateDirection) }), "success");
  }
  function handleCoordinateSnakeChange(e) {
    state.coordinateSnake = e.target.checked;
    saveBotSettings();
    console.log(`\u{1F40D} Snake pattern ${state.coordinateSnake ? "enabled" : "disabled"}`);
    showAlert(t(state.coordinateSnake ? "snakeEnabled" : "snakeDisabled"), "success");
  }
  function handleSortCoordinateByFrequencyChange(e) {
    state.sortCoordinateByFrequency = e.target.checked;
    saveBotSettings();
    console.log(`SortCoordinateByFrequency ${e.target.checked ? "enabled" : "disabled"}`);
    showAlert(
      t(e.target.checked ? "SortCoordinateByFrequencyEnabled" : "SortCoordinateByFrequencyDisabled"),
      "success"
    );
  }
  function handleBlockWidthInput(e) {
    const width = parseInt(e.target.value, 10);
    if (width >= 1 && width <= 50) {
      state.blockWidth = width;
      saveBotSettings();
    }
  }
  function handleBlockHeightInput(e) {
    const height = parseInt(e.target.value, 10);
    if (height >= 1 && height <= 50) {
      state.blockHeight = height;
      saveBotSettings();
    }
  }
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // src/js/ui/handlers/checkbox-handlers.js
  function createCheckboxHandler(settingKey, onMessageKey, offMessageKey) {
    return function(e) {
      const isChecked = e.target.checked;
      state[settingKey] = isChecked;
      saveBotSettings();
      console.log(`\u{1F3A8} ${settingKey}: ${isChecked ? "ON" : "OFF"}`);
      const message = t(isChecked ? onMessageKey : offMessageKey);
      showAlert(message, "success");
    };
  }
  function createSliderHandler(settingKey, valueElementSelector, formatFn = null) {
    const defaultFormat = (value) => `${Math.round(value * 100)}%`;
    const formatter = formatFn || defaultFormat;
    return function(e) {
      const value = parseFloat(e.target.value);
      state[settingKey] = value;
      saveBotSettings();
      console.log(`\u{1F39A}\uFE0F ${settingKey}: ${value}`);
      if (valueElementSelector) {
        const valueEl = document.querySelector(valueElementSelector);
        if (valueEl) {
          valueEl.textContent = formatter(value);
        }
      }
    };
  }

  // src/js/tiles/tile-loader.js
  var TileLoader = class {
    constructor(overlayManager2) {
      this.overlayManager = overlayManager2;
      this.baseTileUrl = "https://backend.wplace.live/files/s0/tiles";
      this.activeRequests = /* @__PURE__ */ new Map();
      this.recentlyRequested = /* @__PURE__ */ new Map();
      this.requestCacheTimeout = 5e3;
    }
    isRecentlyRequested(tileKey) {
      const lastTime = this.recentlyRequested.get(tileKey);
      return lastTime && Date.now() - lastTime < this.requestCacheTimeout;
    }
    markAsRequested(tileKey) {
      this.recentlyRequested.set(tileKey, Date.now());
      setTimeout(() => {
        if (this.recentlyRequested.get(tileKey) === Date.now()) {
          this.recentlyRequested.delete(tileKey);
        }
      }, this.requestCacheTimeout);
    }
    /**
     * Loads a tile and updates the overlay cache
     * @param {number} tileX
     * @param {number} tileY
     * @param {AbortSignal} [signal]
     * @returns {Promise<{success: boolean, skipped?: boolean, error?: string}>}
     */
    async loadTile(tileX, tileY, signal = null) {
      const tileKey = `${tileX},${tileY}`;
      if (this.isRecentlyRequested(tileKey)) {
        return { success: true, skipped: true, reason: "Recently requested" };
      }
      if (this.activeRequests.has(tileKey)) {
        this.activeRequests.get(tileKey).abort();
      }
      const controller = new AbortController();
      this.activeRequests.set(tileKey, controller);
      if (signal) {
        signal.addEventListener("abort", () => controller.abort());
      }
      try {
        const url = `${this.baseTileUrl}/${tileX}/${tileY}.png`;
        const response = await fetch(url, {
          signal: controller.signal,
          cache: "reload"
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        this.markAsRequested(tileKey);
        return { success: true };
      } catch (error) {
        if (error.name === "AbortError") {
          return { success: false, error: "Request aborted" };
        }
        return { success: false, error: error.message };
      } finally {
        this.activeRequests.delete(tileKey);
      }
    }
    /**
     * Batch loads tiles
     * @param {Array<{x: number, y: number}>} tiles
     * @param {number} [concurrency = 4]
     * @returns {Promise<Array<{tile: {x, y}, result: {success: boolean, skipped?: boolean, error?: string}}>>}
     */
    async loadTilesBatch(tiles, concurrency = 4) {
      const results = [];
      const queue = [...tiles];
      while (queue.length > 0) {
        const batch = queue.splice(0, concurrency);
        const promises = batch.map(async (tile) => {
          const result = await this.loadTile(tile.x, tile.y);
          return { tile, result };
        });
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
      }
      return results;
    }
    /**
     * Cancels all active requests
     */
    cancelAll() {
      for (const controller of this.activeRequests.values()) {
        controller.abort();
      }
      this.activeRequests.clear();
    }
  };

  // src/js/core/wplace-ui.js
  var WPlaceUI = class {
    /**
     * Closes the paint menu if it is currently open.
     *
     * The method locates the close button within the paint panel by searching for an SVG path
     * unique to the close icon. If found, it dispatches a synthetic click event and waits briefly
     * for the UI to update.
     *
     * @async
     * @returns {Promise<void>} Resolves when the close action has been attempted.
     */
    async closePaintMenu() {
      const closeBtnPath = "m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z";
      const closeBtn = document.querySelector(
        `div.absolute.bottom-0.left-0.z-50.w-full button svg path[d="${closeBtnPath}"]`
      )?.closest("button");
      if (closeBtn) {
        const clickEvent = new MouseEvent("click", {
          view: window,
          bubbles: true,
          cancelable: true
        });
        closeBtn.dispatchEvent(clickEvent);
        await new Promise((resolve) => setTimeout(resolve, 250));
      } else {
        console.warn(
          "   Close button for paint menu not found (menu might be already closed or structure changed)."
        );
      }
    }
    /**
     * Forces a refresh of map tiles by temporarily overriding the document visibility state.
     *
     * This method simulates a visibility change to trigger a redraw with reload of tiles currently visible on the canvas.
     * It works by overriding `document.hidden` to always return `false`, dispatching a
     * `visibilitychange` event, and restoring the original state afterward.
     *
     * If the paint menu was open before the refresh, it will be closed automatically afterward
     * via {@link WPlaceUI#closePaintMenu closePaintMenu()}.
     *
     * @async
     * @returns {Promise<void>} Resolves when the tile refresh process is completed.
     */
    async forceRefreshCanvas() {
      const paintButtonContainer = document.querySelector(
        "div.absolute.bottom-3.left-1\\/2.z-30.-translate-x-1\\/2"
      );
      let menuWasOpen = false;
      if (!paintButtonContainer) {
        menuWasOpen = true;
      } else {
        const paintButton = paintButtonContainer.querySelector(
          "button.btn.btn-primary.btn-lg.sm\\:btn-xl"
        );
        if (paintButton) {
          const clickEvent = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true
          });
          paintButton.dispatchEvent(clickEvent);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } else {
          menuWasOpen = true;
          console.error("Paint button not found inside container.");
        }
      }
      if (menuWasOpen) {
        const originalHiddenDescriptor = Object.getOwnPropertyDescriptor(
          Document.prototype,
          "hidden"
        );
        Object.defineProperty(document, "hidden", {
          get() {
            return false;
          },
          configurable: true
        });
        document.dispatchEvent(new Event("visibilitychange"));
        if (originalHiddenDescriptor) {
          Object.defineProperty(document, "hidden", originalHiddenDescriptor);
        }
      } else {
        await this.closePaintMenu();
      }
    }
  };
  var wplaceUI = new WPlaceUI();

  // src/js/tiles/overlay-manager.js
  var OverlayManager = class {
    constructor() {
      this.isEnabled = false;
      this.startCoords = null;
      this.imageBitmap = null;
      this.chunkedTiles = /* @__PURE__ */ new Map();
      this.originalTiles = /* @__PURE__ */ new Map();
      this.originalTilesData = /* @__PURE__ */ new Map();
      this.tileSize = 1e3;
      this.processPromise = null;
      this.lastProcessedHash = null;
      this.workerPool = null;
      this.tileProgress = /* @__PURE__ */ new Map();
      this.totalRequired = 0;
      this.totalPainted = 0;
      this.totalWrong = 0;
    }
    async toggle() {
      this.isEnabled = !this.isEnabled;
      try {
        await wplaceUI.forceRefreshCanvas();
      } catch (error) {
        console.warn("\u26A0\uFE0F overlayManager.toggle: Error during wplaceUI.forceRefreshCanvas():", error);
      }
      console.log(`Overlay ${this.isEnabled ? "enabled" : "disabled"}.`);
      return this.isEnabled;
    }
    enable() {
      this.isEnabled = true;
    }
    disable() {
      this.isEnabled = false;
    }
    clear() {
      this.disable();
      this.imageBitmap = null;
      this.chunkedTiles.clear();
      this.originalTiles.clear();
      this.originalTilesData.clear();
      this.lastProcessedHash = null;
      if (this.processPromise) {
        this.processPromise = null;
      }
    }
    async setImage(imageBitmap) {
      this.imageBitmap = imageBitmap;
      this.lastProcessedHash = null;
      this.tileProgress.clear();
      if (this.imageBitmap && this.startCoords) {
        await this.processImageIntoChunks();
      }
    }
    async setPosition(startPosition, region) {
      if (!startPosition || !region) {
        this.startCoords = null;
        this.chunkedTiles.clear();
        this.lastProcessedHash = null;
        return;
      }
      this.startCoords = { region, pixel: startPosition };
      this.lastProcessedHash = null;
      if (this.imageBitmap) {
        await this.processImageIntoChunks();
      }
    }
    // Generate hash for cache invalidation
    _generateProcessHash() {
      if (!this.imageBitmap || !this.startCoords) return null;
      const { width, height } = this.imageBitmap;
      const { x: px, y: py } = this.startCoords.pixel;
      const { x: rx, y: ry } = this.startCoords.region;
      return `${width}x${height}_${px},${py}_${rx},${ry}_${state.blueMarbleEnabled}_${state.overlayOpacity}`;
    }
    async processImageIntoChunks() {
      if (!this.imageBitmap || !this.startCoords) return;
      if (this.processPromise) {
        return this.processPromise;
      }
      const currentHash = this._generateProcessHash();
      if (this.lastProcessedHash === currentHash && this.chunkedTiles.size > 0) {
        console.log(`\u{1F4E6} Using cached overlay chunks (${this.chunkedTiles.size} tiles)`);
        return;
      }
      this.processPromise = this._doProcessImageIntoChunks();
      try {
        await this.processPromise;
        this.lastProcessedHash = currentHash;
      } finally {
        this.processPromise = null;
      }
    }
    async _doProcessImageIntoChunks() {
      const startTime = performance.now();
      this.chunkedTiles.clear();
      const { width: imageWidth, height: imageHeight } = this.imageBitmap;
      const { x: startPixelX, y: startPixelY } = this.startCoords.pixel;
      const { x: startRegionX, y: startRegionY } = this.startCoords.region;
      const { startTileX, startTileY, endTileX, endTileY } = calculateTileRange(
        startRegionX,
        startRegionY,
        startPixelX,
        startPixelY,
        imageWidth,
        imageHeight,
        this.tileSize
      );
      const totalTiles = (endTileX - startTileX + 1) * (endTileY - startTileY + 1);
      console.log(`\u{1F504} Processing ${totalTiles} overlay tiles...`);
      const batchSize = 4;
      const tilesToProcess = [];
      for (let ty = startTileY; ty <= endTileY; ty++) {
        for (let tx = startTileX; tx <= endTileX; tx++) {
          tilesToProcess.push({ tx, ty });
        }
      }
      for (let i = 0; i < tilesToProcess.length; i += batchSize) {
        const batch = tilesToProcess.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async ({ tx, ty }) => {
            const tileKey = `${tx},${ty}`;
            const chunkBitmap = await this._processTile(
              tx,
              ty,
              imageWidth,
              imageHeight,
              startPixelX,
              startPixelY,
              startRegionX,
              startRegionY
            );
            if (chunkBitmap) {
              this.chunkedTiles.set(tileKey, chunkBitmap);
            }
          })
        );
        if (i + batchSize < tilesToProcess.length) {
          await sleep(0);
        }
      }
      const processingTime = performance.now() - startTime;
      console.log(
        `\u2705 Overlay processed ${this.chunkedTiles.size} tiles in ${Math.round(processingTime)}ms`
      );
    }
    async _processTile(tx, ty, imageWidth, imageHeight, startPixelX, startPixelY, startRegionX, startRegionY) {
      const tileKey = `${tx},${ty}`;
      const imgStartX = (tx - startRegionX) * this.tileSize - startPixelX;
      const imgStartY = (ty - startRegionY) * this.tileSize - startPixelY;
      const sX = Math.max(0, imgStartX);
      const sY = Math.max(0, imgStartY);
      const sW = Math.min(imageWidth - sX, this.tileSize - (sX - imgStartX));
      const sH = Math.min(imageHeight - sY, this.tileSize - (sY - imgStartY));
      if (sW <= 0 || sH <= 0) return null;
      const dX = Math.max(0, -imgStartX);
      const dY = Math.max(0, -imgStartY);
      const chunkCanvas = new OffscreenCanvas(this.tileSize, this.tileSize);
      const chunkCtx = chunkCanvas.getContext("2d");
      chunkCtx.imageSmoothingEnabled = false;
      chunkCtx.drawImage(this.imageBitmap, sX, sY, sW, sH, dX, dY, sW, sH);
      if (state.blueMarbleEnabled) {
        const imageData = chunkCtx.getImageData(dX, dY, sW, sH);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const pixelIndex = i / 4;
          const pixelY = Math.floor(pixelIndex / sW);
          const pixelX = pixelIndex % sW;
          if ((pixelX + pixelY) % 2 === 0 && data[i + 3] > 0) {
            data[i + 3] = 0;
          }
        }
        chunkCtx.putImageData(imageData, dX, dY);
      }
      return chunkCanvas.transferToImageBitmap();
    }
    async processAndRespondToTileRequest(eventData) {
      const { endpoint, blobID, blobData } = eventData;
      let finalBlob = blobData;
      if (this.isEnabled && this.chunkedTiles.size > 0) {
        const tileMatch = endpoint.match(/(\d+)\/(\d+)\.png/);
        if (tileMatch) {
          const tileX = parseInt(tileMatch[1], 10);
          const tileY = parseInt(tileMatch[2], 10);
          const tileKey = `${tileX},${tileY}`;
          const chunkBitmap = this.chunkedTiles.get(tileKey);
          try {
            const originalBitmap = await createImageBitmap(blobData);
            this.originalTiles.set(tileKey, originalBitmap);
            try {
              let canvas, ctx;
              if (typeof OffscreenCanvas !== "undefined") {
                canvas = new OffscreenCanvas(originalBitmap.width, originalBitmap.height);
                ctx = canvas.getContext("2d");
              } else {
                canvas = document.createElement("canvas");
                canvas.width = originalBitmap.width;
                canvas.height = originalBitmap.height;
                ctx = canvas.getContext("2d");
              }
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(originalBitmap, 0, 0);
              const imgData = ctx.getImageData(0, 0, originalBitmap.width, originalBitmap.height);
              this.originalTilesData.set(tileKey, {
                w: originalBitmap.width,
                h: originalBitmap.height,
                data: new Uint8ClampedArray(imgData.data)
              });
              await this._analyzeTileProgress(tileKey);
            } catch (e) {
              console.warn("OverlayManager: could not cache ImageData for", tileKey, e);
            }
          } catch (e) {
            console.warn("OverlayManager: could not create original bitmap for", tileKey, e);
          }
          if (chunkBitmap) {
            try {
              finalBlob = await this._compositeTileOptimized(blobData, chunkBitmap);
            } catch (e) {
              console.error("Error compositing overlay:", e);
              finalBlob = blobData;
            }
          }
        }
      }
      window.postMessage(
        {
          source: "auto-image-overlay",
          blobID,
          blobData: finalBlob
        },
        "*"
      );
    }
    // Returns [r,g,b,a] for a pixel inside a region tile (tileX, tileY are region coords)
    async getTilePixelColor(tileX, tileY, pixelX, pixelY) {
      const tileKey = `${tileX},${tileY}`;
      const cached = this.originalTilesData.get(tileKey);
      if (cached && cached.data && cached.w > 0 && cached.h > 0) {
        const x = Math.max(0, Math.min(cached.w - 1, pixelX));
        const y = Math.max(0, Math.min(cached.h - 1, pixelY));
        const idx = (y * cached.w + x) * 4;
        const pixelData = cached.data;
        const r = pixelData[idx];
        const g = pixelData[idx + 1];
        const b = pixelData[idx + 2];
        const a = pixelData[idx + 3];
        return [r, g, b, a];
      }
      const maxRetries = 3;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const bitmap = this.originalTiles.get(tileKey);
        if (!bitmap) {
          if (attempt === maxRetries) {
            console.warn("OverlayManager: no bitmap for", tileKey, "after", maxRetries, "attempts");
          } else {
            await sleep(50 * attempt);
          }
          continue;
        }
        try {
          let canvas, ctx;
          if (typeof OffscreenCanvas !== "undefined") {
            canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            ctx = canvas.getContext("2d");
          } else {
            canvas = document.createElement("canvas");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            ctx = canvas.getContext("2d");
          }
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(bitmap, 0, 0);
          const x = Math.max(0, Math.min(bitmap.width - 1, pixelX));
          const y = Math.max(0, Math.min(bitmap.height - 1, pixelY));
          const data = ctx.getImageData(x, y, 1, 1).data;
          const a = data[3];
          if (!state.paintTransparentPixels && isTransparentPixel(a)) {
            if (window._overlayDebug)
              console.debug("OverlayManager: pixel transparent (fallback)", tileKey, x, y, a);
            return null;
          }
          return [data[0], data[1], data[2], a];
        } catch (e) {
          console.warn("OverlayManager: failed to read pixel (attempt", attempt, ")", tileKey, e);
          if (attempt < maxRetries) {
            await sleep(50 * attempt);
          } else {
            console.error(
              "OverlayManager: failed to read pixel after",
              maxRetries,
              "attempts",
              tileKey
            );
          }
        }
      }
      return null;
    }
    /**
     * Analyze a single tile's progress by comparing template data with actual tile data.
     * Updates this.tileProgress for the given tileKey.
     * @param {string} tileKey - Key "tileX,tileY" of the tile to analyze.
     */
    async _analyzeTileProgress(tileKey) {
      if (!this.imageBitmap || !this.startCoords) {
        console.warn(`[OverlayManager] Cannot analyze progress: image or startCoords missing.`);
        return;
      }
      const [tileX, tileY] = tileKey.split(",").map(Number);
      const { x: startRegionX, y: startRegionY } = this.startCoords.region;
      const { x: startPixelX, y: startPixelY } = this.startCoords.pixel;
      const imgStartX = (tileX - startRegionX) * this.tileSize - startPixelX;
      const imgStartY = (tileY - startRegionY) * this.tileSize - startPixelY;
      const sX = Math.max(0, imgStartX);
      const sY = Math.max(0, imgStartY);
      const sW = Math.min(this.imageBitmap.width - sX, this.tileSize - (sX - imgStartX));
      const sH = Math.min(this.imageBitmap.height - sY, this.tileSize - (sY - imgStartY));
      if (sW <= 0 || sH <= 0) {
        this.tileProgress.delete(tileKey);
        return;
      }
      const tempCanvas = new OffscreenCanvas(this.tileSize, this.tileSize);
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.imageSmoothingEnabled = false;
      tempCtx.drawImage(this.imageBitmap, sX, sY, sW, sH, 0, 0, sW, sH);
      const templateData = tempCtx.getImageData(0, 0, sW, sH).data;
      const tileData = this.originalTilesData.get(tileKey);
      if (!tileData) {
        console.warn(`[OverlayManager] No cached ImageData for tile ${tileKey}.`);
        this.tileProgress.delete(tileKey);
        return;
      }
      const actualData = tileData.data;
      const actualWidth = tileData.w;
      const actualHeight = tileData.h;
      let painted = 0;
      let required = 0;
      let wrong = 0;
      const dX = Math.max(0, -imgStartX);
      const dY = Math.max(0, -imgStartY);
      for (let ty = 0; ty < sH; ty++) {
        for (let tx = 0; tx < sW; tx++) {
          const templateIdx = (ty * sW + tx) * 4;
          const tr = templateData[templateIdx];
          const tg = templateData[templateIdx + 1];
          const tb = templateData[templateIdx + 2];
          const ta = templateData[templateIdx + 3];
          if (ta < 64) continue;
          required++;
          const actualTx = dX + tx;
          const actualTy = dY + ty;
          if (actualTx >= actualWidth || actualTy >= actualHeight) continue;
          const actualIdx = (actualTy * actualWidth + actualTx) * 4;
          const ar = actualData[actualIdx];
          const ag = actualData[actualIdx + 1];
          const ab = actualData[actualIdx + 2];
          const aa = actualData[actualIdx + 3];
          if (ar === tr && ag === tg && ab === tb && aa === ta) {
            painted++;
          } else if (aa > 0) {
            wrong++;
          }
        }
      }
      this.tileProgress.set(tileKey, { painted, required, wrong });
      state.localPaintedOffset = 0;
      console.debug(
        `[OverlayManager] Analyzed tile ${tileKey}: painted=${painted}, required=${required}, wrong=${wrong}`
      );
    }
    async _compositeTileOptimized(originalBlob, overlayBitmap) {
      const originalBitmap = await createImageBitmap(originalBlob);
      const canvas = new OffscreenCanvas(originalBitmap.width, originalBitmap.height);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(originalBitmap, 0, 0);
      ctx.globalAlpha = state.overlayOpacity;
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(overlayBitmap, 0, 0);
      return await canvas.convertToBlob({
        type: "image/png",
        quality: 0.95
        // Slight compression for faster processing
      });
    }
    /**
     * Waits until all required tiles for the current overlay image are loaded and cached.
     *
     * This method determines which tiles are needed based on the current region and pixel coordinates,
     * then loads them using {@link TileLoader#loadTilesBatch TileLoader.loadTilesBatch()}.
     * It waits until all of them are present in the local tile cache ({@link OverlayManager#originalTiles}).
     *
     * An optional flag `shouldForceUpdateCanvas` can trigger a canvas refresh via {@link wplaceUI.forceRefreshCanvas wplaceUI.forceRefreshCanvas()}
     * *after* the required tiles are loaded. This refresh affects the *currently visible* area on the WPlace canvas,
     * which might be useful for updating the user's view, but does *not* guarantee that the *required* tiles (which might be off-screen)
     * are loaded by this mechanism alone. The primary loading mechanism remains {@link TileLoader#loadTilesBatch TileLoader}.
     *
     * The function periodically checks if all required tiles have been loaded and cached within the given timeout.
     * If the global {@link state.stopFlag} is set, it stops early and returns `false`.
     *
     * @async
     * @param {boolean} [shouldForceUpdateCanvas=false] - If `true`, triggers a canvas refresh via {@link wplaceUI.forceRefreshCanvas wplaceUI.forceRefreshCanvas()}
     *                                                    *after* loading required tiles with TileLoader. This refreshes the *visible* area.
     *                                                    If `false`, only uses {@link TileLoader#loadTilesBatch TileLoader} for loading.
     * @param {number} [timeoutMs=10000] - Maximum time (in milliseconds) to wait for tiles to be loaded and cached.
     * @param {number} [concurrency=4] - Maximum number of concurrent tile loading operations.
     * @returns {Promise<boolean>} Resolves to `true` if all required tiles are successfully loaded and cached,
     *                             or `false` if timeout is reached or the operation was stopped.
     * @throws {Error} May throw if {@link wplaceUI.forceRefreshCanvas wplaceUI.forceRefreshCanvas()} fails unexpectedly.
     */
    async waitForTiles(shouldForceUpdateCanvas = false, timeoutMs = 1e4, concurrency = 4) {
      if (!this.startCoords || !this.startCoords.region || !this.startCoords.pixel) {
        console.warn("OverlayManager: startCoords not set, cannot calculate tile range");
        return false;
      }
      if (!this.imageBitmap || !this.imageBitmap.width || !this.imageBitmap.height) {
        console.warn("OverlayManager: imageBitmap not set or invalid, cannot calculate tile range");
        return false;
      }
      const { x: startPixelX, y: startPixelY } = this.startCoords.pixel;
      const { x: startRegionX, y: startRegionY } = this.startCoords.region;
      const { width: imageWidth, height: imageHeight } = this.imageBitmap;
      const { startTileX, startTileY, endTileX, endTileY } = calculateTileRange(
        startRegionX,
        startRegionY,
        startPixelX,
        startPixelY,
        imageWidth,
        imageHeight,
        this.tileSize
      );
      const requiredTiles = [];
      for (let ty = startTileY; ty <= endTileY; ty++) {
        for (let tx = startTileX; tx <= endTileX; tx++) {
          requiredTiles.push({ x: tx, y: ty });
        }
      }
      if (requiredTiles.length === 0) return true;
      const requiredTileKeys = requiredTiles.map((t2) => `${t2.x},${t2.y}`);
      const tileLoader = new TileLoader(this);
      const results = await tileLoader.loadTilesBatch(requiredTiles, concurrency);
      const failed = results.filter((r) => !r.result.success);
      if (failed.length > 0) {
        console.warn(`\u274C Some tiles failed to load:`, failed);
      }
      if (shouldForceUpdateCanvas) {
        try {
          await wplaceUI.forceRefreshCanvas();
        } catch (error) {
          console.warn("\u26A0\uFE0F waitForTiles: Error during wplaceUI.forceRefreshCanvas():", error);
        }
      }
      const startTime = Date.now();
      while (Date.now() - startTime < timeoutMs) {
        if (state.stopFlag) {
          console.log("waitForTiles: stopped by user");
          return false;
        }
        const missing = requiredTileKeys.filter((key) => !this.originalTiles.has(key));
        if (missing.length === 0) {
          console.log(`\u2705 All ${requiredTiles.length} required tiles are loaded and cached`);
          return true;
        }
        await sleep(100);
      }
      console.warn(`\u274C Timeout waiting for tiles: ${requiredTileKeys.length} required, 
      ${requiredTileKeys.filter((k) => this.originalTiles.has(k)).length} loaded`);
      return false;
    }
    /**
     * Calculates overall progress statistics based on cached tile data.
     * @returns {Object} { painted: number, required: number, wrong: number }
     */
    getOverallProgress() {
      let totalPainted = 0;
      let totalRequired = 0;
      let totalWrong = 0;
      for (const stats of this.tileProgress.values()) {
        totalPainted += stats.painted;
        totalRequired += stats.required;
        totalWrong += stats.wrong;
      }
      this.totalPainted = totalPainted;
      this.totalRequired = totalRequired;
      this.totalWrong = totalWrong;
      return {
        painted: totalPainted,
        required: totalRequired,
        wrong: totalWrong
      };
    }
    getTileProgress(tileKey) {
      return this.tileProgress.get(tileKey) || { painted: 0, required: 0, wrong: 0 };
    }
  };
  async function restoreOverlayFromData() {
    if (!state.imageLoaded || !state.imageLoaded || !state.startPosition || !state.region) {
      return false;
    }
    try {
      const { width, height, pixels } = state.imageData;
      if (!pixels || !(pixels instanceof Uint8ClampedArray)) {
        console.error("Invalid pixel data: expected Uint8ClampedArray");
        return false;
      }
      if (width <= 0 || height <= 0) {
        console.error("Invalid image dimensions:", { width, height });
        return false;
      }
      if (pixels.length !== width * height * 4) {
        console.error("Pixel data length mismatch:", {
          expected: width * height * 4,
          actual: pixels.length
        });
        return false;
      }
      const imageData = new ImageData(pixels, width, height);
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d", { willReadFrequently: false });
      if (!ctx) {
        console.error("Could not get 2D context from OffscreenCanvas");
        return false;
      }
      ctx.putImageData(imageData, 0, 0);
      const imageBitmap = await canvas.transferToImageBitmap();
      await overlayManager.setImage(imageBitmap);
      await overlayManager.setPosition(state.startPosition, state.region);
      overlayManager.enable();
      const toggleOverlayBtn2 = document.getElementById("toggleOverlayBtn");
      if (toggleOverlayBtn2) {
        toggleOverlayBtn2.disabled = false;
        toggleOverlayBtn2.classList.add("active");
      }
      console.log("Overlay restored from data");
      return true;
    } catch (error) {
      console.error("Failed to restore overlay from data:", error);
      return false;
    }
  }
  var overlayManager = new OverlayManager();

  // src/js/ui/theme.js
  function applyThemeWithKey(themeKey) {
    const theme = APP_CONSTANTS.THEMES[themeKey];
    if (!theme) {
      console.error(`Unknown theme: ${themeKey}`);
      return;
    }
    const root = document.documentElement;
    Array.from(root.classList).forEach((cls) => {
      if (cls.startsWith("wplace-theme-")) {
        root.classList.remove(cls);
      }
    });
    root.classList.add(theme.cssClass);
  }
  var switchTheme = async (themeKey) => {
    if (!APP_CONSTANTS.THEMES[themeKey]) {
      console.warn(`Theme not found: ${themeKey}`);
      return;
    }
    if (themeKey === "neon-retro") {
      await appendResourceOnce(
        "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
        { type: "link" }
      );
    }
    applyThemeWithKey(themeKey);
  };

  // src/js/ui/handlers/settings/settings-handler.js
  var handlePaintUnavailablePixelsToggle = createCheckboxHandler(
    "paintUnavailablePixels",
    "paintUnavailableEnabled",
    "paintUnavailableSkipped"
  );
  var handlePaintTransparentPixelsToggle = createCheckboxHandler(
    "paintTransparentPixels",
    "paintTransparentEnabled",
    "paintTransparentSkipped"
  );
  var handlePaintWhitePixelsToggle = createCheckboxHandler(
    "paintWhitePixels",
    "paintWhiteEnabled",
    "paintWhiteSkipped"
  );
  var handleOverlayOpacityChange = createSliderHandler(
    "overlayOpacity",
    "#overlayOpacityValue"
  );
  async function handleBlueMarbleToggle(e) {
    state.blueMarbleEnabled = e.target.checked;
    saveBotSettings();
    if (state.imageLoaded && overlayManager.imageBitmap) {
      showAlert(t("reprocessingOverlay"), "info");
      await overlayManager.processImageIntoChunks();
      showAlert(t("overlayUpdated"), "success");
    }
  }
  function handleTokenSourceChange(e) {
    state.tokenSource = e.target.value;
    saveBotSettings();
    console.log(`\u{1F511} Token source changed to: ${state.tokenSource}`);
    const sourceNames = {
      generator: "Automatic Generator",
      hybrid: "Generator + Auto Fallback",
      manual: "Manual Pixel Placement"
    };
    showAlert(t("tokenSourceSet", { source: sourceNames[state.tokenSource] }), "success");
  }
  function handleBatchModeChange(e) {
    const value = e.target.value;
    state.batchMode = value;
    saveBotSettings();
    console.log(`\u{1F4E6} Batch mode changed to: ${value}`);
    const normalControls = document.querySelector("#normalBatchControls");
    const randomControls = document.querySelector("#randomBatchControls");
    if (normalControls && randomControls) {
      if (value === "random") {
        normalControls.style.display = "none";
        randomControls.style.display = "block";
      } else {
        normalControls.style.display = "block";
        randomControls.style.display = "none";
      }
    }
    const modeLabel = value === "random" ? t("randomRange") : t("normalFixedSize");
    showAlert(t("batchModeSet", { mode: modeLabel }), "success");
  }
  var handleSpeedSliderInput = createSliderHandler(
    "paintingSpeed",
    "#speedValue",
    (speed) => `${speed}`
  );
  var pendingMin;
  var pendingMax;
  var lastEdited = "max";
  function resetPendingBatchRangeToState() {
    pendingMin = state.randomBatchMin;
    pendingMax = state.randomBatchMax;
  }
  function updateUIOnly() {
    const minInput = document.querySelector("#randomBatchMin");
    const maxInput = document.querySelector("#randomBatchMax");
    if (minInput) minInput.value = pendingMin;
    if (maxInput) maxInput.value = pendingMax;
  }
  var applyBatchRangeSettings = debounce(() => {
    if (lastEdited === "max" && pendingMin > pendingMax) {
      pendingMin = pendingMax;
    } else if (lastEdited === "min" && pendingMax < pendingMin) {
      pendingMax = pendingMin;
    }
    state.randomBatchMin = pendingMin;
    state.randomBatchMax = pendingMax;
    saveBotSettings();
    updateUIOnly();
  }, 350);
  function handleRandomBatchMinInput(e) {
    resetPendingBatchRangeToState();
    const input = e.target;
    const rawValue = input.value;
    const numValue = parseInt(rawValue, 10);
    if (!isNaN(numValue)) {
      const clamped = Math.min(Math.max(1, numValue), 1e3);
      pendingMin = clamped;
      lastEdited = "min";
      applyBatchRangeSettings();
      if (clamped !== numValue) {
        input.value = clamped;
      }
    } else {
      input.value = state.randomBatchMin;
    }
  }
  function handleRandomBatchMaxInput(e) {
    resetPendingBatchRangeToState();
    const input = e.target;
    const rawValue = input.value;
    const numValue = parseInt(rawValue, 10);
    if (!isNaN(numValue)) {
      const clamped = Math.min(Math.max(1, numValue), 1e3);
      pendingMax = clamped;
      lastEdited = "max";
      applyBatchRangeSettings();
      if (clamped !== numValue) {
        input.value = clamped;
      }
    } else {
      input.value = state.randomBatchMax;
    }
  }
  var handlePaintSpeedToggle = createCheckboxHandler(
    "paintingSpeedLimitEnabled",
    "paintSpeedLimitEnabled",
    "paintSpeedLimitDisabled"
  );
  async function handleThemeChange(e) {
    const newThemeKey = e.target.value;
    await switchTheme(newThemeKey);
    state.themeKey = newThemeKey;
    saveBotSettings();
  }
  async function handleLanguageChange(e) {
    const newLanguageKey = e.target.value;
    const oldLanguageKey = state.languageKey;
    state.languageKey = newLanguageKey;
    saveBotSettings();
    await loadTranslations(newLanguageKey);
    updateTranslations();
    console.log(`\u{1F504} Language switched to ${newLanguageKey} (was ${oldLanguageKey})`);
  }
  function handleCloseSettingsClick() {
    const settingsContainer = document.getElementById("wplace-settings-container");
    if (!settingsContainer) return;
    settingsContainer.style.animation = "settings-fade-out 0.3s ease-out forwards";
    settingsContainer.classList.remove("show");
    setTimeout(() => {
      settingsContainer.style.animation = "";
    }, 300);
  }

  // src/js/ui/handlers/settings/notification-handler.js
  var handleNotificationsEnabledToggle = createCheckboxHandler(
    "notificationsEnabled",
    "notificationsEnabledGlobally",
    "notificationsDisabledGlobally"
  );
  var handleNotifyOnChargesReachedToggle = createCheckboxHandler(
    "notifyOnChargesReached",
    "notifyOnChargesEnabled",
    "notifyOnChargesDisabled"
  );
  var handleNotifyOnlyWhenUnfocusedToggle = createCheckboxHandler(
    "notifyOnlyWhenUnfocused",
    "notifyOnlyUnfocusedEnabled",
    "notifyOnlyUnfocusedDisabled"
  );
  function handleNotificationIntervalInput(e) {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1 || value > 60) return;
    state.notificationIntervalMinutes = value;
    saveBotSettings();
    console.log(`\u23F0 Notification interval set to: ${value} min`);
    showAlert(t("notificationIntervalUpdated", { minutes: value }), "success");
  }
  async function handleRequestNotificationPermission() {
    const perm = await NotificationManager.requestPermission();
    if (perm === "granted") {
      showAlert(t("notificationsPermissionGranted"), "success");
    } else {
      showAlert(t("notificationsPermissionDenied"), "warning");
    }
    NotificationManager.syncFromState();
  }
  function handleTestNotification() {
    NotificationManager.notify(
      t("testNotificationTitle"),
      t("testNotificationMessage"),
      "wplace-notify-test",
      true
    );
  }

  // src/js/ui/listeners/settings.js
  function setupSettingsListeners() {
    const container = document.getElementById("wplace-settings-container");
    if (!container) return;
    const closeSettingsBtn = container.querySelector("#closeSettingsBtn");
    safeOn(closeSettingsBtn, "click", handleCloseSettingsClick);
    const tokenSourceSelect = container.querySelector("#tokenSourceSelect");
    safeOn(tokenSourceSelect, "change", handleTokenSourceChange);
    const overlayOpacitySlider = container.querySelector("#overlayOpacitySlider");
    const enableBlueMarbleToggle = container.querySelector("#enableBlueMarbleToggle");
    safeOn(overlayOpacitySlider, "input", handleOverlayOpacityChange);
    safeOn(enableBlueMarbleToggle, "change", handleBlueMarbleToggle);
    const paintUnavailableToggle = container.querySelector("#paintUnavailablePixelsToggle");
    const paintTransparentToggle2 = container.querySelector("#settingsPaintTransparentToggle");
    const settingsPaintWhiteToggle = container.querySelector("#settingsPaintWhiteToggle");
    safeOn(paintUnavailableToggle, "change", handlePaintUnavailablePixelsToggle);
    safeOn(paintTransparentToggle2, "change", handlePaintTransparentPixelsToggle);
    safeOn(settingsPaintWhiteToggle, "change", handlePaintWhitePixelsToggle);
    const batchModeSelect = container.querySelector("#batchModeSelect");
    safeOn(batchModeSelect, "change", handleBatchModeChange);
    const speedSlider = container.querySelector("#speedSlider");
    safeOn(speedSlider, "input", handleSpeedSliderInput);
    const randomBatchMin = container.querySelector("#randomBatchMin");
    const randomBatchMax = container.querySelector("#randomBatchMax");
    safeOn(randomBatchMin, "input", handleRandomBatchMinInput);
    safeOn(randomBatchMax, "input", handleRandomBatchMaxInput);
    const paintSpeedToggle = container.querySelector("#enableSpeedToggle");
    safeOn(paintSpeedToggle, "change", handlePaintSpeedToggle);
    const coordinateModeSelect = container.querySelector("#coordinateModeSelect");
    const coordinateDirectionSelect = container.querySelector("#coordinateDirectionSelect");
    const coordinateSnakeToggle = container.querySelector("#coordinateSnakeToggle");
    const sortCoordinateByFrequencyToggle = container.querySelector(
      "#sortCoordinateByFrequencyToggle"
    );
    const blockWidthInput = container.querySelector("#blockWidthInput");
    const blockHeightInput = container.querySelector("#blockHeightInput");
    safeOn(coordinateModeSelect, "change", handleCoordinateModeChange);
    safeOn(coordinateDirectionSelect, "change", handleCoordinateDirectionChange);
    safeOn(coordinateSnakeToggle, "change", handleCoordinateSnakeChange);
    safeOn(sortCoordinateByFrequencyToggle, "change", handleSortCoordinateByFrequencyChange);
    safeOn(blockWidthInput, "input", handleBlockWidthInput);
    safeOn(blockHeightInput, "input", handleBlockHeightInput);
    const notifEnabledToggle = container.querySelector("#notifEnabledToggle");
    const notifOnChargesToggle = container.querySelector("#notifOnChargesToggle");
    const notifOnlyUnfocusedToggle = container.querySelector("#notifOnlyUnfocusedToggle");
    const notifIntervalInput = container.querySelector("#notifIntervalInput");
    const notificationPermissionBtn = container.querySelector("#notifRequestPermBtn");
    const notificationTestBtn = container.querySelector("#notifTestBtn");
    safeOn(notifEnabledToggle, "change", handleNotificationsEnabledToggle);
    safeOn(notifOnChargesToggle, "change", handleNotifyOnChargesReachedToggle);
    safeOn(notifOnlyUnfocusedToggle, "change", handleNotifyOnlyWhenUnfocusedToggle);
    safeOn(notifIntervalInput, "input", handleNotificationIntervalInput);
    safeOn(notificationPermissionBtn, "click", handleRequestNotificationPermission);
    safeOn(notificationTestBtn, "click", handleTestNotification);
    const themeSelect = container.querySelector("#themeSelect");
    safeOn(themeSelect, "change", handleThemeChange);
    const languageSelect = container.querySelector("#languageSelect");
    safeOn(languageSelect, "change", handleLanguageChange);
  }

  // src/js/ui/listeners/stats.js
  function setupStatsListeners() {
    const container = document.getElementById("wplace-stats-container");
    const mainContainer = document.getElementById("wplace-image-bot-container");
    const statsBtn = mainContainer?.querySelector("#statsBtn");
    if (!container || !statsBtn) return;
    const closeStatsBtn = container.querySelector("#closeStatsBtn");
    const refreshChargesBtn = container.querySelector("#refreshChargesBtn");
    safeOn(closeStatsBtn, "click", () => {
      container.style.display = "none";
      statsBtn.innerHTML = '<i class="fas fa-chart-bar"></i>';
      statsBtn.title = t("hideStats");
    });
    safeOn(refreshChargesBtn, "click", async () => {
      refreshChargesBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      refreshChargesBtn.disabled = true;
      try {
        await updateStats(true);
      } catch (error) {
        console.error("Error refreshing charges:", error);
      } finally {
        refreshChargesBtn.innerHTML = '<i class="fas fa-sync"></i>';
        refreshChargesBtn.disabled = false;
      }
    });
  }

  // src/js/ui/handlers/main-panel/handle-data-buttons.js
  function updateDataButtons() {
    const container = document.getElementById("wplace-image-bot-container");
    const saveToFileBtn = container.querySelector("#saveToFileBtn");
    const saveBtn = container.querySelector("#saveBtn");
    const hasImageData = state.imageLoaded;
    saveBtn.disabled = !hasImageData;
    saveToFileBtn.disabled = !hasImageData;
  }
  function handleSaveToFileClick() {
    const success = saveProgressToFile();
    if (success) {
      updateUI("fileSaved", "success");
      showAlert(t("fileSaved"), "success");
    } else {
      showAlert(t("fileError"), "error");
    }
  }
  async function handleSaveClick() {
    if (!state.imageLoaded) {
      showAlert(t("missingRequirements"), "error");
      return;
    }
    const success = await saveProgress();
    if (success) {
      updateUI("autoSaved", "success");
      showAlert(t("autoSaved"), "success");
    } else {
      showAlert(t("errorSavingProgress"), "error");
    }
  }
  async function handleProgressLoadSuccess(savedData, source) {
    updateUI(source, "success");
    showAlert(t(source), "success");
    updateDataButtons();
    try {
      await restoreOverlayFromData();
      await overlayManager.waitForTiles(true);
      await updateStats();
    } catch (error) {
      console.error(`Failed to restore overlay from ${source}:`, error);
    }
    const uploadBtn = document.getElementById("uploadBtn");
    const selectPosBtn = document.getElementById("selectPosBtn");
    const resizeBtn = document.getElementById("resizeBtn");
    if (state.hasAvailableColors) {
      if (uploadBtn) uploadBtn.disabled = false;
      if (selectPosBtn) selectPosBtn.disabled = false;
      if (resizeBtn) resizeBtn.disabled = false;
    } else {
      if (uploadBtn) uploadBtn.disabled = false;
    }
    const controlBtn = document.getElementById("controlBtn");
    if (state.imageLoaded && state.startPosition && state.region && state.hasAvailableColors) {
      if (controlBtn) controlBtn.disabled = false;
    }
  }
  async function handleLoadClick(needConfirm = false) {
    const savedData = await loadProgress();
    if (!savedData) {
      updateUI("noSavedData", "warning");
      showAlert(t("noSavedData"), "warning");
      return;
    }
    const savedDate = new Date(savedData.timestamp).toLocaleString();
    if (needConfirm) {
      const confirmLoad = confirm(
        `${t("savedDataFound")}

Timestamp: ${savedDate}
Art size: ${savedData.imageData.width} \xD7 ${savedData.imageData.height}
Start position (x, y): ${savedData.state.startPosition.x}, ${savedData.state.startPosition.y}
Region (x, y): ${savedData.state.region.x}, ${savedData.state.region.y}
Total: ${savedData.state.artTotalPixels} pixels`
      );
      if (!confirmLoad) return;
    }
    const success = restoreProgress(savedData);
    if (success) {
      await handleProgressLoadSuccess(savedData, "dataLoaded");
    } else {
      showAlert(t("errorLoadingProgress"), "error");
    }
  }
  async function handleLoadFromFileClick() {
    try {
      const success = await loadProgressFromFile();
      if (success) {
        await handleProgressLoadSuccess(null, "fileLoaded");
      }
    } catch (error) {
      if (error.message === "Invalid JSON file") {
        showAlert(t("invalidFileFormat"), "error");
      } else {
        showAlert(t("fileError"), "error");
      }
    }
  }

  // src/js/ui/handlers/main-panel/upload-handler.js
  async function handleUploadClick() {
    await updateStats(true);
    if (!state.hasAvailableColors) {
      updateUI("noColorsKnown", "error");
      showAlert(t("noColorsKnown"), "error");
      return;
    }
    const selectPosBtn = document.getElementById("selectPosBtn");
    const resizeBtn = document.getElementById("resizeBtn");
    if (selectPosBtn) selectPosBtn.disabled = false;
    try {
      updateUI("loadingImage", "default");
      const imageSrc = await createImageUploader();
      if (!imageSrc) {
        updateUI("colorsFound", "success", { count: state.availableColors.length });
        return;
      }
      const processor = new ImageProcessor(imageSrc);
      await processor.load();
      const { width, height } = processor.getDimensions();
      const pixels = processor.getPixelData();
      const artColorFrequency = processor.countColors(!state.paintTransparentPixels);
      let totalValidPixels = 0;
      for (const count of artColorFrequency.values()) {
        totalValidPixels += count;
      }
      state.imageData = {
        width,
        height,
        pixels,
        totalPixels: totalValidPixels,
        processor
      };
      state.artTotalPixels = totalValidPixels;
      state.artColorFrequency = artColorFrequency;
      state.totalPaintedPixels = 0;
      state.resizeSettings = null;
      state.resizeIgnoreMask = null;
      state.originalImage = { dataUrl: imageSrc, width, height };
      saveBotSettings();
      const imageBitmap = await createImageBitmap(processor.img);
      await overlayManager.setImage(imageBitmap);
      overlayManager.enable();
      await overlayManager.waitForTiles(true);
      const toggleOverlayBtn2 = document.getElementById("toggleOverlayBtn");
      if (toggleOverlayBtn2) {
        toggleOverlayBtn2.disabled = false;
        toggleOverlayBtn2.classList.add("active");
        toggleOverlayBtn2.setAttribute("aria-pressed", "true");
      }
      if (state.hasAvailableColors) {
        if (resizeBtn) resizeBtn.disabled = false;
      }
      const saveBtn = document.getElementById("saveBtn");
      if (saveBtn) saveBtn.disabled = false;
      const controlBtn = document.getElementById("controlBtn");
      if (state.startPosition && controlBtn) {
        controlBtn.disabled = false;
      }
      await updateStats();
      updateDataButtons();
      updateUI("imageLoaded", "success", { count: totalValidPixels });
    } catch (error) {
      console.error("Image upload error:", error);
      updateUI("imageError", "error");
    }
  }

  // src/js/ui/components/resize/color-palette.js
  function toggleAllColors(select, updateActiveColorPalette, showingUnavailable = false) {
    const swatches = document.querySelectorAll(".wplace-color-swatch");
    if (swatches) {
      swatches.forEach((swatch) => {
        const isUnavailable = swatch.classList.contains("unavailable");
        if (!isUnavailable || showingUnavailable) {
          if (!isUnavailable) {
            swatch.classList.toggle("active", select);
          }
        }
      });
    }
    updateActiveColorPalette();
  }
  function unselectAllPaidColors(updateActiveColorPalette) {
    const swatches = document.querySelectorAll(".wplace-color-swatch");
    if (swatches) {
      swatches.forEach((swatch) => {
        const colorId = parseInt(swatch.getAttribute("data-color-id"), 10);
        if (!isNaN(colorId) && colorId >= 32) {
          swatch.classList.toggle("active", false);
        }
      });
    }
    updateActiveColorPalette();
  }
  function initializeColorPalette(container, onPaletteChange) {
    const colorsContainer = container.querySelector("#colors-container");
    const showAllToggle = container.querySelector("#showAllColorsToggle");
    if (!colorsContainer) return;
    if (!state.availableColors || state.availableColors.length === 0) {
      colorsContainer.innerHTML = `<div class="wplace-colors-placeholder">${t(
        "uploadImageFirst"
      )}</div>`;
      return;
    }
    function updateActiveColorPalette() {
      const newPalette = [];
      const activeSwatches = document.querySelectorAll(".wplace-color-swatch.active");
      activeSwatches.forEach((swatch) => {
        const rgbStr = swatch.getAttribute("data-rgb");
        if (rgbStr) {
          const rgb = rgbStr.split(",").map(Number);
          newPalette.push(rgb);
        }
      });
      state.activeColorPalette = newPalette;
      if (typeof onPaletteChange === "function") {
        onPaletteChange(newPalette);
      }
    }
    function populateColors(showUnavailable = false) {
      colorsContainer.innerHTML = "";
      let availableCount = 0;
      let totalCount = 0;
      const allColors = Object.values(APP_CONSTANTS.COLOR_MAP);
      allColors.forEach((colorData) => {
        const { id, name, rgb } = colorData;
        const rgbKey = `${rgb.r},${rgb.g},${rgb.b}`;
        totalCount++;
        const isAvailable = state.availableColors.some(
          (c) => c.rgb[0] === rgb.r && c.rgb[1] === rgb.g && c.rgb[2] === rgb.b
        );
        if (!showUnavailable && !isAvailable) {
          return;
        }
        if (isAvailable) availableCount++;
        const colorItem = createElement("div", {
          className: "wplace-color-item"
        });
        const swatch = createElement("button", {
          className: `wplace-color-swatch ${!isAvailable ? "unavailable" : ""}`,
          title: `${name} (ID: ${id})${!isAvailable ? " (Unavailable)" : ""}`,
          "data-rgb": rgbKey,
          "data-color-id": id
        });
        swatch.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        if (!isAvailable) {
          swatch.style.opacity = "0.4";
          swatch.style.filter = "grayscale(50%)";
          swatch.disabled = true;
        } else {
          swatch.classList.add("active");
        }
        const nameLabel = createElement(
          "span",
          {
            className: "wplace-color-item-name",
            style: !isAvailable ? "color: #888; font-style: italic;" : ""
          },
          name + (!isAvailable ? " (N/A)" : "")
        );
        if (isAvailable) {
          swatch.addEventListener("click", () => {
            swatch.classList.toggle("active");
            updateActiveColorPalette();
          });
        }
        colorItem.appendChild(swatch);
        colorItem.appendChild(nameLabel);
        colorsContainer.appendChild(colorItem);
      });
      updateActiveColorPalette();
    }
    populateColors(false);
    if (showAllToggle) {
      showAllToggle.addEventListener("change", (e) => {
        populateColors(e.target.checked);
      });
    }
    container.querySelector("#selectAllBtn")?.addEventListener(
      "click",
      () => toggleAllColors(true, updateActiveColorPalette, showAllToggle?.checked)
    );
    container.querySelector("#unselectAllBtn")?.addEventListener(
      "click",
      () => toggleAllColors(false, updateActiveColorPalette, showAllToggle?.checked)
    );
    container.querySelector("#unselectPaidBtn")?.addEventListener("click", () => unselectAllPaidColors(updateActiveColorPalette));
  }

  // src/js/ui/components/resize/resize-dither.js
  function createDitherBuffers() {
    let workBuffer = null;
    let eligibleBuffer = null;
    return {
      ensure: (numPixels) => {
        if (!workBuffer || workBuffer.length !== numPixels * 3) {
          workBuffer = new Float32Array(numPixels * 3);
        }
        if (!eligibleBuffer || eligibleBuffer.length !== numPixels) {
          eligibleBuffer = new Uint8Array(numPixels);
        }
        return { work: workBuffer, eligible: eligibleBuffer };
      },
      reset: () => {
        workBuffer = null;
        eligibleBuffer = null;
      }
    };
  }
  async function applyFloydSteinbergCore({
    input,
    state: state2,
    mask,
    findClosestColor: findClosestColor2,
    isTransparentPixel: isTransparentPixel2,
    isWhitePixel: isWhitePixel2,
    ensureBuffers,
    asyncProgress
  }) {
    const w = input.width;
    const h = input.height;
    const numPixels = w * h;
    const { work, eligible } = ensureBuffers(numPixels);
    const data = input.data;
    let pixelsProcessed = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const i4 = idx * 4;
        const r = data[i4];
        const g = data[i4 + 1];
        const b = data[i4 + 2];
        const a = data[i4 + 3];
        const masked = mask && mask[idx];
        const isEligible = !masked && (state2.paintTransparentPixels || !isTransparentPixel2(a)) && (state2.paintWhitePixels || !isWhitePixel2(r, g, b));
        eligible[idx] = isEligible ? 1 : 0;
        work[idx * 3] = r;
        work[idx * 3 + 1] = g;
        work[idx * 3 + 2] = b;
        if (!isEligible) {
          data[i4 + 3] = 0;
        }
      }
      if (asyncProgress && (y & 15) === 0) {
        await Promise.resolve();
      }
    }
    const diffuse = (nx, ny, er, eg, eb, factor) => {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) return;
      const nidx = ny * w + nx;
      if (!eligible[nidx]) return;
      const base = nidx * 3;
      work[base] = Math.min(255, Math.max(0, work[base] + er * factor));
      work[base + 1] = Math.min(255, Math.max(0, work[base + 1] + eg * factor));
      work[base + 2] = Math.min(255, Math.max(0, work[base + 2] + eb * factor));
    };
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        if (!eligible[idx]) continue;
        const base = idx * 3;
        const r0 = work[base];
        const g0 = work[base + 1];
        const b0 = work[base + 2];
        const [nr, ng, nb] = findClosestColor2(r0, g0, b0, state2.activeColorPalette);
        const i4 = idx * 4;
        data[i4] = nr;
        data[i4 + 1] = ng;
        data[i4 + 2] = nb;
        data[i4 + 3] = 255;
        pixelsProcessed++;
        const er = r0 - nr;
        const eg = g0 - ng;
        const eb = b0 - nb;
        diffuse(x + 1, y, er, eg, eb, 7 / 16);
        diffuse(x - 1, y + 1, er, eg, eb, 3 / 16);
        diffuse(x, y + 1, er, eg, eb, 5 / 16);
        diffuse(x + 1, y + 1, er, eg, eb, 1 / 16);
      }
      if (asyncProgress) {
        await Promise.resolve();
      }
    }
    return { pixelsProcessed };
  }
  function applyFloydSteinbergPreview(args) {
    return applyFloydSteinbergCore({ ...args, input: args.imageData, asyncProgress: false });
  }
  async function applyFloydSteinbergFinal(args) {
    return applyFloydSteinbergCore({
      ...args,
      input: { data: args.data, width: args.width, height: args.height },
      asyncProgress: true
    });
  }

  // src/js/ui/components/resize/resize-panzoom-controller.js
  function createPanZoomController({
    panStage: panStage2,
    canvasStack: canvasStack2,
    baseCanvas: baseCanvas2,
    maskCanvas: maskCanvas2,
    zoomSlider: zoomSlider2,
    zoomValue: zoomValue2,
    zoomInBtn: zoomInBtn2,
    zoomOutBtn: zoomOutBtn2,
    zoomFitBtn: zoomFitBtn2,
    zoomActualBtn: zoomActualBtn2,
    panModeBtn: panModeBtn2
  }) {
    let zoomLevel = 1;
    let panX = 0;
    let panY = 0;
    let panRaf = 0;
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let startPanX = 0;
    let startPanY = 0;
    let allowPan = false;
    let panMode = false;
    let lastTouchDist = null;
    let touchStartTime = 0;
    let doubleTapTimer = null;
    const clampPan = () => {
      if (!panStage2) return;
      const rect = panStage2.getBoundingClientRect();
      const w = (baseCanvas2.width || 1) * zoomLevel;
      const h = (baseCanvas2.height || 1) * zoomLevel;
      if (w <= rect.width) {
        panX = Math.floor((rect.width - w) / 2);
      } else {
        const minX = rect.width - w;
        panX = Math.min(0, Math.max(minX, panX));
      }
      if (h <= rect.height) {
        panY = Math.floor((rect.height - h) / 2);
      } else {
        const minY = rect.height - h;
        panY = Math.min(0, Math.max(minY, panY));
      }
    };
    const applyPan = () => {
      if (panRaf) return;
      panRaf = requestAnimationFrame(() => {
        clampPan();
        canvasStack2.style.transform = `translate3d(${Math.round(panX)}px, ${Math.round(panY)}px, 0) scale(${zoomLevel})`;
        panRaf = 0;
      });
    };
    const updateZoomLayout = () => {
      const w = baseCanvas2.width || 1;
      const h = baseCanvas2.height || 1;
      baseCanvas2.style.width = `${w}px`;
      baseCanvas2.style.height = `${h}px`;
      maskCanvas2.style.width = `${w}px`;
      maskCanvas2.style.height = `${h}px`;
      canvasStack2.style.width = `${w}px`;
      canvasStack2.style.height = `${h}px`;
      applyPan();
    };
    const applyZoom = (z) => {
      zoomLevel = Math.max(0.05, Math.min(20, z || 1));
      if (zoomSlider2) zoomSlider2.value = zoomLevel;
      updateZoomLayout();
      if (zoomValue2) zoomValue2.textContent = `${Math.round(zoomLevel * 100)}%`;
    };
    const computeFitZoom = () => {
      if (!panStage2) return 1;
      const rect = panStage2.getBoundingClientRect();
      const w = baseCanvas2.width || 1;
      const h = baseCanvas2.height || 1;
      const margin = 10;
      const scaleX = (rect.width - margin) / w;
      const scaleY = (rect.height - margin) / h;
      return Math.max(0.05, Math.min(20, Math.min(scaleX, scaleY)));
    };
    const centerInView = () => {
      if (!panStage2) return;
      const rect = panStage2.getBoundingClientRect();
      const w = (baseCanvas2.width || 1) * zoomLevel;
      const h = (baseCanvas2.height || 1) * zoomLevel;
      panX = Math.floor((rect.width - w) / 2);
      panY = Math.floor((rect.height - h) / 2);
      applyPan();
    };
    const setCursor = (cursor) => {
      if (panStage2) panStage2.style.cursor = cursor;
    };
    const updatePanModeBtn = () => {
      if (!panModeBtn2) return;
      panModeBtn2.classList.toggle("active", panMode);
      panModeBtn2.setAttribute("aria-pressed", panMode);
    };
    const handleZoomInput = () => {
      if (!zoomSlider2) return;
      applyZoom(parseFloat(zoomSlider2.value));
    };
    const handleZoomClick = (delta) => () => {
      applyZoom(parseFloat(zoomSlider2?.value || 1) + delta);
    };
    const handleZoomFit = () => {
      applyZoom(computeFitZoom());
      centerInView();
    };
    const handleZoomActual = () => {
      applyZoom(1);
      centerInView();
    };
    const handlePanModeToggle = () => {
      panMode = !panMode;
      updatePanModeBtn();
      setCursor(panMode ? "grab" : "");
    };
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        allowPan = true;
        setCursor("grab");
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        allowPan = false;
        if (!isPanning) setCursor("");
      }
    };
    const handleMouseDown = (e) => {
      if (!(e.button === 1 || e.button === 2) && !allowPan && !panMode) return;
      e.preventDefault();
      isPanning = true;
      startX = e.clientX;
      startY = e.clientY;
      startPanX = panX;
      startPanY = panY;
      setCursor("grabbing");
    };
    const handleMouseMove = (e) => {
      if (!isPanning) return;
      panX = startPanX + (e.clientX - startX);
      panY = startPanY + (e.clientY - startY);
      applyPan();
    };
    const handleMouseUp = () => {
      if (isPanning) {
        isPanning = false;
        setCursor(panMode || allowPan ? "grab" : "");
      }
    };
    const handleWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = panStage2.getBoundingClientRect();
      const cx = e.clientX - rect.left - panX;
      const cy = e.clientY - rect.top - panY;
      const step = Math.abs(e.deltaY) > 20 ? 0.2 : 0.1;
      const next = Math.max(0.05, Math.min(20, zoomLevel + (e.deltaY > 0 ? -step : step)));
      if (next === zoomLevel) return;
      const scale = next / zoomLevel;
      panX = panX - cx * (scale - 1);
      panY = panY - cy * (scale - 1);
      applyZoom(next);
    };
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        const t2 = e.touches[0];
        isPanning = true;
        startX = t2.clientX;
        startY = t2.clientY;
        startPanX = panX;
        startPanY = panY;
        setCursor("grabbing");
        const now = Date.now();
        if (now - touchStartTime < 300) {
          clearTimeout(doubleTapTimer);
          const z = Math.abs(zoomLevel - 1) < 0.01 ? computeFitZoom() : 1;
          applyZoom(z);
          centerInView();
        } else {
          touchStartTime = now;
          doubleTapTimer = setTimeout(() => {
            doubleTapTimer = null;
          }, 320);
        }
      } else if (e.touches.length === 2) {
        const [a, b] = e.touches;
        lastTouchDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      }
    };
    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && isPanning) {
        const t2 = e.touches[0];
        panX = startPanX + (t2.clientX - startX);
        panY = startPanY + (t2.clientY - startY);
        applyPan();
      } else if (e.touches.length === 2 && lastTouchDist !== null) {
        e.preventDefault();
        const [a, b] = e.touches;
        const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        const rect = panStage2.getBoundingClientRect();
        const centerX = (a.clientX + b.clientX) / 2 - rect.left - panX;
        const centerY = (a.clientY + b.clientY) / 2 - rect.top - panY;
        const next = Math.max(0.05, Math.min(20, zoomLevel * (dist / lastTouchDist)));
        if (next !== zoomLevel) {
          panX = panX - centerX * (next / zoomLevel - 1);
          panY = panY - centerY * (next / zoomLevel - 1);
          applyZoom(next);
        }
        lastTouchDist = dist;
      }
    };
    const handleTouchEnd = () => {
      isPanning = false;
      lastTouchDist = null;
      setCursor(panMode || allowPan ? "grab" : "");
    };
    const bindEvents = () => {
      const on = (el, ev, fn, opts) => el?.addEventListener(ev, fn, opts);
      on(zoomSlider2, "input", handleZoomInput);
      on(zoomInBtn2, "click", handleZoomClick(0.1));
      on(zoomOutBtn2, "click", handleZoomClick(-0.1));
      on(zoomFitBtn2, "click", handleZoomFit);
      on(zoomActualBtn2, "click", handleZoomActual);
      on(panModeBtn2, "click", handlePanModeToggle);
      on(panStage2, "contextmenu", (e) => allowPan && e.preventDefault());
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      on(panStage2, "mousedown", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      on(panStage2, "wheel", handleWheel, { passive: false });
      on(panStage2, "touchstart", handleTouchStart, { passive: true });
      on(panStage2, "touchmove", handleTouchMove, { passive: false });
      on(panStage2, "touchend", handleTouchEnd);
    };
    const destroy = () => {
      if (panRaf) {
        cancelAnimationFrame(panRaf);
        panRaf = 0;
      }
    };
    bindEvents();
    updatePanModeBtn();
    return {
      applyZoom,
      computeFitZoom,
      centerInView,
      updateZoomLayout,
      get zoomLevel() {
        return zoomLevel;
      },
      isPanInteractionActive() {
        return panMode || allowPan;
      },
      destroy
    };
  }

  // src/js/ui/components/resize/resize-mask-overlay.js
  function createMaskOverlay({ maskCtx: maskCtx2, baseCanvas: baseCanvas2, maskCanvas: maskCanvas2, state: state2 }) {
    let maskImageData = null;
    let maskData = null;
    let dirty = null;
    const resetDirty = () => {
      dirty = { minX: Infinity, minY: Infinity, maxX: -1, maxY: -1 };
    };
    const markDirty = (x, y) => {
      if (!dirty) resetDirty();
      dirty.minX = Math.min(dirty.minX, x);
      dirty.minY = Math.min(dirty.minY, y);
      dirty.maxX = Math.max(dirty.maxX, x);
      dirty.maxY = Math.max(dirty.maxY, y);
    };
    const flushDirty = () => {
      if (!dirty || dirty.maxX < dirty.minX || dirty.maxY < dirty.minY) return;
      const x = Math.max(0, dirty.minX);
      const y = Math.max(0, dirty.minY);
      const w = Math.min(maskCanvas2.width - x, dirty.maxX - x + 1);
      const h = Math.min(maskCanvas2.height - y, dirty.maxY - y + 1);
      if (w > 0 && h > 0) {
        maskCtx2.putImageData(maskImageData, 0, 0, x, y, w, h);
      }
      resetDirty();
    };
    const ensureOverlayBuffers = (w, h, rebuildFromMask = false) => {
      const needsNewBuffer = !maskImageData || maskImageData.width !== w || maskImageData.height !== h;
      if (needsNewBuffer) {
        maskImageData = maskCtx2.createImageData(w, h);
        maskData = maskImageData.data;
        rebuildFromMask = true;
      }
      if (rebuildFromMask) {
        const maskArray = state2.resizeIgnoreMask;
        maskData.fill(0);
        if (maskArray) {
          for (let i = 0; i < maskArray.length; i++) {
            if (maskArray[i]) {
              const p = i * 4;
              maskData[p] = 255;
              maskData[p + 1] = 0;
              maskData[p + 2] = 0;
              maskData[p + 3] = 150;
            }
          }
        }
        maskCtx2.putImageData(maskImageData, 0, 0);
        resetDirty();
      }
    };
    const ensureMaskArraySize = (w, h) => {
      const len = w * h;
      if (!state2.resizeIgnoreMask || state2.resizeIgnoreMask.length !== len) {
        state2.resizeIgnoreMask = new Uint8Array(len);
      }
    };
    const ensureMaskSize = (w, h) => {
      ensureMaskArraySize(w, h);
      baseCanvas2.width = w;
      baseCanvas2.height = h;
      maskCanvas2.width = w;
      maskCanvas2.height = h;
      maskCtx2.clearRect(0, 0, w, h);
      ensureOverlayBuffers(w, h, true);
    };
    const rebuildFromStateMask = () => {
      if (maskImageData) {
        ensureOverlayBuffers(maskCanvas2.width, maskCanvas2.height, true);
      }
    };
    const destroy = () => {
      maskImageData = null;
      maskData = null;
      dirty = null;
    };
    return {
      ensureOverlayBuffers,
      ensureMaskSize,
      resetDirty,
      markDirty,
      flushDirty,
      rebuildFromStateMask,
      getMaskData: () => maskData,
      getMaskImageData: () => maskImageData,
      destroy
    };
  }

  // src/js/ui/components/resize/resize-size-handlers.js
  function createSizeHandlers({
    widthSlider: widthSlider2,
    heightSlider: heightSlider2,
    keepAspect: keepAspect2,
    baseWidth,
    baseHeight,
    state: state2,
    saveBotSettings: saveBotSettings2,
    updatePreview,
    applyZoom,
    computeFitZoom
  }) {
    let isDraggingSize = false;
    let pendingSave = null;
    const onWidthInput = () => {
      if (keepAspect2.checked) {
        const newHeight = Math.round(parseInt(widthSlider2.value, 10) / (baseWidth / baseHeight));
        heightSlider2.value = newHeight;
      }
      updatePreview();
    };
    const onHeightInput = () => {
      if (keepAspect2.checked) {
        const newWidth = Math.round(parseInt(heightSlider2.value, 10) * (baseWidth / baseHeight));
        widthSlider2.value = newWidth;
      }
      updatePreview();
    };
    const syncStateAndZoom = () => {
      const curW = parseInt(widthSlider2.value, 10);
      const curH = parseInt(heightSlider2.value, 10);
      state2.resizeSettings = { baseWidth, baseHeight, width: curW, height: curH };
      const fit = typeof computeFitZoom === "function" ? computeFitZoom() : 1;
      if (!isNaN(fit) && isFinite(fit)) applyZoom(fit);
    };
    const saveSettings = () => {
      if (pendingSave) clearTimeout(pendingSave);
      pendingSave = null;
      saveBotSettings2();
    };
    const markDragStart = () => {
      isDraggingSize = true;
      if (pendingSave) clearTimeout(pendingSave);
    };
    const markDragEnd = () => {
      isDraggingSize = false;
      syncStateAndZoom();
      saveSettings();
    };
    const bind = () => {
      const on = (el, ev, fn) => el?.addEventListener(ev, fn);
      const off = (el, ev, fn) => el?.removeEventListener(ev, fn);
      on(widthSlider2, "pointerdown", markDragStart);
      on(heightSlider2, "pointerdown", markDragStart);
      on(widthSlider2, "pointerup", markDragEnd);
      on(heightSlider2, "pointerup", markDragEnd);
      on(widthSlider2, "input", onWidthInput);
      on(heightSlider2, "input", onHeightInput);
      return () => {
        off(widthSlider2, "pointerdown", markDragStart);
        off(heightSlider2, "pointerdown", markDragStart);
        off(widthSlider2, "pointerup", markDragEnd);
        off(heightSlider2, "pointerup", markDragEnd);
        off(widthSlider2, "input", onWidthInput);
        off(heightSlider2, "input", onHeightInput);
      };
    };
    return {
      bind,
      get isDraggingSize() {
        return isDraggingSize;
      }
    };
  }

  // src/js/ui/components/resize/resize-mask-events.js
  function createMaskEvents({
    resizeContainer: resizeContainer2,
    baseCanvas: baseCanvas2,
    maskCanvas: maskCanvas2,
    state: state2,
    saveBotSettings: saveBotSettings2,
    maskOverlay,
    // { getMaskData, markDirty, flushDirty, ensureOverlayBuffers }
    mapClientToPixel
  }) {
    let draggingMask = false;
    let brushSize = 1;
    let rowColSize = 1;
    let maskMode = "ignore";
    const elements = {
      brush: resizeContainer2.querySelector("#maskBrushSize"),
      brushVal: resizeContainer2.querySelector("#maskBrushSizeValue"),
      rowColSize: resizeContainer2.querySelector("#rowColSize"),
      rowColSizeVal: resizeContainer2.querySelector("#rowColSizeValue"),
      ignore: resizeContainer2.querySelector("#maskModeIgnore"),
      unignore: resizeContainer2.querySelector("#maskModeUnignore"),
      toggle: resizeContainer2.querySelector("#maskModeToggle"),
      clear: resizeContainer2.querySelector("#clearIgnoredBtn"),
      invert: resizeContainer2.querySelector("#invertMaskBtn")
    };
    const updateModeButtons = () => {
      const modes = (
        /** @type {[HTMLElement, string][]} */
        [
          [elements.ignore, "ignore"],
          [elements.unignore, "unignore"],
          [elements.toggle, "toggle"]
        ]
      );
      for (const [el, mode] of modes) {
        if (!el) continue;
        const active = maskMode === mode;
        el.classList.toggle("active", active);
        el.setAttribute("aria-pressed", active ? "true" : "false");
      }
    };
    const ensureMask = (w, h) => {
      const len = w * h;
      if (!state2.resizeIgnoreMask || state2.resizeIgnoreMask.length !== len) {
        state2.resizeIgnoreMask = new Uint8Array(len);
      }
    };
    const paintCircle = (cx, cy, radius) => {
      const w = baseCanvas2.width;
      const h = baseCanvas2.height;
      ensureMask(w, h);
      const r2 = radius * radius;
      const md = maskOverlay.getMaskData();
      for (let yy = cy - radius; yy <= cy + radius; yy++) {
        if (yy < 0 || yy >= h) continue;
        for (let xx = cx - radius; xx <= cx + radius; xx++) {
          if (xx < 0 || xx >= w) continue;
          const dx = xx - cx;
          const dy = yy - cy;
          if (dx * dx + dy * dy > r2) continue;
          const idx = yy * w + xx;
          let val = 0;
          if (maskMode === "toggle") val = state2.resizeIgnoreMask[idx] ? 0 : 1;
          else if (maskMode === "ignore") val = 1;
          else if (maskMode === "unignore") val = 0;
          state2.resizeIgnoreMask[idx] = val;
          if (md) {
            const p = idx * 4;
            md[p] = val ? 255 : 0;
            md[p + 1] = 0;
            md[p + 2] = 0;
            md[p + 3] = val ? 150 : 0;
            maskOverlay.markDirty(xx, yy);
          }
        }
      }
    };
    const paintRow = (y) => {
      const w = baseCanvas2.width;
      const h = baseCanvas2.height;
      ensureMask(w, h);
      if (y < 0 || y >= h) return;
      const half = Math.floor(rowColSize / 2);
      const startY = Math.max(0, y - half);
      const endY = Math.min(h - 1, y + half);
      const md = maskOverlay.getMaskData();
      for (let rowY = startY; rowY <= endY; rowY++) {
        for (let x = 0; x < w; x++) {
          const idx = rowY * w + x;
          let val = 0;
          if (maskMode === "toggle") val = state2.resizeIgnoreMask[idx] ? 0 : 1;
          else if (maskMode === "ignore") val = 1;
          else if (maskMode === "unignore") val = 0;
          state2.resizeIgnoreMask[idx] = val;
          if (md) {
            const p = idx * 4;
            md[p] = val ? 255 : 0;
            md[p + 1] = 0;
            md[p + 2] = 0;
            md[p + 3] = val ? 150 : 0;
          }
        }
        if (md) {
          maskOverlay.markDirty(0, rowY);
          maskOverlay.markDirty(w - 1, rowY);
        }
      }
    };
    const paintColumn = (x) => {
      const w = baseCanvas2.width;
      const h = baseCanvas2.height;
      ensureMask(w, h);
      if (x < 0 || x >= w) return;
      const half = Math.floor(rowColSize / 2);
      const startX = Math.max(0, x - half);
      const endX = Math.min(w - 1, x + half);
      const md = maskOverlay.getMaskData();
      for (let colX = startX; colX <= endX; colX++) {
        for (let y = 0; y < h; y++) {
          const idx = y * w + colX;
          let val = 0;
          if (maskMode === "toggle") val = state2.resizeIgnoreMask[idx] ? 0 : 1;
          else if (maskMode === "ignore") val = 1;
          else if (maskMode === "unignore") val = 0;
          state2.resizeIgnoreMask[idx] = val;
          if (md) {
            const p = idx * 4;
            md[p] = val ? 255 : 0;
            md[p + 1] = 0;
            md[p + 2] = 0;
            md[p + 3] = val ? 150 : 0;
          }
        }
        if (md) {
          maskOverlay.markDirty(colX, 0);
          maskOverlay.markDirty(colX, h - 1);
        }
      }
    };
    const redraw = () => maskOverlay.flushDirty();
    const handleBrushChange = () => {
      brushSize = parseInt(elements.brush.value, 10) || 1;
      elements.brushVal.textContent = brushSize;
    };
    const handleRowColSizeChange = () => {
      rowColSize = parseInt(elements.rowColSize.value, 10) || 1;
      elements.rowColSizeVal.textContent = rowColSize;
    };
    const setMaskMode = (mode) => {
      maskMode = mode;
      updateModeButtons();
    };
    const handlePaint = (e) => {
      if (e.buttons & 2 || e.buttons & 4) return;
      const { x, y } = mapClientToPixel(e.clientX, e.clientY);
      const w = baseCanvas2.width;
      const h = baseCanvas2.height;
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      if (e.shiftKey) {
        paintRow(y);
      } else if (e.altKey) {
        paintColumn(x);
      } else {
        const radius = Math.max(1, Math.floor(brushSize / 2));
        paintCircle(x, y, radius);
      }
      redraw();
    };
    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      draggingMask = true;
      handlePaint(e);
    };
    const onMouseMove = (e) => {
      if (draggingMask) handlePaint(e);
    };
    const onMouseUp = () => {
      if (draggingMask) {
        draggingMask = false;
        saveBotSettings2();
      }
    };
    const clearMask = () => {
      const w = baseCanvas2.width;
      const h = baseCanvas2.height;
      ensureMask(w, h);
      state2.resizeIgnoreMask.fill(0);
      maskOverlay.ensureOverlayBuffers(w, h, true);
      redraw();
      saveBotSettings2();
    };
    const invertMask = () => {
      const mask = state2.resizeIgnoreMask;
      if (!mask) return;
      for (let i = 0; i < mask.length; i++) {
        mask[i] = mask[i] ? 0 : 1;
      }
      const w = baseCanvas2.width;
      const h = baseCanvas2.height;
      maskOverlay.ensureOverlayBuffers(w, h, true);
      redraw();
      saveBotSettings2();
    };
    const bind = () => {
      const on = (el, ev, fn) => el?.addEventListener(ev, fn);
      on(elements.brush, "input", handleBrushChange);
      on(elements.rowColSize, "input", handleRowColSizeChange);
      on(elements.ignore, "click", () => setMaskMode("ignore"));
      on(elements.unignore, "click", () => setMaskMode("unignore"));
      on(elements.toggle, "click", () => setMaskMode("toggle"));
      on(maskCanvas2, "mousedown", onMouseDown);
      on(window, "mousemove", onMouseMove);
      on(window, "mouseup", onMouseUp);
      on(elements.clear, "click", clearMask);
      on(elements.invert, "click", invertMask);
      if (elements.brush && elements.brushVal) {
        brushSize = parseInt(elements.brush.value, 10) || 1;
        elements.brushVal.textContent = brushSize;
      }
      if (elements.rowColSize && elements.rowColSizeVal) {
        rowColSize = parseInt(elements.rowColSize.value, 10) || 1;
        elements.rowColSizeVal.textContent = rowColSize;
      }
      updateModeButtons();
      return () => {
        const off = (el, ev, fn) => el?.removeEventListener(ev, fn);
        off(elements.brush, "input", handleBrushChange);
        off(elements.rowColSize, "input", handleRowColSizeChange);
        off(elements.ignore, "click", () => setMaskMode("ignore"));
        off(elements.unignore, "click", () => setMaskMode("unignore"));
        off(elements.toggle, "click", () => setMaskMode("toggle"));
        off(maskCanvas2, "mousedown", onMouseDown);
        off(window, "mousemove", onMouseMove);
        off(window, "mouseup", onMouseUp);
        off(elements.clear, "click", clearMask);
        off(elements.invert, "click", invertMask);
      };
    };
    return { bind };
  }

  // src/js/ui/components/resize/resize-preview-controller.js
  function createPreviewController({
    baseProcessor,
    processor,
    state: state2,
    baseCtx: baseCtx2,
    maskCtx: maskCtx2,
    baseCanvas: baseCanvas2,
    maskCanvas: maskCanvas2,
    canvasStack: canvasStack2,
    widthSlider: widthSlider2,
    heightSlider: heightSlider2,
    widthValue: widthValue2,
    heightValue: heightValue2,
    ensureMaskSize,
    applyFloydSteinbergPreview: applyFloydSteinbergPreview2,
    findClosestColor: findClosestColor2,
    isTransparentPixel: isTransparentPixel2,
    isWhitePixel: isWhitePixel2,
    ensureDitherBuffers,
    updateZoomLayout,
    maskOverlay,
    isDraggingSize
  }) {
    let previewTimer = null;
    let previewJobId = 0;
    async function updateResizePreview() {
      const jobId = ++previewJobId;
      const newWidth = parseInt(widthSlider2.value, 10);
      const newHeight = parseInt(heightSlider2.value, 10);
      widthValue2.textContent = newWidth;
      heightValue2.textContent = newHeight;
      ensureMaskSize(newWidth, newHeight);
      canvasStack2.style.width = `${newWidth}px`;
      canvasStack2.style.height = `${newHeight}px`;
      baseCtx2.imageSmoothingEnabled = false;
      if (!state2.availableColors?.length) {
        if (baseProcessor !== processor && (!baseProcessor.img || !baseProcessor.canvas)) {
          await baseProcessor.load();
        }
        baseCtx2.clearRect(0, 0, newWidth, newHeight);
        baseCtx2.drawImage(baseProcessor.img, 0, 0, newWidth, newHeight);
        maskCtx2.clearRect(0, 0, maskCanvas2.width, maskCanvas2.height);
        const maskImg2 = maskOverlay.getMaskImageData();
        if (maskImg2) maskCtx2.putImageData(maskImg2, 0, 0);
        updateZoomLayout();
        return;
      }
      if (baseProcessor !== processor && (!baseProcessor.img || !baseProcessor.canvas)) {
        await baseProcessor.load();
      }
      baseCtx2.clearRect(0, 0, newWidth, newHeight);
      baseCtx2.drawImage(baseProcessor.img, 0, 0, newWidth, newHeight);
      const imgData = baseCtx2.getImageData(0, 0, newWidth, newHeight);
      if (state2.ditheringEnabled && !isDraggingSize) {
        applyFloydSteinbergPreview2({
          imageData: imgData,
          state: state2,
          findClosestColor: findClosestColor2,
          isTransparentPixel: isTransparentPixel2,
          isWhitePixel: isWhitePixel2,
          ensureDitherBuffers
        });
      } else {
        const { data } = imgData;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (!state2.paintTransparentPixels && isTransparentPixel2(a) || !state2.paintWhitePixels && isWhitePixel2(r, g, b)) {
            data[i + 3] = 0;
          } else {
            const [nr, ng, nb] = findClosestColor2(r, g, b, state2.activeColorPalette);
            data[i] = nr;
            data[i + 1] = ng;
            data[i + 2] = nb;
            data[i + 3] = 255;
          }
        }
      }
      if (jobId !== previewJobId) return;
      baseCtx2.putImageData(imgData, 0, 0);
      maskCtx2.clearRect(0, 0, maskCanvas2.width, maskCanvas2.height);
      const maskImg = maskOverlay.getMaskImageData();
      if (maskImg) maskCtx2.putImageData(maskImg, 0, 0);
      updateZoomLayout();
    }
    function schedulePreview() {
      if (previewTimer) clearTimeout(previewTimer);
      const run = () => {
        previewTimer = null;
        updateResizePreview();
      };
      if (window.requestIdleCallback) {
        previewTimer = setTimeout(() => requestIdleCallback(run, { timeout: 150 }), 50);
      } else {
        previewTimer = setTimeout(() => requestAnimationFrame(run), 50);
      }
    }
    function destroy() {
      if (previewTimer) {
        clearTimeout(previewTimer);
        previewTimer = null;
      }
    }
    return {
      updateResizePreview,
      schedulePreview,
      destroy
    };
  }

  // src/js/ui/sync-ui.js
  var UI_BINDINGS = [
    // Coordinate Mode
    { key: "coordinateMode", selector: "#coordinateModeSelect", prop: "value" },
    {
      key: "coordinateDirection",
      selector: "#coordinateDirectionSelect",
      prop: "value"
    },
    {
      key: "coordinateSnake",
      selector: "#coordinateSnakeToggle",
      prop: "checked"
    },
    {
      key: "sortCoordinateByFrequency",
      selector: "#sortCoordinateByFrequencyToggle",
      prop: "checked"
    },
    // Paint Filters
    {
      key: "paintUnavailablePixels",
      selector: "#paintUnavailablePixelsToggle",
      prop: "checked"
    },
    {
      key: "paintWhitePixels",
      selector: "#settingsPaintWhiteToggle",
      prop: "checked"
    },
    {
      key: "paintTransparentPixels",
      selector: "#settingsPaintTransparentToggle",
      prop: "checked"
    },
    // Speed
    { key: "paintingSpeed", selector: "#speedSlider", prop: "value" },
    {
      key: "paintingSpeedLimitEnabled",
      selector: "#enableSpeedToggle",
      prop: "checked"
    },
    // Batch Mode
    { key: "batchMode", selector: "#batchModeSelect", prop: "value" },
    { key: "randomBatchMin", selector: "#randomBatchMin", prop: "value" },
    { key: "randomBatchMax", selector: "#randomBatchMax", prop: "value" },
    // Overlay
    { key: "overlayOpacity", selector: "#overlayOpacitySlider", prop: "value" },
    {
      key: "blueMarbleEnabled",
      selector: "#enableBlueMarbleToggle",
      prop: "checked"
    },
    // Token Source
    { key: "tokenSource", selector: "#tokenSourceSelect", prop: "value" },
    // Color Matching - Resize settings
    {
      key: "colorMatchingAlgorithm",
      selector: "#colorAlgorithmSelect",
      prop: "value"
    },
    {
      key: "enableChromaPenalty",
      selector: "#enableChromaPenaltyToggle",
      prop: "checked"
    },
    {
      key: "chromaPenaltyWeight",
      selector: "#chromaPenaltyWeightSlider",
      prop: "value"
    },
    {
      key: "customTransparencyThreshold",
      selector: "#transparencyThresholdInput",
      prop: "value"
    },
    {
      key: "customWhiteThreshold",
      selector: "#whiteThresholdInput",
      prop: "value"
    },
    // Notifications
    {
      key: "notificationsEnabled",
      selector: "#notifEnabledToggle",
      prop: "checked"
    },
    {
      key: "notifyOnChargesReached",
      selector: "#notifOnChargesToggle",
      prop: "checked"
    },
    {
      key: "notifyOnlyWhenUnfocused",
      selector: "#notifOnlyUnfocusedToggle",
      prop: "checked"
    },
    {
      key: "notificationIntervalMinutes",
      selector: "#notifIntervalInput",
      prop: "value"
    },
    // Themes + Language
    {
      key: "themeKey",
      selector: "#themeSelect",
      prop: "value"
    },
    {
      key: "languageKey",
      selector: "#languageSelect",
      prop: "value"
    }
  ];
  var SPECIAL_HANDLERS = [
    {
      keys: ["paintingSpeed"],
      update: (state2) => {
        const el = document.getElementById("speedValue");
        if (el) el.textContent = `${state2.paintingSpeed}`;
      }
    },
    {
      keys: ["overlayOpacity"],
      update: (state2) => {
        const el = document.getElementById("overlayOpacityValue");
        if (el) el.textContent = `${Math.round(state2.overlayOpacity * 100)}%`;
      }
    },
    {
      keys: ["chromaPenaltyWeight"],
      update: (state2) => {
        const el = document.getElementById("chromaWeightValue");
        if (el) el.textContent = state2.chromaPenaltyWeight;
      }
    },
    {
      keys: ["batchMode"],
      update: (state2) => {
        const normal = document.getElementById("normalBatchControls");
        const random = document.getElementById("randomBatchControls");
        if (normal && random) {
          if (state2.batchMode === "random") {
            normal.style.display = "none";
            random.style.display = "block";
          } else {
            normal.style.display = "block";
            random.style.display = "none";
          }
        }
      }
    },
    {
      keys: ["coordinateMode"],
      update: (state2) => {
        const container = document.getElementById("wplace-settings-container");
        if (!container) return;
        updateCoordinateUI({
          mode: state2.coordinateMode,
          directionControls: container.querySelector("#directionControls"),
          snakeControls: container.querySelector("#snakeControls"),
          blockControls: container.querySelector("#blockControls")
        });
      }
    },
    {
      keys: ["blockHeight", "blockWidth"],
      update: (state2) => {
        const blockHeightInput = document.getElementById("blockHeightInput");
        const blockWidthInput = document.getElementById("blockWidthInput");
        if (blockHeightInput) blockHeightInput.value = state2.blockHeight;
        if (blockWidthInput) blockWidthInput.value = state2.blockWidth;
      }
    }
  ];
  function syncSettingsUI() {
    for (const binding of UI_BINDINGS) {
      const el = document.querySelector(binding.selector);
      if (el && Object.prototype.hasOwnProperty.call(state, binding.key)) {
        el[binding.prop] = state[binding.key];
      }
    }
    for (const handler of SPECIAL_HANDLERS) {
      if (handler.keys.some((key) => Object.prototype.hasOwnProperty.call(state, key))) {
        handler.update(state);
      }
    }
  }

  // src/js/ui/components/resize/resize-dialog.js
  var colorSettingsUnsubscribe = null;
  var resizeContainer;
  var resizeOverlay;
  var widthSlider;
  var heightSlider;
  var widthValue;
  var heightValue;
  var keepAspect;
  var paintWhiteToggle;
  var paintTransparentToggle;
  var zoomSlider;
  var zoomValue;
  var zoomInBtn;
  var zoomOutBtn;
  var zoomFitBtn;
  var zoomActualBtn;
  var panModeBtn;
  var panStage;
  var canvasStack;
  var baseCanvas;
  var maskCanvas;
  var baseCtx;
  var maskCtx;
  var confirmResize;
  var cancelResize;
  var downloadPreviewBtn;
  var clearIgnoredBtn;
  var toggleOverlayBtn;
  var _resizeDialogCleanup = null;
  var initializeDOMRefs = (container, overlay) => {
    resizeContainer = container;
    resizeOverlay = overlay;
    widthSlider = container.querySelector("#widthSlider");
    heightSlider = container.querySelector("#heightSlider");
    widthValue = container.querySelector("#widthValue");
    heightValue = container.querySelector("#heightValue");
    keepAspect = container.querySelector("#keepAspect");
    paintWhiteToggle = container.querySelector("#paintWhiteToggle");
    paintTransparentToggle = container.querySelector("#paintTransparentToggle");
    zoomSlider = container.querySelector("#zoomSlider");
    zoomValue = container.querySelector("#zoomValue");
    zoomInBtn = container.querySelector("#zoomInBtn");
    zoomOutBtn = container.querySelector("#zoomOutBtn");
    zoomFitBtn = container.querySelector("#zoomFitBtn");
    zoomActualBtn = container.querySelector("#zoomActualBtn");
    panModeBtn = container.querySelector("#panModeBtn");
    panStage = container.querySelector("#resizePanStage");
    canvasStack = container.querySelector("#resizeCanvasStack");
    baseCanvas = container.querySelector("#resizeCanvas");
    maskCanvas = container.querySelector("#maskCanvas");
    baseCtx = baseCanvas.getContext("2d", { alpha: true });
    maskCtx = maskCanvas.getContext("2d", { alpha: true });
    confirmResize = container.querySelector("#confirmResize");
    cancelResize = container.querySelector("#cancelResize");
    downloadPreviewBtn = container.querySelector("#downloadPreviewBtn");
    clearIgnoredBtn = container.querySelector("#clearIgnoredBtn");
    toggleOverlayBtn = container.querySelector("#toggleOverlayBtn");
  };
  function showResizeDialog(processor, container, overlay) {
    initializeDOMRefs(container, overlay);
    let baseProcessor = processor;
    let width, height;
    if (state.originalImage?.dataUrl) {
      baseProcessor = new ImageProcessor(state.originalImage.dataUrl);
      width = state.originalImage.width;
      height = state.originalImage.height;
    } else {
      const dims = processor.getDimensions();
      width = dims.width;
      height = dims.height;
    }
    const rs = state.resizeSettings;
    const minSize = 10;
    const maxSize = width * 2;
    widthSlider.min = heightSlider.min = minSize;
    widthSlider.max = heightSlider.max = maxSize;
    const initialW = Math.max(minSize, Math.min(rs?.width ?? width, maxSize));
    const initialH = Math.max(minSize, Math.min(rs?.height ?? height, maxSize));
    widthSlider.value = initialW;
    heightSlider.value = initialH;
    widthValue.textContent = initialW;
    heightValue.textContent = initialH;
    zoomSlider.value = 1;
    if (zoomValue) zoomValue.textContent = "100%";
    paintWhiteToggle.checked = state.paintWhitePixels;
    paintTransparentToggle.checked = state.paintTransparentPixels;
    const ditherBuffers = createDitherBuffers();
    const maskOverlay = createMaskOverlay({ maskCtx, baseCanvas, maskCanvas, state });
    const previewController = createPreviewController({
      baseProcessor,
      processor,
      state,
      baseCtx,
      maskCtx,
      baseCanvas,
      maskCanvas,
      canvasStack,
      widthSlider,
      heightSlider,
      widthValue,
      heightValue,
      ensureMaskSize: (w, h) => maskOverlay.ensureMaskSize(w, h),
      applyFloydSteinbergPreview,
      findClosestColor,
      isTransparentPixel,
      isWhitePixel,
      ensureDitherBuffers: (n) => ditherBuffers.ensure(n),
      updateZoomLayout: () => panZoomController.updateZoomLayout(),
      maskOverlay,
      isDraggingSize: () => sizeHandlers.isDraggingSize
    });
    const panZoomController = createPanZoomController({
      panStage,
      canvasStack,
      baseCanvas,
      maskCanvas,
      zoomSlider,
      zoomValue,
      zoomInBtn,
      zoomOutBtn,
      zoomFitBtn,
      zoomActualBtn,
      panModeBtn
    });
    const sizeHandlers = createSizeHandlers({
      widthSlider,
      heightSlider,
      keepAspect,
      baseWidth: width,
      baseHeight: height,
      state,
      saveBotSettings,
      updatePreview: () => {
        previewController.updateResizePreview();
        previewController.schedulePreview();
      },
      applyZoom: (z) => panZoomController.applyZoom(z),
      computeFitZoom: () => panZoomController.computeFitZoom()
    });
    const mapClientToPixel = (clientX, clientY) => {
      const rect = baseCanvas.getBoundingClientRect();
      const scaleX = rect.width / baseCanvas.width;
      const scaleY = rect.height / baseCanvas.height;
      return {
        x: Math.floor((clientX - rect.left) / scaleX),
        y: Math.floor((clientY - rect.top) / scaleY)
      };
    };
    const maskEvents = createMaskEvents({
      resizeContainer,
      baseCanvas,
      maskCanvas,
      state,
      saveBotSettings,
      maskOverlay,
      mapClientToPixel
    });
    const setupColorSettingsBindings = () => {
      if (colorSettingsUnsubscribe) {
        colorSettingsUnsubscribe();
      }
      const bindInput = (id, stateKey, transform = (v) => v, fromState = (v) => v) => {
        const el = resizeContainer.querySelector(`#${id}`);
        if (!el) return;
        const handleChange = () => {
          let value = el.value;
          if (el.type === "checkbox") value = el.checked;
          state.updateColorSettings({ [stateKey]: transform(value) });
        };
        el.addEventListener("change", handleChange);
        const handleStateChange = (updates) => {
          if (updates[stateKey] !== void 0) {
            const value = fromState(updates[stateKey]);
            if (el.type === "checkbox") {
              el.checked = value;
            } else {
              el.value = value;
            }
          }
        };
        handleStateChange({ [stateKey]: state[stateKey] });
        return () => {
          el.removeEventListener("change", handleChange);
        };
      };
      const unbinders = [
        bindInput("colorAlgorithmSelect", "colorMatchingAlgorithm"),
        bindInput(
          "enableChromaPenaltyToggle",
          "enableChromaPenalty",
          (v) => v,
          (v) => v
        ),
        bindInput("chromaPenaltyWeightSlider", "chromaPenaltyWeight", parseFloat),
        bindInput("transparencyThresholdInput", "customTransparencyThreshold", (v) => {
          const num = parseInt(v, 10);
          if (isNaN(num)) return state.customTransparencyThreshold;
          return Math.min(255, Math.max(0, num));
        }),
        bindInput("whiteThresholdInput", "customWhiteThreshold", (v) => {
          const num = parseInt(v, 10);
          if (isNaN(num)) return state.customWhiteThreshold;
          return Math.min(255, Math.max(200, num));
        })
      ];
      const handleColorSettingsChange = (updates) => {
        invalidateColorCache(updates);
        previewController.updateResizePreview();
        saveBotSettings();
      };
      colorSettingsUnsubscribe = () => {
        unbinders.forEach((unbind) => unbind && unbind());
        state._eventEmitter.off("colorSettingsChange", handleColorSettingsChange);
      };
      onColorSettingsChange(handleColorSettingsChange);
    };
    setupColorSettingsBindings();
    const unbindSize = sizeHandlers.bind();
    const unbindMask = maskEvents.bind();
    paintWhiteToggle.onchange = (e) => {
      state.paintWhitePixels = e.target.checked;
      previewController.updateResizePreview();
      saveBotSettings();
    };
    paintTransparentToggle.onchange = (e) => {
      state.paintTransparentPixels = e.target.checked;
      previewController.updateResizePreview();
      saveBotSettings();
    };
    confirmResize.onclick = async () => {
      const newWidth = parseInt(widthSlider.value, 10);
      const newHeight = parseInt(heightSlider.value, 10);
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = newWidth;
      tempCanvas.height = newHeight;
      tempCtx.imageSmoothingEnabled = false;
      if (baseProcessor !== processor && (!baseProcessor.img || !baseProcessor.canvas)) {
        await baseProcessor.load();
      }
      tempCtx.drawImage(baseProcessor.img, 0, 0, newWidth, newHeight);
      const imgData = tempCtx.getImageData(0, 0, newWidth, newHeight);
      const data = imgData.data;
      const mask = state.resizeIgnoreMask?.length === newWidth * newHeight ? state.resizeIgnoreMask : null;
      let totalValidPixels = 0;
      if (state.ditheringEnabled) {
        totalValidPixels = await applyFloydSteinbergFinal({
          data,
          width: newWidth,
          height: newHeight,
          state,
          mask,
          findClosestColor,
          isTransparentPixel,
          isWhitePixel,
          ensureDitherBuffers: (n) => ditherBuffers.ensure(n)
        });
      } else {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          const masked = mask && mask[i >> 2];
          if (!state.paintTransparentPixels && isTransparentPixel(a) || masked || !state.paintWhitePixels && isWhitePixel(r, g, b)) {
            data[i + 3] = 0;
            continue;
          }
          totalValidPixels++;
          const [nr, ng, nb] = findClosestColor(r, g, b, state.activeColorPalette);
          data[i] = nr;
          data[i + 1] = ng;
          data[i + 2] = nb;
          data[i + 3] = 255;
        }
      }
      tempCtx.putImageData(imgData, 0, 0);
      state.imageData = {
        pixels: new Uint8ClampedArray(imgData.data),
        width: newWidth,
        height: newHeight,
        totalPixels: totalValidPixels
      };
      state.artTotalPixels = totalValidPixels;
      state.totalPaintedPixels = 0;
      state.resizeSettings = {
        baseWidth: width,
        baseHeight: height,
        width: newWidth,
        height: newHeight
      };
      saveBotSettings();
      const finalImageBitmap = await createImageBitmap(tempCanvas);
      await overlayManager.setImage(finalImageBitmap);
      overlayManager.enable();
      toggleOverlayBtn.classList.add("active");
      toggleOverlayBtn.setAttribute("aria-pressed", "true");
      await updateStats();
      updateUI("resizeSuccess", "success", { width: newWidth, height: newHeight });
      closeResizeDialog();
    };
    downloadPreviewBtn.onclick = () => {
      try {
        const out = document.createElement("canvas");
        out.width = baseCanvas.width;
        out.height = baseCanvas.height;
        const ctx = out.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(baseCanvas, 0, 0);
        ctx.drawImage(maskCanvas, 0, 0);
        const link = document.createElement("a");
        link.download = "wplace-preview.png";
        link.href = out.toDataURL();
        link.click();
      } catch (e) {
        console.warn("Failed to download preview:", e);
      }
    };
    cancelResize.onclick = closeResizeDialog;
    resizeOverlay.style.display = "block";
    resizeContainer.style.display = "block";
    initializeColorPalette(resizeContainer, () => {
      previewController.updateResizePreview();
    });
    previewController.updateResizePreview();
    setTimeout(() => {
      const fitZoom = panZoomController.computeFitZoom();
      if (isFinite(fitZoom)) {
        panZoomController.applyZoom(fitZoom);
        panZoomController.centerInView();
      }
    }, 0);
    _resizeDialogCleanup = () => {
      try {
        zoomSlider.replaceWith(zoomSlider.cloneNode(true));
        [zoomInBtn, zoomOutBtn].forEach((btn) => {
          btn?.replaceWith(btn.cloneNode(true));
        });
      } catch {
      }
      colorSettingsUnsubscribe?.();
      unbindSize?.();
      unbindMask?.();
      previewController.destroy();
      panZoomController.destroy();
      maskOverlay.destroy();
      ditherBuffers.reset();
    };
  }
  function closeResizeDialog() {
    _resizeDialogCleanup?.();
    resizeOverlay.style.display = "none";
    resizeContainer.style.display = "none";
    _resizeDialogCleanup = null;
  }

  // src/js/security/turnstile.js
  var turnstileLoaded = false;
  var _turnstileContainer = null;
  var _turnstileOverlay = null;
  var _turnstileWidgetId = null;
  var _lastSitekey = null;
  var _cachedSitekey = null;
  async function loadTurnstile() {
    if (window.turnstile) {
      turnstileLoaded = true;
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]')) {
        const checkReady = () => {
          if (window.turnstile) {
            turnstileLoaded = true;
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        return checkReady();
      }
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        turnstileLoaded = true;
        console.log("\u2705 Turnstile script loaded successfully");
        resolve();
      };
      script.onerror = () => {
        console.error("\u274C Failed to load Turnstile script");
        reject(new Error("Failed to load Turnstile"));
      };
      document.head.appendChild(script);
    });
  }
  function ensureTurnstileContainer() {
    if (!_turnstileContainer || !document.body.contains(_turnstileContainer)) {
      if (_turnstileContainer) {
        _turnstileContainer.remove();
      }
      _turnstileContainer = document.createElement("div");
      _turnstileContainer.className = "wplace-turnstile-hidden";
      _turnstileContainer.setAttribute("aria-hidden", "true");
      _turnstileContainer.id = "turnstile-widget-container";
      document.body.appendChild(_turnstileContainer);
    }
    return _turnstileContainer;
  }
  function ensureTurnstileOverlayContainer() {
    if (_turnstileOverlay && document.body.contains(_turnstileOverlay)) {
      return _turnstileOverlay;
    }
    const overlay = document.createElement("div");
    overlay.id = "turnstile-overlay-container";
    overlay.className = "wplace-turnstile-overlay wplace-overlay-hidden";
    const title = document.createElement("div");
    title.textContent = t("turnstileInstructions");
    title.dataset.i18nKey = "turnstileInstructions";
    title.className = "wplace-turnstile-title";
    const host = document.createElement("div");
    host.id = "turnstile-overlay-host";
    host.className = "wplace-turnstile-host";
    const hideBtn = document.createElement("button");
    hideBtn.textContent = t("hideTurnstileBtn");
    hideBtn.dataset.i18nKey = "hideTurnstileBtn";
    hideBtn.className = "wplace-turnstile-hide-btn";
    hideBtn.addEventListener("click", () => overlay.remove());
    overlay.appendChild(title);
    overlay.appendChild(host);
    overlay.appendChild(hideBtn);
    document.body.appendChild(overlay);
    _turnstileOverlay = overlay;
    return overlay;
  }
  async function executeTurnstile(sitekey, action = "paint") {
    await loadTurnstile();
    if (_turnstileWidgetId && _lastSitekey === sitekey && window.turnstile?.execute) {
      try {
        console.log("\u{1F504} Reusing existing Turnstile widget...");
        const token = await Promise.race([
          window.turnstile.execute(_turnstileWidgetId, { action }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Execute timeout")), 15e3))
        ]);
        if (token && token.length > 20) {
          console.log("\u2705 Token generated via widget reuse");
          return token;
        }
      } catch (error) {
        console.log("\u{1F534} Widget reuse failed, will create a fresh widget:", error.message);
      }
    }
    const invisibleToken = await createTurnstileWidget(sitekey, action);
    if (invisibleToken && invisibleToken.length > 20) {
      return invisibleToken;
    }
    console.log("\u{1F534} Falling back to interactive Turnstile (visible).");
    return await createTurnstileWidgetInteractive(sitekey, action);
  }
  async function createTurnstileWidget(sitekey, action) {
    return new Promise((resolve) => {
      try {
        if (_turnstileWidgetId && window.turnstile?.remove) {
          try {
            window.turnstile.remove(_turnstileWidgetId);
            console.log("\u{1F9F9} Cleaned up existing Turnstile widget");
          } catch (e) {
            console.warn("\u26A0\uFE0F Widget cleanup warning:", e.message);
          }
        }
        const container = ensureTurnstileContainer();
        container.innerHTML = "";
        if (!window.turnstile?.render) {
          console.error("\u274C Turnstile not available for rendering");
          resolve(null);
          return;
        }
        console.log("\u{1F527} Creating invisible Turnstile widget...");
        const widgetId = window.turnstile.render(container, {
          sitekey,
          action,
          size: "invisible",
          retry: "auto",
          "retry-interval": 8e3,
          callback: (token) => {
            console.log("\u2705 Invisible Turnstile callback");
            resolve(token);
          },
          "error-callback": () => resolve(null),
          "timeout-callback": () => resolve(null)
        });
        _turnstileWidgetId = widgetId;
        _lastSitekey = sitekey;
        if (!widgetId) {
          return resolve(null);
        }
        Promise.race([
          window.turnstile.execute(widgetId, { action }),
          new Promise(
            (_, reject) => setTimeout(() => reject(new Error("Invisible execute timeout")), 12e3)
          )
        ]).then(resolve).catch(() => resolve(null));
      } catch (e) {
        console.error("\u274C Invisible Turnstile creation failed:", e);
        resolve(null);
      }
    });
  }
  async function createTurnstileWidgetInteractive(sitekey, action) {
    return new Promise((resolve) => {
      try {
        if (_turnstileWidgetId && window.turnstile?.remove) {
          try {
            window.turnstile.remove(_turnstileWidgetId);
          } catch (e) {
            console.warn("\u26A0\uFE0F Widget cleanup warning:", e.message);
          }
        }
        const overlay = ensureTurnstileOverlayContainer();
        overlay.classList.remove("wplace-overlay-hidden");
        overlay.style.display = "block";
        const host = overlay.querySelector("#turnstile-overlay-host");
        host.innerHTML = "";
        const timeout = setTimeout(() => {
          console.warn("\u23F0 Interactive Turnstile widget timeout");
          overlay.classList.add("wplace-overlay-hidden");
          overlay.style.display = "none";
          resolve(null);
        }, 6e4);
        const widgetId = window.turnstile.render(host, {
          sitekey,
          action,
          size: "normal",
          theme: "light",
          callback: (token) => {
            clearTimeout(timeout);
            overlay.classList.add("wplace-overlay-hidden");
            overlay.style.display = "none";
            console.log("\u2705 Interactive Turnstile completed successfully");
            if (typeof token === "string" && token.length > 20) {
              resolve(token);
            } else {
              console.warn("\u274C Invalid token from interactive widget");
              resolve(null);
            }
          },
          "error-callback": (error) => {
            clearTimeout(timeout);
            overlay.classList.add("wplace-overlay-hidden");
            overlay.style.display = "none";
            console.warn("\u274C Interactive Turnstile error:", error);
            resolve(null);
          }
        });
        _turnstileWidgetId = widgetId;
        _lastSitekey = sitekey;
        if (!widgetId) {
          clearTimeout(timeout);
          overlay.classList.add("wplace-overlay-hidden");
          overlay.style.display = "none";
          console.warn("\u274C Failed to create interactive Turnstile widget");
          resolve(null);
        } else {
          console.log("\u2705 Interactive Turnstile widget created, waiting for user interaction...");
        }
      } catch (e) {
        console.error("\u274C Interactive Turnstile creation failed:", e);
        resolve(null);
      }
    });
  }
  function cleanupTurnstile() {
    if (_turnstileWidgetId && window.turnstile?.remove) {
      try {
        window.turnstile.remove(_turnstileWidgetId);
      } catch (e) {
        console.warn("Failed to cleanup Turnstile widget:", e);
      }
    }
    if (_turnstileContainer && document.body.contains(_turnstileContainer)) {
      _turnstileContainer.remove();
    }
    if (_turnstileOverlay && document.body.contains(_turnstileOverlay)) {
      _turnstileOverlay.remove();
    }
    _turnstileWidgetId = null;
    _turnstileContainer = null;
    _turnstileOverlay = null;
    _lastSitekey = null;
  }
  async function obtainSitekey(fallback = "0x4AAAAAABpqJe8FO0N84q0F") {
    if (_cachedSitekey) {
      console.log("\u{1F50D} Using cached sitekey:", _cachedSitekey);
      return _cachedSitekey;
    }
    const potentialSitekeys = [
      "0x4AAAAAABpqJe8FO0N84q0F",
      // WPlace common sitekey
      "0x4AAAAAABpHqZ-6i7uL0nmG",
      // Alternative WPlace sitekey
      "0x4AAAAAAAJ7xjKAp6Mt_7zw",
      // Alternative WPlace sitekey
      "0x4AAAAAADm5QWx6Ov2LNF2g"
      // Another common sitekey
    ];
    const testSitekey = async (sitekey, source) => {
      if (!sitekey || sitekey.length < 10) return null;
      console.log(`\u{1F50D} Testing sitekey from ${source}:`, sitekey);
      try {
        const token = await executeTurnstile(sitekey);
        if (token && typeof token === "string" && token.length >= 20) {
          console.log(`\u2705 Valid sitekey found from ${source}`);
          setTurnstileToken(token);
          _cachedSitekey = sitekey;
          return sitekey;
        } else {
          console.log(`\u274C Invalid token for sitekey from ${source}`);
          return null;
        }
      } catch (error) {
        console.log(`\u274C Error testing sitekey from ${source}:`, error.message);
        return null;
      }
    };
    try {
      const sitekeySel = document.querySelector("[data-sitekey]");
      if (sitekeySel) {
        const sitekey = sitekeySel.getAttribute("data-sitekey");
        const result = await testSitekey(sitekey, "data attribute");
        if (result) return result;
      }
      const turnstileEl = document.querySelector(".cf-turnstile");
      if (turnstileEl?.dataset?.sitekey) {
        const sitekey = turnstileEl.dataset.sitekey;
        const result = await testSitekey(sitekey, "turnstile element");
        if (result) return result;
      }
      const metaTags = document.querySelectorAll(
        'meta[name*="turnstile"], meta[property*="turnstile"]'
      );
      for (const meta of metaTags) {
        const content = meta.getAttribute("content");
        const result = await testSitekey(content, "meta tag");
        if (result) return result;
      }
      if (window.__TURNSTILE_SITEKEY) {
        const result = await testSitekey(window.__TURNSTILE_SITEKEY, "global variable");
        if (result) return result;
      }
      const scripts = document.querySelectorAll("script");
      for (const script of scripts) {
        const content = script.textContent || script.innerHTML;
        const match = content.match(
          /(?:sitekey|data-sitekey)['"\s[\]:=(]*['"]?([0-9a-zA-Z_-]{20,})['"]?/i
        );
        if (match && match[1]) {
          const extracted = match[1].replace(/['"]/g, "");
          const result = await testSitekey(extracted, "script content");
          if (result) return result;
        }
      }
      for (const testSitekeyValue of potentialSitekeys) {
        const result = await testSitekey(testSitekeyValue, "known list");
        if (result) return result;
      }
    } catch (error) {
      console.warn("\u26A0\uFE0F Error during sitekey detection:", error);
    }
    console.log("\u{1F527} Trying fallback sitekey:", fallback);
    const fallbackResult = await testSitekey(fallback, "fallback");
    if (fallbackResult) {
      return fallbackResult;
    }
    console.error("\u274C No working sitekey found.");
    return null;
  }

  // src/js/utils/dev-utils.js
  function createDevReloadButton() {
    const container = document.getElementById("wplace-image-bot-container");
    if (!container) return;
    const headerControls = container.querySelector(".wplace-header-controls");
    if (!headerControls) return;
    const button = document.createElement("button");
    button.id = "dev-reload-btn";
    button.className = "wplace-header-btn";
    button.title = "Click: Local Dev Server | Alt+Click: GitHub (cached)";
    const icon = document.createElement("i");
    icon.className = "fas fa-sync-alt";
    button.appendChild(icon);
    button.onclick = (e) => {
      e.stopPropagation();
      const isAltPressed = e.altKey;
      const localUrl = "http://127.0.0.1:8000/dist/script.user.js";
      const githubUrl = "https://github.com/skalsech/WPlace-AutoBOT/raw/custom-main/dist/script.user.js";
      const targetUrl = isAltPressed ? githubUrl : localUrl;
      button.classList.add("animate-spin");
      setTimeout(() => button.classList.remove("animate-spin"), 500);
      const updateTab = window.open(targetUrl, "_blank");
      setTimeout(() => {
        if (updateTab && !updateTab.closed) {
          updateTab.close();
        }
      }, 2500);
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          console.log(`\u{1F504} Reloading page after ${isAltPressed ? "GitHub" : "local"} update...`);
          location.reload();
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
    };
    const minimizeBtn = headerControls.querySelector("#settingsBtn");
    if (minimizeBtn) {
      headerControls.insertBefore(button, minimizeBtn);
    } else {
      headerControls.appendChild(button);
    }
  }
  function truncateString(str, prefixLength = 15, suffixLength = 20, middleLength = 15) {
    if (typeof str !== "string") {
      return str;
    }
    if (str.length <= prefixLength + suffixLength + middleLength) {
      return str;
    }
    const prefix = str.substring(0, prefixLength);
    const suffix = str.substring(str.length - suffixLength);
    const middleHash = Array.from(
      { length: middleLength },
      (_, i) => str[Math.floor(
        prefixLength + i * (str.length - prefixLength - suffixLength) / (middleLength - 1)
      )]
    ).join("");
    return `${prefix}...${middleHash}...${suffix}`;
  }

  // src/js/security/turnstile-manager.js
  var TurnstileState = {
    /** @type {string | null} */
    token: null,
    expiryTime: 0,
    generationInProgress: false,
    resolveToken: null,
    tokenPromise: null
  };
  TurnstileState.tokenPromise = new Promise((resolve) => {
    TurnstileState.resolveToken = resolve;
  });
  var TOKEN_LIFETIME = 24e4;
  function setTurnstileToken(token) {
    if (TurnstileState.token === token) {
      console.log("[turnstile-token]: \u23ED\uFE0F Token is the same, skipping update");
      return;
    }
    const displayToken = truncateString(token);
    console.debug(
      `[turnstile-token]: \u{1F511} New set - Type: ${typeof token}, Value: ${displayToken}, \u{1F50D} Length: ${token.length}`
    );
    if (TurnstileState.resolveToken) {
      TurnstileState.resolveToken(token);
      TurnstileState.resolveToken = null;
    }
    TurnstileState.token = token;
    TurnstileState.expiryTime = Date.now() + TOKEN_LIFETIME;
    console.log("[turnstile-token]: \u2705 Cached successfully");
  }
  function getTurnstileToken() {
    return TurnstileState.token;
  }
  function isTokenValid() {
    return TurnstileState.token && Date.now() < TurnstileState.expiryTime;
  }
  function invalidateToken() {
    TurnstileState.token = null;
    TurnstileState.expiryTime = 0;
    console.log("[turnstile-token]: \u{1F5D1}\uFE0F Token invalidated, will force fresh generation");
  }
  async function ensureToken(forceRefresh = false) {
    if (isTokenValid() && !forceRefresh) {
      return TurnstileState.token;
    }
    if (forceRefresh) invalidateToken();
    if (TurnstileState.generationInProgress) {
      console.log("[turnstile-token]: \u{1F504} Token generation already in progress, waiting...");
      await sleep(2e3);
      return isTokenValid() ? TurnstileState.token : null;
    }
    TurnstileState.generationInProgress = true;
    try {
      console.log("[turnstile-token]: \u{1F504} Token expired or missing, generating new one...");
      const token = await handleCaptchaWithRetry();
      if (token) {
        setTurnstileToken(token);
        return token;
      }
      console.log("[turnstile-token]: \u26A0\uFE0F Invisible Turnstile failed, forcing browser automation...");
      const fallbackToken = await handleCaptchaFallback();
      if (fallbackToken && fallbackToken.length > 20) {
        setTurnstileToken(fallbackToken);
        console.log("[turnstile-token]: \u2705 Fallback token captured successfully");
        return fallbackToken;
      }
      console.log("[turnstile-token]: \u274C All token generation methods failed");
      return null;
    } finally {
      TurnstileState.generationInProgress = false;
    }
  }
  async function handleCaptchaWithRetry() {
    const startTime = performance.now();
    try {
      const sitekey = await obtainSitekey();
      if (!sitekey) {
        throw new Error("No valid sitekey found");
      }
      console.log("[turnstile-token]: \u{1F510} Getting cached Turnstile token");
      const token = getTurnstileToken();
      if (token && typeof token === "string" && token.length > 20) {
        const elapsed = Math.round(performance.now() - startTime);
        console.log(`[turnstile-token]: \u2705 Turnstile token generated successfully in ${elapsed}ms`);
        return token;
      } else {
        throw new Error(`Invalid or empty token received - Length: ${token?.length || 0}`);
      }
    } catch (error) {
      const elapsed = Math.round(performance.now() - startTime);
      console.error(
        `[turnstile-token]: \u274C Turnstile token generation failed after ${elapsed}ms:`,
        error
      );
      throw error;
    }
  }
  async function handleCaptchaFallback() {
    return new Promise(async (resolve, reject) => {
      try {
        if (!TurnstileState.resolveToken) {
          TurnstileState.tokenPromise = new Promise((res) => {
            TurnstileState.resolveToken = res;
          });
        }
        const timeoutPromise = sleep(2e4).then(() => reject(new Error("Auto-CAPTCHA timed out.")));
        const solvePromise = (async () => {
          const mainPaintBtn = await waitForSelector(
            "button.btn.btn-primary.btn-lg, button.btn-primary.sm\\:btn-xl",
            200,
            1e4
          );
          if (!mainPaintBtn) throw new Error("Could not find the main paint button.");
          mainPaintBtn.click();
          await sleep(500);
          const transBtn = await waitForSelector("button#color-0", 200, 5e3);
          if (!transBtn) throw new Error("Could not find the transparent color button.");
          transBtn.click();
          await sleep(500);
          const canvas = await waitForSelector("canvas", 200, 5e3);
          if (!canvas) throw new Error("Could not find the canvas element.");
          canvas.setAttribute("tabindex", "0");
          canvas.focus();
          const rect = canvas.getBoundingClientRect();
          const centerX = Math.round(rect.left + rect.width / 2);
          const centerY = Math.round(rect.top + rect.height / 2);
          canvas.dispatchEvent(
            new MouseEvent("mousemove", {
              clientX: centerX,
              clientY: centerY,
              bubbles: true
            })
          );
          canvas.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: " ",
              code: "Space",
              bubbles: true
            })
          );
          await sleep(50);
          canvas.dispatchEvent(
            new KeyboardEvent("keyup", {
              key: " ",
              code: "Space",
              bubbles: true
            })
          );
          await sleep(500);
          await sleep(800);
          const confirmLoop = async () => {
            while (!TurnstileState.token) {
              let confirmBtn = await waitForSelector(
                "button.btn.btn-primary.btn-lg, button.btn.btn-primary.sm\\:btn-xl"
              );
              if (!confirmBtn) {
                const allPrimary = Array.from(document.querySelectorAll("button.btn-primary"));
                confirmBtn = allPrimary.length ? allPrimary[allPrimary.length - 1] : null;
              }
              if (confirmBtn) {
                confirmBtn.click();
              }
              await sleep(500);
            }
          };
          confirmLoop();
          const token = await TurnstileState.tokenPromise;
          await sleep(300);
          resolve(token);
        })();
        await Promise.race([solvePromise, timeoutPromise]);
      } catch (error) {
        console.error("[turnstile-token]: Auto-CAPTCHA process failed:", error);
        reject(error);
      }
    });
  }

  // src/js/core/captcha-handler.js
  async function handleCaptcha() {
    const startTime = performance.now();
    if (state.tokenSource === "manual") {
      console.log("\u{1F3AF} Manual token source selected - using pixel placement automation");
      return await handleCaptchaFallback();
    }
    try {
      const sitekey = await obtainSitekey();
      if (!sitekey) {
        throw new Error("No valid sitekey found");
      }
      console.log("\u{1F511} Generating Turnstile token for sitekey:", sitekey);
      if (!window.turnstile) {
        await loadTurnstile();
      }
      const token = await executeTurnstile(sitekey, "paint");
      if (!token || typeof token !== "string" || token.length < 20) {
        throw new Error(`Invalid token received: ${JSON.stringify(token)}`);
      }
      setTurnstileToken(token);
      if (token.length > 20) {
        const duration = Math.round(performance.now() - startTime);
        console.log(`\u2705 Turnstile token generated successfully in ${duration}ms`);
        return token;
      } else {
        throw new Error(
          `Invalid or empty token received - Type: ${typeof token}, Value: ${JSON.stringify(
            token
          )}, Length: ${token?.length || 0}`
        );
      }
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      console.error(`\u274C Turnstile token generation failed after ${duration}ms:`, error);
      if (state.tokenSource === "hybrid") {
        console.log(
          "\u{1F504} Hybrid mode: Generator failed, automatically switching to manual pixel placement..."
        );
        return await handleCaptchaFallback();
      } else {
        throw error;
      }
    }
  }

  // src/js/security/wasm-token.js
  var MESSAGE_ID = "pawtect-proxy-" + Math.random().toString(36).slice(2, 11);
  function getMainWorldCode() {
    return function mainWorldCode(messageId) {
      if (window.__pawtect_injected) return;
      window.__pawtect_injected = true;
      let pawtectModuleUrl = null;
      let wasmModule = null;
      async function findTokenModule(str) {
        try {
          const links = Array.from(
            document.querySelectorAll('link[rel="modulepreload"][href$=".js"]')
          );
          for (const link of links) {
            try {
              const url = new URL(link.getAttribute("href"), location.origin).href;
              const code = await fetch(url, { credentials: "omit" }).then((r) => r.text());
              if (code.includes(str)) {
                pawtectModuleUrl = url;
                return url;
              }
            } catch (error) {
              console.warn(`[WPlace-AutoBOT]: \u26A0\uFE0F Failed to check script:`, error.message);
            }
          }
          console.error("[wasm-token]: \u274C Could not find Pawtect module");
          return null;
        } catch (error) {
          console.error("[wasm-token]: \u{1F6D1} Error finding Pawtect module:", error);
          return null;
        }
      }
      async function loadWasmModule() {
        if (wasmModule) return wasmModule;
        const moduleUrl = await findTokenModule("pawtect_wasm_bg.wasm");
        if (!moduleUrl) {
          throw new Error("pawtect module URL not found");
        }
        const mod = await import(moduleUrl);
        if (!mod || typeof mod._ !== "function") {
          throw new Error("Invalid pawtect module structure");
        }
        const wasm = await mod._();
        wasmModule = { mod, wasm };
        return wasmModule;
      }
      async function computePawtect(payload) {
        try {
          const { url, bodyStr } = payload;
          const { mod, wasm } = await loadWasmModule();
          try {
            const me = await fetch("https://backend.wplace.live/me", { credentials: "include" }).then(
              (r) => r.ok ? r.json() : null
            );
            if (me?.id && typeof mod.p === "function") {
              try {
                mod.p(me.id);
              } catch (userIdError) {
                console.log("[wasm-token]: \u26A0\uFE0F Error setting user ID:", userIdError.message);
              }
            }
          } catch (error) {
            console.warn("[wasm-token]: \u26A0\uFE0F Failed to set user ID:", error.message);
          }
          try {
            if (typeof mod.r === "function") {
              mod.r(url);
            }
          } catch (urlError) {
            console.log("[wasm-token]: \u26A0\uFE0F Error setting request URL:", urlError.message);
          }
          const enc = new TextEncoder();
          const dec = new TextDecoder();
          const bytes = enc.encode(bodyStr);
          let inPtr;
          try {
            if (!wasm.__wbindgen_malloc) {
              throw new Error("__wbindgen_malloc function not found");
            }
            inPtr = wasm.__wbindgen_malloc(bytes.length, 1);
            const wasmBuffer = new Uint8Array(wasm.memory.buffer, inPtr, bytes.length);
            wasmBuffer.set(bytes);
          } catch (memError) {
            console.error("[wasm-token]: \u274C Memory allocation error:", memError);
            throw memError;
          }
          let token = null;
          let outPtr, outLen;
          try {
            const result = wasm.get_pawtected_endpoint_payload(inPtr, bytes.length);
            if (Array.isArray(result) && result.length === 2) {
              [outPtr, outLen] = result;
              const outputBuffer = new Uint8Array(wasm.memory.buffer, outPtr, outLen);
              token = dec.decode(outputBuffer);
            } else {
              throw new Error("Unexpected result format from WASM");
            }
          } catch (funcError) {
            console.error("[wasm-token]: \u274C Function call error:", funcError);
            throw funcError;
          } finally {
            try {
              if (wasm.__wbindgen_free) {
                if (outPtr && outLen) {
                  wasm.__wbindgen_free(outPtr, outLen, 1);
                }
              } else {
                console.log("[wasm-token]: \u26A0\uFE0F Cleanup warning: __wbindgen_free function not found");
              }
            } catch (cleanupError) {
              console.log("[wasm-token]: \u26A0\uFE0F Cleanup warning:", cleanupError.message);
            }
          }
          if (token) {
            let displayToken = token;
            if (token.length > 64) {
              const prefix = token.substring(0, 20);
              const suffix = token.substring(token.length - 12);
              const middleHash = Array.from(
                { length: 8 },
                (_, i) => token[Math.floor(
                  prefix.length + i * (token.length - prefix.length - suffix.length) / 7
                )]
              ).join("");
              displayToken = `${prefix}...${middleHash}...${suffix}`;
            }
            console.log(`[wasm-token]: \u{1F511} Full token: ${displayToken}, \u{1F50D} Length: ${token.length}`);
          }
          return token;
        } catch (error) {
          console.error("[wasm-token]: \u{1F6D1} pawtect computation failed:", error);
          throw error;
        }
      }
      window.addEventListener("message", async (event) => {
        if (event.data && event.data.source === messageId && event.data.action === "compute-pawtect") {
          try {
            const token = await computePawtect(event.data.payload);
            window.postMessage(
              {
                source: messageId,
                action: "pawtect-result",
                token
              },
              "*"
            );
          } catch (error) {
            window.postMessage(
              {
                source: messageId,
                action: "pawtect-error",
                error: error.message
              },
              "*"
            );
          }
        }
      });
      window.postMessage(
        {
          source: messageId,
          action: "request-ready"
        },
        "*"
      );
    };
  }
  function injectIntoMainWorld() {
    if (window.__pawtect_injector_installed) return;
    window.__pawtect_injector_installed = true;
    const mainWorldFunction = getMainWorldCode();
    const functionString = mainWorldFunction.toString();
    const script = document.createElement("script");
    script.textContent = `
    (function() {
      try {
        const mainWorldCode = ${functionString};
        mainWorldCode('${MESSAGE_ID}');
      } catch (error) {
        console.error('[wasm-token] Failed to initialize main world code:', error);
      }
    })();
  `;
    document.documentElement.appendChild(script);
    script.remove();
  }
  function initPawtect() {
    if (!window.__pawtect_store) {
      window.__pawtect_store = {
        ready: false,
        pendingRequests: [],
        error: null
      };
    }
    window.addEventListener("message", (event) => {
      if (event.data && event.data.source === MESSAGE_ID) {
        if (event.data.action === "pawtect-result") {
          const store = window.__pawtect_store;
          while (store.pendingRequests.length > 0) {
            const resolve = store.pendingRequests.shift();
            resolve(event.data.token);
          }
        } else if (event.data.action === "pawtect-error") {
          const store = window.__pawtect_store;
          while (store.pendingRequests.length > 0) {
            const reject = store.pendingRequests.shift();
            reject(new Error(event.data.error));
          }
          store.error = new Error(event.data.error);
          console.error("[wasm-token] Pawtect error:", event.data.error);
        } else if (event.data.action === "request-ready") {
          window.__pawtect_store.ready = true;
        }
      }
    });
    injectIntoMainWorld();
  }
  async function computePawtectToken(url, bodyStr) {
    return new Promise((resolve, reject) => {
      const store = window.__pawtect_store;
      if (store.error) {
        reject(store.error);
        return;
      }
      store.pendingRequests.push(resolve);
      store.pendingRequests.push(reject);
      window.postMessage(
        {
          source: MESSAGE_ID,
          action: "compute-pawtect",
          payload: { url, bodyStr }
        },
        "*"
      );
      setTimeout(() => {
        const resolveIndex = store.pendingRequests.indexOf(resolve);
        if (resolveIndex !== -1) {
          store.pendingRequests.splice(resolveIndex, 1);
          store.pendingRequests.splice(store.pendingRequests.indexOf(reject), 1);
          reject(new Error("Pawtect computation timeout"));
        }
      }, 1e4);
    });
  }

  // src/js/lib/fingerprint.js
  function getFingerprintJSCode() {
    return `var FingerprintJS=function(n){"use strict";var e=function(){return e=Object.assign||function(n){for(var e,t=1,r=arguments.length;t<r;t++)for(var o in e=arguments[t])Object.prototype.hasOwnProperty.call(e,o)&&(n[o]=e[o]);return n},e.apply(this,arguments)};function t(n,e,t,r){return new(t||(t=Promise))((function(o,i){function a(n){try{u(r.next(n))}catch(e){i(e)}}function c(n){try{u(r.throw(n))}catch(e){i(e)}}function u(n){var e;n.done?o(n.value):(e=n.value,e instanceof t?e:new t((function(n){n(e)}))).then(a,c)}u((r=r.apply(n,e||[])).next())}))}function r(n,e){var t,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function c(c){return function(u){return function(c){if(t)throw new TypeError("Generator is already executing.");for(;i&&(i=0,c[0]&&(a=0)),a;)try{if(t=1,r&&(o=2&c[0]?r.return:c[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,c[1])).done)return o;switch(r=0,o&&(c=[2&c[0],o.value]),c[0]){case 0:case 1:o=c;break;case 4:return a.label++,{value:c[1],done:!1};case 5:a.label++,r=c[1],c=[0];continue;case 7:c=a.ops.pop(),a.trys.pop();continue;default:if(!(o=a.trys,(o=o.length>0&&o[o.length-1])||6!==c[0]&&2!==c[0])){a=0;continue}if(3===c[0]&&(!o||c[1]>o[0]&&c[1]<o[3])){a.label=c[1];break}if(6===c[0]&&a.label<o[1]){a.label=o[1],o=c;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(c);break}o[2]&&a.ops.pop(),a.trys.pop();continue}c=e.call(n,a)}catch(u){c=[6,u],r=0}finally{t=o=0}if(5&c[0])throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}([c,u])}}}function o(n,e,t){if(t||2===arguments.length)for(var r,o=0,i=e.length;o<i;o++)!r&&o in e||(r||(r=Array.prototype.slice.call(e,0,o)),r[o]=e[o]);return n.concat(r||Array.prototype.slice.call(e))}function i(n,e){return new Promise((function(t){return setTimeout(t,n,e)}))}function a(n){return!!n&&"function"==typeof n.then}function c(n,e){try{var t=n();a(t)?t.then((function(n){return e(!0,n)}),(function(n){return e(!1,n)})):e(!0,t)}catch(r){e(!1,r)}}function u(n,e,o){return void 0===o&&(o=16),t(this,void 0,void 0,(function(){var t,i,a,c;return r(this,(function(r){switch(r.label){case 0:t=Array(n.length),i=Date.now(),a=0,r.label=1;case 1:return a<n.length?(t[a]=e(n[a],a),(c=Date.now())>=i+o?(i=c,[4,new Promise((function(n){var e=new MessageChannel;e.port1.onmessage=function(){return n()},e.port2.postMessage(null)}))]):[3,3]):[3,4];case 2:r.sent(),r.label=3;case 3:return++a,[3,1];case 4:return[2,t]}}))}))}function l(n){return n.then(void 0,(function(){})),n}function s(n){return parseInt(n)}function d(n){return parseFloat(n)}function f(n,e){return"number"==typeof n&&isNaN(n)?e:n}function m(n){return n.reduce((function(n,e){return n+(e?1:0)}),0)}function v(n,e){if(void 0===e&&(e=1),Math.abs(e)>=1)return Math.round(n/e)*e;var t=1/e;return Math.round(n*t)/t}function h(n,e){var t=n[0]>>>16,r=65535&n[0],o=n[1]>>>16,i=65535&n[1],a=e[0]>>>16,c=65535&e[0],u=e[1]>>>16,l=0,s=0,d=0,f=0;d+=(f+=i+(65535&e[1]))>>>16,f&=65535,s+=(d+=o+u)>>>16,d&=65535,l+=(s+=r+c)>>>16,s&=65535,l+=t+a,l&=65535,n[0]=l<<16|s,n[1]=d<<16|f}function p(n,e){var t=n[0]>>>16,r=65535&n[0],o=n[1]>>>16,i=65535&n[1],a=e[0]>>>16,c=65535&e[0],u=e[1]>>>16,l=65535&e[1],s=0,d=0,f=0,m=0;f+=(m+=i*l)>>>16,m&=65535,d+=(f+=o*l)>>>16,f&=65535,d+=(f+=i*u)>>>16,f&=65535,s+=(d+=r*l)>>>16,d&=65535,s+=(d+=o*u)>>>16,d&=65535,s+=(d+=i*c)>>>16,d&=65535,s+=t*l+r*u+o*c+i*a,s&=65535,n[0]=s<<16|d,n[1]=f<<16|m}function b(n,e){var t=n[0];32===(e%=64)?(n[0]=n[1],n[1]=t):e<32?(n[0]=t<<e|n[1]>>>32-e,n[1]=n[1]<<e|t>>>32-e):(e-=32,n[0]=n[1]<<e|t>>>32-e,n[1]=t<<e|n[1]>>>32-e)}function y(n,e){0!==(e%=64)&&(e<32?(n[0]=n[1]>>>32-e,n[1]=n[1]<<e):(n[0]=n[1]<<e-32,n[1]=0))}function g(n,e){n[0]^=e[0],n[1]^=e[1]}var w=[4283543511,3981806797],L=[3301882366,444984403];function k(n){var e=[0,n[0]>>>1];g(n,e),p(n,w),e[1]=n[0]>>>1,g(n,e),p(n,L),e[1]=n[0]>>>1,g(n,e)}var V=[2277735313,289559509],S=[1291169091,658871167],W=[0,5],x=[0,1390208809],Z=[0,944331445];function M(n,e){var t=function(n){for(var e=new Uint8Array(n.length),t=0;t<n.length;t++){var r=n.charCodeAt(t);if(r>127)return(new TextEncoder).encode(n);e[t]=r}return e}(n);e=e||0;var r,o=[0,t.length],i=o[1]%16,a=o[1]-i,c=[0,e],u=[0,e],l=[0,0],s=[0,0];for(r=0;r<a;r+=16)l[0]=t[r+4]|t[r+5]<<8|t[r+6]<<16|t[r+7]<<24,l[1]=t[r]|t[r+1]<<8|t[r+2]<<16|t[r+3]<<24,s[0]=t[r+12]|t[r+13]<<8|t[r+14]<<16|t[r+15]<<24,s[1]=t[r+8]|t[r+9]<<8|t[r+10]<<16|t[r+11]<<24,p(l,V),b(l,31),p(l,S),g(c,l),b(c,27),h(c,u),p(c,W),h(c,x),p(s,S),b(s,33),p(s,V),g(u,s),b(u,31),h(u,c),p(u,W),h(u,Z);l[0]=0,l[1]=0,s[0]=0,s[1]=0;var d=[0,0];switch(i){case 15:d[1]=t[r+14],y(d,48),g(s,d);case 14:d[1]=t[r+13],y(d,40),g(s,d);case 13:d[1]=t[r+12],y(d,32),g(s,d);case 12:d[1]=t[r+11],y(d,24),g(s,d);case 11:d[1]=t[r+10],y(d,16),g(s,d);case 10:d[1]=t[r+9],y(d,8),g(s,d);case 9:d[1]=t[r+8],g(s,d),p(s,S),b(s,33),p(s,V),g(u,s);case 8:d[1]=t[r+7],y(d,56),g(l,d);case 7:d[1]=t[r+6],y(d,48),g(l,d);case 6:d[1]=t[r+5],y(d,40),g(l,d);case 5:d[1]=t[r+4],y(d,32),g(l,d);case 4:d[1]=t[r+3],y(d,24),g(l,d);case 3:d[1]=t[r+2],y(d,16),g(l,d);case 2:d[1]=t[r+1],y(d,8),g(l,d);case 1:d[1]=t[r],g(l,d),p(l,V),b(l,31),p(l,S),g(c,l)}return g(c,o),g(u,o),h(c,u),h(u,c),k(c),k(u),h(c,u),h(u,c),("00000000"+(c[0]>>>0).toString(16)).slice(-8)+("00000000"+(c[1]>>>0).toString(16)).slice(-8)+("00000000"+(u[0]>>>0).toString(16)).slice(-8)+("00000000"+(u[1]>>>0).toString(16)).slice(-8)}function R(n){return"function"!=typeof n}function F(n,e,o,i){var a=Object.keys(n).filter((function(n){return!function(n,e){for(var t=0,r=n.length;t<r;++t)if(n[t]===e)return!0;return!1}(o,n)})),s=l(u(a,(function(t){return function(n,e){var t=l(new Promise((function(t){var r=Date.now();c(n.bind(null,e),(function(){for(var n=[],e=0;e<arguments.length;e++)n[e]=arguments[e];var o=Date.now()-r;if(!n[0])return t((function(){return{error:n[1],duration:o}}));var i=n[1];if(R(i))return t((function(){return{value:i,duration:o}}));t((function(){return new Promise((function(n){var e=Date.now();c(i,(function(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];var i=o+Date.now()-e;if(!t[0])return n({error:t[1],duration:i});n({value:t[1],duration:i})}))}))}))}))})));return function(){return t.then((function(n){return n()}))}}(n[t],e)}),i));return function(){return t(this,void 0,void 0,(function(){var n,e,t,o;return r(this,(function(r){switch(r.label){case 0:return[4,s];case 1:return[4,u(r.sent(),(function(n){return l(n())}),i)];case 2:return n=r.sent(),[4,Promise.all(n)];case 3:for(e=r.sent(),t={},o=0;o<a.length;++o)t[a[o]]=e[o];return[2,t]}}))}))}}function G(){var n=window,e=navigator;return m(["MSCSSMatrix"in n,"msSetImmediate"in n,"msIndexedDB"in n,"msMaxTouchPoints"in e,"msPointerEnabled"in e])>=4}function I(){var n=window,e=navigator;return m(["msWriteProfilerMark"in n,"MSStream"in n,"msLaunchUri"in e,"msSaveBlob"in e])>=3&&!G()}function Y(){var n=window,e=navigator;return m(["webkitPersistentStorage"in e,"webkitTemporaryStorage"in e,0===(e.vendor||"").indexOf("Google"),"webkitResolveLocalFileSystemURL"in n,"BatteryManager"in n,"webkitMediaStream"in n,"webkitSpeechGrammar"in n])>=5}function C(){var n=window;return m(["ApplePayError"in n,"CSSPrimitiveValue"in n,"Counter"in n,0===navigator.vendor.indexOf("Apple"),"RGBColor"in n,"WebKitMediaKeys"in n])>=4}function j(){var n=window,e=n.HTMLElement,t=n.Document;return m(["safari"in n,!("ongestureend"in n),!("TouchEvent"in n),!("orientation"in n),e&&!("autocapitalize"in e.prototype),t&&"pointerLockElement"in t.prototype])>=4}function X(){var n,e=window;return n=e.print,/^function\\s.*?\\{\\s*\\[native code]\\s*}$/.test(String(n))&&"[object WebPageNamespace]"===String(e.browser)}function P(){var n,e,t=window;return m(["buildID"in navigator,"MozAppearance"in(null!==(e=null===(n=document.documentElement)||void 0===n?void 0:n.style)&&void 0!==e?e:{}),"onmozfullscreenchange"in t,"mozInnerScreenX"in t,"CSSMozDocumentRule"in t,"CanvasCaptureMediaStream"in t])>=4}function E(){var n=window,e=navigator,t=n.CSS,r=n.HTMLButtonElement;return m([!("getStorageUpdates"in e),r&&"popover"in r.prototype,"CSSCounterStyleRule"in n,t.supports("font-size-adjust: ex-height 0.5"),t.supports("text-transform: full-width")])>=4}function H(){var n=document;return n.fullscreenElement||n.msFullscreenElement||n.mozFullScreenElement||n.webkitFullscreenElement||null}function A(){var n=Y(),e=P(),t=window,r=navigator,o="connection";return n?m([!("SharedWorker"in t),r[o]&&"ontypechange"in r[o],!("sinkId"in new Audio)])>=2:!!e&&m(["onorientationchange"in t,"orientation"in t,/android/i.test(r.appVersion)])>=2}function N(){var n=navigator,e=window,t=Audio.prototype,r=e.visualViewport;return m(["srLatency"in t,"srChannelCount"in t,"devicePosture"in n,r&&"segments"in r,"getTextInformation"in Image.prototype])>=3}function J(){var n=window,e=n.OfflineAudioContext||n.webkitOfflineAudioContext;if(!e)return-2;if(C()&&!j()&&!function(){var n=window;return m(["DOMRectList"in n,"RTCPeerConnectionIceEvent"in n,"SVGGeometryElement"in n,"ontransitioncancel"in n])>=3}())return-1;var t=new e(1,5e3,44100),r=t.createOscillator();r.type="triangle",r.frequency.value=1e4;var o=t.createDynamicsCompressor();o.threshold.value=-50,o.knee.value=40,o.ratio.value=12,o.attack.value=0,o.release.value=.25,r.connect(o),o.connect(t.destination),r.start(0);var i=function(n){var e=3,t=500,r=500,o=5e3,i=function(){};return[new Promise((function(c,u){var s=!1,d=0,f=0;n.oncomplete=function(n){return c(n.renderedBuffer)};var m=function(){setTimeout((function(){return u(T("timeout"))}),Math.min(r,f+o-Date.now()))},v=function(){try{var r=n.startRendering();switch(a(r)&&l(r),n.state){case"running":f=Date.now(),s&&m();break;case"suspended":document.hidden||d++,s&&d>=e?u(T("suspended")):setTimeout(v,t)}}catch(o){u(o)}};v(),i=function(){s||(s=!0,f>0&&m())}})),i]}(t),c=i[0],u=i[1],s=l(c.then((function(n){return function(n){for(var e=0,t=0;t<n.length;++t)e+=Math.abs(n[t]);return e}(n.getChannelData(0).subarray(4500))}),(function(n){if("timeout"===n.name||"suspended"===n.name)return-3;throw n})));return function(){return u(),s}}function T(n){var e=new Error(n);return e.name=n,e}function D(n,e,o){var a,c,u;return void 0===o&&(o=50),t(this,void 0,void 0,(function(){var t,l;return r(this,(function(r){switch(r.label){case 0:t=document,r.label=1;case 1:return t.body?[3,3]:[4,i(o)];case 2:return r.sent(),[3,1];case 3:l=t.createElement("iframe"),r.label=4;case 4:return r.trys.push([4,,10,11]),[4,new Promise((function(n,r){var o=!1,i=function(){o=!0,n()};l.onload=i,l.onerror=function(n){o=!0,r(n)};var a=l.style;a.setProperty("display","block","important"),a.position="absolute",a.top="0",a.left="0",a.visibility="hidden",e&&"srcdoc"in l?l.srcdoc=e:l.src="about:blank",t.body.appendChild(l);var c=function(){var n,e;o||("complete"===(null===(e=null===(n=l.contentWindow)||void 0===n?void 0:n.document)||void 0===e?void 0:e.readyState)?i():setTimeout(c,10))};c()}))];case 5:r.sent(),r.label=6;case 6:return(null===(c=null===(a=l.contentWindow)||void 0===a?void 0:a.document)||void 0===c?void 0:c.body)?[3,8]:[4,i(o)];case 7:return r.sent(),[3,6];case 8:return[4,n(l,l.contentWindow)];case 9:return[2,r.sent()];case 10:return null===(u=l.parentNode)||void 0===u||u.removeChild(l),[7];case 11:return[2]}}))}))}function _(n){for(var e=function(n){for(var e,t,r="Unexpected syntax '".concat(n,"'"),o=/^\\s*([a-z-]*)(.*)$/i.exec(n),i=o[1]||void 0,a={},c=/([.:#][\\w-]+|\\[.+?\\])/gi,u=function(n,e){a[n]=a[n]||[],a[n].push(e)};;){var l=c.exec(o[2]);if(!l)break;var s=l[0];switch(s[0]){case".":u("class",s.slice(1));break;case"#":u("id",s.slice(1));break;case"[":var d=/^\\[([\\w-]+)([~|^$*]?=("(.*?)"|([\\w-]+)))?(\\s+[is])?\\]$/.exec(s);if(!d)throw new Error(r);u(d[1],null!==(t=null!==(e=d[4])&&void 0!==e?e:d[5])&&void 0!==t?t:"");break;default:throw new Error(r)}}return[i,a]}(n),t=e[0],r=e[1],o=document.createElement(null!=t?t:"div"),i=0,a=Object.keys(r);i<a.length;i++){var c=a[i],u=r[c].join(" ");"style"===c?z(o.style,u):o.setAttribute(c,u)}return o}function z(n,e){for(var t=0,r=e.split(";");t<r.length;t++){var o=r[t],i=/^\\s*([\\w-]+)\\s*:\\s*(.+?)(\\s*!([\\w-]+))?\\s*$/.exec(o);if(i){var a=i[1],c=i[2],u=i[4];n.setProperty(a,c,u||"")}}}var B=["monospace","sans-serif","serif"],O=["sans-serif-thin","ARNO PRO","Agency FB","Arabic Typesetting","Arial Unicode MS","AvantGarde Bk BT","BankGothic Md BT","Batang","Bitstream Vera Sans Mono","Calibri","Century","Century Gothic","Clarendon","EUROSTILE","Franklin Gothic","Futura Bk BT","Futura Md BT","GOTHAM","Gill Sans","HELV","Haettenschweiler","Helvetica Neue","Humanst521 BT","Leelawadee","Letter Gothic","Levenim MT","Lucida Bright","Lucida Sans","Menlo","MS Mincho","MS Outlook","MS Reference Specialty","MS UI Gothic","MT Extra","MYRIAD PRO","Marlett","Meiryo UI","Microsoft Uighur","Minion Pro","Monotype Corsiva","PMingLiU","Pristina","SCRIPTINA","Segoe UI Light","Serifa","SimHei","Small Fonts","Staccato222 BT","TRAJAN PRO","Univers CE 55 Medium","Vrinda","ZWAdobeF"];function U(n){var e,t,r,o=!1,i=function(){var n=document.createElement("canvas");return n.width=1,n.height=1,[n,n.getContext("2d")]}(),a=i[0],c=i[1];return!function(n,e){return!(!e||!n.toDataURL)}(a,c)?t=r="unsupported":(o=function(n){return n.rect(0,0,10,10),n.rect(2,2,6,6),!n.isPointInPath(5,5,"evenodd")}(c),n?t=r="skipped":(e=function(n,e){!function(n,e){n.width=240,n.height=60,e.textBaseline="alphabetic",e.fillStyle="#f60",e.fillRect(100,1,62,20),e.fillStyle="#069",e.font='11pt "Times New Roman"';var t="Cwm fjordbank gly ".concat(String.fromCharCode(55357,56835));e.fillText(t,2,15),e.fillStyle="rgba(102, 204, 0, 0.2)",e.font="18pt Arial",e.fillText(t,4,45)}(n,e);var t=Q(n),r=Q(n);if(t!==r)return["unstable","unstable"];return function(n,e){n.width=122,n.height=110,e.globalCompositeOperation="multiply";for(var t=0,r=[["#f2f",40,40],["#2ff",80,40],["#ff2",60,80]];t<r.length;t++){var o=r[t],i=o[0],a=o[1],c=o[2];e.fillStyle=i,e.beginPath(),e.arc(a,c,40,0,2*Math.PI,!0),e.closePath(),e.fill()}e.fillStyle="#f9c",e.arc(60,60,60,0,2*Math.PI,!0),e.arc(60,60,20,0,2*Math.PI,!0),e.fill("evenodd")}(n,e),[Q(n),t]}(a,c),t=e[0],r=e[1])),{winding:o,geometry:t,text:r}}function Q(n){return n.toDataURL()}function K(){var n=screen,e=function(n){return f(s(n),null)},t=[e(n.width),e(n.height)];return t.sort().reverse(),t}var q,$;function nn(){var n=this;return function(){if(void 0===$){var n=function(){var e=en();tn(e)?$=setTimeout(n,2500):(q=e,$=void 0)};n()}}(),function(){return t(n,void 0,void 0,(function(){var n;return r(this,(function(e){switch(e.label){case 0:return tn(n=en())?q?[2,o([],q,!0)]:H()?[4,(t=document,(t.exitFullscreen||t.msExitFullscreen||t.mozCancelFullScreen||t.webkitExitFullscreen).call(t))]:[3,2]:[3,2];case 1:e.sent(),n=en(),e.label=2;case 2:return tn(n)||(q=n),[2,n]}var t}))}))}}function en(){var n=screen;return[f(d(n.availTop),null),f(d(n.width)-d(n.availWidth)-f(d(n.availLeft),0),null),f(d(n.height)-d(n.availHeight)-f(d(n.availTop),0),null),f(d(n.availLeft),null)]}function tn(n){for(var e=0;e<4;++e)if(n[e])return!1;return!0}function rn(n){var e;return t(this,void 0,void 0,(function(){var t,o,a,c,u,l,s;return r(this,(function(r){switch(r.label){case 0:for(t=document,o=t.createElement("div"),a=new Array(n.length),c={},on(o),s=0;s<n.length;++s)"DIALOG"===(u=_(n[s])).tagName&&u.show(),on(l=t.createElement("div")),l.appendChild(u),o.appendChild(l),a[s]=u;r.label=1;case 1:return t.body?[3,3]:[4,i(50)];case 2:return r.sent(),[3,1];case 3:t.body.appendChild(o);try{for(s=0;s<n.length;++s)a[s].offsetParent||(c[n[s]]=!0)}finally{null===(e=o.parentNode)||void 0===e||e.removeChild(o)}return[2,c]}}))}))}function on(n){n.style.setProperty("visibility","hidden","important"),n.style.setProperty("display","block","important")}function an(n){return matchMedia("(inverted-colors: ".concat(n,")")).matches}function cn(n){return matchMedia("(forced-colors: ".concat(n,")")).matches}function un(n){return matchMedia("(prefers-contrast: ".concat(n,")")).matches}function ln(n){return matchMedia("(prefers-reduced-motion: ".concat(n,")")).matches}function sn(n){return matchMedia("(prefers-reduced-transparency: ".concat(n,")")).matches}function dn(n){return matchMedia("(dynamic-range: ".concat(n,")")).matches}var fn=Math,mn=function(){return 0};var vn={default:[],apple:[{font:"-apple-system-body"}],serif:[{fontFamily:"serif"}],sans:[{fontFamily:"sans-serif"}],mono:[{fontFamily:"monospace"}],min:[{fontSize:"1px"}],system:[{fontFamily:"system-ui"}]};var hn=function(){for(var n=window;;){var e=n.parent;if(!e||e===n)return!1;try{if(e.location.origin!==n.location.origin)return!0}catch(t){if(t instanceof Error&&"SecurityError"===t.name)return!0;throw t}n=e}};var pn=new Set([10752,2849,2884,2885,2886,2928,2929,2930,2931,2932,2960,2961,2962,2963,2964,2965,2966,2967,2968,2978,3024,3042,3088,3089,3106,3107,32773,32777,32777,32823,32824,32936,32937,32938,32939,32968,32969,32970,32971,3317,33170,3333,3379,3386,33901,33902,34016,34024,34076,3408,3410,3411,3412,3413,3414,3415,34467,34816,34817,34818,34819,34877,34921,34930,35660,35661,35724,35738,35739,36003,36004,36005,36347,36348,36349,37440,37441,37443,7936,7937,7938]),bn=new Set([34047,35723,36063,34852,34853,34854,34229,36392,36795,38449]),yn=["FRAGMENT_SHADER","VERTEX_SHADER"],gn=["LOW_FLOAT","MEDIUM_FLOAT","HIGH_FLOAT","LOW_INT","MEDIUM_INT","HIGH_INT"],wn="WEBGL_debug_renderer_info";function Ln(n){if(n.webgl)return n.webgl.context;var e,t=document.createElement("canvas");t.addEventListener("webglCreateContextError",(function(){return e=void 0}));for(var r=0,o=["webgl","experimental-webgl"];r<o.length;r++){var i=o[r];try{e=t.getContext(i)}catch(a){}if(e)break}return n.webgl={context:e},e}function kn(n,e,t){var r=n.getShaderPrecisionFormat(n[e],n[t]);return r?[r.rangeMin,r.rangeMax,r.precision]:[]}function Vn(n){return Object.keys(n.__proto__).filter(Sn)}function Sn(n){return"string"==typeof n&&!n.match(/[^A-Z0-9_x]/)}function Wn(){return P()}function xn(n){return"function"==typeof n.getParameter}var Zn={fonts:function(){var n=this;return D((function(e,o){var i=o.document;return t(n,void 0,void 0,(function(){var n,e,t,o,a,c,u,l,s,d,f;return r(this,(function(r){for((n=i.body).style.fontSize="48px",(e=i.createElement("div")).style.setProperty("visibility","hidden","important"),t={},o={},a=function(n){var t=i.createElement("span"),r=t.style;return r.position="absolute",r.top="0",r.left="0",r.fontFamily=n,t.textContent="mmMwWLliI0O&1",e.appendChild(t),t},c=function(n,e){return a("'".concat(n,"',").concat(e))},u=function(){for(var n={},e=function(e){n[e]=B.map((function(n){return c(e,n)}))},t=0,r=O;t<r.length;t++){e(r[t])}return n},l=function(n){return B.some((function(e,r){return n[r].offsetWidth!==t[e]||n[r].offsetHeight!==o[e]}))},s=function(){return B.map(a)}(),d=u(),n.appendChild(e),f=0;f<B.length;f++)t[B[f]]=s[f].offsetWidth,o[B[f]]=s[f].offsetHeight;return[2,O.filter((function(n){return l(d[n])}))]}))}))}))},domBlockers:function(n){var e=(void 0===n?{}:n).debug;return t(this,void 0,void 0,(function(){var n,t,o,i,a;return r(this,(function(r){switch(r.label){case 0:return C()||A()?(c=atob,n={abpIndo:["#Iklan-Melayang","#Kolom-Iklan-728","#SidebarIklan-wrapper",'[title="ALIENBOLA" i]',c("I0JveC1CYW5uZXItYWRz")],abpvn:[".quangcao","#mobileCatfish",c("LmNsb3NlLWFkcw=="),'[id^="bn_bottom_fixed_"]',"#pmadv"],adBlockFinland:[".mainostila",c("LnNwb25zb3JpdA=="),".ylamainos",c("YVtocmVmKj0iL2NsaWNrdGhyZ2guYXNwPyJd"),c("YVtocmVmXj0iaHR0cHM6Ly9hcHAucmVhZHBlYWsuY29tL2FkcyJd")],adBlockPersian:["#navbar_notice_50",".kadr",'TABLE[width="140px"]',"#divAgahi",c("YVtocmVmXj0iaHR0cDovL2cxLnYuZndtcm0ubmV0L2FkLyJd")],adBlockWarningRemoval:["#adblock-honeypot",".adblocker-root",".wp_adblock_detect",c("LmhlYWRlci1ibG9ja2VkLWFk"),c("I2FkX2Jsb2NrZXI=")],adGuardAnnoyances:[".hs-sosyal","#cookieconsentdiv",'div[class^="app_gdpr"]',".as-oil",'[data-cypress="soft-push-notification-modal"]'],adGuardBase:[".BetterJsPopOverlay",c("I2FkXzMwMFgyNTA="),c("I2Jhbm5lcmZsb2F0MjI="),c("I2NhbXBhaWduLWJhbm5lcg=="),c("I0FkLUNvbnRlbnQ=")],adGuardChinese:[c("LlppX2FkX2FfSA=="),c("YVtocmVmKj0iLmh0aGJldDM0LmNvbSJd"),"#widget-quan",c("YVtocmVmKj0iLzg0OTkyMDIwLnh5eiJd"),c("YVtocmVmKj0iLjE5NTZobC5jb20vIl0=")],adGuardFrench:["#pavePub",c("LmFkLWRlc2t0b3AtcmVjdGFuZ2xl"),".mobile_adhesion",".widgetadv",c("LmFkc19iYW4=")],adGuardGerman:['aside[data-portal-id="leaderboard"]'],adGuardJapanese:["#kauli_yad_1",c("YVtocmVmXj0iaHR0cDovL2FkMi50cmFmZmljZ2F0ZS5uZXQvIl0="),c("Ll9wb3BJbl9pbmZpbml0ZV9hZA=="),c("LmFkZ29vZ2xl"),c("Ll9faXNib29zdFJldHVybkFk")],adGuardMobile:[c("YW1wLWF1dG8tYWRz"),c("LmFtcF9hZA=="),'amp-embed[type="24smi"]',"#mgid_iframe1",c("I2FkX2ludmlld19hcmVh")],adGuardRussian:[c("YVtocmVmXj0iaHR0cHM6Ly9hZC5sZXRtZWFkcy5jb20vIl0="),c("LnJlY2xhbWE="),'div[id^="smi2adblock"]',c("ZGl2W2lkXj0iQWRGb3hfYmFubmVyXyJd"),"#psyduckpockeball"],adGuardSocial:[c("YVtocmVmXj0iLy93d3cuc3R1bWJsZXVwb24uY29tL3N1Ym1pdD91cmw9Il0="),c("YVtocmVmXj0iLy90ZWxlZ3JhbS5tZS9zaGFyZS91cmw/Il0="),".etsy-tweet","#inlineShare",".popup-social"],adGuardSpanishPortuguese:["#barraPublicidade","#Publicidade","#publiEspecial","#queTooltip",".cnt-publi"],adGuardTrackingProtection:["#qoo-counter",c("YVtocmVmXj0iaHR0cDovL2NsaWNrLmhvdGxvZy5ydS8iXQ=="),c("YVtocmVmXj0iaHR0cDovL2hpdGNvdW50ZXIucnUvdG9wL3N0YXQucGhwIl0="),c("YVtocmVmXj0iaHR0cDovL3RvcC5tYWlsLnJ1L2p1bXAiXQ=="),"#top100counter"],adGuardTurkish:["#backkapat",c("I3Jla2xhbWk="),c("YVtocmVmXj0iaHR0cDovL2Fkc2Vydi5vbnRlay5jb20udHIvIl0="),c("YVtocmVmXj0iaHR0cDovL2l6bGVuemkuY29tL2NhbXBhaWduLyJd"),c("YVtocmVmXj0iaHR0cDovL3d3dy5pbnN0YWxsYWRzLm5ldC8iXQ==")],bulgarian:[c("dGQjZnJlZW5ldF90YWJsZV9hZHM="),"#ea_intext_div",".lapni-pop-over","#xenium_hot_offers"],easyList:[".yb-floorad",c("LndpZGdldF9wb19hZHNfd2lkZ2V0"),c("LnRyYWZmaWNqdW5reS1hZA=="),".textad_headline",c("LnNwb25zb3JlZC10ZXh0LWxpbmtz")],easyListChina:[c("LmFwcGd1aWRlLXdyYXBbb25jbGljayo9ImJjZWJvcy5jb20iXQ=="),c("LmZyb250cGFnZUFkdk0="),"#taotaole","#aafoot.top_box",".cfa_popup"],easyListCookie:[".ezmob-footer",".cc-CookieWarning","[data-cookie-number]",c("LmF3LWNvb2tpZS1iYW5uZXI="),".sygnal24-gdpr-modal-wrap"],easyListCzechSlovak:["#onlajny-stickers",c("I3Jla2xhbW5pLWJveA=="),c("LnJla2xhbWEtbWVnYWJvYXJk"),".sklik",c("W2lkXj0ic2tsaWtSZWtsYW1hIl0=")],easyListDutch:[c("I2FkdmVydGVudGll"),c("I3ZpcEFkbWFya3RCYW5uZXJCbG9jaw=="),".adstekst",c("YVtocmVmXj0iaHR0cHM6Ly94bHR1YmUubmwvY2xpY2svIl0="),"#semilo-lrectangle"],easyListGermany:["#SSpotIMPopSlider",c("LnNwb25zb3JsaW5rZ3J1ZW4="),c("I3dlcmJ1bmdza3k="),c("I3Jla2xhbWUtcmVjaHRzLW1pdHRl"),c("YVtocmVmXj0iaHR0cHM6Ly9iZDc0Mi5jb20vIl0=")],easyListItaly:[c("LmJveF9hZHZfYW5udW5jaQ=="),".sb-box-pubbliredazionale",c("YVtocmVmXj0iaHR0cDovL2FmZmlsaWF6aW9uaWFkcy5zbmFpLml0LyJd"),c("YVtocmVmXj0iaHR0cHM6Ly9hZHNlcnZlci5odG1sLml0LyJd"),c("YVtocmVmXj0iaHR0cHM6Ly9hZmZpbGlhemlvbmlhZHMuc25haS5pdC8iXQ==")],easyListLithuania:[c("LnJla2xhbW9zX3RhcnBhcw=="),c("LnJla2xhbW9zX251b3JvZG9z"),c("aW1nW2FsdD0iUmVrbGFtaW5pcyBza3lkZWxpcyJd"),c("aW1nW2FsdD0iRGVkaWt1b3RpLmx0IHNlcnZlcmlhaSJd"),c("aW1nW2FsdD0iSG9zdGluZ2FzIFNlcnZlcmlhaS5sdCJd")],estonian:[c("QVtocmVmKj0iaHR0cDovL3BheTRyZXN1bHRzMjQuZXUiXQ==")],fanboyAnnoyances:["#ac-lre-player",".navigate-to-top","#subscribe_popup",".newsletter_holder","#back-top"],fanboyAntiFacebook:[".util-bar-module-firefly-visible"],fanboyEnhancedTrackers:[".open.pushModal","#issuem-leaky-paywall-articles-zero-remaining-nag","#sovrn_container",'div[class$="-hide"][zoompage-fontsize][style="display: block;"]',".BlockNag__Card"],fanboySocial:["#FollowUs","#meteored_share","#social_follow",".article-sharer",".community__social-desc"],frellwitSwedish:[c("YVtocmVmKj0iY2FzaW5vcHJvLnNlIl1bdGFyZ2V0PSJfYmxhbmsiXQ=="),c("YVtocmVmKj0iZG9rdG9yLXNlLm9uZWxpbmsubWUiXQ=="),"article.category-samarbete",c("ZGl2LmhvbGlkQWRz"),"ul.adsmodern"],greekAdBlock:[c("QVtocmVmKj0iYWRtYW4ub3RlbmV0LmdyL2NsaWNrPyJd"),c("QVtocmVmKj0iaHR0cDovL2F4aWFiYW5uZXJzLmV4b2R1cy5nci8iXQ=="),c("QVtocmVmKj0iaHR0cDovL2ludGVyYWN0aXZlLmZvcnRobmV0LmdyL2NsaWNrPyJd"),"DIV.agores300","TABLE.advright"],hungarian:["#cemp_doboz",".optimonk-iframe-container",c("LmFkX19tYWlu"),c("W2NsYXNzKj0iR29vZ2xlQWRzIl0="),"#hirdetesek_box"],iDontCareAboutCookies:['.alert-info[data-block-track*="CookieNotice"]',".ModuleTemplateCookieIndicator",".o--cookies--container","#cookies-policy-sticky","#stickyCookieBar"],icelandicAbp:[c("QVtocmVmXj0iL2ZyYW1ld29yay9yZXNvdXJjZXMvZm9ybXMvYWRzLmFzcHgiXQ==")],latvian:[c("YVtocmVmPSJodHRwOi8vd3d3LnNhbGlkemluaS5sdi8iXVtzdHlsZT0iZGlzcGxheTogYmxvY2s7IHdpZHRoOiAxMjBweDsgaGVpZ2h0OiA0MHB4OyBvdmVyZmxvdzogaGlkZGVuOyBwb3NpdGlvbjogcmVsYXRpdmU7Il0="),c("YVtocmVmPSJodHRwOi8vd3d3LnNhbGlkemluaS5sdi8iXVtzdHlsZT0iZGlzcGxheTogYmxvY2s7IHdpZHRoOiA4OHB4OyBoZWlnaHQ6IDMxcHg7IG92ZXJmbG93OiBoaWRkZW47IHBvc2l0aW9uOiByZWxhdGl2ZTsiXQ==")],listKr:[c("YVtocmVmKj0iLy9hZC5wbGFuYnBsdXMuY28ua3IvIl0="),c("I2xpdmVyZUFkV3JhcHBlcg=="),c("YVtocmVmKj0iLy9hZHYuaW1hZHJlcC5jby5rci8iXQ=="),c("aW5zLmZhc3R2aWV3LWFk"),".revenue_unit_item.dable"],listeAr:[c("LmdlbWluaUxCMUFk"),".right-and-left-sponsers",c("YVtocmVmKj0iLmFmbGFtLmluZm8iXQ=="),c("YVtocmVmKj0iYm9vcmFxLm9yZyJd"),c("YVtocmVmKj0iZHViaXp6bGUuY29tL2FyLz91dG1fc291cmNlPSJd")],listeFr:[c("YVtocmVmXj0iaHR0cDovL3Byb21vLnZhZG9yLmNvbS8iXQ=="),c("I2FkY29udGFpbmVyX3JlY2hlcmNoZQ=="),c("YVtocmVmKj0id2Vib3JhbWEuZnIvZmNnaS1iaW4vIl0="),".site-pub-interstitiel",'div[id^="crt-"][data-criteo-id]'],officialPolish:["#ceneo-placeholder-ceneo-12",c("W2hyZWZePSJodHRwczovL2FmZi5zZW5kaHViLnBsLyJd"),c("YVtocmVmXj0iaHR0cDovL2Fkdm1hbmFnZXIudGVjaGZ1bi5wbC9yZWRpcmVjdC8iXQ=="),c("YVtocmVmXj0iaHR0cDovL3d3dy50cml6ZXIucGwvP3V0bV9zb3VyY2UiXQ=="),c("ZGl2I3NrYXBpZWNfYWQ=")],ro:[c("YVtocmVmXj0iLy9hZmZ0cmsuYWx0ZXgucm8vQ291bnRlci9DbGljayJd"),c("YVtocmVmXj0iaHR0cHM6Ly9ibGFja2ZyaWRheXNhbGVzLnJvL3Ryay9zaG9wLyJd"),c("YVtocmVmXj0iaHR0cHM6Ly9ldmVudC4ycGVyZm9ybWFudC5jb20vZXZlbnRzL2NsaWNrIl0="),c("YVtocmVmXj0iaHR0cHM6Ly9sLnByb2ZpdHNoYXJlLnJvLyJd"),'a[href^="/url/"]'],ruAd:[c("YVtocmVmKj0iLy9mZWJyYXJlLnJ1LyJd"),c("YVtocmVmKj0iLy91dGltZy5ydS8iXQ=="),c("YVtocmVmKj0iOi8vY2hpa2lkaWtpLnJ1Il0="),"#pgeldiz",".yandex-rtb-block"],thaiAds:["a[href*=macau-uta-popup]",c("I2Fkcy1nb29nbGUtbWlkZGxlX3JlY3RhbmdsZS1ncm91cA=="),c("LmFkczMwMHM="),".bumq",".img-kosana"],webAnnoyancesUltralist:["#mod-social-share-2","#social-tools",c("LmN0cGwtZnVsbGJhbm5lcg=="),".zergnet-recommend",".yt.btn-link.btn-md.btn"]},t=Object.keys(n),[4,rn((a=[]).concat.apply(a,t.map((function(e){return n[e]}))))]):[2,void 0];case 1:return o=r.sent(),e&&function(n,e){for(var t="DOM blockers debug:\\n\`\`\`",r=0,o=Object.keys(n);r<o.length;r++){var i=o[r];t+="\\n".concat(i,":");for(var a=0,c=n[i];a<c.length;a++){var u=c[a];t+="\\n  ".concat(e[u]?"\u{1F6AB}":"\u27A1\uFE0F"," ").concat(u)}}console.log("".concat(t,"\\n\`\`\`"))}(n,o),(i=t.filter((function(e){var t=n[e];return m(t.map((function(n){return o[n]})))>.6*t.length}))).sort(),[2,i]}var c}))}))},fontPreferences:function(){return function(n,e){void 0===e&&(e=4e3);return D((function(t,r){var i=r.document,a=i.body,c=a.style;c.width="".concat(e,"px"),c.webkitTextSizeAdjust=c.textSizeAdjust="none",Y()?a.style.zoom="".concat(1/r.devicePixelRatio):C()&&(a.style.zoom="reset");var u=i.createElement("div");return u.textContent=o([],Array(e/20<<0),!0).map((function(){return"word"})).join(" "),a.appendChild(u),n(i,a)}),'<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">')}((function(n,e){for(var t={},r={},o=0,i=Object.keys(vn);o<i.length;o++){var a=i[o],c=vn[a],u=c[0],l=void 0===u?{}:u,s=c[1],d=void 0===s?"mmMwWLliI0fiflO&1":s,f=n.createElement("span");f.textContent=d,f.style.whiteSpace="nowrap";for(var m=0,v=Object.keys(l);m<v.length;m++){var h=v[m],p=l[h];void 0!==p&&(f.style[h]=p)}t[a]=f,e.append(n.createElement("br"),f)}for(var b=0,y=Object.keys(vn);b<y.length;b++){r[a=y[b]]=t[a].getBoundingClientRect().width}return r}))},audio:function(){return C()&&E()&&X()||Y()&&N()&&(n=window,e=n.URLPattern,m(["union"in Set.prototype,"Iterator"in n,e&&"hasRegExpGroups"in e.prototype,"RGB8"in WebGLRenderingContext.prototype])>=3)?-4:J();var n,e},screenFrame:function(){var n=this;if(C()&&E()&&X())return function(){return Promise.resolve(void 0)};var e=nn();return function(){return t(n,void 0,void 0,(function(){var n,t;return r(this,(function(r){switch(r.label){case 0:return[4,e()];case 1:return n=r.sent(),[2,[(t=function(n){return null===n?null:v(n,10)})(n[0]),t(n[1]),t(n[2]),t(n[3])]]}}))}))}},canvas:function(){return U(C()&&E()&&X())},osCpu:function(){return navigator.oscpu},languages:function(){var n,e=navigator,t=[],r=e.language||e.userLanguage||e.browserLanguage||e.systemLanguage;if(void 0!==r&&t.push([r]),Array.isArray(e.languages))Y()&&m([!("MediaSettingsRange"in(n=window)),"RTCEncodedAudioFrame"in n,""+n.Intl=="[object Intl]",""+n.Reflect=="[object Reflect]"])>=3||t.push(e.languages);else if("string"==typeof e.languages){var o=e.languages;o&&t.push(o.split(","))}return t},colorDepth:function(){return window.screen.colorDepth},deviceMemory:function(){return f(d(navigator.deviceMemory),void 0)},screenResolution:function(){if(!(C()&&E()&&X()))return K()},hardwareConcurrency:function(){return f(s(navigator.hardwareConcurrency),void 0)},timezone:function(){var n,e=null===(n=window.Intl)||void 0===n?void 0:n.DateTimeFormat;if(e){var t=(new e).resolvedOptions().timeZone;if(t)return t}var r,o=(r=(new Date).getFullYear(),-Math.max(d(new Date(r,0,1).getTimezoneOffset()),d(new Date(r,6,1).getTimezoneOffset())));return"UTC".concat(o>=0?"+":"").concat(o)},sessionStorage:function(){try{return!!window.sessionStorage}catch(n){return!0}},localStorage:function(){try{return!!window.localStorage}catch(n){return!0}},indexedDB:function(){if(!G()&&!I())try{return!!window.indexedDB}catch(n){return!0}},openDatabase:function(){return!!window.openDatabase},cpuClass:function(){return navigator.cpuClass},platform:function(){var n=navigator.platform;return"MacIntel"===n&&C()&&!j()?function(){if("iPad"===navigator.platform)return!0;var n=screen,e=n.width/n.height;return m(["MediaSource"in window,!!Element.prototype.webkitRequestFullscreen,e>.65&&e<1.53])>=2}()?"iPad":"iPhone":n},plugins:function(){var n=navigator.plugins;if(n){for(var e=[],t=0;t<n.length;++t){var r=n[t];if(r){for(var o=[],i=0;i<r.length;++i){var a=r[i];o.push({type:a.type,suffixes:a.suffixes})}e.push({name:r.name,description:r.description,mimeTypes:o})}}return e}},touchSupport:function(){var n,e=navigator,t=0;void 0!==e.maxTouchPoints?t=s(e.maxTouchPoints):void 0!==e.msMaxTouchPoints&&(t=e.msMaxTouchPoints);try{document.createEvent("TouchEvent"),n=!0}catch(r){n=!1}return{maxTouchPoints:t,touchEvent:n,touchStart:"ontouchstart"in window}},vendor:function(){return navigator.vendor||""},vendorFlavors:function(){for(var n=[],e=0,t=["chrome","safari","__crWeb","__gCrWeb","yandex","__yb","__ybro","__firefox__","__edgeTrackingPreventionStatistics","webkit","oprt","samsungAr","ucweb","UCShellJava","puffinDevice"];e<t.length;e++){var r=t[e],o=window[r];o&&"object"==typeof o&&n.push(r)}return n.sort()},cookiesEnabled:function(){var n=document;try{n.cookie="cookietest=1; SameSite=Strict;";var e=-1!==n.cookie.indexOf("cookietest=");return n.cookie="cookietest=1; SameSite=Strict; expires=Thu, 01-Jan-1970 00:00:01 GMT",e}catch(t){return!1}},colorGamut:function(){for(var n=0,e=["rec2020","p3","srgb"];n<e.length;n++){var t=e[n];if(matchMedia("(color-gamut: ".concat(t,")")).matches)return t}},invertedColors:function(){return!!an("inverted")||!an("none")&&void 0},forcedColors:function(){return!!cn("active")||!cn("none")&&void 0},monochrome:function(){if(matchMedia("(min-monochrome: 0)").matches){for(var n=0;n<=100;++n)if(matchMedia("(max-monochrome: ".concat(n,")")).matches)return n;throw new Error("Too high value")}},contrast:function(){return un("no-preference")?0:un("high")||un("more")?1:un("low")||un("less")?-1:un("forced")?10:void 0},reducedMotion:function(){return!!ln("reduce")||!ln("no-preference")&&void 0},reducedTransparency:function(){return!!sn("reduce")||!sn("no-preference")&&void 0},hdr:function(){return!!dn("high")||!dn("standard")&&void 0},math:function(){var n,e=fn.acos||mn,t=fn.acosh||mn,r=fn.asin||mn,o=fn.asinh||mn,i=fn.atanh||mn,a=fn.atan||mn,c=fn.sin||mn,u=fn.sinh||mn,l=fn.cos||mn,s=fn.cosh||mn,d=fn.tan||mn,f=fn.tanh||mn,m=fn.exp||mn,v=fn.expm1||mn,h=fn.log1p||mn;return{acos:e(.12312423423423424),acosh:t(1e308),acoshPf:(n=1e154,fn.log(n+fn.sqrt(n*n-1))),asin:r(.12312423423423424),asinh:o(1),asinhPf:function(n){return fn.log(n+fn.sqrt(n*n+1))}(1),atanh:i(.5),atanhPf:function(n){return fn.log((1+n)/(1-n))/2}(.5),atan:a(.5),sin:c(-1e300),sinh:u(1),sinhPf:function(n){return fn.exp(n)-1/fn.exp(n)/2}(1),cos:l(10.000000000123),cosh:s(1),coshPf:function(n){return(fn.exp(n)+1/fn.exp(n))/2}(1),tan:d(-1e300),tanh:f(1),tanhPf:function(n){return(fn.exp(2*n)-1)/(fn.exp(2*n)+1)}(1),exp:m(1),expm1:v(1),expm1Pf:function(n){return fn.exp(n)-1}(1),log1p:h(10),log1pPf:function(n){return fn.log(1+n)}(10),powPI:function(n){return fn.pow(fn.PI,n)}(-100)}},pdfViewerEnabled:function(){return navigator.pdfViewerEnabled},architecture:function(){var n=new Float32Array(1),e=new Uint8Array(n.buffer);return n[0]=1/0,n[0]=n[0]-n[0],e[3]},applePay:function(){var n=window.ApplePaySession;if("function"!=typeof(null==n?void 0:n.canMakePayments))return-1;if(hn())return-3;try{return n.canMakePayments()?1:0}catch(e){return function(n){if(n instanceof Error&&"InvalidAccessError"===n.name&&/\\bfrom\\b.*\\binsecure\\b/i.test(n.message))return-2;throw n}(e)}},privateClickMeasurement:function(){var n,e=document.createElement("a"),t=null!==(n=e.attributionSourceId)&&void 0!==n?n:e.attributionsourceid;return void 0===t?void 0:String(t)},audioBaseLatency:function(){if(!(A()||C()))return-2;if(!window.AudioContext)return-1;var n=(new AudioContext).baseLatency;return null==n?-1:isFinite(n)?n:-3},dateTimeLocale:function(){if(!window.Intl)return-1;var n=window.Intl.DateTimeFormat;if(!n)return-2;var e=n().resolvedOptions().locale;return e||""===e?e:-3},webGlBasics:function(n){var e,t,r,o,i,a,c=Ln(n.cache);if(!c)return-1;if(!xn(c))return-2;var u=Wn()?null:c.getExtension(wn);return{version:(null===(e=c.getParameter(c.VERSION))||void 0===e?void 0:e.toString())||"",vendor:(null===(t=c.getParameter(c.VENDOR))||void 0===t?void 0:t.toString())||"",vendorUnmasked:u?null===(r=c.getParameter(u.UNMASKED_VENDOR_WEBGL))||void 0===r?void 0:r.toString():"",renderer:(null===(o=c.getParameter(c.RENDERER))||void 0===o?void 0:o.toString())||"",rendererUnmasked:u?null===(i=c.getParameter(u.UNMASKED_RENDERER_WEBGL))||void 0===i?void 0:i.toString():"",shadingLanguageVersion:(null===(a=c.getParameter(c.SHADING_LANGUAGE_VERSION))||void 0===a?void 0:a.toString())||""}},webGlExtensions:function(n){var e=Ln(n.cache);if(!e)return-1;if(!xn(e))return-2;var t=e.getSupportedExtensions(),r=e.getContextAttributes(),o=[],i=[],a=[],c=[],u=[];if(r)for(var l=0,s=Object.keys(r);l<s.length;l++){var d=s[l];i.push("".concat(d,"=").concat(r[d]))}for(var f=0,m=Vn(e);f<m.length;f++){var v=e[L=m[f]];a.push("".concat(L,"=").concat(v).concat(pn.has(v)?"=".concat(e.getParameter(v)):""))}if(t)for(var h=0,p=t;h<p.length;h++){var b=p[h];if(!(b===wn&&Wn()||"WEBGL_polygon_mode"===b&&(Y()||C()))){var y=e.getExtension(b);if(y)for(var g=0,w=Vn(y);g<w.length;g++){var L;v=y[L=w[g]];c.push("".concat(L,"=").concat(v).concat(bn.has(v)?"=".concat(e.getParameter(v)):""))}else o.push(b)}}for(var k=0,V=yn;k<V.length;k++)for(var S=V[k],W=0,x=gn;W<x.length;W++){var Z=x[W],M=kn(e,S,Z);u.push("".concat(S,".").concat(Z,"=").concat(M.join(",")))}return c.sort(),a.sort(),{contextAttributes:i,parameters:a,shaderPrecisions:u,extensions:t,extensionParameters:c,unsupportedExtensions:o}}};function Mn(n){var e=function(n){if(A())return.4;if(C())return!j()||E()&&X()?.3:.5;var e="value"in n.platform?n.platform.value:"";if(/^Win/.test(e))return.6;if(/^Mac/.test(e))return.5;return.7}(n),t=function(n){return v(.99+.01*n,1e-4)}(e);return{score:e,comment:"$ if upgrade to Pro: https://fpjs.dev/pro".replace(/\\$/g,"".concat(t))}}function Rn(n){return JSON.stringify(n,(function(n,t){return t instanceof Error?e({name:(r=t).name,message:r.message,stack:null===(o=r.stack)||void 0===o?void 0:o.split("\\n")},r):t;var r,o}),2)}function Fn(n){return M(function(n){for(var e="",t=0,r=Object.keys(n).sort();t<r.length;t++){var o=r[t],i=n[o],a="error"in i?"error":JSON.stringify(i.value);e+="".concat(e?"|":"").concat(o.replace(/([:|\\\\])/g,"\\\\$1"),":").concat(a)}return e}(n))}function Gn(n){return void 0===n&&(n=50),function(n,e){void 0===e&&(e=1/0);var t=window.requestIdleCallback;return t?new Promise((function(n){return t.call(window,(function(){return n()}),{timeout:e})})):i(Math.min(n,e))}(n,2*n)}function In(n,e){var o=Date.now();return{get:function(i){return t(this,void 0,void 0,(function(){var t,a,c;return r(this,(function(r){switch(r.label){case 0:return t=Date.now(),[4,n()];case 1:return a=r.sent(),c=function(n){var e;return{get visitorId(){return void 0===e&&(e=Fn(this.components)),e},set visitorId(n){e=n},confidence:Mn(n),components:n,version:"4.6.2"}}(a),(e||(null==i?void 0:i.debug))&&console.log("Copy the text below to get the debug data:\\n\\n\`\`\`\\nversion: ".concat(c.version,"\\nuserAgent: ").concat(navigator.userAgent,"\\ntimeBetweenLoadAndGet: ").concat(t-o,"\\nvisitorId: ").concat(c.visitorId,"\\ncomponents: ").concat(Rn(a),"\\n\`\`\`")),[2,c]}}))}))}}}function Yn(n){return void 0===n&&(n={}),t(this,void 0,void 0,(function(){var e,t,o;return r(this,(function(r){switch(r.label){case 0:return n.monitoring,e=n.delayFallback,t=n.debug,[4,Gn(e)];case 1:return r.sent(),o=function(n){return F(Zn,n,[])}({cache:{},debug:t}),[2,In(o,t)]}}))}))}var Cn={load:Yn,hashComponents:Fn,componentsToDebugString:Rn},jn=M;return n.componentsToDebugString=Rn,n.default=Cn,n.getFullscreenElement=H,n.getUnstableAudioFingerprint=J,n.getUnstableCanvasFingerprint=U,n.getUnstableScreenFrame=nn,n.getUnstableScreenResolution=K,n.getWebGLContext=Ln,n.hashComponents=Fn,n.isAndroid=A,n.isChromium=Y,n.isDesktopWebKit=j,n.isEdgeHTML=I,n.isGecko=P,n.isSamsungInternet=N,n.isTrident=G,n.isWebKit=C,n.load=Yn,n.loadSources=F,n.murmurX64Hash128=jn,n.prepareForSources=Gn,n.sources=Zn,n.transformSource=function(n,e){var t=function(n){return R(n)?e(n):function(){var t=n();return a(t)?t.then(e):e(t)}};return function(e){var r=n(e);return a(r)?r.then(t):t(r)}},n.withIframe=D,Object.defineProperty(n,"__esModule",{value:!0}),n}({});`;
  }
  var cachedFingerprint = null;
  async function getFingerprint() {
    if (cachedFingerprint) return cachedFingerprint;
    const stored = sessionStorage.getItem("fingerprint_visitor_id");
    if (stored) {
      cachedFingerprint = stored;
      return cachedFingerprint;
    }
    const fp = await window.FingerprintJS.load();
    const result = await fp.get();
    cachedFingerprint = result.visitorId;
    sessionStorage.setItem("fingerprint_visitor_id", cachedFingerprint);
    return cachedFingerprint;
  }

  // src/js/core/pixel-batch.js
  async function sendPixelRequest(url, payload, pawtectVariant, wasmToken) {
    return fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        "x-pawtect-token": wasmToken,
        "x-pawtect-variant": pawtectVariant
      },
      body: JSON.stringify(payload)
    });
  }
  async function trySendPixelBatch(pixelBatch, regionX, regionY) {
    const fingerprint = await getFingerprint();
    const pawtectVariant = (await wplaceService.getPawtectVariant()).value;
    const url = `https://backend.wplace.live/s0/pixel/${regionX}/${regionY}`;
    if (!fingerprint) throw new Error("Missing fingerprint");
    if (!pawtectVariant) throw new Error("Missing pawtect variant");
    const token = getTurnstileToken();
    if (!token) return "token_error";
    const payload = makePayload(pixelBatch, token, fingerprint);
    const wasmToken = pawtectVariant !== "disabled" ? await computePawtectToken(url, JSON.stringify(payload)) : "";
    const res = await sendPixelRequest(url, payload, pawtectVariant, wasmToken);
    if (res.status === 403) {
      console.warn("403 Forbidden \u2014 token may be expired. Regenerating...");
      return handle403AndRetry(pixelBatch, url, fingerprint, pawtectVariant);
    }
    return parsePixelResponse(res, pixelBatch.length, token);
  }
  async function handle403AndRetry(pixelBatch, url, fingerprint, pawtectVariant) {
    try {
      const newToken = await handleCaptcha();
      const retryPayload = makePayload(pixelBatch, newToken, fingerprint);
      const retryWasmToken = pawtectVariant !== "disabled" ? await computePawtectToken(url, JSON.stringify(retryPayload)) : "";
      const retryRes = await sendPixelRequest(url, retryPayload, pawtectVariant, retryWasmToken);
      if (retryRes.status === 403) {
        console.error("Token still invalid after regeneration");
        setTurnstileToken(null);
        return "token_error";
      }
      return parsePixelResponse(retryRes, pixelBatch.length, newToken);
    } catch (e) {
      console.error("Token regeneration failed:", e);
      setTurnstileToken(null);
      return "token_error";
    }
  }
  async function parsePixelResponse(res, expectedCount, tokenUsed) {
    try {
      const data = await res.json();
      const success = data?.painted === expectedCount;
      if (success) setTurnstileToken(tokenUsed);
      return success;
    } catch (e) {
      console.error("Invalid server response:", e);
      return false;
    }
  }
  function makePayload(pixelBatch, token, fingerprint) {
    const coords = new Array(pixelBatch.length * 2);
    const colors = new Array(pixelBatch.length);
    for (let i = 0; i < pixelBatch.length; i++) {
      const p = pixelBatch[i];
      coords[i * 2] = p.x;
      coords[i * 2 + 1] = p.y;
      colors[i] = p.color;
    }
    return { coords, colors, t: token, fp: fingerprint };
  }
  async function sendBatchWithRetry(pixels, regionX, regionY, maxRetries = 5) {
    let attempt = 0;
    while (attempt < maxRetries && !state.stopFlag) {
      attempt++;
      console.log(
        `\u{1F504} Attempt ${attempt}/${maxRetries} \u2014 region ${regionX},${regionY}, pixels=${pixels.length}`
      );
      const result = await trySendPixelBatch(pixels, regionX, regionY);
      if (result === true) {
        console.log(`\u2705 Batch succeeded on attempt ${attempt}`);
        return true;
      }
      if (result === "token_error") {
        console.log("\u{1F511} Token error. Will retry after captcha.");
        updateUI("captchaSolving", "warning");
        await sleep(5e3);
        continue;
      }
      console.warn(`\u26A0\uFE0F Batch failed (attempt ${attempt}), retrying...`);
      const delay = Math.min(1e3 * 2 ** (attempt - 1), 3e4) + Math.random() * 1e3;
      await sleep(delay);
    }
    if (!state.stopFlag) {
      console.error(`\u274C Failed after ${attempt} attempts. Aborting.`);
    }
    return false;
  }

  // src/js/core/auto-save.js
  function shouldAutoSave() {
    return false;
    const now = Date.now();
    const pixelsSinceLastSave = state.currentPaintedPixels - state._lastSavePixelCount;
    const timeSinceLastSave = now - state._lastSaveTime;
    return !state._saveInProgress && pixelsSinceLastSave >= 25 && timeSinceLastSave >= 3e4;
  }
  async function performSmartSave() {
    if (!shouldAutoSave()) return false;
    state._saveInProgress = true;
    const success = await saveProgress();
    if (success) {
      state._lastSavePixelCount = state.currentPaintedPixels;
      state._lastSaveTime = Date.now();
      console.log(`\u{1F4BE} Auto-saved at ${state.currentPaintedPixels} pixels`);
    }
    state._saveInProgress = false;
    return success;
  }

  // src/js/core/coordinate-generator.js
  async function generateCoordinates(width, height, mode, direction, snake, blockWidth, blockHeight, sortByFrequency, pixels) {
    const coords = [];
    let xStart, xEnd, xStep;
    let yStart, yEnd, yStep;
    switch (direction) {
      case "top-left":
        xStart = 0;
        xEnd = width;
        xStep = 1;
        yStart = 0;
        yEnd = height;
        yStep = 1;
        break;
      case "top-right":
        xStart = width - 1;
        xEnd = -1;
        xStep = -1;
        yStart = 0;
        yEnd = height;
        yStep = 1;
        break;
      case "bottom-left":
        xStart = 0;
        xEnd = width;
        xStep = 1;
        yStart = height - 1;
        yEnd = -1;
        yStep = -1;
        break;
      case "bottom-right":
        xStart = width - 1;
        xEnd = -1;
        xStep = -1;
        yStart = height - 1;
        yEnd = -1;
        yStep = -1;
        break;
      default:
        throw new Error(`Unknown direction: ${direction}`);
    }
    if (mode === "rows") {
      for (let y = yStart; y !== yEnd; y += yStep) {
        if (snake && (y - yStart) % 2 !== 0) {
          for (let x = xEnd - xStep; x !== xStart - xStep; x -= xStep) {
            coords.push([x, y]);
          }
        } else {
          for (let x = xStart; x !== xEnd; x += xStep) {
            coords.push([x, y]);
          }
        }
      }
    } else if (mode === "columns") {
      for (let x = xStart; x !== xEnd; x += xStep) {
        if (snake && (x - xStart) % 2 !== 0) {
          for (let y = yEnd - yStep; y !== yStart - yStep; y -= yStep) {
            coords.push([x, y]);
          }
        } else {
          for (let y = yStart; y !== yEnd; y += yStep) {
            coords.push([x, y]);
          }
        }
      }
    } else if (mode === "circle-out") {
      const cx = Math.floor(width / 2);
      const cy = Math.floor(height / 2);
      const maxRadius = Math.ceil(Math.sqrt(cx * cx + cy * cy));
      for (let r = 0; r <= maxRadius; r++) {
        for (let y = cy - r; y <= cy + r; y++) {
          for (let x = cx - r; x <= cx + r; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
              const dx = x - cx;
              const dy = y - cy;
              const absX = dx < 0 ? -dx : dx;
              const absY = dy < 0 ? -dy : dy;
              const dist = absX > absY ? absX : absY;
              if (dist === r) coords.push([x, y]);
            }
          }
        }
      }
    } else if (mode === "circle-in") {
      const cx = Math.floor(width / 2);
      const cy = Math.floor(height / 2);
      const maxRadius = Math.ceil(Math.sqrt(cx * cx + cy * cy));
      for (let r = maxRadius; r >= 0; r--) {
        for (let y = cy - r; y <= cy + r; y++) {
          for (let x = cx - r; x <= cx + r; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
              const dx = x - cx;
              const dy = y - cy;
              const absX = dx < 0 ? -dx : dx;
              const absY = dy < 0 ? -dy : dy;
              const dist = absX > absY ? absX : absY;
              if (dist === r) coords.push([x, y]);
            }
          }
        }
      }
    } else if (mode === "blocks" || mode === "shuffle-blocks") {
      const blocks = [];
      for (let by = 0; by < height; by += blockHeight) {
        for (let bx = 0; bx < width; bx += blockWidth) {
          const block = [];
          for (let y = by; y < Math.min(by + blockHeight, height); y++) {
            for (let x = bx; x < Math.min(bx + blockWidth, width); x++) {
              block.push([x, y]);
            }
          }
          blocks.push(block);
        }
      }
      if (mode === "shuffle-blocks") {
        for (let i = blocks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
        }
      }
      for (const block of blocks) {
        for (const coord of block) {
          coords.push(coord);
        }
      }
    } else {
      throw new Error(`Unknown mode: ${mode}`);
    }
    if (sortByFrequency) {
      if (!overlayManager || state.artColorFrequency.size === 0) {
        throw new Error(
          "overlayManager and artColorFrequency must be provided for option sort-by-color-frequency"
        );
      }
      const enrichedCoords = coords.map(([x, y], index) => {
        const idx = (y * width + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const a = pixels[idx + 3];
        if (!state.paintTransparentPixels && isTransparentPixel(a)) return null;
        const colorStr = `${r},${g},${b}`;
        const frequency = state.artColorFrequency.get(colorStr) || 0;
        return { coord: [x, y], frequency, index };
      });
      const validCoords = enrichedCoords.filter(Boolean);
      const groupedByFreq = /* @__PURE__ */ new Map();
      for (const item of validCoords) {
        const freq = item.frequency;
        if (!groupedByFreq.has(freq)) {
          groupedByFreq.set(freq, []);
        }
        groupedByFreq.get(freq).push(item);
      }
      const sortedFreqs = [...groupedByFreq.keys()].sort((a, b) => a - b);
      const result = [];
      for (const freq of sortedFreqs) {
        const group = groupedByFreq.get(freq);
        group.sort((a, b) => a.index - b.index);
        for (const item of group) {
          result.push(item);
        }
      }
      return result.map((item) => item.coord);
    }
    return coords;
  }

  // src/js/core/painting-controller.js
  async function flushPixelBatch(batch) {
    if (!batch || batch.pixels.length === 0) return true;
    const batchSize = batch.pixels.length;
    const success = await sendBatchWithRetry(batch.pixels, batch.regionX, batch.regionY);
    if (success) {
      const ownsRegion = await wplaceService.ownsRegion(batch.regionX, batch.regionY);
      const chargesSpent = batchSize * (ownsRegion ? 0.9 : 1);
      state.localPaintedOffset += batchSize;
      state.fullChargeData = {
        ...state.fullChargeData,
        spentSinceShot: state.fullChargeData.spentSinceShot + chargesSpent
      };
      await updateStats();
      await performSmartSave();
    } else {
      if (!state.stopFlag) {
        console.error(
          `\u274C Batch for ${batch.regionX}, ${batch.regionY} with ${batch.pixels.length} pixels
         failed permanently after retries. Stopping painting.`
        );
        state.stopFlag = true;
        updateUI("paintingBatchFailed", "error");
      }
    }
    batch.pixels = [];
    return success;
  }
  async function processImage() {
    const { width, height, pixels } = state.imageData;
    const { x: startX, y: startY } = state.startPosition;
    const { x: regionX, y: regionY } = state.region;
    const tilesReady = await overlayManager.waitForTiles(true);
    if (!tilesReady) {
      updateUI("overlayTilesNotLoaded", "error");
      state.stopFlag = true;
      return;
    }
    const pixelBatches = /* @__PURE__ */ new Map();
    let lastSendTime = 0;
    let globalPixelBatchTotalCount = 0;
    let currentBatchSize = calculateBatchSize(state.batchMode);
    const skippedPixels = {
      transparent: 0,
      white: 0,
      alreadyPainted: 0,
      colorUnavailable: 0
    };
    function checkPixelEligibility(x, y) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2], a = pixels[idx + 3];
      if (!state.paintTransparentPixels && isTransparentPixel(a))
        return {
          eligible: false,
          reason: "transparent"
        };
      if (!state.paintWhitePixels && isWhitePixel(r, g, b))
        return {
          eligible: false,
          reason: "white"
        };
      let mappedTargetColor;
      if (isWhitePixel(r, g, b)) {
        mappedTargetColor = APP_CONSTANTS.COLOR_MAP["5"];
      } else if (isTransparentPixel(a)) {
        mappedTargetColor = APP_CONSTANTS.COLOR_MAP["0"];
      } else {
        mappedTargetColor = resolveColor(
          findClosestColor(r, g, b, state.activeColorPalette),
          state.availableColors,
          !state.paintUnavailablePixels
        );
        if (!state.paintUnavailablePixels && !mappedTargetColor.id) {
          return {
            eligible: false,
            reason: "colorUnavailable",
            r,
            g,
            b,
            a,
            mappedColorId: mappedTargetColor.id
          };
        }
      }
      return { eligible: true, r, g, b, a, mappedColorId: mappedTargetColor.id };
    }
    function skipPixel(reason, id, rgb, x, y) {
      if (reason !== "transparent") {
      }
      skippedPixels[reason]++;
    }
    try {
      const coords = await generateCoordinates(
        width,
        height,
        state.coordinateMode,
        state.coordinateDirection,
        state.coordinateSnake,
        state.blockWidth,
        state.blockHeight,
        state.sortCoordinateByFrequency,
        pixels
      );
      outerLoop: for (const [x, y] of coords) {
        const targetPixelInfo = checkPixelEligibility(x, y);
        const absX = startX + x;
        const absY = startY + y;
        const adderX = Math.floor(absX / 1e3);
        const adderY = Math.floor(absY / 1e3);
        const pixelX = absX % 1e3;
        const pixelY = absY % 1e3;
        const targetMappedColorId = targetPixelInfo.mappedColorId;
        if (!targetPixelInfo.eligible) {
          skipPixel(
            targetPixelInfo.reason,
            targetMappedColorId,
            [targetPixelInfo.r, targetPixelInfo.g, targetPixelInfo.b],
            pixelX,
            pixelY
          );
          continue;
        }
        const key = `${regionX + adderX},${regionY + adderY}`;
        if (!pixelBatches.has(key)) {
          pixelBatches.set(key, {
            regionX: regionX + adderX,
            regionY: regionY + adderY,
            pixels: []
          });
        }
        const batch = pixelBatches.get(key);
        try {
          const tilePixelRGBA = await overlayManager.getTilePixelColor(
            batch.regionX,
            batch.regionY,
            pixelX,
            pixelY
          );
          if (tilePixelRGBA && Array.isArray(tilePixelRGBA)) {
            const mappedCanvasColor = resolveColor(tilePixelRGBA, state.availableColors);
            const isMatch = mappedCanvasColor.id === targetMappedColorId;
            if (isMatch) {
              skipPixel(
                "alreadyPainted",
                targetMappedColorId,
                [targetPixelInfo.r, targetPixelInfo.g, targetPixelInfo.b],
                pixelX,
                pixelY
              );
              continue;
            }
          }
        } catch (e) {
          console.error(`[DEBUG] Error checking existing pixel at (${pixelX}, ${pixelY}):`, e);
          updateUI("paintingPixelCheckFailed", "error", { x: pixelX, y: pixelY });
          state.stopFlag = true;
          break outerLoop;
        }
        batch.pixels.push({
          x: pixelX,
          y: pixelY,
          color: targetMappedColorId,
          localX: x,
          localY: y
        });
        globalPixelBatchTotalCount++;
        if (globalPixelBatchTotalCount >= currentBatchSize) {
          for (const b of pixelBatches.values()) {
            if (b.pixels.length > 0 && !state.stopFlag) {
              const elapsed = Date.now() - lastSendTime;
              const remaining = 1500 - elapsed;
              if (remaining > 0 && state.paintingSpeedLimitEnabled) {
                await sleep(remaining);
              }
              const success = await flushPixelBatch(b);
              lastSendTime = Date.now();
              if (!success || state.stopFlag) {
                break outerLoop;
              }
              updateUI("paintingProgress", "default", {
                painted: state.currentPaintedPixels,
                total: state.artTotalPixels
              });
            }
          }
          globalPixelBatchTotalCount = 0;
          currentBatchSize = calculateBatchSize(state.batchMode);
        }
        if (state.preciseCurrentCharges < state.cooldownChargeThreshold && !state.stopFlag) {
          await dynamicSleep(() => {
            if (state.preciseCurrentCharges >= state.cooldownChargeThreshold) {
              NotificationManager.maybeNotifyChargesReached(true);
              return 0;
            }
            if (state.stopFlag) return 0;
            return getMsToTargetCharges(
              state.preciseCurrentCharges,
              state.cooldownChargeThreshold,
              state.cooldown
            );
          });
        }
        if (state.stopFlag) {
          break outerLoop;
        }
      }
      for (const [key, batch] of pixelBatches.entries()) {
        if (batch.pixels.length > 0 && !state.stopFlag) {
          console.log(`\u{1F3C1} Sending final batch`);
          const success = await flushPixelBatch(batch);
          lastSendTime = Date.now();
          if (!success) {
            console.warn(`\u26A0\uFE0F Final batch for ${key} failed with ${batch.pixels.length} pixels.`);
          }
        }
      }
    } catch (e) {
      state.stopFlag = true;
      updateUI("paintingError", "error");
      const err = e instanceof Error ? e : new Error(String(e));
      const groupStyle = "color: #d32f2f; font-weight: bold; background: #ffebee; padding: 2px 6px; border-radius: 3px;";
      console.groupCollapsed(`%cError: ${err.message}`, groupStyle);
      console.log("time:", (/* @__PURE__ */ new Date()).toISOString());
      console.log("name:", err.name);
      console.log("message:", err.message);
      if (err.stack) console.log("stack:", err.stack);
      console.groupEnd();
    }
    await saveProgress();
    if (state.stopFlag) {
    } else {
      updateUI("paintingComplete", "success", { count: state.currentPaintedPixels });
      overlayManager.clear();
      const toggleOverlayBtn2 = document.getElementById("toggleOverlayBtn");
      if (toggleOverlayBtn2) {
        toggleOverlayBtn2.classList.remove("active");
        toggleOverlayBtn2.disabled = true;
      }
    }
    await updateStats();
  }
  function calculateBatchSize(batchMode) {
    let targetBatchSize;
    if (batchMode === "random") {
      const min = Math.max(1, state.randomBatchMin);
      const max = Math.max(min, state.randomBatchMax);
      targetBatchSize = Math.floor(Math.random() * (max - min + 1)) + min;
      console.log(`\u{1F3B2} Random batch size generated: ${targetBatchSize} (range: ${min}-${max})`);
    } else {
      targetBatchSize = state.paintingSpeed;
    }
    const maxAllowed = Math.floor(state.preciseCurrentCharges);
    return Math.min(targetBatchSize, maxAllowed);
  }

  // src/js/ui/handlers/main-panel/main-panel-handler.js
  function handleResizeClick(e) {
    e?.preventDefault();
    if (state.imageLoaded && state.imageData.processor && state.hasAvailableColors) {
      const resizeContainer2 = document.querySelector(".resize-container");
      const resizeOverlay2 = document.querySelector(".resize-overlay");
      showResizeDialog(state.imageData.processor, resizeContainer2, resizeOverlay2);
    } else if (!state.hasAvailableColors) {
      showAlert(t("uploadImageFirstColors"), "warning");
    }
  }
  async function handleStopClick() {
    state.stopFlag = true;
    state.running = false;
    updateControlButtonState();
    updateUI("paintingStoppedByUser", "warning");
    if (state.imageLoaded && state.totalPaintedPixels > 0) {
      await saveProgress();
      showAlert(t("autoSaved"), "success");
    }
  }
  function updateControlButtonState() {
    const controlBtn = document.getElementById("controlBtn");
    if (!state.imageLoaded || !state.startPosition || !state.region) {
      controlBtn.disabled = true;
      return;
    }
    controlBtn.disabled = false;
    if (state.running) {
      controlBtn.classList.remove("wplace-btn-start");
      controlBtn.classList.add("wplace-btn-stop");
      controlBtn.innerHTML = `
      <i class="fas fa-stop"></i>
      <span data-i18n-key="stopPainting">${t("stopPainting")}</span>
    `;
    } else {
      controlBtn.classList.remove("wplace-btn-stop");
      controlBtn.classList.add("wplace-btn-start");
      controlBtn.innerHTML = `
      <i class="fas fa-play"></i>
      <span data-i18n-key="startPainting">${t("startPainting")}</span>
    `;
    }
  }
  async function handleStartPainting() {
    if (!state.imageLoaded || !state.startPosition || !state.region) {
      updateUI("missingRequirements", "error");
      return;
    }
    await ensureToken();
    if (!getTurnstileToken()) return;
    state.running = true;
    state.stopFlag = false;
    updateControlButtonState();
    const uploadBtn = document.getElementById("uploadBtn");
    const selectPosBtn = document.getElementById("selectPosBtn");
    const resizeBtn = document.getElementById("resizeBtn");
    const saveBtn = document.getElementById("saveBtn");
    const toggleOverlayBtn2 = document.getElementById("toggleOverlayBtn");
    if (uploadBtn) uploadBtn.disabled = true;
    if (selectPosBtn) selectPosBtn.disabled = true;
    if (resizeBtn) resizeBtn.disabled = true;
    if (saveBtn) saveBtn.disabled = true;
    if (toggleOverlayBtn2) toggleOverlayBtn2.disabled = true;
    updateUI("startPaintingMsg", "success");
    try {
      await processImage();
    } catch (e) {
      console.error("Unexpected error:", e);
      updateUI("paintingError", "error");
    } finally {
      state.running = false;
      updateControlButtonState();
      if (saveBtn) saveBtn.disabled = false;
      if (!state.stopFlag) {
        if (uploadBtn) uploadBtn.disabled = false;
        if (selectPosBtn) selectPosBtn.disabled = false;
        if (resizeBtn) resizeBtn.disabled = false;
      }
      if (toggleOverlayBtn2) toggleOverlayBtn2.disabled = false;
    }
  }
  async function handleTogglePainting() {
    const isRunning = state.running;
    if (isRunning) {
      await handleStopClick();
    } else {
      await handleStartPainting();
    }
    updateControlButtonState();
  }
  async function handleColorFilter() {
  }
  async function handleToggleOverlayClick() {
    const isEnabled = await overlayManager.toggle();
    const btn = document.getElementById("toggleOverlayBtn");
    if (btn) {
      btn.classList.toggle("active", isEnabled);
      btn.setAttribute("aria-pressed", isEnabled ? "true" : "false");
    }
    showAlert(isEnabled ? t("overlayEnabled") : t("overlayDisabled"), "info");
  }
  function handleCooldownSliderInput(e) {
    const threshold = parseInt(e.target.value, 10);
    state.cooldownChargeThreshold = threshold;
    const cooldownValue = document.getElementById("cooldownValue");
    if (cooldownValue) {
      cooldownValue.textContent = threshold.toString();
    }
    saveBotSettings();
    NotificationManager.resetEdgeTracking();
  }

  // src/js/ui/handlers/main-panel/handle-select-position-click.js
  function handleSelectPositionClick() {
    if (state.selectingPosition) {
      return;
    }
    state.selectingPosition = true;
    state.startPosition = null;
    state.region = null;
    const controlBtn = document.getElementById("controlBtn");
    if (controlBtn) {
      controlBtn.disabled = true;
    }
    showAlert(t("selectPositionAlert"), "info");
    updateUI("waitingPosition", "default");
    const tempFetch = async (url, options) => {
      const method = options?.method ? options.method.toUpperCase() : "GET";
      if (typeof url === "string" && url.includes("https://backend.wplace.live/s0/pixel/") && method === "GET") {
        try {
          const urlObj = new URL(url);
          const x = parseInt(urlObj.searchParams.get("x"), 10);
          const y = parseInt(urlObj.searchParams.get("y"), 10);
          const regionMatch = url.match(/\/pixel\/(\d+)\/(\d+)/);
          if (!regionMatch || regionMatch.length < 3 || isNaN(x) || isNaN(y)) {
            return originalFetch(url, options);
          }
          state.region = {
            x: Number.parseInt(regionMatch[1]),
            y: Number.parseInt(regionMatch[2])
          };
          state.startPosition = { x, y };
          await overlayManager.setPosition(state.startPosition, state.region);
          if (state.imageLoaded) {
            const controlBtn2 = document.getElementById("controlBtn");
            if (controlBtn2) {
              controlBtn2.disabled = false;
            }
          }
          window.fetch = originalFetch;
          state.selectingPosition = false;
          updateUI("positionSet", "success");
          return originalFetch(url, options);
        } catch (error) {
          console.error("Fetch hook error:", error);
          window.fetch = originalFetch;
          state.selectingPosition = false;
          updateUI("positionError", "error");
          return originalFetch(url, options);
        }
      }
      return originalFetch(url, options);
    };
    const originalFetch = window.fetch;
    window.fetch = tempFetch;
    setTimeout(() => {
      if (state.selectingPosition) {
        window.fetch = originalFetch;
        state.selectingPosition = false;
        updateUI("positionTimeout", "error");
        showAlert(t("positionTimeout"), "error");
      }
    }, 12e4);
  }

  // src/js/ui/handlers/main-panel/handle-header-buttons.js
  function handleSettingsClick() {
    const container = document.getElementById("wplace-settings-container");
    if (!container) return;
    const isVisible = container.classList.contains("show");
    if (isVisible) {
      container.style.animation = "settings-fade-out 0.3s ease-out forwards";
      container.classList.remove("show");
      setTimeout(() => {
        container.style.animation = "";
      }, 300);
    } else {
      container.classList.add("show");
      container.style.animation = "settings-slide-in 0.4s ease-out";
    }
  }
  function handleStatsClick() {
    const statsContainer = document.getElementById("wplace-stats-container");
    const statsBtn = document.getElementById("statsBtn");
    if (!statsContainer || !statsBtn) return;
    const isVisible = statsContainer.style.display !== "none";
    if (isVisible) {
      statsContainer.style.display = "none";
      statsBtn.innerHTML = '<i class="fas fa-chart-bar"></i>';
      statsBtn.title = t("showStats");
    } else {
      statsContainer.style.display = "block";
      statsBtn.innerHTML = '<i class="fas fa-chart-line"></i>';
      statsBtn.title = t("hideStats");
    }
  }
  function handleMinimizeClick() {
    state.minimized = !state.minimized;
    const container = document.getElementById("wplace-image-bot-container");
    const content = container?.querySelector(".wplace-content");
    const btn = document.getElementById("minimizeBtn");
    const icon = btn?.querySelector("i");
    container?.classList.toggle("wplace-minimized", state.minimized);
    content?.classList.toggle("wplace-hidden", state.minimized);
    if (icon) {
      icon.classList.toggle("rotated", state.minimized);
    }
    if (btn) {
      btn.title = state.minimized ? t("restore") : t("minimize");
    }
  }
  function handleCompactClick() {
    const container = document.getElementById("wplace-image-bot-container");
    const btn = document.getElementById("compactBtn");
    container.classList.toggle("wplace-compact");
    const isCompact = container.classList.contains("wplace-compact");
    if (isCompact) {
      if (btn) {
        btn.innerHTML = '<i class="fas fa-expand"></i>';
        btn.title = t("expandMode");
      }
    } else {
      if (btn) {
        btn.innerHTML = '<i class="fas fa-compress"></i>';
        btn.title = t("compactMode");
      }
    }
  }

  // src/js/ui/listeners/main-panel.js
  function setupMainPanelListeners() {
    const container = document.getElementById("wplace-image-bot-container");
    if (!container) return;
    const settingsBtn = container.querySelector("#settingsBtn");
    const statsBtn = container.querySelector("#statsBtn");
    const minimizeBtn = container.querySelector("#minimizeBtn");
    const compactBtn = container.querySelector("#compactBtn");
    const uploadBtn = container.querySelector("#uploadBtn");
    const resizeBtn = container.querySelector("#resizeBtn");
    const selectPosBtn = container.querySelector("#selectPosBtn");
    const controlBtn = container.querySelector("#controlBtn");
    const colorFilterBtn = container.querySelector("#colorFilterBtn");
    const toggleOverlayBtn2 = container.querySelector("#toggleOverlayBtn");
    const cooldownSlider = container.querySelector("#cooldownSlider");
    const saveBtn = container.querySelector("#saveBtn");
    const loadBtn = container.querySelector("#loadBtn");
    const saveToFileBtn = container.querySelector("#saveToFileBtn");
    const loadFromFileBtn = container.querySelector("#loadFromFileBtn");
    container.querySelectorAll(".wplace-section-title").forEach((title) => {
      if (!title.querySelector("i.arrow")) {
        const arrow = document.createElement("i");
        arrow.className = "fas fa-chevron-down arrow";
        title.appendChild(arrow);
      }
      safeOn(title, "click", () => {
        const section = title.parentElement;
        section.classList.toggle("collapsed");
      });
    });
    safeOn(uploadBtn, "click", handleUploadClick);
    safeOn(resizeBtn, "click", handleResizeClick);
    safeOn(selectPosBtn, "click", handleSelectPositionClick);
    safeOn(controlBtn, "click", handleTogglePainting);
    safeOn(colorFilterBtn, "click", handleColorFilter);
    safeOn(toggleOverlayBtn2, "click", handleToggleOverlayClick);
    safeOn(cooldownSlider, "input", handleCooldownSliderInput);
    safeOn(saveBtn, "click", handleSaveClick);
    safeOn(loadBtn, "click", handleLoadClick);
    safeOn(saveToFileBtn, "click", handleSaveToFileClick);
    safeOn(loadFromFileBtn, "click", handleLoadFromFileClick);
    safeOn(settingsBtn, "click", handleSettingsClick);
    safeOn(statsBtn, "click", handleStatsClick);
    safeOn(minimizeBtn, "click", handleMinimizeClick);
    safeOn(compactBtn, "click", handleCompactClick);
  }

  // src/js/ui/panel.js
  function cleanupExistingUI() {
    const ids = ["wplace-image-bot-container", "wplace-settings-container", "wplace-stats-container"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      el?.remove();
    });
    document.querySelector(".resize-container")?.remove();
    document.querySelector(".resize-overlay")?.remove();
  }
  async function initializeDependencies() {
    await appendResourceOnce(
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      {
        type: "link"
      }
    );
    await appendResourceOnce(
      "https://skalsech.github.io/WPlace-AutoBOT/custom-main/dist/css/main.css",
      {
        type: "link",
        attributes: {
          "data-wplace-theme": "true"
        }
      }
    );
  }
  function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    const header = element.querySelector(".wplace-header") || element.querySelector(".wplace-settings-header");
    if (!header) {
      console.warn("No draggable header found for element:", element);
      return;
    }
    header.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
      if (e.target.closest(".wplace-header-btn") || e.target.closest("button")) return;
      e.preventDefault();
      isDragging = true;
      const rect = element.getBoundingClientRect();
      element.style.transform = "none";
      element.style.top = rect.top + "px";
      element.style.left = rect.left + "px";
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.classList.add("wplace-dragging");
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
      document.body.style.userSelect = "none";
    }
    function elementDrag(e) {
      if (!isDragging) return;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      let newTop = element.offsetTop - pos2;
      let newLeft = element.offsetLeft - pos1;
      const rect = element.getBoundingClientRect();
      const maxTop = window.innerHeight - rect.height;
      const maxLeft = window.innerWidth - rect.width;
      newTop = Math.max(0, Math.min(newTop, maxTop));
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      element.style.top = newTop + "px";
      element.style.left = newLeft + "px";
    }
    function closeDragElement() {
      isDragging = false;
      element.classList.remove("wplace-dragging");
      document.onmouseup = null;
      document.onmousemove = null;
      document.body.style.userSelect = "";
    }
  }
  function updateUI(messageKey, type = "default", params = {}, silent = false) {
    const message = t(messageKey, params);
    const container = document.getElementById("wplace-image-bot-container");
    const statusText = container.querySelector("#statusText");
    statusText.textContent = message;
    statusText.className = `wplace-status status-${type}`;
    if (!silent) {
      statusText.style.animation = "none";
      void statusText.offsetWidth;
      statusText.style.animation = "slide-in 0.3s ease-out";
    }
  }
  function ensureChargeStats(afterEl = null) {
    const statsContainer = document.getElementById("wplace-stats-container");
    const statsArea = statsContainer?.querySelector("#statsArea");
    let el = document.getElementById("wplace-charge-stats");
    if (!el) {
      el = document.createElement("div");
      el.id = "wplace-charge-stats";
      el.innerHTML = `
      <div class="wplace-stat-item">
        <div class="wplace-stat-label" data-i18n-key="charges"><i class="fas fa-bolt"></i>${t("charges")}</div>
        <div class="wplace-stat-value" id="wplace-stat-charges-value">0/0</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label" data-i18n-key="fullChargeIn"><i class="fas fa-battery-half"></i>${t("fullChargeIn")}</div>
        <div class="wplace-stat-value" id="wplace-stat-fullcharge-value">--:--:--</div>
      </div>
    `;
      if (afterEl && afterEl.parentNode === statsArea) {
        statsArea.insertBefore(el, afterEl.nextSibling);
      } else {
        statsArea.appendChild(el);
      }
    }
    return el;
  }
  function ensureImageStats(afterEl = null) {
    const statsContainer = document.getElementById("wplace-stats-container");
    const statsArea = statsContainer?.querySelector("#statsArea");
    let el = document.getElementById("wplace-image-stats");
    if (!el) {
      el = document.createElement("div");
      el.id = "wplace-image-stats";
      el.innerHTML = `
      <div class="wplace-stat-item">
        <div class="wplace-stat-label" data-i18n-key="progress"><i class="fas fa-image"></i>${t("progress")}</div>
        <div class="wplace-stat-value" id="wplace-stat-progress">--%</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label" data-i18n-key="pixels"><i class="fas fa-paint-brush"></i>${t("pixels")}</div>
        <div class="wplace-stat-value" id="wplace-stat-pixels">0/0</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label" data-i18n-key="estimatedTime"><i class="fas fa-clock"></i>${t("estimatedTime")}</div>
        <div class="wplace-stat-value" id="wplace-stat-estimated">--:--</div>
      </div>
    `;
      if (afterEl && afterEl.parentNode === statsArea) {
        statsArea.insertBefore(el, afterEl.nextSibling);
      } else {
        statsArea.appendChild(el);
      }
    }
    return el;
  }
  function ensureColorSwatches(afterEl = null) {
    const statsContainer = document.getElementById("wplace-stats-container");
    const statsArea = statsContainer?.querySelector("#statsArea");
    let el = document.getElementById("wplace-colors-section");
    if (!el) {
      el = document.createElement("div");
      el.id = "wplace-colors-section";
      el.className = "wplace-colors-section";
      el.innerHTML = `
      <div class="wplace-stat-label" id="wplace-stat-colors-label"></div>
      <div class="wplace-stat-colors-grid" id="wplace-stat-colors-grid"></div>
    `;
      if (afterEl && afterEl.parentNode === statsArea) {
        statsArea.insertBefore(el, afterEl.nextSibling);
      } else {
        statsArea.appendChild(el);
      }
    }
    return el;
  }
  function updateChargeStatsDisplay(intervalMs) {
    const currentChargesEl = document.getElementById("wplace-stat-charges-value");
    const fullChargeEl = document.getElementById("wplace-stat-fullcharge-value");
    if (!fullChargeEl && !currentChargesEl) return;
    if (!state.fullChargeData) {
      fullChargeEl.textContent = "--:--:--";
      return;
    }
    const { current, max, cooldownMs, startTime, spentSinceShot } = state.fullChargeData;
    const elapsed = Date.now() - startTime;
    const chargesGained = elapsed / cooldownMs;
    const rawCharges = current + chargesGained - spentSinceShot;
    const cappedCharges = Math.min(rawCharges, max);
    let displayCharges;
    const fraction = cappedCharges - Math.floor(cappedCharges);
    if (fraction >= 0.95) {
      displayCharges = Math.ceil(cappedCharges);
    } else {
      displayCharges = Math.floor(cappedCharges);
    }
    state.displayCharges = Math.max(0, displayCharges);
    state.preciseCurrentCharges = cappedCharges;
    const remainingMs = getMsToTargetCharges(cappedCharges, max, state.cooldown, intervalMs);
    const timeText = msToTimeText(remainingMs);
    if (currentChargesEl) {
      const newText = `${state.displayCharges} / ${state.fullChargeData.max}`;
      if (currentChargesEl.textContent !== newText) {
        currentChargesEl.textContent = newText;
      }
    }
    if (state.displayCharges < state.cooldownChargeThreshold && !state.stopFlag && state.running) {
      updateChargesThresholdUI(intervalMs);
    }
    if (fullChargeEl) {
      let newFullText;
      if (state.displayCharges >= max) {
        newFullText = `<span style="color:#10b981;">FULL</span>`;
      } else {
        newFullText = `<span style="color:#f59e0b;">${timeText}</span>`;
      }
      if (fullChargeEl.innerHTML !== newFullText) {
        fullChargeEl.innerHTML = newFullText;
      }
    }
  }
  function updateImageStats(intervalMs) {
    if (!state.imageLoaded) return;
    const container = document.getElementById("wplace-image-bot-container");
    const progressBar = container.querySelector("#progressBar");
    const progress = overlayManager.getOverallProgress();
    state.totalPaintedPixels = progress.painted;
    state.estimatedTime = calculateEstimatedTime(intervalMs);
    const percentage = state.artTotalPixels > 0 ? state.currentPaintedPixels / state.artTotalPixels * 100 : 0;
    const displayPercentage = parseFloat(percentage.toFixed(2));
    const newWidth = `${displayPercentage}%`;
    if (progressBar.style.width !== newWidth) progressBar.style.width = newWidth;
    const updates = [
      { el: "wplace-stat-progress", text: `${displayPercentage}%` },
      { el: "wplace-stat-pixels", text: `${state.currentPaintedPixels}/${state.artTotalPixels}` },
      { el: "wplace-stat-estimated", text: formatTime(state.estimatedTime) }
    ];
    updates.forEach(({ el, text }) => {
      const elem = document.getElementById(el);
      if (elem && elem.textContent !== text) elem.textContent = text;
    });
  }
  function updateColorSwatches() {
    if (!state.hasAvailableColors) return;
    const labelEl = document.getElementById("wplace-stat-colors-label");
    const gridEl = document.getElementById("wplace-stat-colors-grid");
    if (!labelEl || !gridEl) return;
    labelEl.innerHTML = `
    <i class="fas fa-palette"></i> 
    <span data-i18n-key="availableColors">
      ${t("availableColors", { count: state.availableColors.length })}
    </span>
  `;
    gridEl.innerHTML = state.availableColors.map((color) => {
      const rgbString = `rgb(${color.rgb.join(",")})`;
      const style = color.id === 0 ? "background: repeating-linear-gradient(45deg, #ccc 0 2px, #fff 2px 4px);background-size: cover;" : `background-color: ${rgbString};`;
      return `<div class="wplace-stat-color-swatch" style="${style}" title="${t("colorTooltip", {
        name: color.name,
        id: color.id,
        rgb: color.rgb.join(", ")
      })}"></div>`;
    }).join("");
  }
  async function updateStats(isManualRefresh = false) {
    const isFirstCheck = !state.fullChargeData?.startTime;
    if (isManualRefresh || isFirstCheck) {
      wplaceService.invalidateCache();
    }
    const { count, max, cooldown, fromCache: chargesFromCache } = await wplaceService.getCharges();
    if (!chargesFromCache) {
      state.displayCharges = Math.floor(count);
      state.preciseCurrentCharges = count;
      state.cooldown = cooldown;
      state.fullChargeData = {
        current: count,
        max,
        cooldownMs: cooldown,
        startTime: Date.now(),
        spentSinceShot: 0
      };
      NotificationManager.maybeNotifyChargesReached();
    }
    if (state.fullChargeInterval) {
      clearInterval(state.fullChargeInterval);
      state.fullChargeInterval = null;
    }
    const intervalMs = 1e3;
    state.fullChargeInterval = setInterval(() => {
      updateImageStats(intervalMs);
      updateChargeStatsDisplay(intervalMs);
    }, intervalMs);
    const container = document.getElementById("wplace-image-bot-container");
    const cooldownSlider = container.querySelector("#cooldownSlider");
    if (cooldownSlider.max !== state.fullChargeData.max) {
      cooldownSlider.max = state.fullChargeData.max;
    }
    const { value: colorsBitmap } = await wplaceService.getExtraColorsBitmap();
    const newAvailableColors = getAvailableColors(colorsBitmap);
    const foundColorsCount = Array.isArray(newAvailableColors) ? newAvailableColors.length : 0;
    if (foundColorsCount === 0 && isManualRefresh) {
      showAlert(t("noColorsFound"), "warning");
    } else if (foundColorsCount > 0 && colorsChanged(state.availableColors, newAvailableColors)) {
      const oldCount = state.availableColors.length;
      const newCount = foundColorsCount;
      const diffCount = newCount - oldCount;
      let message;
      if (oldCount === 0 && newCount > 0) {
        message = t("colorsUpdatedFirst", { newCount });
      } else if (oldCount > 0 && newCount > oldCount) {
        message = t("colorsUpdatedIncreased", { oldCount, newCount, diffCount });
      } else if (oldCount > 0 && newCount < oldCount) {
        message = t("colorsUpdatedDecreased", { oldCount, newCount, diffCount: -diffCount });
      }
      showAlert(message, "success");
      state.availableColors = newAvailableColors;
      invalidateColorCache({ availableColors: true });
    }
    let lastEl = document.getElementById("wplace-init-msg");
    if (state.imageLoaded) lastEl = ensureImageStats(lastEl);
    if (state.fullChargeData) lastEl = ensureChargeStats(lastEl);
    if (state.hasAvailableColors) lastEl = ensureColorSwatches(lastEl);
    updateImageStats(intervalMs);
    updateChargeStatsDisplay(intervalMs);
    updateColorSwatches();
    tryRemoveStatsInitMessage();
  }
  var checkSavedProgress = async () => {
    const savedData = await loadProgress();
    if (savedData && savedData.state.artTotalPixels > 0) {
      const savedDate = new Date(savedData.timestamp).toLocaleString();
      showAlert(
        `${t("savedDataFound")}
Timestamp: ${savedDate} - Art size: ${savedData.imageData.width} \xD7 ${savedData.imageData.height}.
Start position: ${savedData.state.startPosition.x},${savedData.state.startPosition.y} - Region: ${savedData.state.region.x},${savedData.state.region.y}
Total: ${savedData.state.artTotalPixels} pixels. 
${t("clickLoadToContinue")}`,
        "info"
      );
    }
  };
  async function createUI() {
    cleanupExistingUI();
    await initializeDependencies();
    loadBotSettings();
    const container = createMainContainer();
    const statsContainer = createStatsContainer();
    const settingsContainer = createSettingsContainer();
    const resizeContainer2 = createResizeContainer();
    const resizeOverlay2 = document.createElement("div");
    resizeOverlay2.className = "resize-overlay";
    document.body.append(
      container,
      resizeOverlay2,
      resizeContainer2,
      statsContainer,
      settingsContainer
    );
    if (true) {
      createDevReloadButton();
    }
    setupMainPanelListeners();
    setupStatsListeners();
    setupSettingsListeners();
    makeDraggable(container);
    makeDraggable(statsContainer);
    makeDraggable(settingsContainer);
    updateDataButtons();
    syncSettingsUI();
    NotificationManager.syncFromState();
    await initializeTranslations();
    container.style.display = "block";
    await checkSavedProgress();
  }

  // src/js/startup/startup.js
  function enableFileOperations() {
    const loadBtn = document.querySelector("#loadBtn");
    const loadFromFileBtn = document.querySelector("#loadFromFileBtn");
    const uploadBtn = document.querySelector("#uploadBtn");
    if (loadBtn) {
      loadBtn.disabled = false;
      loadBtn.title = "";
      loadBtn.style.animation = "pulse 0.6s ease-in-out";
      setTimeout(() => {
        if (loadBtn) loadBtn.style.animation = "";
      }, 600);
    }
    if (loadFromFileBtn) {
      loadFromFileBtn.disabled = false;
      loadFromFileBtn.title = "";
      loadFromFileBtn.style.animation = "pulse 0.6s ease-in-out";
      setTimeout(() => {
        if (loadFromFileBtn) loadFromFileBtn.style.animation = "";
      }, 600);
    }
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.title = "";
      uploadBtn.style.animation = "pulse 0.6s ease-in-out";
      setTimeout(() => {
        if (uploadBtn) uploadBtn.style.animation = "";
      }, 600);
    }
    console.log("\u2705 File operations (Load/Upload) are now available!");
  }
  async function initializeTokenGenerator() {
    if (isTokenValid()) {
      console.log("\u2705 Valid token already available, skipping initialization");
      updateUI("tokenReady", "success");
      return;
    }
    try {
      updateUI("initializingToken", "default");
      await loadTurnstile();
      console.log("\u{1F527} Turnstile token generator initialized.");
      updateUI("tokenReady", "success");
    } catch (error) {
      console.error("\u274C Critical error during Turnstile initialization:", error);
      updateUI("tokenRetryLater", "warning");
    }
  }

  // src/js/core/fetch-interceptor.js
  function setupFetchInterceptor() {
    const injectedFunction = () => {
      const fetchedBlobQueue = /* @__PURE__ */ new Map();
      window.addEventListener("message", (event) => {
        const { source, blobID, blobData } = event.data;
        if (source === "auto-image-overlay" && blobID && blobData) {
          const callback = fetchedBlobQueue.get(blobID);
          if (typeof callback === "function") {
            callback(blobData);
          }
          fetchedBlobQueue.delete(blobID);
        }
      });
      const originalFetch = window.fetch;
      window.fetch = async function(...args) {
        const response = await originalFetch.apply(this, args);
        const url = args[0] instanceof Request ? args[0].url : args[0];
        if (typeof url === "string") {
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("image/png") && url.includes(".png")) {
            const cloned = response.clone();
            return new Promise(async (resolve) => {
              const blobUUID = crypto.randomUUID();
              const originalBlob = await cloned.blob();
              fetchedBlobQueue.set(blobUUID, (processedBlob) => {
                resolve(
                  new Response(processedBlob, {
                    headers: cloned.headers,
                    status: cloned.status,
                    statusText: cloned.statusText
                  })
                );
              });
              window.postMessage(
                {
                  source: "auto-image-tile",
                  endpoint: url,
                  blobID: blobUUID,
                  blobData: originalBlob
                },
                "*"
              );
            });
          }
        }
        return response;
      };
    };
    const code = `(${injectedFunction.toString()})()`;
    const blob = new Blob([code], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    const script = document.createElement("script");
    script.src = blobUrl;
    script.async = true;
    script.onload = () => {
      URL.revokeObjectURL(blobUrl);
      script.remove();
    };
    script.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      console.error("[WPlace-AutoBOT] Failed to inject fetch interceptor via blob");
    };
    (document.head || document.documentElement).appendChild(script);
    window.addEventListener("message", (event) => {
      const { source, endpoint, blobID, blobData, token } = event.data;
      if (source === "auto-image-tile" && endpoint && blobID && blobData) {
        overlayManager.processAndRespondToTileRequest(event.data);
      }
    });
  }

  // src/js/lib/inject-library.js
  var LIBRARY_ID = "wplace-lib-" + Math.random().toString(36).slice(2, 11);
  async function injectLibrary(getCodeFn, globalVarName) {
    if (window[globalVarName]) {
      console.log(`\u2705 ${globalVarName} already loaded`);
      return;
    }
    const script = document.createElement("script");
    script.textContent = `
    (function() {
      if (window.__wplace_lib_injected_${globalVarName}) return;
      window.__wplace_lib_injected_${globalVarName} = true;

      window.addEventListener('message', function(event) {
        if (event.data && event.data.source === '${LIBRARY_ID}' && event.data.action === 'request-library') {
          try {
            const code = ${JSON.stringify(getCodeFn())};

            const blob = new Blob([code], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);

            const libScript = document.createElement('script');
            libScript.src = blobUrl;

            libScript.onload = function() {
              URL.revokeObjectURL(blobUrl);
              window.postMessage({
                source: '${LIBRARY_ID}',
                action: 'library-loaded',
                name: '${globalVarName}'
              }, '*');
            };

            libScript.onerror = function() {
              URL.revokeObjectURL(blobUrl);
              window.postMessage({
                source: '${LIBRARY_ID}',
                action: 'library-error',
                name: '${globalVarName}',
                error: 'Failed to load library script'
              }, '*');
            };

            document.head.appendChild(libScript);
          } catch (error) {
            window.postMessage({
              source: '${LIBRARY_ID}',
              action: 'library-error',
              name: '${globalVarName}',
              error: 'Failed to process library code: ' + error.message
            }, '*');
          }
        }
      });

      window.postMessage({
        source: '${LIBRARY_ID}',
        action: 'request-library'
      }, '*');
    })();
  `;
    document.documentElement.appendChild(script);
    script.remove();
  }
  async function waitForLibrary(globalVarName, timeout = 5e3) {
    return new Promise((resolve, reject) => {
      const check = () => {
        if (window[globalVarName]) {
          resolve(true);
          return;
        }
        setTimeout(check, 10);
      };
      const timer = setTimeout(() => {
        reject(new Error(`Library ${globalVarName} not loaded within ${timeout}ms`));
      }, timeout);
      window.addEventListener("message", (event) => {
        if (event.data?.source === LIBRARY_ID) {
          if (event.data.action === "library-loaded" && event.data.name === globalVarName) {
            clearTimeout(timer);
            resolve(true);
          } else if (event.data.action === "library-error") {
            clearTimeout(timer);
            reject(new Error(`Library ${globalVarName} failed to load: ${event.data.error}`));
          }
        }
      });
      check();
    });
  }

  // src/js/lib/intl-messageformat.js
  function getIntlMessageFormatCode() {
    return 'var IntlMessageFormat=(()=>{var e=Object.defineProperty,t=Object.defineProperties,r=Object.getOwnPropertyDescriptor,i=Object.getOwnPropertyDescriptors,n=Object.getOwnPropertyNames,o=Object.getOwnPropertySymbols,s=Object.prototype.hasOwnProperty,h=Object.prototype.propertyIsEnumerable,a=(t,r,i)=>r in t?e(t,r,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[r]=i,u=(e,t)=>{for(var r in t||(t={}))s.call(t,r)&&a(e,r,t[r]);if(o)for(var r of o(t))h.call(t,r)&&a(e,r,t[r]);return e},l=(e,t,r)=>(a(e,"symbol"!=typeof t?t+"":t,r),r),c={};function p(e,t){var r=t&&t.cache?t.cache:A,i=t&&t.serializer?t.serializer:_;return(t&&t.strategy?t.strategy:g)(e,{cache:r,serializer:i})}function f(e,t,r,i){var n,o=null==(n=i)||"number"==typeof n||"boolean"==typeof n?i:r(i),s=t.get(o);return void 0===s&&(s=e.call(this,i),t.set(o,s)),s}function E(e,t,r){var i=Array.prototype.slice.call(arguments,3),n=r(i),o=t.get(n);return void 0===o&&(o=e.apply(this,i),t.set(n,o)),o}function m(e,t,r,i,n){return r.bind(t,e,i,n)}function g(e,t){return m(e,this,1===e.length?f:E,t.cache.create(),t.serializer)}((t,r)=>{for(var i in r)e(t,i,{get:r[i],enumerable:!0})})(c,{ErrorCode:()=>Le,FormatError:()=>Pe,IntlMessageFormat:()=>De,InvalidValueError:()=>Se,InvalidValueTypeError:()=>Ne,MissingValueError:()=>Ie,PART_TYPE:()=>Ce,default:()=>Fe,formatToParts:()=>Me,isFormatXMLElementFn:()=>Re});var b,H,T,B,y,d,_=function(){return JSON.stringify(arguments)},v=function(){function e(){this.cache=Object.create(null)}return e.prototype.get=function(e){return this.cache[e]},e.prototype.set=function(e,t){this.cache[e]=t},e}(),A={create:function(){return new v}},L={variadic:function(e,t){return m(e,this,E,t.cache.create(),t.serializer)},monadic:function(e,t){return m(e,this,f,t.cache.create(),t.serializer)}},P=function(){return P=Object.assign||function(e){for(var t,r=1,i=arguments.length;r<i;r++)for(var n in t=arguments[r])Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e},P.apply(this,arguments)};function S(e){return e.type===T.literal}function N(e){return e.type===T.argument}function I(e){return e.type===T.number}function C(e){return e.type===T.date}function R(e){return e.type===T.time}function M(e){return e.type===T.select}function O(e){return e.type===T.plural}function U(e){return e.type===T.pound}function G(e){return e.type===T.tag}function w(e){return!(!e||"object"!=typeof e||e.type!==y.number)}function D(e){return!(!e||"object"!=typeof e||e.type!==y.dateTime)}(H=b||(b={}))[H.EXPECT_ARGUMENT_CLOSING_BRACE=1]="EXPECT_ARGUMENT_CLOSING_BRACE",H[H.EMPTY_ARGUMENT=2]="EMPTY_ARGUMENT",H[H.MALFORMED_ARGUMENT=3]="MALFORMED_ARGUMENT",H[H.EXPECT_ARGUMENT_TYPE=4]="EXPECT_ARGUMENT_TYPE",H[H.INVALID_ARGUMENT_TYPE=5]="INVALID_ARGUMENT_TYPE",H[H.EXPECT_ARGUMENT_STYLE=6]="EXPECT_ARGUMENT_STYLE",H[H.INVALID_NUMBER_SKELETON=7]="INVALID_NUMBER_SKELETON",H[H.INVALID_DATE_TIME_SKELETON=8]="INVALID_DATE_TIME_SKELETON",H[H.EXPECT_NUMBER_SKELETON=9]="EXPECT_NUMBER_SKELETON",H[H.EXPECT_DATE_TIME_SKELETON=10]="EXPECT_DATE_TIME_SKELETON",H[H.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE=11]="UNCLOSED_QUOTE_IN_ARGUMENT_STYLE",H[H.EXPECT_SELECT_ARGUMENT_OPTIONS=12]="EXPECT_SELECT_ARGUMENT_OPTIONS",H[H.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE=13]="EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE",H[H.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE=14]="INVALID_PLURAL_ARGUMENT_OFFSET_VALUE",H[H.EXPECT_SELECT_ARGUMENT_SELECTOR=15]="EXPECT_SELECT_ARGUMENT_SELECTOR",H[H.EXPECT_PLURAL_ARGUMENT_SELECTOR=16]="EXPECT_PLURAL_ARGUMENT_SELECTOR",H[H.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT=17]="EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT",H[H.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT=18]="EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT",H[H.INVALID_PLURAL_ARGUMENT_SELECTOR=19]="INVALID_PLURAL_ARGUMENT_SELECTOR",H[H.DUPLICATE_PLURAL_ARGUMENT_SELECTOR=20]="DUPLICATE_PLURAL_ARGUMENT_SELECTOR",H[H.DUPLICATE_SELECT_ARGUMENT_SELECTOR=21]="DUPLICATE_SELECT_ARGUMENT_SELECTOR",H[H.MISSING_OTHER_CLAUSE=22]="MISSING_OTHER_CLAUSE",H[H.INVALID_TAG=23]="INVALID_TAG",H[H.INVALID_TAG_NAME=25]="INVALID_TAG_NAME",H[H.UNMATCHED_CLOSING_TAG=26]="UNMATCHED_CLOSING_TAG",H[H.UNCLOSED_TAG=27]="UNCLOSED_TAG",(B=T||(T={}))[B.literal=0]="literal",B[B.argument=1]="argument",B[B.number=2]="number",B[B.date=3]="date",B[B.time=4]="time",B[B.select=5]="select",B[B.plural=6]="plural",B[B.pound=7]="pound",B[B.tag=8]="tag",(d=y||(y={}))[d.number=0]="number",d[d.dateTime=1]="dateTime";var F=/[ \\xA0\\u1680\\u2000-\\u200A\\u202F\\u205F\\u3000]/,k=/(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^\']*\'[^\']*\')*[^\']*$)/g;function V(e){var t={};return e.replace(k,(function(e){var r=e.length;switch(e[0]){case"G":t.era=4===r?"long":5===r?"narrow":"short";break;case"y":t.year=2===r?"2-digit":"numeric";break;case"Y":case"u":case"U":case"r":throw new RangeError("`Y/u/U/r` (year) patterns are not supported, use `y` instead");case"q":case"Q":throw new RangeError("`q/Q` (quarter) patterns are not supported");case"M":case"L":t.month=["numeric","2-digit","short","long","narrow"][r-1];break;case"w":case"W":throw new RangeError("`w/W` (week) patterns are not supported");case"d":t.day=["numeric","2-digit"][r-1];break;case"D":case"F":case"g":throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");case"E":t.weekday=4===r?"long":5===r?"narrow":"short";break;case"e":if(r<4)throw new RangeError("`e..eee` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][r-4];break;case"c":if(r<4)throw new RangeError("`c..ccc` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][r-4];break;case"a":t.hour12=!0;break;case"b":case"B":throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");case"h":t.hourCycle="h12",t.hour=["numeric","2-digit"][r-1];break;case"H":t.hourCycle="h23",t.hour=["numeric","2-digit"][r-1];break;case"K":t.hourCycle="h11",t.hour=["numeric","2-digit"][r-1];break;case"k":t.hourCycle="h24",t.hour=["numeric","2-digit"][r-1];break;case"j":case"J":case"C":throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");case"m":t.minute=["numeric","2-digit"][r-1];break;case"s":t.second=["numeric","2-digit"][r-1];break;case"S":case"A":throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");case"z":t.timeZoneName=r<4?"short":"long";break;case"Z":case"O":case"v":case"V":case"X":case"x":throw new RangeError("`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead")}return""})),t}var X=/[\\t-\\r \\x85\\u200E\\u200F\\u2028\\u2029]/i;var x=/^\\.(?:(0+)(\\*)?|(#+)|(0+)(#+))$/g,K=/^(@+)?(\\+|#+)?[rs]?$/g,Y=/(\\*)(0+)|(#+)(0+)|(0+)/g,j=/^(0+)$/;function Z(e){var t={};return"r"===e[e.length-1]?t.roundingPriority="morePrecision":"s"===e[e.length-1]&&(t.roundingPriority="lessPrecision"),e.replace(K,(function(e,r,i){return"string"!=typeof i?(t.minimumSignificantDigits=r.length,t.maximumSignificantDigits=r.length):"+"===i?t.minimumSignificantDigits=r.length:"#"===r[0]?t.maximumSignificantDigits=r.length:(t.minimumSignificantDigits=r.length,t.maximumSignificantDigits=r.length+("string"==typeof i?i.length:0)),""})),t}function W(e){switch(e){case"sign-auto":return{signDisplay:"auto"};case"sign-accounting":case"()":return{currencySign:"accounting"};case"sign-always":case"+!":return{signDisplay:"always"};case"sign-accounting-always":case"()!":return{signDisplay:"always",currencySign:"accounting"};case"sign-except-zero":case"+?":return{signDisplay:"exceptZero"};case"sign-accounting-except-zero":case"()?":return{signDisplay:"exceptZero",currencySign:"accounting"};case"sign-never":case"+_":return{signDisplay:"never"}}}function z(e){var t;if("E"===e[0]&&"E"===e[1]?(t={notation:"engineering"},e=e.slice(2)):"E"===e[0]&&(t={notation:"scientific"},e=e.slice(1)),t){var r=e.slice(0,2);if("+!"===r?(t.signDisplay="always",e=e.slice(2)):"+?"===r&&(t.signDisplay="exceptZero",e=e.slice(2)),!j.test(e))throw new Error("Malformed concise eng/scientific notation");t.minimumIntegerDigits=e.length}return t}function $(e){var t=W(e);return t||{}}function Q(e){for(var t={},r=0,i=e;r<i.length;r++){var n=i[r];switch(n.stem){case"percent":case"%":t.style="percent";continue;case"%x100":t.style="percent",t.scale=100;continue;case"currency":t.style="currency",t.currency=n.options[0];continue;case"group-off":case",_":t.useGrouping=!1;continue;case"precision-integer":case".":t.maximumFractionDigits=0;continue;case"measure-unit":case"unit":t.style="unit",t.unit=n.options[0].replace(/^(.*?)-/,"");continue;case"compact-short":case"K":t.notation="compact",t.compactDisplay="short";continue;case"compact-long":case"KK":t.notation="compact",t.compactDisplay="long";continue;case"scientific":t=P(P(P({},t),{notation:"scientific"}),n.options.reduce((function(e,t){return P(P({},e),$(t))}),{}));continue;case"engineering":t=P(P(P({},t),{notation:"engineering"}),n.options.reduce((function(e,t){return P(P({},e),$(t))}),{}));continue;case"notation-simple":t.notation="standard";continue;case"unit-width-narrow":t.currencyDisplay="narrowSymbol",t.unitDisplay="narrow";continue;case"unit-width-short":t.currencyDisplay="code",t.unitDisplay="short";continue;case"unit-width-full-name":t.currencyDisplay="name",t.unitDisplay="long";continue;case"unit-width-iso-code":t.currencyDisplay="symbol";continue;case"scale":t.scale=parseFloat(n.options[0]);continue;case"rounding-mode-floor":t.roundingMode="floor";continue;case"rounding-mode-ceiling":t.roundingMode="ceil";continue;case"rounding-mode-down":t.roundingMode="trunc";continue;case"rounding-mode-up":t.roundingMode="expand";continue;case"rounding-mode-half-even":t.roundingMode="halfEven";continue;case"rounding-mode-half-down":t.roundingMode="halfTrunc";continue;case"rounding-mode-half-up":t.roundingMode="halfExpand";continue;case"integer-width":if(n.options.length>1)throw new RangeError("integer-width stems only accept a single optional option");n.options[0].replace(Y,(function(e,r,i,n,o,s){if(r)t.minimumIntegerDigits=i.length;else{if(n&&o)throw new Error("We currently do not support maximum integer digits");if(s)throw new Error("We currently do not support exact integer digits")}return""}));continue}if(j.test(n.stem))t.minimumIntegerDigits=n.stem.length;else if(x.test(n.stem)){if(n.options.length>1)throw new RangeError("Fraction-precision stems only accept a single optional option");n.stem.replace(x,(function(e,r,i,n,o,s){return"*"===i?t.minimumFractionDigits=r.length:n&&"#"===n[0]?t.maximumFractionDigits=n.length:o&&s?(t.minimumFractionDigits=o.length,t.maximumFractionDigits=o.length+s.length):(t.minimumFractionDigits=r.length,t.maximumFractionDigits=r.length),""}));var o=n.options[0];"w"===o?t=P(P({},t),{trailingZeroDisplay:"stripIfInteger"}):o&&(t=P(P({},t),Z(o)))}else if(K.test(n.stem))t=P(P({},t),Z(n.stem));else{var s=W(n.stem);s&&(t=P(P({},t),s));var h=z(n.stem);h&&(t=P(P({},t),h))}}return t}var J,q={"001":["H","h"],419:["h","H","hB","hb"],AC:["H","h","hb","hB"],AD:["H","hB"],AE:["h","hB","hb","H"],AF:["H","hb","hB","h"],AG:["h","hb","H","hB"],AI:["H","h","hb","hB"],AL:["h","H","hB"],AM:["H","hB"],AO:["H","hB"],AR:["h","H","hB","hb"],AS:["h","H"],AT:["H","hB"],AU:["h","hb","H","hB"],AW:["H","hB"],AX:["H"],AZ:["H","hB","h"],BA:["H","hB","h"],BB:["h","hb","H","hB"],BD:["h","hB","H"],BE:["H","hB"],BF:["H","hB"],BG:["H","hB","h"],BH:["h","hB","hb","H"],BI:["H","h"],BJ:["H","hB"],BL:["H","hB"],BM:["h","hb","H","hB"],BN:["hb","hB","h","H"],BO:["h","H","hB","hb"],BQ:["H"],BR:["H","hB"],BS:["h","hb","H","hB"],BT:["h","H"],BW:["H","h","hb","hB"],BY:["H","h"],BZ:["H","h","hb","hB"],CA:["h","hb","H","hB"],CC:["H","h","hb","hB"],CD:["hB","H"],CF:["H","h","hB"],CG:["H","hB"],CH:["H","hB","h"],CI:["H","hB"],CK:["H","h","hb","hB"],CL:["h","H","hB","hb"],CM:["H","h","hB"],CN:["H","hB","hb","h"],CO:["h","H","hB","hb"],CP:["H"],CR:["h","H","hB","hb"],CU:["h","H","hB","hb"],CV:["H","hB"],CW:["H","hB"],CX:["H","h","hb","hB"],CY:["h","H","hb","hB"],CZ:["H"],DE:["H","hB"],DG:["H","h","hb","hB"],DJ:["h","H"],DK:["H"],DM:["h","hb","H","hB"],DO:["h","H","hB","hb"],DZ:["h","hB","hb","H"],EA:["H","h","hB","hb"],EC:["h","H","hB","hb"],EE:["H","hB"],EG:["h","hB","hb","H"],EH:["h","hB","hb","H"],ER:["h","H"],ES:["H","hB","h","hb"],ET:["hB","hb","h","H"],FI:["H"],FJ:["h","hb","H","hB"],FK:["H","h","hb","hB"],FM:["h","hb","H","hB"],FO:["H","h"],FR:["H","hB"],GA:["H","hB"],GB:["H","h","hb","hB"],GD:["h","hb","H","hB"],GE:["H","hB","h"],GF:["H","hB"],GG:["H","h","hb","hB"],GH:["h","H"],GI:["H","h","hb","hB"],GL:["H","h"],GM:["h","hb","H","hB"],GN:["H","hB"],GP:["H","hB"],GQ:["H","hB","h","hb"],GR:["h","H","hb","hB"],GT:["h","H","hB","hb"],GU:["h","hb","H","hB"],GW:["H","hB"],GY:["h","hb","H","hB"],HK:["h","hB","hb","H"],HN:["h","H","hB","hb"],HR:["H","hB"],HU:["H","h"],IC:["H","h","hB","hb"],ID:["H"],IE:["H","h","hb","hB"],IL:["H","hB"],IM:["H","h","hb","hB"],IN:["h","H"],IO:["H","h","hb","hB"],IQ:["h","hB","hb","H"],IR:["hB","H"],IS:["H"],IT:["H","hB"],JE:["H","h","hb","hB"],JM:["h","hb","H","hB"],JO:["h","hB","hb","H"],JP:["H","K","h"],KE:["hB","hb","H","h"],KG:["H","h","hB","hb"],KH:["hB","h","H","hb"],KI:["h","hb","H","hB"],KM:["H","h","hB","hb"],KN:["h","hb","H","hB"],KP:["h","H","hB","hb"],KR:["h","H","hB","hb"],KW:["h","hB","hb","H"],KY:["h","hb","H","hB"],KZ:["H","hB"],LA:["H","hb","hB","h"],LB:["h","hB","hb","H"],LC:["h","hb","H","hB"],LI:["H","hB","h"],LK:["H","h","hB","hb"],LR:["h","hb","H","hB"],LS:["h","H"],LT:["H","h","hb","hB"],LU:["H","h","hB"],LV:["H","hB","hb","h"],LY:["h","hB","hb","H"],MA:["H","h","hB","hb"],MC:["H","hB"],MD:["H","hB"],ME:["H","hB","h"],MF:["H","hB"],MG:["H","h"],MH:["h","hb","H","hB"],MK:["H","h","hb","hB"],ML:["H"],MM:["hB","hb","H","h"],MN:["H","h","hb","hB"],MO:["h","hB","hb","H"],MP:["h","hb","H","hB"],MQ:["H","hB"],MR:["h","hB","hb","H"],MS:["H","h","hb","hB"],MT:["H","h"],MU:["H","h"],MV:["H","h"],MW:["h","hb","H","hB"],MX:["h","H","hB","hb"],MY:["hb","hB","h","H"],MZ:["H","hB"],NA:["h","H","hB","hb"],NC:["H","hB"],NE:["H"],NF:["H","h","hb","hB"],NG:["H","h","hb","hB"],NI:["h","H","hB","hb"],NL:["H","hB"],NO:["H","h"],NP:["H","h","hB"],NR:["H","h","hb","hB"],NU:["H","h","hb","hB"],NZ:["h","hb","H","hB"],OM:["h","hB","hb","H"],PA:["h","H","hB","hb"],PE:["h","H","hB","hb"],PF:["H","h","hB"],PG:["h","H"],PH:["h","hB","hb","H"],PK:["h","hB","H"],PL:["H","h"],PM:["H","hB"],PN:["H","h","hb","hB"],PR:["h","H","hB","hb"],PS:["h","hB","hb","H"],PT:["H","hB"],PW:["h","H"],PY:["h","H","hB","hb"],QA:["h","hB","hb","H"],RE:["H","hB"],RO:["H","hB"],RS:["H","hB","h"],RU:["H"],RW:["H","h"],SA:["h","hB","hb","H"],SB:["h","hb","H","hB"],SC:["H","h","hB"],SD:["h","hB","hb","H"],SE:["H"],SG:["h","hb","H","hB"],SH:["H","h","hb","hB"],SI:["H","hB"],SJ:["H"],SK:["H"],SL:["h","hb","H","hB"],SM:["H","h","hB"],SN:["H","h","hB"],SO:["h","H"],SR:["H","hB"],SS:["h","hb","H","hB"],ST:["H","hB"],SV:["h","H","hB","hb"],SX:["H","h","hb","hB"],SY:["h","hB","hb","H"],SZ:["h","hb","H","hB"],TA:["H","h","hb","hB"],TC:["h","hb","H","hB"],TD:["h","H","hB"],TF:["H","h","hB"],TG:["H","hB"],TH:["H","h"],TJ:["H","h"],TL:["H","hB","hb","h"],TM:["H","h"],TN:["h","hB","hb","H"],TO:["h","H"],TR:["H","hB"],TT:["h","hb","H","hB"],TW:["hB","hb","h","H"],TZ:["hB","hb","H","h"],UA:["H","hB","h"],UG:["hB","hb","H","h"],UM:["h","hb","H","hB"],US:["h","hb","H","hB"],UY:["h","H","hB","hb"],UZ:["H","hB","h"],VA:["H","h","hB"],VC:["h","hb","H","hB"],VE:["h","H","hB","hb"],VG:["h","hb","H","hB"],VI:["h","hb","H","hB"],VN:["H","h"],VU:["h","H"],WF:["H","hB"],WS:["h","H"],XK:["H","hB","h"],YE:["h","hB","hb","H"],YT:["H","hB"],ZA:["H","h","hb","hB"],ZM:["h","hb","H","hB"],ZW:["H","h"],"af-ZA":["H","h","hB","hb"],"ar-001":["h","hB","hb","H"],"ca-ES":["H","h","hB"],"en-001":["h","hb","H","hB"],"en-HK":["h","hb","H","hB"],"en-IL":["H","h","hb","hB"],"en-MY":["h","hb","H","hB"],"es-BR":["H","h","hB","hb"],"es-ES":["H","h","hB","hb"],"es-GQ":["H","h","hB","hb"],"fr-CA":["H","h","hB"],"gl-ES":["H","h","hB"],"gu-IN":["hB","hb","h","H"],"hi-IN":["hB","h","H"],"it-CH":["H","h","hB"],"it-IT":["H","h","hB"],"kn-IN":["hB","h","H"],"ml-IN":["hB","h","H"],"mr-IN":["hB","hb","h","H"],"pa-IN":["hB","hb","h","H"],"ta-IN":["hB","h","hb","H"],"te-IN":["hB","h","H"],"zu-ZA":["H","hB","hb","h"]};function ee(e){var t=e.hourCycle;if(void 0===t&&e.hourCycles&&e.hourCycles.length&&(t=e.hourCycles[0]),t)switch(t){case"h24":return"k";case"h23":return"H";case"h12":return"h";case"h11":return"K";default:throw new Error("Invalid hourCycle")}var r,i=e.language;return"root"!==i&&(r=e.maximize().region),(q[r||""]||q[i||""]||q["".concat(i,"-001")]||q["001"])[0]}var te=new RegExp("^".concat(F.source,"*")),re=new RegExp("".concat(F.source,"*$"));function ie(e,t){return{start:e,end:t}}var ne=!!String.prototype.startsWith&&"_a".startsWith("a",1),oe=!!String.fromCodePoint,se=!!Object.fromEntries,he=!!String.prototype.codePointAt,ae=!!String.prototype.trimStart,ue=!!String.prototype.trimEnd,le=!!Number.isSafeInteger?Number.isSafeInteger:function(e){return"number"==typeof e&&isFinite(e)&&Math.floor(e)===e&&Math.abs(e)<=9007199254740991},ce=!0;try{ce="a"===(null===(J=Be("([^\\\\p{White_Space}\\\\p{Pattern_Syntax}]*)","yu").exec("a"))||void 0===J?void 0:J[0])}catch(e){ce=!1}var pe,fe,Ee=ne?function(e,t,r){return e.startsWith(t,r)}:function(e,t,r){return e.slice(r,r+t.length)===t},me=oe?String.fromCodePoint:function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];for(var r,i="",n=e.length,o=0;n>o;){if((r=e[o++])>1114111)throw RangeError(r+" is not a valid code point");i+=r<65536?String.fromCharCode(r):String.fromCharCode(55296+((r-=65536)>>10),r%1024+56320)}return i},ge=se?Object.fromEntries:function(e){for(var t={},r=0,i=e;r<i.length;r++){var n=i[r],o=n[0],s=n[1];t[o]=s}return t},be=he?function(e,t){return e.codePointAt(t)}:function(e,t){var r=e.length;if(!(t<0||t>=r)){var i,n=e.charCodeAt(t);return n<55296||n>56319||t+1===r||(i=e.charCodeAt(t+1))<56320||i>57343?n:i-56320+(n-55296<<10)+65536}},He=ae?function(e){return e.trimStart()}:function(e){return e.replace(te,"")},Te=ue?function(e){return e.trimEnd()}:function(e){return e.replace(re,"")};function Be(e,t){return new RegExp(e,t)}ce?(fe=Be("([^\\\\p{White_Space}\\\\p{Pattern_Syntax}]*)","yu"),pe=function(e,t){var r;return fe.lastIndex=t,null!==(r=fe.exec(e)[1])&&void 0!==r?r:""}):pe=function(e,t){for(var r=[];;){var i=be(e,t);if(void 0===i||_e(i)||ve(i))break;r.push(i),t+=i>=65536?2:1}return me.apply(void 0,r)};var ye=function(){function e(e,t){void 0===t&&(t={}),this.message=e,this.position={offset:0,line:1,column:1},this.ignoreTag=!!t.ignoreTag,this.locale=t.locale,this.requiresOtherClause=!!t.requiresOtherClause,this.shouldParseSkeletons=!!t.shouldParseSkeletons}return e.prototype.parse=function(){if(0!==this.offset())throw Error("parser can only be used once");return this.parseMessage(0,"",!1)},e.prototype.parseMessage=function(e,t,r){for(var i=[];!this.isEOF();){var n=this.char();if(123===n){if((o=this.parseArgument(e,r)).err)return o;i.push(o.val)}else{if(125===n&&e>0)break;if(35!==n||"plural"!==t&&"selectordinal"!==t){if(60===n&&!this.ignoreTag&&47===this.peek()){if(r)break;return this.error(b.UNMATCHED_CLOSING_TAG,ie(this.clonePosition(),this.clonePosition()))}if(60===n&&!this.ignoreTag&&de(this.peek()||0)){if((o=this.parseTag(e,t)).err)return o;i.push(o.val)}else{var o;if((o=this.parseLiteral(e,t)).err)return o;i.push(o.val)}}else{var s=this.clonePosition();this.bump(),i.push({type:T.pound,location:ie(s,this.clonePosition())})}}}return{val:i,err:null}},e.prototype.parseTag=function(e,t){var r=this.clonePosition();this.bump();var i=this.parseTagName();if(this.bumpSpace(),this.bumpIf("/>"))return{val:{type:T.literal,value:"<".concat(i,"/>"),location:ie(r,this.clonePosition())},err:null};if(this.bumpIf(">")){var n=this.parseMessage(e+1,t,!0);if(n.err)return n;var o=n.val,s=this.clonePosition();if(this.bumpIf("</")){if(this.isEOF()||!de(this.char()))return this.error(b.INVALID_TAG,ie(s,this.clonePosition()));var h=this.clonePosition();return i!==this.parseTagName()?this.error(b.UNMATCHED_CLOSING_TAG,ie(h,this.clonePosition())):(this.bumpSpace(),this.bumpIf(">")?{val:{type:T.tag,value:i,children:o,location:ie(r,this.clonePosition())},err:null}:this.error(b.INVALID_TAG,ie(s,this.clonePosition())))}return this.error(b.UNCLOSED_TAG,ie(r,this.clonePosition()))}return this.error(b.INVALID_TAG,ie(r,this.clonePosition()))},e.prototype.parseTagName=function(){var e,t=this.offset();for(this.bump();!this.isEOF()&&(45===(e=this.char())||46===e||e>=48&&e<=57||95===e||e>=97&&e<=122||e>=65&&e<=90||183==e||e>=192&&e<=214||e>=216&&e<=246||e>=248&&e<=893||e>=895&&e<=8191||e>=8204&&e<=8205||e>=8255&&e<=8256||e>=8304&&e<=8591||e>=11264&&e<=12271||e>=12289&&e<=55295||e>=63744&&e<=64975||e>=65008&&e<=65533||e>=65536&&e<=983039);)this.bump();return this.message.slice(t,this.offset())},e.prototype.parseLiteral=function(e,t){for(var r=this.clonePosition(),i="";;){var n=this.tryParseQuote(t);if(n)i+=n;else{var o=this.tryParseUnquoted(e,t);if(o)i+=o;else{var s=this.tryParseLeftAngleBracket();if(!s)break;i+=s}}}var h=ie(r,this.clonePosition());return{val:{type:T.literal,value:i,location:h},err:null}},e.prototype.tryParseLeftAngleBracket=function(){return this.isEOF()||60!==this.char()||!this.ignoreTag&&(de(e=this.peek()||0)||47===e)?null:(this.bump(),"<");var e},e.prototype.tryParseQuote=function(e){if(this.isEOF()||39!==this.char())return null;switch(this.peek()){case 39:return this.bump(),this.bump(),"\'";case 123:case 60:case 62:case 125:break;case 35:if("plural"===e||"selectordinal"===e)break;return null;default:return null}this.bump();var t=[this.char()];for(this.bump();!this.isEOF();){var r=this.char();if(39===r){if(39!==this.peek()){this.bump();break}t.push(39),this.bump()}else t.push(r);this.bump()}return me.apply(void 0,t)},e.prototype.tryParseUnquoted=function(e,t){if(this.isEOF())return null;var r=this.char();return 60===r||123===r||35===r&&("plural"===t||"selectordinal"===t)||125===r&&e>0?null:(this.bump(),me(r))},e.prototype.parseArgument=function(e,t){var r=this.clonePosition();if(this.bump(),this.bumpSpace(),this.isEOF())return this.error(b.EXPECT_ARGUMENT_CLOSING_BRACE,ie(r,this.clonePosition()));if(125===this.char())return this.bump(),this.error(b.EMPTY_ARGUMENT,ie(r,this.clonePosition()));var i=this.parseIdentifierIfPossible().value;if(!i)return this.error(b.MALFORMED_ARGUMENT,ie(r,this.clonePosition()));if(this.bumpSpace(),this.isEOF())return this.error(b.EXPECT_ARGUMENT_CLOSING_BRACE,ie(r,this.clonePosition()));switch(this.char()){case 125:return this.bump(),{val:{type:T.argument,value:i,location:ie(r,this.clonePosition())},err:null};case 44:return this.bump(),this.bumpSpace(),this.isEOF()?this.error(b.EXPECT_ARGUMENT_CLOSING_BRACE,ie(r,this.clonePosition())):this.parseArgumentOptions(e,t,i,r);default:return this.error(b.MALFORMED_ARGUMENT,ie(r,this.clonePosition()))}},e.prototype.parseIdentifierIfPossible=function(){var e=this.clonePosition(),t=this.offset(),r=pe(this.message,t),i=t+r.length;return this.bumpTo(i),{value:r,location:ie(e,this.clonePosition())}},e.prototype.parseArgumentOptions=function(e,t,r,i){var n,o=this.clonePosition(),s=this.parseIdentifierIfPossible().value,h=this.clonePosition();switch(s){case"":return this.error(b.EXPECT_ARGUMENT_TYPE,ie(o,h));case"number":case"date":case"time":this.bumpSpace();var a=null;if(this.bumpIf(",")){this.bumpSpace();var u=this.clonePosition();if((H=this.parseSimpleArgStyleIfPossible()).err)return H;if(0===(f=Te(H.val)).length)return this.error(b.EXPECT_ARGUMENT_STYLE,ie(this.clonePosition(),this.clonePosition()));a={style:f,styleLocation:ie(u,this.clonePosition())}}if((B=this.tryParseArgumentClose(i)).err)return B;var l=ie(i,this.clonePosition());if(a&&Ee(null==a?void 0:a.style,"::",0)){var c=He(a.style.slice(2));if("number"===s)return(H=this.parseNumberSkeletonFromString(c,a.styleLocation)).err?H:{val:{type:T.number,value:r,location:l,style:H.val},err:null};if(0===c.length)return this.error(b.EXPECT_DATE_TIME_SKELETON,l);var p=c;this.locale&&(p=function(e,t){for(var r="",i=0;i<e.length;i++){var n=e.charAt(i);if("j"===n){for(var o=0;i+1<e.length&&e.charAt(i+1)===n;)o++,i++;var s=1+(1&o),h=o<2?1:3+(o>>1),a=ee(t);for("H"!=a&&"k"!=a||(h=0);h-- >0;)r+="a";for(;s-- >0;)r=a+r}else r+="J"===n?"H":n}return r}(c,this.locale));var f={type:y.dateTime,pattern:p,location:a.styleLocation,parsedOptions:this.shouldParseSkeletons?V(p):{}};return{val:{type:"date"===s?T.date:T.time,value:r,location:l,style:f},err:null}}return{val:{type:"number"===s?T.number:"date"===s?T.date:T.time,value:r,location:l,style:null!==(n=null==a?void 0:a.style)&&void 0!==n?n:null},err:null};case"plural":case"selectordinal":case"select":var E=this.clonePosition();if(this.bumpSpace(),!this.bumpIf(","))return this.error(b.EXPECT_SELECT_ARGUMENT_OPTIONS,ie(E,P({},E)));this.bumpSpace();var m=this.parseIdentifierIfPossible(),g=0;if("select"!==s&&"offset"===m.value){if(!this.bumpIf(":"))return this.error(b.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE,ie(this.clonePosition(),this.clonePosition()));var H;if(this.bumpSpace(),(H=this.tryParseDecimalInteger(b.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE,b.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE)).err)return H;this.bumpSpace(),m=this.parseIdentifierIfPossible(),g=H.val}var B,d=this.tryParsePluralOrSelectOptions(e,s,t,m);if(d.err)return d;if((B=this.tryParseArgumentClose(i)).err)return B;var _=ie(i,this.clonePosition());return"select"===s?{val:{type:T.select,value:r,options:ge(d.val),location:_},err:null}:{val:{type:T.plural,value:r,options:ge(d.val),offset:g,pluralType:"plural"===s?"cardinal":"ordinal",location:_},err:null};default:return this.error(b.INVALID_ARGUMENT_TYPE,ie(o,h))}},e.prototype.tryParseArgumentClose=function(e){return this.isEOF()||125!==this.char()?this.error(b.EXPECT_ARGUMENT_CLOSING_BRACE,ie(e,this.clonePosition())):(this.bump(),{val:!0,err:null})},e.prototype.parseSimpleArgStyleIfPossible=function(){for(var e=0,t=this.clonePosition();!this.isEOF();){switch(this.char()){case 39:this.bump();var r=this.clonePosition();if(!this.bumpUntil("\'"))return this.error(b.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE,ie(r,this.clonePosition()));this.bump();break;case 123:e+=1,this.bump();break;case 125:if(!(e>0))return{val:this.message.slice(t.offset,this.offset()),err:null};e-=1;break;default:this.bump()}}return{val:this.message.slice(t.offset,this.offset()),err:null}},e.prototype.parseNumberSkeletonFromString=function(e,t){var r=[];try{r=function(e){if(0===e.length)throw new Error("Number skeleton cannot be empty");for(var t=[],r=0,i=e.split(X).filter((function(e){return e.length>0}));r<i.length;r++){var n=i[r].split("/");if(0===n.length)throw new Error("Invalid number skeleton");for(var o=n[0],s=n.slice(1),h=0,a=s;h<a.length;h++)if(0===a[h].length)throw new Error("Invalid number skeleton");t.push({stem:o,options:s})}return t}(e)}catch(e){return this.error(b.INVALID_NUMBER_SKELETON,t)}return{val:{type:y.number,tokens:r,location:t,parsedOptions:this.shouldParseSkeletons?Q(r):{}},err:null}},e.prototype.tryParsePluralOrSelectOptions=function(e,t,r,i){for(var n,o=!1,s=[],h=new Set,a=i.value,u=i.location;;){if(0===a.length){var l=this.clonePosition();if("select"===t||!this.bumpIf("="))break;var c=this.tryParseDecimalInteger(b.EXPECT_PLURAL_ARGUMENT_SELECTOR,b.INVALID_PLURAL_ARGUMENT_SELECTOR);if(c.err)return c;u=ie(l,this.clonePosition()),a=this.message.slice(l.offset,this.offset())}if(h.has(a))return this.error("select"===t?b.DUPLICATE_SELECT_ARGUMENT_SELECTOR:b.DUPLICATE_PLURAL_ARGUMENT_SELECTOR,u);"other"===a&&(o=!0),this.bumpSpace();var p=this.clonePosition();if(!this.bumpIf("{"))return this.error("select"===t?b.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT:b.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT,ie(this.clonePosition(),this.clonePosition()));var f=this.parseMessage(e+1,t,r);if(f.err)return f;var E=this.tryParseArgumentClose(p);if(E.err)return E;s.push([a,{value:f.val,location:ie(p,this.clonePosition())}]),h.add(a),this.bumpSpace(),a=(n=this.parseIdentifierIfPossible()).value,u=n.location}return 0===s.length?this.error("select"===t?b.EXPECT_SELECT_ARGUMENT_SELECTOR:b.EXPECT_PLURAL_ARGUMENT_SELECTOR,ie(this.clonePosition(),this.clonePosition())):this.requiresOtherClause&&!o?this.error(b.MISSING_OTHER_CLAUSE,ie(this.clonePosition(),this.clonePosition())):{val:s,err:null}},e.prototype.tryParseDecimalInteger=function(e,t){var r=1,i=this.clonePosition();this.bumpIf("+")||this.bumpIf("-")&&(r=-1);for(var n=!1,o=0;!this.isEOF();){var s=this.char();if(!(s>=48&&s<=57))break;n=!0,o=10*o+(s-48),this.bump()}var h=ie(i,this.clonePosition());return n?le(o*=r)?{val:o,err:null}:this.error(t,h):this.error(e,h)},e.prototype.offset=function(){return this.position.offset},e.prototype.isEOF=function(){return this.offset()===this.message.length},e.prototype.clonePosition=function(){return{offset:this.position.offset,line:this.position.line,column:this.position.column}},e.prototype.char=function(){var e=this.position.offset;if(e>=this.message.length)throw Error("out of bound");var t=be(this.message,e);if(void 0===t)throw Error("Offset ".concat(e," is at invalid UTF-16 code unit boundary"));return t},e.prototype.error=function(e,t){return{val:null,err:{kind:e,message:this.message,location:t}}},e.prototype.bump=function(){if(!this.isEOF()){var e=this.char();10===e?(this.position.line+=1,this.position.column=1,this.position.offset+=1):(this.position.column+=1,this.position.offset+=e<65536?1:2)}},e.prototype.bumpIf=function(e){if(Ee(this.message,e,this.offset())){for(var t=0;t<e.length;t++)this.bump();return!0}return!1},e.prototype.bumpUntil=function(e){var t=this.offset(),r=this.message.indexOf(e,t);return r>=0?(this.bumpTo(r),!0):(this.bumpTo(this.message.length),!1)},e.prototype.bumpTo=function(e){if(this.offset()>e)throw Error("targetOffset ".concat(e," must be greater than or equal to the current offset ").concat(this.offset()));for(e=Math.min(e,this.message.length);;){var t=this.offset();if(t===e)break;if(t>e)throw Error("targetOffset ".concat(e," is at invalid UTF-16 code unit boundary"));if(this.bump(),this.isEOF())break}},e.prototype.bumpSpace=function(){for(;!this.isEOF()&&_e(this.char());)this.bump()},e.prototype.peek=function(){if(this.isEOF())return null;var e=this.char(),t=this.offset(),r=this.message.charCodeAt(t+(e>=65536?2:1));return null!=r?r:null},e}();function de(e){return e>=97&&e<=122||e>=65&&e<=90}function _e(e){return e>=9&&e<=13||32===e||133===e||e>=8206&&e<=8207||8232===e||8233===e}function ve(e){return e>=33&&e<=35||36===e||e>=37&&e<=39||40===e||41===e||42===e||43===e||44===e||45===e||e>=46&&e<=47||e>=58&&e<=59||e>=60&&e<=62||e>=63&&e<=64||91===e||92===e||93===e||94===e||96===e||123===e||124===e||125===e||126===e||161===e||e>=162&&e<=165||166===e||167===e||169===e||171===e||172===e||174===e||176===e||177===e||182===e||187===e||191===e||215===e||247===e||e>=8208&&e<=8213||e>=8214&&e<=8215||8216===e||8217===e||8218===e||e>=8219&&e<=8220||8221===e||8222===e||8223===e||e>=8224&&e<=8231||e>=8240&&e<=8248||8249===e||8250===e||e>=8251&&e<=8254||e>=8257&&e<=8259||8260===e||8261===e||8262===e||e>=8263&&e<=8273||8274===e||8275===e||e>=8277&&e<=8286||e>=8592&&e<=8596||e>=8597&&e<=8601||e>=8602&&e<=8603||e>=8604&&e<=8607||8608===e||e>=8609&&e<=8610||8611===e||e>=8612&&e<=8613||8614===e||e>=8615&&e<=8621||8622===e||e>=8623&&e<=8653||e>=8654&&e<=8655||e>=8656&&e<=8657||8658===e||8659===e||8660===e||e>=8661&&e<=8691||e>=8692&&e<=8959||e>=8960&&e<=8967||8968===e||8969===e||8970===e||8971===e||e>=8972&&e<=8991||e>=8992&&e<=8993||e>=8994&&e<=9e3||9001===e||9002===e||e>=9003&&e<=9083||9084===e||e>=9085&&e<=9114||e>=9115&&e<=9139||e>=9140&&e<=9179||e>=9180&&e<=9185||e>=9186&&e<=9254||e>=9255&&e<=9279||e>=9280&&e<=9290||e>=9291&&e<=9311||e>=9472&&e<=9654||9655===e||e>=9656&&e<=9664||9665===e||e>=9666&&e<=9719||e>=9720&&e<=9727||e>=9728&&e<=9838||9839===e||e>=9840&&e<=10087||10088===e||10089===e||10090===e||10091===e||10092===e||10093===e||10094===e||10095===e||10096===e||10097===e||10098===e||10099===e||10100===e||10101===e||e>=10132&&e<=10175||e>=10176&&e<=10180||10181===e||10182===e||e>=10183&&e<=10213||10214===e||10215===e||10216===e||10217===e||10218===e||10219===e||10220===e||10221===e||10222===e||10223===e||e>=10224&&e<=10239||e>=10240&&e<=10495||e>=10496&&e<=10626||10627===e||10628===e||10629===e||10630===e||10631===e||10632===e||10633===e||10634===e||10635===e||10636===e||10637===e||10638===e||10639===e||10640===e||10641===e||10642===e||10643===e||10644===e||10645===e||10646===e||10647===e||10648===e||e>=10649&&e<=10711||10712===e||10713===e||10714===e||10715===e||e>=10716&&e<=10747||10748===e||10749===e||e>=10750&&e<=11007||e>=11008&&e<=11055||e>=11056&&e<=11076||e>=11077&&e<=11078||e>=11079&&e<=11084||e>=11085&&e<=11123||e>=11124&&e<=11125||e>=11126&&e<=11157||11158===e||e>=11159&&e<=11263||e>=11776&&e<=11777||11778===e||11779===e||11780===e||11781===e||e>=11782&&e<=11784||11785===e||11786===e||11787===e||11788===e||11789===e||e>=11790&&e<=11798||11799===e||e>=11800&&e<=11801||11802===e||11803===e||11804===e||11805===e||e>=11806&&e<=11807||11808===e||11809===e||11810===e||11811===e||11812===e||11813===e||11814===e||11815===e||11816===e||11817===e||e>=11818&&e<=11822||11823===e||e>=11824&&e<=11833||e>=11834&&e<=11835||e>=11836&&e<=11839||11840===e||11841===e||11842===e||e>=11843&&e<=11855||e>=11856&&e<=11857||11858===e||e>=11859&&e<=11903||e>=12289&&e<=12291||12296===e||12297===e||12298===e||12299===e||12300===e||12301===e||12302===e||12303===e||12304===e||12305===e||e>=12306&&e<=12307||12308===e||12309===e||12310===e||12311===e||12312===e||12313===e||12314===e||12315===e||12316===e||12317===e||e>=12318&&e<=12319||12320===e||12336===e||64830===e||64831===e||e>=65093&&e<=65094}function Ae(e){e.forEach((function(e){if(delete e.location,M(e)||O(e))for(var t in e.options)delete e.options[t].location,Ae(e.options[t].value);else I(e)&&w(e.style)||(C(e)||R(e))&&D(e.style)?delete e.style.location:G(e)&&Ae(e.children)}))}var Le=(e=>(e.MISSING_VALUE="MISSING_VALUE",e.INVALID_VALUE="INVALID_VALUE",e.MISSING_INTL_API="MISSING_INTL_API",e))(Le||{}),Pe=class extends Error{constructor(e,t,r){super(e),l(this,"code"),l(this,"originalMessage"),this.code=t,this.originalMessage=r}toString(){return`[formatjs Error: ${this.code}] ${this.message}`}},Se=class extends Pe{constructor(e,t,r,i){super(`Invalid values for "${e}": "${t}". Options are "${Object.keys(r).join(\'", "\')}"`,"INVALID_VALUE",i)}},Ne=class extends Pe{constructor(e,t,r){super(`Value for "${e}" must be of type ${t}`,"INVALID_VALUE",r)}},Ie=class extends Pe{constructor(e,t){super(`The intl string context variable "${e}" was not provided to the string "${t}"`,"MISSING_VALUE",t)}},Ce=(e=>(e[e.literal=0]="literal",e[e.object=1]="object",e))(Ce||{});function Re(e){return"function"==typeof e}function Me(e,t,r,i,n,o,s){if(1===e.length&&S(e[0]))return[{type:0,value:e[0].value}];const h=[];for(const a of e){if(S(a)){h.push({type:0,value:a.value});continue}if(U(a)){"number"==typeof o&&h.push({type:0,value:r.getNumberFormat(t).format(o)});continue}const{value:e}=a;if(!n||!(e in n))throw new Ie(e,s);let u=n[e];if(N(a))u&&"string"!=typeof u&&"number"!=typeof u||(u="string"==typeof u||"number"==typeof u?String(u):""),h.push({type:"string"==typeof u?0:1,value:u});else if(C(a)){const e="string"==typeof a.style?i.date[a.style]:D(a.style)?a.style.parsedOptions:void 0;h.push({type:0,value:r.getDateTimeFormat(t,e).format(u)})}else if(R(a)){const e="string"==typeof a.style?i.time[a.style]:D(a.style)?a.style.parsedOptions:i.time.medium;h.push({type:0,value:r.getDateTimeFormat(t,e).format(u)})}else if(I(a)){const e="string"==typeof a.style?i.number[a.style]:w(a.style)?a.style.parsedOptions:void 0;e&&e.scale&&(u*=e.scale||1),h.push({type:0,value:r.getNumberFormat(t,e).format(u)})}else{if(G(a)){const{children:e,value:u}=a,l=n[u];if(!Re(l))throw new Ne(u,"function",s);let c=l(Me(e,t,r,i,n,o).map((e=>e.value)));Array.isArray(c)||(c=[c]),h.push(...c.map((e=>({type:"string"==typeof e?0:1,value:e}))))}if(M(a)){const e=a.options[u]||a.options.other;if(!e)throw new Se(a.value,u,Object.keys(a.options),s);h.push(...Me(e.value,t,r,i,n))}else if(O(a)){let e=a.options[`=${u}`];if(!e){if(!Intl.PluralRules)throw new Pe(\'Intl.PluralRules is not available in this environment.\\nTry polyfilling it using "@formatjs/intl-pluralrules"\\n\',"MISSING_INTL_API",s);const i=r.getPluralRules(t,{type:a.pluralType}).select(u-(a.offset||0));e=a.options[i]||a.options.other}if(!e)throw new Se(a.value,u,Object.keys(a.options),s);h.push(...Me(e.value,t,r,i,n,u-(a.offset||0)))}else;}}return(a=h).length<2?a:a.reduce(((e,t)=>{const r=e[e.length-1];return r&&0===r.type&&0===t.type?r.value+=t.value:e.push(t),e}),[]);var a}function Oe(e,t){return t?Object.keys(e).reduce(((r,i)=>{var n,o;return r[i]=(n=e[i],(o=t[i])?u(u(u({},n||{}),o||{}),Object.keys(n).reduce(((e,t)=>(e[t]=u(u({},n[t]),o[t]||{}),e)),{})):n),r}),u({},e)):e}function Ue(e){return{create:()=>({get:t=>e[t],set(t,r){e[t]=r}})}}var Ge=class e{constructor(r,n=e.defaultLocale,a,c){if(l(this,"ast"),l(this,"locales"),l(this,"resolvedLocale"),l(this,"formatters"),l(this,"formats"),l(this,"message"),l(this,"formatterCache",{number:{},dateTime:{},pluralRules:{}}),l(this,"format",(e=>{const t=this.formatToParts(e);if(1===t.length)return t[0].value;const r=t.reduce(((e,t)=>(e.length&&0===t.type&&"string"==typeof e[e.length-1]?e[e.length-1]+=t.value:e.push(t.value),e)),[]);return r.length<=1?r[0]||"":r})),l(this,"formatToParts",(e=>Me(this.ast,this.locales,this.formatters,this.formats,e,void 0,this.message))),l(this,"resolvedOptions",(()=>{var e;return{locale:(null==(e=this.resolvedLocale)?void 0:e.toString())||Intl.NumberFormat.supportedLocalesOf(this.locales)[0]}})),l(this,"getAst",(()=>this.ast)),this.locales=n,this.resolvedLocale=e.resolveLocale(n),"string"==typeof r){if(this.message=r,!e.__parse)throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");const n=c||{},{formatters:a}=n,l=((e,t)=>{var r={};for(var i in e)s.call(e,i)&&t.indexOf(i)<0&&(r[i]=e[i]);if(null!=e&&o)for(var i of o(e))t.indexOf(i)<0&&h.call(e,i)&&(r[i]=e[i]);return r})(n,["formatters"]);this.ast=e.__parse(r,(f=u({},l),E={locale:this.resolvedLocale},t(f,i(E))))}else this.ast=r;var f,E;if(!Array.isArray(this.ast))throw new TypeError("A message must be provided as a String or AST.");this.formats=Oe(e.formats,a),this.formatters=c&&c.formatters||function(e={number:{},dateTime:{},pluralRules:{}}){return{getNumberFormat:p(((...e)=>new Intl.NumberFormat(...e)),{cache:Ue(e.number),strategy:L.variadic}),getDateTimeFormat:p(((...e)=>new Intl.DateTimeFormat(...e)),{cache:Ue(e.dateTime),strategy:L.variadic}),getPluralRules:p(((...e)=>new Intl.PluralRules(...e)),{cache:Ue(e.pluralRules),strategy:L.variadic})}}(this.formatterCache)}static get defaultLocale(){return e.memoizedDefaultLocale||(e.memoizedDefaultLocale=(new Intl.NumberFormat).resolvedOptions().locale),e.memoizedDefaultLocale}};l(Ge,"memoizedDefaultLocale",null),l(Ge,"resolveLocale",(e=>{if(void 0===Intl.Locale)return;const t=Intl.NumberFormat.supportedLocalesOf(e);return t.length>0?new Intl.Locale(t[0]):new Intl.Locale("string"==typeof e?e:e[0])})),l(Ge,"__parse",(function(e,t){void 0===t&&(t={}),t=P({shouldParseSkeletons:!0,requiresOtherClause:!0},t);var r=new ye(e,t).parse();if(r.err){var i=SyntaxError(b[r.err.kind]);throw i.location=r.err.location,i.originalMessage=r.err.message,i}return(null==t?void 0:t.captureLocation)||Ae(r.val),r.val})),l(Ge,"formats",{number:{integer:{maximumFractionDigits:0},currency:{style:"currency"},percent:{style:"percent"}},date:{short:{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},long:{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{short:{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},long:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}});var we,De=Ge,Fe=De;return we=c,((t,i,o,h)=>{if(i&&"object"==typeof i||"function"==typeof i)for(let a of n(i))s.call(t,a)||a===o||e(t,a,{get:()=>i[a],enumerable:!(h=r(i,a))||h.enumerable});return t})(e({},"__esModule",{value:!0}),we)})();';
  }

  // src/js/lib/load-all.js
  async function loadIntlMessageFormat() {
    await injectLibrary(getIntlMessageFormatCode, "IntlMessageFormat");
    await waitForLibrary("IntlMessageFormat");
    if (!window.IntlMessageFormat) {
      throw new Error("IntlMessageFormat is not available on window");
    }
    console.log("\u2705 IntlMessageFormat loaded successfully");
    return window.IntlMessageFormat;
  }
  async function loadFingerprintJS() {
    await injectLibrary(getFingerprintJSCode, "FingerprintJS");
    await waitForLibrary("FingerprintJS");
    if (!window.FingerprintJS) {
      throw new Error("IntlMessageFormat is not available on window");
    }
    console.log("\u2705 FingerprintJS loaded successfully");
    return window.FingerprintJS;
  }
  async function loadAllLibraries() {
    await Promise.all([loadIntlMessageFormat(), loadFingerprintJS()]);
  }

  // src/js/main.js
  document.addEventListener("DOMContentLoaded", () => {
    loadAllLibraries().then(() => {
      initPawtect();
      setupFetchInterceptor();
      createUI().then(async () => {
        await updateStats();
        try {
          await wplaceService.requireValidExperiments();
        } catch (error) {
          console.error("\u{1F6D1} CRITICAL: Invalid experiment configuration. App cannot start.");
          console.error(error.message);
          const message = "Security settings have been updated. This app requires the latest version to run. Please try again later or contact support if the issue persists.";
          showAlert(message, "error");
          updateUI(message, "error");
          return;
        }
        window.addEventListener("beforeunload", cleanupTurnstile);
        await initializeTokenGenerator();
        enableFileOperations();
        await handleLoadClick();
      });
    });
  });
})();
//# sourceMappingURL=script.user.js.map
