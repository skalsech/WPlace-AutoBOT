// ==UserScript==
// @name         WPlace AutoBOT
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  blank
// @author       10590
// @match        https://wplace.live/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/js/utils/helpers.js
  var randStr = (len, chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") => {
    const getRandomIndex = () => {
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return array[0] % chars.length;
      }
      return Math.floor(Math.random() * chars.length);
    };
    return [...Array(len)].map(() => chars[getRandomIndex()]).join("");
  };
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
      await this.sleep(Math.min(interval, remaining));
      remaining = Math.max(0, await tickAndGetRemainingMs());
    }
  };
  var appendLinkOnce = (href, attributes = {}) => {
    const exists = Array.from(document.head.querySelectorAll("link")).some(
      (link2) => link2.href === href
    );
    if (exists) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    for (const [key, value] of Object.entries(attributes)) {
      link.setAttribute(key, value);
    }
    document.head.appendChild(link);
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
  var calculateTileRange = (startRegionX, startRegionY, startPixelX, startPixelY, width, height, tileSize = 1e3) => {
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

  // src/js/core/state.js
  var state = {
    ...DEFAULT_SETTINGS,
    // runtime-only (todo some progress also, to be separated)
    running: false,
    processing: false,
    artTotalPixels: 0,
    totalPaintedPixels: 0,
    userPaintedPixels: 0,
    availableColors: [],
    activeColorPalette: [],
    // User-selected colors for conversion
    fullChargeData: null,
    fullChargeInterval: null,
    displayCharges: 0,
    preciseCurrentCharges: 0,
    maxCharges: 1,
    cooldown: 31e3,
    imageData: null,
    stopFlag: false,
    startPosition: null,
    selectingPosition: false,
    region: null,
    estimatedTime: 0,
    chargesThresholdInterval: null,
    initialSetupComplete: false,
    // Track if initial startup setup is complete (only happens once)
    resizeIgnoreMask: null,
    _lastChargesNotifyAt: 0,
    _lastChargesBelow: true,
    // Smart save tracking
    _lastSavePixelCount: 0,
    _lastSaveTime: 0,
    _saveInProgress: false,
    /**
     * @deprecated Painted map is account-specific and should not be saved.
     */
    paintedMap: null,
    get hasAvailableColors() {
      return !!this.availableColors.length;
    },
    get imageLoaded() {
      return !!this.imageData;
    }
  };

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

  // src/js/core/storage.js
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

  // src/js/core/settings-manager.js
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
          console.debug("[Settings] parseResizeIgnoreMask: no mask.data");
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
    const url = `https://skalsech.github.io/WPlace-AutoBOT/custom-main/lang/${languageKey}.json`.trim();
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
    Object.keys(params).forEach((param) => {
      const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      text = text.replace(new RegExp(`\\{${escapeRegExp(param)}\\}`, "g"), params[param]);
    });
    return text;
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
        el.innerText = newText;
      }
    });
  }

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
          <span data-i18n-key="settings">${t("settings")}</span>
          </h3>
        <button id="closeSettingsBtn" class="wplace-settings-close-btn" title="${t(
      "close"
    )}" data-i18n-key="close" data-i18n-attr="title">\u2715</button>
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
            <option value="generator" ${DEFAULT_SETTINGS.tokenSource === "generator" ? "selected" : ""} data-i18n-key="tokenSourceGenerator" class="wplace-settings-option">\u{1F916} Automatic Token Generator (Recommended)</option>
            <option value="hybrid" ${DEFAULT_SETTINGS.tokenSource === "hybrid" ? "selected" : ""} data-i18n-key="tokenSourceHybrid" class="wplace-settings-option">\u{1F504} Generator + Auto Fallback</option>
            <option value="manual" ${DEFAULT_SETTINGS.tokenSource === "manual" ? "selected" : ""} data-i18n-key="tokenSourceManual" class="wplace-settings-option">\u{1F3AF} Manual Pixel Placement</option>
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
          <span data-i18n-key="automation">${t("automation")}</span>
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
                <input type="checkbox" id="enableBlueMarbleToggle" ${DEFAULT_SETTINGS.blueMarbleEnabled ? "checked" : ""} class="wplace-settings-checkbox"/>
              </label>
          </div>
        </div>

        <!-- Paint Options Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-paint-brush wplace-icon-paint"></i>
          <span data-i18n-key="paintOptions">${t("paintOptions")}</span>
          </label>
          <!-- Pixel Filter Toggles -->
          <div id="pixelFilterControls" class="wplace-settings-section-wrapper wplace-pixel-filter-controls">
            <!-- Paint White Pixels -->
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="paintWhitePixels">${t(
      "paintWhitePixels"
    )}</span>
              <p class="wplace-settings-toggle-description" data-i18n-key="paintWhitePixelsDescription">${t(
      "paintWhitePixelsDescription"
    )}</p>
              </div>
            <input type="checkbox" id="settingsPaintWhiteToggle" ${DEFAULT_SETTINGS.paintWhitePixels ? "checked" : ""} class="wplace-settings-checkbox"/>
            </label>
            
            <!-- Paint Transparent Pixels -->
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="paintTransparentPixels">${t(
      "paintTransparentPixels"
    )}</span>
              <p class="wplace-settings-toggle-description" data-i18n-key="paintTransparentPixelsDescription">${t(
      "paintTransparentPixelsDescription"
    )}</p>
              </div>
            <input type="checkbox" id="settingsPaintTransparentToggle" ${DEFAULT_SETTINGS.paintTransparentPixels ? "checked" : ""} class="wplace-settings-checkbox"/>
            </label>
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="paintUnavailablePixels">${t(
      "paintUnavailablePixels"
    )}</span>
              <p class="wplace-settings-toggle-description" data-i18n-key="paintUnavailablePixelsDescription">${t(
      "paintUnavailablePixelsDescription"
    )}</p>
              </div>
            <input type="checkbox" id="paintUnavailablePixelsToggle" ${DEFAULT_SETTINGS.paintUnavailablePixels ? "checked" : ""} class="wplace-settings-checkbox"/>
            </label>
          </div>
        </div>

        <!-- Speed Control Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-tachometer-alt wplace-icon-speed"></i>
          <span data-i18n-key="paintingSpeed">${t("paintingSpeed")}</span>
          </label>
          
          <!-- Batch Mode Selection -->
          <div class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-dice wplace-icon-dice"></i>
            <span data-i18n-key="batchMode">Batch Mode</span>
            </label>
            <select id="batchModeSelect" class="wplace-settings-select">
              <option value="normal" data-i18n-key="batchModeNormal" class="wplace-settings-option">\u{1F4E6} Normal (Fixed Size)</option>
              <option value="random" data-i18n-key="batchModeRandom" class="wplace-settings-option">\u{1F3B2} Random (Range)</option>
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
          <p class="wplace-random-batch-description" data-i18n-key="randomBatchDescription">\u{1F3B2} Random batch size between min and max values</p>
          </div>
          
          <!-- Speed Control Toggle -->
          <label class="wplace-speed-control-toggle">
            <input type="checkbox" id="enableSpeedToggle" ${DEFAULT_SETTINGS.paintingSpeedLimitEnabled ? "checked" : ""} class="wplace-speed-checkbox"/>
          <span data-i18n-key="enablePaintingSpeedLimit">${t("enablePaintingSpeedLimit")}</span>
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
            <option value="rows" data-i18n-key="modeRows" class="wplace-settings-option">\u{1F4CF} Rows (Horizontal Lines)</option>
            <option value="columns" data-i18n-key="modeColumns" class="wplace-settings-option">\u{1F4D0} Columns (Vertical Lines)</option>
            <option value="circle-out" data-i18n-key="modeCircleOut" class="wplace-settings-option">\u2B55 Circle Out (Center \u2192 Edges)</option>
            <option value="circle-in" data-i18n-key="modeCircleIn" class="wplace-settings-option">\u2B55 Circle In (Edges \u2192 Center)</option>
            <option value="blocks" data-i18n-key="modeBlocks" class="wplace-settings-option">\u{1F7EB} Blocks (Ordered)</option>
            <option value="shuffle-blocks" data-i18n-key="modeShuffleBlocks" class="wplace-settings-option">\u{1F3B2} Shuffle Blocks (Random)</option>
            </select>
          </div>
          
          <!-- Direction Selection (only for rows/columns) -->
          <div id="directionControls" class="wplace-mode-selection">
            <label class="wplace-mode-label">
              <i class="fas fa-compass wplace-icon-compass"></i>
            <span data-i18n-key="startingDirection">Starting Direction</span>
            </label>
            <select id="coordinateDirectionSelect" class="wplace-settings-select">
            <option value="top-left" data-i18n-key="topLeft" class="wplace-settings-option">\u2196\uFE0F Top-Left</option>
            <option value="top-right" data-i18n-key="topRight" class="wplace-settings-option">\u2197\uFE0F Top-Right</option>
            <option value="bottom-left" data-i18n-key="bottomLeft" class="wplace-settings-option">\u2199\uFE0F Bottom-Left</option>
            <option value="bottom-right" data-i18n-key="bottomRight" class="wplace-settings-option">\u2198\uFE0F Bottom-Right</option>
            </select>
          </div>
          
          <!-- Snake Pattern Toggle (only for rows/columns) -->
          <div id="snakeControls" class="wplace-snake-pattern-controls wplace-settings-section-wrapper">
            <label class="wplace-settings-toggle">
              <div>
              <span class="wplace-settings-toggle-title" data-i18n-key="snakePattern">Snake Pattern</span>
              <p class="wplace-settings-toggle-description" data-i18n-key="snakePatternDescription">Alternate direction for each row/column (zigzag pattern)</p>
              </div>
            <input type="checkbox" id="coordinateSnakeToggle" ${DEFAULT_SETTINGS.coordinateSnake ? "checked" : ""} class="wplace-settings-checkbox"/>
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
          <p class="wplace-block-size-description" data-i18n-key="blockSizeDescription">\u{1F9F1} Block dimensions for block-based generation modes</p>
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
            <span data-i18n-key="enableNotifications">${t("enableNotifications")}</span>
            <input type="checkbox" id="notifEnabledToggle" ${DEFAULT_SETTINGS.notificationsEnabled ? "checked" : ""} class="wplace-notification-checkbox" />
            </label>
            <label class="wplace-notification-toggle">
            <span data-i18n-key="notifyOnChargesThreshold">${t("notifyOnChargesThreshold")}</span>
            <input type="checkbox" id="notifOnChargesToggle" ${DEFAULT_SETTINGS.notifyOnChargesReached ? "checked" : ""} class="wplace-notification-checkbox" />
            </label>
            <label class="wplace-notification-toggle">
            <span data-i18n-key="onlyWhenNotFocused">${t("onlyWhenNotFocused")}</span>
            <input type="checkbox" id="notifOnlyUnfocusedToggle" ${DEFAULT_SETTINGS.notifyOnlyWhenUnfocused ? "checked" : ""} class="wplace-notification-checkbox" />
            </label>
            <div class="wplace-notification-interval">
            <span data-i18n-key="repeatEvery">${t("repeatEvery")}</span>
              <input type="number" id="notifIntervalInput" min="1" max="60" value="${DEFAULT_SETTINGS.notificationIntervalMinutes}" class="wplace-notification-interval-input" />
            <span data-i18n-key="minutesPl">${t("minutesPl")}</span>
            </div>
            <div class="wplace-notification-buttons">
            <button id="notifRequestPermBtn" class="wplace-btn wplace-btn-secondary wplace-notification-perm-btn">
              <i class="fas fa-unlock"></i>
              <span data-i18n-key="grantPermission">${t("grantPermission")}</span>
            </button>
            <button id="notifTestBtn" class="wplace-btn wplace-notification-test-btn">
              <i class="fas fa-bell"></i>
              <span data-i18n-key="test">${t("test")}</span>
            </button>
            </div>
          </div>
        </div>

        <!-- Theme Selection Section -->
        <div class="wplace-settings-section">
          <label class="wplace-settings-section-label">
            <i class="fas fa-palette wplace-icon-palette"></i>
          <span data-i18n-key="themeSettings">${t("themeSettings")}</span>
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
          <span data-i18n-key="language">${t("language")}</span>
          </label>
          <div class="wplace-settings-section-wrapper">
            <select id="languageSelect" class="wplace-settings-select">
            <option value="vi" ${state.languageKey === "vi" ? "selected" : ""} data-i18n-key="lang_vi" class="wplace-settings-option">\u{1F1FB}\u{1F1F3} Ti\u1EBFng Vi\u1EC7t</option>
            <option value="id" ${state.languageKey === "id" ? "selected" : ""} data-i18n-key="lang_id" class="wplace-settings-option">\u{1F1EE}\u{1F1E9} Bahasa Indonesia</option>
            <option value="ru" ${state.languageKey === "ru" ? "selected" : ""} data-i18n-key="lang_ru" class="wplace-settings-option">\u{1F1F7}\u{1F1FA} \u0420\u0443\u0441\u0441\u043A\u0438\u0439</option>
            <option value="uk" ${state.languageKey === "uk" ? "selected" : ""} data-i18n-key="lang_uk" class="wplace-settings-option">\u{1F1FA}\u{1F1E6} \u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430</option>
            <option value="en" ${state.languageKey === "en" ? "selected" : ""} data-i18n-key="lang_en" class="wplace-settings-option">\u{1F1FA}\u{1F1F8} English</option>
            <option value="pt" ${state.languageKey === "pt" ? "selected" : ""} data-i18n-key="lang_pt" class="wplace-settings-option">\u{1F1E7}\u{1F1F7} Portugu\xEAs</option>
            <option value="fr" ${state.languageKey === "fr" ? "selected" : ""} data-i18n-key="lang_fr" class="wplace-settings-option">\u{1F1EB}\u{1F1F7} Fran\xE7ais</option>
            <option value="tr" ${state.languageKey === "tr" ? "selected" : ""} data-i18n-key="lang_tr" class="wplace-settings-option">\u{1F1F9}\u{1F1F7} T\xFCrk\xE7e</option>
            <option value="zh-CN" ${state.languageKey === "zh-CN" ? "selected" : ""} data-i18n-key="lang_zh_CN" class="wplace-settings-option">\u{1F1E8}\u{1F1F3} \u7B80\u4F53\u4E2D\u6587</option>
            <option value="zh-TW" ${state.languageKey === "zh-TW" ? "selected" : ""} data-i18n-key="lang_zh_TW" class="wplace-settings-option">\u{1F1F9}\u{1F1FC} \u7E41\u9AD4\u4E2D\u6587</option>
            <option value="ja" ${state.languageKey === "ja" ? "selected" : ""} data-i18n-key="lang_ja" class="wplace-settings-option">\u{1F1EF}\u{1F1F5} \u65E5\u672C\u8A9E</option>
            <option value="ko" ${state.languageKey === "ko" ? "selected" : ""} data-i18n-key="lang_ko" class="wplace-settings-option">\u{1F1F0}\u{1F1F7} \uD55C\uAD6D\uC5B4</option>
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
        <span data-i18n-key="title">${t("title")}</span>
        </div>
        <div class="wplace-header-controls">
        <button id="settingsBtn" class="wplace-header-btn" title="${t(
      "settings"
    )}" data-i18n-key="settings" data-i18n-attr="title">
            <i class="fas fa-cog"></i>
          </button>
        <button id="statsBtn" class="wplace-header-btn" title="${t("showStats")}" data-i18n-key="showStats" data-i18n-attr="title">
            <i class="fas fa-chart-bar"></i>
          </button>
        <button id="compactBtn" class="wplace-header-btn" title="${t(
      "compactMode"
    )}" data-i18n-key="compactMode" data-i18n-attr="title">
            <i class="fas fa-compress"></i>
          </button>
        <button id="minimizeBtn" class="wplace-header-btn" title="${t(
      "minimize"
    )}" data-i18n-key="minimize" data-i18n-attr="title">
            <i class="fas fa-minus"></i>
          </button>
        </div>
      </div>
      <div class="wplace-content">
        <!-- Status Section - Always visible -->
        <div class="wplace-status-section">
        <div id="statusText" class="wplace-status status-default" data-i18n-key="initMessage">
            ${t("initMessage")}
          </div>
          <div class="wplace-progress">
            <div id="progressBar" class="wplace-progress-bar" style="width: 0;"></div>
          </div>
        </div>

        <!-- Image Section -->
        <div class="wplace-section">
        <div class="wplace-section-title" data-i18n-key="imageManagement">\u{1F5BC}\uFE0F ${t(
      "imageManagement"
    )}</div>
          <div class="wplace-controls">
            <div class="wplace-row">
            <button id="uploadBtn" class="wplace-btn wplace-btn-upload" disabled title="${t(
      "waitingSetupComplete"
    )}" data-i18n-key="waitingSetupComplete" data-i18n-attr="title">
                <i class="fas fa-upload"></i>
              <span data-i18n-key="uploadImage">${t("uploadImage")}</span>
              </button>
              <button id="resizeBtn" class="wplace-btn wplace-btn-primary" disabled>
                <i class="fas fa-expand"></i>
              <span data-i18n-key="resizeImage">${t("resizeImage")}</span>
              </button>
            </div>
            <div class="wplace-row single">
              <button id="selectPosBtn" class="wplace-btn wplace-btn-select" disabled>
                <i class="fas fa-crosshairs"></i>
              <span data-i18n-key="selectPosition">${t("selectPosition")}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Control Section -->
        <div class="wplace-section">
        <div class="wplace-section-title" data-i18n-key="paintingControl">\u{1F3AE} ${t(
      "paintingControl"
    )}</div>
          <div class="wplace-controls">
            <div class="wplace-row">
              <button id="startBtn" class="wplace-btn wplace-btn-start" disabled>
                <i class="fas fa-play"></i>
              <span data-i18n-key="startPainting">${t("startPainting")}</span>
              </button>
              <button id="stopBtn" class="wplace-btn wplace-btn-stop" disabled>
                <i class="fas fa-stop"></i>
              <span data-i18n-key="stopPainting">${t("stopPainting")}</span>
              </button>
            </div>
            <div class="wplace-row single">
                <button id="toggleOverlayBtn" class="wplace-btn wplace-btn-overlay" disabled>
                    <i class="fas fa-eye"></i>
              <span data-i18n-key="toggleOverlay">${t("toggleOverlay")}</span>
                </button>
            </div>
          </div>
        </div>

        <!-- Cooldown Section -->
        <div class="wplace-section">
        <div class="wplace-section-title" data-i18n-key="cooldownSettings">\u23F1\uFE0F ${t(
      "cooldownSettings"
    )}</div>
            <div class="wplace-cooldown-control">
          <label id="cooldownLabel" data-i18n-key="waitCharges">${t("waitCharges")}:</label>
                <div class="wplace-slider-container">
                    <input type="range" id="cooldownSlider" class="wplace-slider" min="1" max="1" value="${state.cooldownChargeThreshold}">
                    <span id="cooldownValue" class="wplace-cooldown-value">${state.cooldownChargeThreshold}</span>
                </div>
            </div>
        </div>

        <!-- Data Section -->
        <div class="wplace-section">
        <div class="wplace-section-title" data-i18n-key="dataManagement">\u{1F4BE} ${t(
      "dataManagement"
    )}</div>
          <div class="wplace-controls">
            <div class="wplace-row">
              <button id="saveBtn" class="wplace-btn wplace-btn-primary" disabled>
                <i class="fas fa-save"></i>
              <span data-i18n-key="saveData">${t("saveData")}</span>
              </button>
            <button id="loadBtn" class="wplace-btn wplace-btn-primary" disabled title="${t(
      "waitingTokenGenerator"
    )}" data-i18n-key="waitingTokenGenerator" data-i18n-attr="title">
                <i class="fas fa-folder-open"></i>
              <span data-i18n-key="loadData">${t("loadData")}</span>
              </button>
            </div>
            <div class="wplace-row">
              <button id="saveToFileBtn" class="wplace-btn wplace-btn-file" disabled>
                <i class="fas fa-download"></i>
              <span data-i18n-key="saveToFile">${t("saveToFile")}</span>
              </button>
            <button id="loadFromFileBtn" class="wplace-btn wplace-btn-file" disabled title="${t(
      "waitingTokenGenerator"
    )}" data-i18n-key="waitingTokenGenerator" data-i18n-attr="title">
                <i class="fas fa-upload"></i>
              <span data-i18n-key="loadFromFile">${t("loadFromFile")}</span>
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
        <span data-i18n-key="paintingStats">${t("paintingStats")}</span>
      </div>
      <div class="wplace-header-controls">
        <button id="refreshChargesBtn" class="wplace-header-btn" title="${t(
      "refreshCharges"
    )}" data-i18n-key="refreshCharges" data-i18n-attr="title">
          <i class="fas fa-sync"></i>
        </button>
        <button id="closeStatsBtn" class="wplace-header-btn" title="${t(
      "closeStats"
    )}" data-i18n-key="closeStats" data-i18n-attr="title">
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
              <span data-i18n-key="initMessage">${t("initMessage")}</span>
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
    <h3 class="resize-dialog-title" data-i18n-key="resizeImage">${t("resizeImage")}</h3>
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
        <span data-i18n-key="keepAspectRatio">${t("keepAspectRatio")}</span>
      </label>
      <label class="resize-checkbox-label">
        <input type="checkbox" id="paintWhiteToggle" checked>
        <span data-i18n-key="paintWhitePixels">${t("paintWhitePixels")}</span>
      </label>
      <label class="resize-checkbox-label">
        <input type="checkbox" id="paintTransparentToggle" checked>
        <span data-i18n-key="paintTransparentPixels">${t("paintTransparentPixels")}</span>
      </label>
      <div class="resize-zoom-controls">
        <button id="zoomOutBtn" class="wplace-btn resize-zoom-btn" title="${t(
      "zoomOut"
    )}" data-i18n-key="zoomOut" data-i18n-attr="title">
          <i class="fas fa-search-minus"></i>
        </button>
        <input type="range" id="zoomSlider" class="resize-slider resize-zoom-slider" min="0.1" max="20" value="1" step="0.05">
        <button id="zoomInBtn" class="wplace-btn resize-zoom-btn" title="${t(
      "zoomIn"
    )}" data-i18n-key="zoomIn" data-i18n-attr="title">
          <i class="fas fa-search-plus"></i>
        </button>
        <button id="zoomFitBtn" class="wplace-btn resize-zoom-btn" title="${t(
      "fitToView"
    )}" data-i18n-key="fitToView" data-i18n-attr="title">
          ${t("fit")}
        </button>
        <button id="zoomActualBtn" class="wplace-btn resize-zoom-btn" title="${t(
      "actualSize"
    )}" data-i18n-key="actualSize" data-i18n-attr="title">
          ${t("hundred")}
        </button>
        <button id="panModeBtn" class="wplace-btn resize-zoom-btn" title="${t(
      "panMode"
    )}" data-i18n-key="panMode" data-i18n-attr="title">
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
        <button id="clearIgnoredBtn" class="wplace-btn resize-clear-btn" title="Clear all ignored pixels" data-i18n-key="clearAllIgnored" data-i18n-attr="title">Clear</button>
        <button id="invertMaskBtn" class="wplace-btn resize-invert-btn" title="Invert mask" data-i18n-key="invertMask" data-i18n-attr="title">Invert</button>
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
            <span data-i18n-key="showAllColorsIncluding">${t("showAllColorsIncluding")}</span>
          </label>
        </div>
        <div class="wplace-row" style="display: flex;">
          <button id="selectAllBtn" class="wplace-btn" style="flex: 1;" data-i18n-key="selectAll">Select All</button>
          <button id="unselectAllBtn" class="wplace-btn" style="flex: 1;" data-i18n-key="unselectAll">Unselect All</button>
          <button id="unselectPaidBtn" class="wplace-btn" data-i18n-key="unselectPaid">Unselect Paid</button>
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
            <option value="lab" ${state.colorMatchingAlgorithm === "lab" ? "selected" : ""} data-i18n-key="perceptualLab">Perceptual (Lab)</option>
            <option value="legacy" ${state.colorMatchingAlgorithm === "legacy" ? "selected" : ""} data-i18n-key="legacyRgb">Legacy (RGB)</option>
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
            <span data-i18n-key="chromaWeight">${t("chromaWeight")}</span>
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
        <button id="resetAdvancedColorBtn" class="wplace-btn resize-reset-advanced-btn" data-i18n-key="resetAdvanced">Reset Advanced</button>
      </div>
    </div>

    <div class="resize-buttons">
      <button id="downloadPreviewBtn" class="wplace-btn wplace-btn-primary">
        <i class="fas fa-download"></i>
        <span data-i18n-key="downloadPreview">${t("downloadPreview")}</span>
      </button>
      <button id="confirmResize" class="wplace-btn wplace-btn-start">
        <i class="fas fa-check"></i>
        <span data-i18n-key="apply">${t("apply")}</span>
      </button>
      <button id="cancelResize" class="wplace-btn wplace-btn-stop">
        <i class="fas fa-times"></i>
        <span data-i18n-key="cancel">${t("cancel")}</span>
      </button>
    </div>
  `;
    return resizeContainer2;
  }

  // src/js/ui/alerts.js
  function showAlert(message, type = "info") {
    const validTypes = ["info", "success", "warning", "error"];
    const alertType = validTypes.includes(type) ? type : "info";
    const alertDiv = document.createElement("div");
    alertDiv.className = `wplace-alert-base wplace-alert-${alertType}`;
    alertDiv.textContent = message;
    alertDiv.addEventListener("click", () => {
      alertDiv.classList.add("fade-out");
      setTimeout(() => document.body.removeChild(alertDiv), 300);
    });
    document.body.appendChild(alertDiv);
    setTimeout(() => {
      alertDiv.classList.add("fade-out");
      setTimeout(() => {
        if (alertDiv.parentElement === document.body) {
          document.body.removeChild(alertDiv);
        }
      }, 300);
    }, 4e3);
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
        console.log("\uFFFD Widget reuse failed, will create a fresh widget:", error.message);
      }
    }
    const invisibleToken = await createTurnstileWidget(sitekey, action);
    if (invisibleToken && invisibleToken.length > 20) {
      return invisibleToken;
    }
    console.log("\uFFFD Falling back to interactive Turnstile (visible).");
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
    console.log("\u{1F504} Creating interactive Turnstile widget (visible)");
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
  async function obtainSitekeyAndToken(fallback = "0x4AAAAAABpqJe8FO0N84q0F") {
    if (_cachedSitekey) {
      console.log("\u{1F50D} Using cached sitekey:", _cachedSitekey);
      return isTokenValid() ? {
        sitekey: _cachedSitekey,
        token: getTurnstileToken()
      } : { sitekey: _cachedSitekey, token: null };
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
    const trySitekey = async (sitekey, source) => {
      if (!sitekey || sitekey.length < 10) return null;
      console.log(`\u{1F50D} Testing sitekey from ${source}:`, sitekey);
      const token = await executeTurnstile(sitekey);
      if (token && token.length >= 20) {
        console.log(`\u2705 Valid token generated from ${source} sitekey`);
        setTurnstileToken(token);
        _cachedSitekey = sitekey;
        return { sitekey, token };
      } else {
        console.log(`\u274C Failed to get token from ${source} sitekey`);
        return null;
      }
    };
    try {
      const sitekeySel = document.querySelector("[data-sitekey]");
      if (sitekeySel) {
        const sitekey = sitekeySel.getAttribute("data-sitekey");
        const result = await trySitekey(sitekey, "data attribute");
        if (result) {
          return result;
        }
      }
      const turnstileEl = document.querySelector(".cf-turnstile");
      if (turnstileEl?.dataset?.sitekey) {
        const sitekey = turnstileEl.dataset.sitekey;
        const result = await trySitekey(sitekey, "turnstile element");
        if (result) {
          return result;
        }
      }
      const metaTags = document.querySelectorAll(
        'meta[name*="turnstile"], meta[property*="turnstile"]'
      );
      for (const meta of metaTags) {
        const content = meta.getAttribute("content");
        const result = await trySitekey(content, "meta tag");
        if (result) {
          return result;
        }
      }
      if (window.__TURNSTILE_SITEKEY) {
        const result = await trySitekey(window.__TURNSTILE_SITEKEY, "global variable");
        if (result) {
          return result;
        }
      }
      const scripts = document.querySelectorAll("script");
      for (const script of scripts) {
        const content = script.textContent || script.innerHTML;
        const match = content.match(
          /(?:sitekey|data-sitekey)['"\s[\]:=(]*['"]?([0-9a-zA-Z_-]{20,})['"]?/i
        );
        if (match && match[1]) {
          const extracted = match[1].replace(/['"]/g, "");
          const result = await trySitekey(extracted, "script content");
          if (result) {
            return result;
          }
        }
      }
      console.log("\u{1F50D} Testing known potential sitekeys...");
      for (const testSitekey of potentialSitekeys) {
        const result = await trySitekey(testSitekey, "known list");
        if (result) {
          return result;
        }
      }
    } catch (error) {
      console.warn("\u26A0\uFE0F Error during sitekey detection:", error);
    }
    console.log("\u{1F527} Trying fallback sitekey:", fallback);
    const fallbackResult = await trySitekey(fallback, "fallback");
    if (fallbackResult) {
      return fallbackResult;
    }
    console.error("\u274C No working sitekey or token found.");
    return { sitekey: null, token: null };
  }

  // src/js/security/turnstile-manager.js
  var TurnstileState = {
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
    if (TurnstileState.resolveToken) {
      TurnstileState.resolveToken(token);
      TurnstileState.resolveToken = null;
    }
    TurnstileState.token = token;
    TurnstileState.expiryTime = Date.now() + TOKEN_LIFETIME;
    console.log("\u2705 Turnstile token set successfully");
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
    console.log("\u{1F5D1}\uFE0F Token invalidated, will force fresh generation");
  }
  async function ensureToken(forceRefresh = false) {
    if (isTokenValid() && !forceRefresh) {
      return TurnstileState.token;
    }
    if (forceRefresh) invalidateToken();
    if (TurnstileState.generationInProgress) {
      console.log("\u{1F504} Token generation already in progress, waiting...");
      await sleep(2e3);
      return isTokenValid() ? TurnstileState.token : null;
    }
    TurnstileState.generationInProgress = true;
    try {
      console.log("\u{1F504} Token expired or missing, generating new one...");
      const token = await handleCaptchaWithRetry();
      if (token && token.length > 20) {
        setTurnstileToken(token);
        console.log("\u2705 Token captured and cached successfully");
        return token;
      }
      console.log("\u26A0\uFE0F Invisible Turnstile failed, forcing browser automation...");
      const fallbackToken = await handleCaptchaFallback();
      if (fallbackToken && fallbackToken.length > 20) {
        setTurnstileToken(fallbackToken);
        console.log("\u2705 Fallback token captured successfully");
        return fallbackToken;
      }
      console.log("\u274C All token generation methods failed");
      return null;
    } finally {
      TurnstileState.generationInProgress = false;
    }
  }
  async function handleCaptchaWithRetry() {
    const startTime = performance.now();
    try {
      const { sitekey, token: preGeneratedToken } = await obtainSitekeyAndToken();
      if (!sitekey) {
        throw new Error("No valid sitekey found");
      }
      console.log("\u{1F511} Using sitekey:", sitekey);
      if (typeof window !== "undefined" && window.navigator) {
        console.log(
          "\u{1F9ED} UA:",
          window.navigator.userAgent.substring(0, 50) + "...",
          "Platform:",
          window.navigator.platform
        );
      }
      let token;
      if (preGeneratedToken && typeof preGeneratedToken === "string" && preGeneratedToken.length > 20) {
        console.log("\u267B\uFE0F Reusing pre-generated Turnstile token");
        token = preGeneratedToken;
      } else {
        if (isTokenValid()) {
          console.log("\u267B\uFE0F Using existing cached token (from previous session)");
          token = TurnstileState.token;
        } else {
          console.log("\u{1F510} Generating new token with executeTurnstile...");
          token = await executeTurnstile(sitekey, "paint");
          if (token) setTurnstileToken(token);
        }
      }
      if (token && typeof token === "string" && token.length > 20) {
        const elapsed = Math.round(performance.now() - startTime);
        console.log(`\u2705 Turnstile token generated successfully in ${elapsed}ms`);
        return token;
      } else {
        throw new Error(`Invalid or empty token received - Length: ${token?.length || 0}`);
      }
    } catch (error) {
      const elapsed = Math.round(performance.now() - startTime);
      console.error(`\u274C Turnstile token generation failed after ${elapsed}ms:`, error);
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
        console.error("Auto-CAPTCHA process failed:", error);
        reject(error);
      }
    });
  }

  // src/js/core/api-service.js
  var WPlaceService = {
    async paintPixelInRegion(regionX, regionY, pixelX, pixelY, color) {
      try {
        await ensureToken();
        if (!getTurnstileToken) return "token_error";
        const payload = {
          coords: [pixelX, pixelY],
          colors: [color],
          t: getTurnstileToken
        };
        const res = await fetch(`https://backend.wplace.live/s0/pixel/${regionX}/${regionY}`, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          credentials: "include",
          body: JSON.stringify(payload)
        });
        if (res.status === 403) {
          console.error("\u274C 403 Forbidden. Turnstile token might be invalid or expired.");
          setTurnstileToken(null);
          return "token_error";
        }
        const data = await res.json();
        return data?.painted === 1;
      } catch (e) {
        console.error("Paint request failed:", e);
        return false;
      }
    },
    async getCharges() {
      const defaultResult = {
        charges: 0,
        max: 1,
        cooldown: state.cooldown
      };
      try {
        const res = await fetch("https://backend.wplace.live/me", {
          credentials: "include"
        });
        if (!res.ok) {
          console.error(`Failed to get charges: HTTP ${res.status}`);
          return defaultResult;
        }
        const data = await res.json();
        return {
          charges: data.charges?.count ?? 0,
          max: data.charges?.max ?? 1,
          cooldown: data.charges?.cooldownMs ?? state.cooldown
        };
      } catch (e) {
        console.error("Failed to get charges:", e);
        return defaultResult;
      }
    }
  };

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
            max: state.maxCharges,
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
          const { charges, cooldown, max } = await WPlaceService.getCharges();
          state.displayCharges = Math.floor(charges);
          state.cooldown = cooldown;
          state.maxCharges = Math.max(1, Math.floor(max));
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
  var ImageProcessor = class {
    constructor(imageSrc) {
      this.imageSrc = imageSrc;
      this.img = null;
      this.canvas = null;
      this.ctx = null;
    }
    async load() {
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
    }
    getDimensions() {
      return {
        width: this.canvas.width,
        height: this.canvas.height
      };
    }
    getPixelData() {
      return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
    }
    resize(newWidth, newHeight) {
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = newWidth;
      tempCanvas.height = newHeight;
      tempCtx.imageSmoothingEnabled = false;
      tempCtx.drawImage(this.canvas, 0, 0, newWidth, newHeight);
      this.canvas.width = newWidth;
      this.canvas.height = newHeight;
      this.ctx.imageSmoothingEnabled = false;
      this.ctx.drawImage(tempCanvas, 0, 0);
      return this.ctx.getImageData(0, 0, newWidth, newHeight).data;
    }
    generatePreview(width, height) {
      const previewCanvas = document.createElement("canvas");
      const previewCtx = previewCanvas.getContext("2d");
      previewCanvas.width = width;
      previewCanvas.height = height;
      previewCtx.imageSmoothingEnabled = false;
      previewCtx.drawImage(this.img, 0, 0, width, height);
      return previewCanvas.toDataURL();
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

  // src/js/core/migrations.js
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

  // src/js/core/progress-manager.js
  function buildProgressData() {
    return {
      timestamp: Date.now(),
      version: "2.3",
      state: {
        artTotalPixels: state.artTotalPixels,
        userPaintedPixels: state.userPaintedPixels,
        startPosition: state.startPosition,
        region: state.region,
        availableColors: state.availableColors
      },
      imageData: state.imageData ? {
        width: state.imageData.width,
        height: state.imageData.height,
        pixels: Array.from(state.imageData.pixels),
        totalPixels: state.imageData.totalPixels
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
    return data;
  }
  function saveProgress() {
    try {
      const progressData = buildProgressData(state);
      return saveToStorage("wplace-bot-progress", progressData);
    } catch (error) {
      console.error("Error saving progress:", error);
      return false;
    }
  }
  function loadProgress() {
    try {
      const savedData = loadFromStorage("wplace-bot-progress");
      if (!savedData) return null;
      const migrated = migrateProgress(savedData);
      if (migrated && migrated !== savedData) {
        saveToStorage("wplace-bot-progress", migrated);
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
      Object.assign(state, migrated.state);
      if (migrated.imageData) {
        state.imageData = {
          ...migrated.imageData,
          pixels: new Uint8ClampedArray(migrated.imageData.pixels)
        };
        try {
          const canvas = document.createElement("canvas");
          canvas.width = state.imageData.width;
          canvas.height = state.imageData.height;
          const ctx = canvas.getContext("2d");
          const imageData = new ImageData(
            state.imageData.pixels,
            state.imageData.width,
            state.imageData.height
          );
          ctx.putImageData(imageData, 0, 0);
          const proc = new ImageProcessor("");
          proc.img = canvas;
          proc.canvas = canvas;
          proc.ctx = ctx;
          state.imageData.processor = proc;
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
      return restoreProgress(data);
    } catch (error) {
      console.error("Error loading from file:", error);
      throw error;
    }
  }

  // src/js/utils/painting-helpers.js
  function getMsToTargetCharges(current, target, cooldown, intervalMs = 0) {
    const remainingCharges = target - current;
    return Math.max(0, remainingCharges * cooldown - intervalMs);
  }
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
  function calculateEstimatedTime() {
    const remainingPixels = state.artTotalPixels - state.userPaintedPixels;
    return getMsToTargetCharges(state.preciseCurrentCharges, remainingPixels, state.cooldown);
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
  function extractColors() {
    const availableColors = [];
    const unavailableColors = [];
    const colorElements = document.querySelectorAll('.tooltip button[id^="color-"]');
    if (colorElements.length === 0) {
      console.log("\u274C No color elements found on page");
      return { availableColors, unavailableColors };
    }
    function parseColorElement(el) {
      const id = Number(el.id.replace("color-", ""));
      const rgbMatch = el.style.backgroundColor.match(/\d+/g);
      if (!rgbMatch || rgbMatch.length < 3) {
        if (id !== 0) {
          console.warn(`Skipping color element ${el.id} \u2014 cannot parse RGB`);
          return null;
        } else {
          const configTransparent = APP_CONSTANTS.COLOR_MAP[id];
          if (!configTransparent) return null;
          return {
            id: configTransparent.id,
            name: configTransparent.name,
            rgb: Object.values(configTransparent.rgb),
            isAvailable: true
          };
        }
      }
      const rgb = rgbMatch.map(Number);
      const colorInfo = APP_CONSTANTS.COLOR_MAP[id];
      const name = colorInfo ? colorInfo.name : `Unknown Color ${id}`;
      if (!colorInfo) console.warn(`Color id ${id} not found in known colors`);
      const isAvailable = !el.querySelector("svg");
      return { id, name, rgb, isAvailable };
    }
    for (const el of colorElements) {
      const colorData = parseColorElement(el);
      if (!colorData) continue;
      if (colorData.isAvailable) availableColors.push(colorData);
      else unavailableColors.push(colorData);
    }
    console.log("=== CAPTURED COLORS STATUS ===");
    console.log(`Total available colors: ${availableColors.length}`);
    console.log(`Total unavailable colors: ${unavailableColors.length}`);
    console.log(`Total colors scanned: ${availableColors.length + unavailableColors.length}`);
    if (availableColors.length > 0) {
      console.log("\n--- AVAILABLE COLORS ---");
      availableColors.forEach((color, index) => {
        console.log(
          `${index + 1}. ID: ${color.id}, Name: "${color.name}", RGB: (${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`
        );
      });
    }
    if (unavailableColors.length > 0) {
      console.log("\n--- UNAVAILABLE COLORS ---");
      unavailableColors.forEach((color, index) => {
        console.log(
          `${index + 1}. ID: ${color.id}, Name: "${color.name}", RGB: (${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]}) [LOCKED]`
        );
      });
    }
    console.log("=== END COLOR STATUS ===");
    return { availableColors, unavailableColors };
  }
  function safeOn(el, event, handler) {
    if (el) el.addEventListener(event, handler);
  }

  // src/js/utils/color-matching.js
  var _labCache = /* @__PURE__ */ new Map();
  var colorCache = /* @__PURE__ */ new Map();
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
  function findClosestPaletteColor(r, g, b, palette) {
    if (!palette || palette.length === 0) {
      palette = Object.values(APP_CONSTANTS.COLOR_MAP).filter((c) => c.rgb).map((c) => [c.rgb.r, c.rgb.g, c.rgb.b]);
    }
    if (state.colorMatchingAlgorithm === "legacy") {
      let menorDist = Infinity;
      let cor = [0, 0, 0, 255];
      for (let i = 0; i < palette.length; i++) {
        const [pr, pg, pb] = palette[i];
        const rmean = (pr + r) / 2;
        const rdiff = pr - r;
        const gdiff = pg - g;
        const bdiff = pb - b;
        const dist = Math.sqrt(
          ((512 + rmean) * rdiff * rdiff >> 8) + 4 * gdiff * gdiff + ((767 - rmean) * bdiff * bdiff >> 8)
        );
        if (dist < menorDist) {
          menorDist = dist;
          cor = [pr, pg, pb, 255];
        }
      }
      return cor;
    }
    const [Lt, at, bt] = _lab(r, g, b);
    const targetChroma = Math.sqrt(at * at + bt * bt);
    let best = null;
    let bestDist = Infinity;
    for (let i = 0; i < palette.length; i++) {
      const [pr, pg, pb] = palette[i];
      const [Lp, ap, bp] = _lab(pr, pg, pb);
      const dL = Lt - Lp;
      const da = at - ap;
      const db = bt - bp;
      let dist = dL * dL + da * da + db * db;
      if (state.enableChromaPenalty && targetChroma > 20) {
        const candChroma = Math.sqrt(ap * ap + bp * bp);
        if (candChroma < targetChroma) {
          const chromaDiff = targetChroma - candChroma;
          dist += chromaDiff * chromaDiff * state.chromaPenaltyWeight;
        }
      }
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
        const [r, g, b] = c.rgb;
        const rmean = (r + targetRgb[0]) / 2;
        const rdiff = r - targetRgb[0];
        const gdiff = g - targetRgb[1];
        const bdiff = b - targetRgb[2];
        const dist = Math.sqrt(
          ((512 + rmean) * rdiff * rdiff >> 8) + 4 * gdiff * gdiff + ((767 - rmean) * bdiff * bdiff >> 8)
        );
        if (dist < bestScore) {
          bestScore = dist;
          bestId = c.id;
          bestRgb = [...c.rgb];
          if (dist === 0) break;
        }
      }
    } else {
      const [Lt, at, bt] = _lab(targetRgb[0], targetRgb[1], targetRgb[2]);
      const targetChroma = Math.sqrt(at * at + bt * bt);
      const penaltyWeight = state.enableChromaPenalty ? state.chromaPenaltyWeight || 0.15 : 0;
      for (let i = 0; i < availableColors.length; i++) {
        const c = availableColors[i];
        const [r, g, b] = c.rgb;
        const [L2, a2, b2] = _lab(r, g, b);
        const dL = Lt - L2, da = at - a2, db = bt - b2;
        let dist = dL * dL + da * da + db * db;
        if (penaltyWeight > 0 && targetChroma > 20) {
          const candChroma = Math.sqrt(a2 * a2 + b2 * b2);
          if (candChroma < targetChroma) {
            const cd = targetChroma - candChroma;
            dist += cd * cd * penaltyWeight;
          }
        }
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

  // src/js/ui/coordinate-ui.js
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
      directionControls: document.getElementById("#directionControls"),
      snakeControls: document.getElementById("#snakeControls"),
      blockControls: document.getElementById("#blockControls")
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

  // src/js/overlay/overlay-manager.js
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
    }
    toggle() {
      this.isEnabled = !this.isEnabled;
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
    // --- OVERLAY UPDATE: Optimized chunking with caching and batch processing ---
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
      return await chunkCanvas.transferToImageBitmap();
    }
    // --- OVERLAY UPDATE: Optimized compositing with caching ---
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
     * Wait until all required tiles are loaded and cached
     * @param {number} startRegionX
     * @param {number} startRegionY
     * @param {number} pixelWidth
     * @param {number} pixelHeight
     * @param {number} startPixelX
     * @param {number} startPixelY
     * @param {number} timeoutMs
     * @returns {Promise<boolean>} true if tiles are ready
     */
    async waitForTiles(startRegionX, startRegionY, pixelWidth, pixelHeight, startPixelX = 0, startPixelY = 0, timeoutMs = 1e4) {
      const { startTileX, startTileY, endTileX, endTileY } = calculateTileRange(
        startRegionX,
        startRegionY,
        startPixelX,
        startPixelY,
        pixelWidth,
        pixelHeight,
        this.tileSize
      );
      const requiredTiles = [];
      for (let ty = startTileY; ty <= endTileY; ty++) {
        for (let tx = startTileX; tx <= endTileX; tx++) {
          requiredTiles.push(`${tx},${ty}`);
        }
      }
      if (requiredTiles.length === 0) return true;
      const startTime = Date.now();
      while (Date.now() - startTime < timeoutMs) {
        if (state.stopFlag) {
          console.log("waitForTiles: stopped by user");
          return false;
        }
        const missing = requiredTiles.filter((key) => !this.originalTiles.has(key));
        if (missing.length === 0) {
          console.log(`\u2705 All ${requiredTiles.length} required tiles are loaded`);
          return true;
        }
        await sleep(100);
      }
      console.warn(`\u274C Timeout waiting for tiles: ${requiredTiles.length} required, 
        ${requiredTiles.filter((k) => this.originalTiles.has(k)).length} loaded`);
      return false;
    }
  };
  async function restoreOverlayFromData() {
    if (!state.imageLoaded || !state.imageData || !state.startPosition || !state.region) {
      return false;
    }
    try {
      const imageData = new ImageData(
        state.imageData.pixels,
        state.imageData.width,
        state.imageData.height
      );
      const canvas = new OffscreenCanvas(state.imageData.width, state.imageData.height);
      const ctx = canvas.getContext("2d");
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
  var switchTheme = (themeKey) => {
    if (!APP_CONSTANTS.THEMES[themeKey]) {
      console.warn(`Theme not found: ${themeKey}`);
      return;
    }
    if (themeKey === "neon-retro") {
      appendLinkOnce("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");
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
  var pendingMin = state.randomBatchMin;
  var pendingMax = state.randomBatchMax;
  var lastEdited = "max";
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
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1 || value > 1e3) return;
    pendingMin = value;
    lastEdited = "min";
    applyBatchRangeSettings();
  }
  function handleRandomBatchMaxInput(e) {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1 || value > 1e3) return;
    pendingMax = value;
    lastEdited = "max";
    applyBatchRangeSettings();
  }
  var handlePaintSpeedToggle = createCheckboxHandler(
    "paintingSpeedLimitEnabled",
    "paintSpeedLimitEnabled",
    "paintSpeedLimitDisabled"
  );
  function handleThemeChange(e) {
    const newThemeKey = e.target.value;
    switchTheme(newThemeKey);
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
    const blockWidthInput = container.querySelector("#blockWidthInput");
    const blockHeightInput = container.querySelector("#blockHeightInput");
    safeOn(coordinateModeSelect, "change", handleCoordinateModeChange);
    safeOn(coordinateDirectionSelect, "change", handleCoordinateDirectionChange);
    safeOn(coordinateSnakeToggle, "change", handleCoordinateSnakeChange);
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
      statsBtn.title = t("showStats");
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
    const hasImageData = state.imageLoaded && state.imageData;
    saveBtn.disabled = !hasImageData;
    saveToFileBtn.disabled = !hasImageData;
  }
  function handleSaveClick() {
    if (!state.imageLoaded) {
      showAlert(t("missingRequirements"), "error");
      return;
    }
    const success = saveProgress();
    if (success) {
      updateUI("autoSaved", "success");
      showAlert(t("autoSaved"), "success");
    } else {
      showAlert(t("errorSavingProgress"), "error");
    }
  }
  async function handleLoadClick() {
    if (!state.initialSetupComplete) {
      showAlert(t("pleaseWaitInitialSetup"), "warning");
      return;
    }
    const savedData = loadProgress();
    if (!savedData) {
      updateUI("noSavedData", "warning");
      showAlert(t("noSavedData"), "warning");
      return;
    }
    const confirmLoad = confirm(
      `${t("savedDataFound")}

Saved: ${new Date(savedData.timestamp).toLocaleString()}
Progress: ${savedData.state.userPaintedPixels}/${savedData.state.artTotalPixels} pixels`
    );
    if (confirmLoad) {
      const success = restoreProgress(savedData);
      if (success) {
        updateUI("dataLoaded", "success");
        showAlert(t("dataLoaded"), "success");
        updateDataButtons();
        await updateStats();
        restoreOverlayFromData().catch((error) => {
          console.error("Failed to restore overlay from localStorage:", error);
        });
        const uploadBtn = document.getElementById("uploadBtn");
        const selectPosBtn = document.getElementById("selectPosBtn");
        if (!state.hasAvailableColors) {
          if (uploadBtn) uploadBtn.disabled = false;
        } else {
          if (uploadBtn) uploadBtn.disabled = false;
          if (selectPosBtn) selectPosBtn.disabled = false;
        }
        const startBtn = document.getElementById("startBtn");
        if (state.imageLoaded && state.startPosition && state.region && state.hasAvailableColors) {
          if (startBtn) startBtn.disabled = false;
        }
      } else {
        showAlert(t("errorLoadingProgress"), "error");
      }
    }
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
  async function handleLoadFromFileClick() {
    if (!state.initialSetupComplete) {
      showAlert(t("pleaseWaitFileSetup"), "warning");
      return;
    }
    try {
      const success = await loadProgressFromFile();
      if (success) {
        updateUI("fileLoaded", "success");
        showAlert(t("fileLoaded"), "success");
        updateDataButtons();
        await updateStats();
        await restoreOverlayFromData().catch((error) => {
          console.error("Failed to restore overlay from file:", error);
        });
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
        const startBtn = document.getElementById("startBtn");
        if (state.imageLoaded && state.startPosition && state.region && state.hasAvailableColors) {
          if (startBtn) startBtn.disabled = false;
        }
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
    if (!state.hasAvailableColors) {
      const { availableColors } = extractColors();
      const newColorsCount = Array.isArray(availableColors) ? availableColors.length : 0;
      if (newColorsCount === 0) {
        updateUI("noColorsKnown", "error");
        showAlert(t("noColorsKnown"), "error");
        return;
      } else if (newColorsCount > 0 && colorsChanged(state.availableColors, availableColors)) {
        const oldCount = state.availableColors.length;
        showAlert(
          t("colorsUpdated", {
            oldCount,
            newCount: newColorsCount,
            diffCount: newColorsCount - oldCount
          }),
          "success"
        );
        state.availableColors = availableColors;
        invalidateColorCache({ availableColors: true });
      }
    }
    await updateStats();
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
      let totalValidPixels = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const shouldSkipTransparent = !state.paintTransparentPixels && isTransparentPixel(pixels[i + 3]);
        const shouldSkipWhite = !state.paintWhitePixels && isWhitePixel(pixels[i], pixels[i + 1], pixels[i + 2]);
        if (!shouldSkipTransparent && !shouldSkipWhite) {
          totalValidPixels++;
        }
      }
      state.imageData = { width, height, pixels, totalPixels: totalValidPixels, processor };
      state.artTotalPixels = totalValidPixels;
      state.userPaintedPixels = 0;
      state.resizeSettings = null;
      state.resizeIgnoreMask = null;
      state.originalImage = { dataUrl: imageSrc, width, height };
      saveBotSettings();
      const imageBitmap = await createImageBitmap(processor.img);
      await overlayManager.setImage(imageBitmap);
      overlayManager.enable();
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
      const startBtn = document.getElementById("startBtn");
      if (state.startPosition && startBtn) {
        startBtn.disabled = false;
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
    function updateActiveColorPalette(onPaletteChange2) {
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
      if (typeof onPaletteChange2 === "function") {
        onPaletteChange2(newPalette);
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
    findClosestPaletteColor: findClosestPaletteColor2,
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
        const [nr, ng, nb] = findClosestPaletteColor2(r0, g0, b0, state2.activeColorPalette);
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
    findClosestPaletteColor: findClosestPaletteColor2,
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
          findClosestPaletteColor: findClosestPaletteColor2,
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
            const [nr, ng, nb] = findClosestPaletteColor2(r, g, b, state2.activeColorPalette);
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

  // src/js/ui/components/resize/resize-dialog.js
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
      findClosestPaletteColor,
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
          findClosestPaletteColor,
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
          const [nr, ng, nb] = findClosestPaletteColor(r, g, b, state.activeColorPalette);
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
      state.userPaintedPixels = 0;
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
      updateStats();
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
  function handleStopClick() {
    state.stopFlag = true;
    state.running = false;
    const stopBtn = document.getElementById("stopBtn");
    if (stopBtn) stopBtn.disabled = true;
    updateUI("paintingStoppedByUser", "warning");
    if (state.imageLoaded && state.userPaintedPixels > 0) {
      saveProgress();
      showAlert(t("autoSaved"), "success");
    }
  }
  function handleToggleOverlayClick() {
    const isEnabled = overlayManager.toggle();
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
    if (state.selectingPosition) return;
    state.selectingPosition = true;
    state.startPosition = null;
    state.region = null;
    const startBtn = document.getElementById("startBtn");
    if (startBtn) startBtn.disabled = true;
    showAlert(t("selectPositionAlert"), "info");
    updateUI("waitingPosition", "default");
    const tempFetch = async (url, options) => {
      if (typeof url === "string" && url.includes("https://backend.wplace.live/s0/pixel/") && options?.method?.toUpperCase() === "POST") {
        try {
          const response = await originalFetch(url, options);
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();
          if (data?.painted === 1) {
            const regionMatch = url.match(/\/pixel\/(\d+)\/(\d+)/);
            if (regionMatch && regionMatch.length >= 3) {
              state.region = {
                x: Number.parseInt(regionMatch[1]),
                y: Number.parseInt(regionMatch[2])
              };
            }
            const payload = JSON.parse(options.body);
            if (payload?.coords && Array.isArray(payload.coords)) {
              state.startPosition = {
                x: payload.coords[0],
                y: payload.coords[1]
              };
              await overlayManager.setPosition(state.startPosition, state.region);
              if (state.imageLoaded) {
                const startBtn2 = document.getElementById("startBtn");
                if (startBtn2) startBtn2.disabled = false;
              }
              window.fetch = originalFetch;
              state.selectingPosition = false;
              updateUI("positionSet", "success");
            }
          }
          return response;
        } catch (error) {
          console.error("Fetch hook error:", error);
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

  // src/js/core/captcha-handler.js
  async function handleCaptcha() {
    const startTime = performance.now();
    if (state.tokenSource === "manual") {
      console.log("\u{1F3AF} Manual token source selected - using pixel placement automation");
      return await handleCaptchaFallback();
    }
    try {
      const { sitekey, token: preGeneratedToken } = await obtainSitekeyAndToken();
      if (!sitekey) {
        throw new Error("No valid sitekey found");
      }
      console.log("\u{1F511} Generating Turnstile token for sitekey:", sitekey);
      console.log(
        "\u{1F9ED} UA:",
        navigator.userAgent.substring(0, 50) + "...",
        "Platform:",
        navigator.platform
      );
      if (!window.turnstile) {
        await loadTurnstile();
      }
      let token = null;
      if (preGeneratedToken && typeof preGeneratedToken === "string" && preGeneratedToken.length > 20) {
        console.log("\u267B\uFE0F Reusing pre-generated token from sitekey detection phase");
        token = preGeneratedToken;
      } else if (isTokenValid()) {
        console.log("\u267B\uFE0F Using existing cached token (from previous operation)");
        token = getTurnstileToken();
      } else {
        console.log("\u{1F510} No valid pre-generated or cached token, creating new one...");
        token = await executeTurnstile(sitekey, "paint");
        if (token) {
          setTurnstileToken(token);
        }
      }
      console.log(
        `\u{1F50D} Token received - Type: ${typeof token}, Value: ${token ? typeof token === "string" ? token.length > 50 ? token.substring(0, 50) + "..." : token : JSON.stringify(token) : "null/undefined"}, Length: ${token?.length || 0}`
      );
      if (typeof token === "string" && token.length > 20) {
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
        const fbToken = await handleCaptchaFallback();
        return fbToken;
      } else {
        throw error;
      }
    }
  }

  // src/js/security/token-generator.js
  async function createWasmToken(regionX, regionY, payload) {
    try {
      const mod = await import("/_app/immutable/chunks/BBb1ALhY.js");
      let wasm;
      try {
        wasm = await mod._();
        console.log("\u2705 WASM initialized successfully");
      } catch (wasmError) {
        console.error("\u274C WASM initialization failed:", wasmError);
        return null;
      }
      try {
        try {
          const me = await fetch(`https://backend.wplace.live/me`, { credentials: "include" }).then(
            (r) => r.ok ? r.json() : null
          );
          if (me?.id) {
            mod.i(me.id);
            console.log("\u2705 user ID set:", me.id);
          }
        } catch {
        }
      } catch (userIdError) {
        console.log("\u26A0\uFE0F Error setting user ID:", userIdError.message);
      }
      try {
        const testUrl = `https://backend.wplace.live/s0/pixel/${regionX}/${regionY}`;
        if (mod.r) {
          mod.r(testUrl);
          console.log("\u2705 Request URL set:", testUrl);
        } else {
          console.log("\u26A0\uFE0F request_url function (mod.r) not available");
        }
      } catch (urlError) {
        console.log("\u26A0\uFE0F Error setting request URL:", urlError.message);
      }
      console.log("\u{1F4DD} payload:", payload);
      const enc = new TextEncoder();
      const dec = new TextDecoder();
      const bodyStr = JSON.stringify(payload);
      const bytes = enc.encode(bodyStr);
      console.log("\u{1F4CF} Payload size:", bytes.length, "bytes");
      console.log("\u{1F4C4} Payload string:", bodyStr);
      let inPtr;
      try {
        if (!wasm.__wbindgen_malloc) {
          console.error("\u274C __wbindgen_malloc function not found");
          return null;
        }
        inPtr = wasm.__wbindgen_malloc(bytes.length, 1);
        console.log("\u2705 WASM memory allocated, pointer:", inPtr);
        const wasmBuffer = new Uint8Array(wasm.memory.buffer, inPtr, bytes.length);
        wasmBuffer.set(bytes);
        console.log("\u2705 Data copied to WASM memory");
      } catch (memError) {
        console.error("\u274C Memory allocation error:", memError);
        return null;
      }
      console.log("\u{1F680} Calling get_pawtected_endpoint_payload...");
      let outPtr, outLen, token;
      try {
        const result = wasm.get_pawtected_endpoint_payload(inPtr, bytes.length);
        console.log("\u2705 Function called, result type:", typeof result, result);
        if (Array.isArray(result) && result.length === 2) {
          [outPtr, outLen] = result;
          console.log("\u2705 Got output pointer:", outPtr, "length:", outLen);
          const outputBuffer = new Uint8Array(wasm.memory.buffer, outPtr, outLen);
          token = dec.decode(outputBuffer);
          console.log("\u2705 Token decoded successfully");
        } else {
          console.error("\u274C Unexpected function result format:", result);
          return null;
        }
      } catch (funcError) {
        console.error("\u274C Function call error:", funcError);
        console.error("Stack trace:", funcError.stack);
        return null;
      }
      try {
        if (wasm.__wbindgen_free && outPtr && outLen) {
          wasm.__wbindgen_free(outPtr, outLen, 1);
          console.log("\u2705 Output memory freed");
        }
        if (wasm.__wbindgen_free && inPtr) {
          wasm.__wbindgen_free(inPtr, bytes.length, 1);
          console.log("\u2705 Input memory freed");
        }
      } catch (cleanupError) {
        console.log("\u26A0\uFE0F Cleanup warning:", cleanupError.message);
      }
      console.log("");
      console.log("\u{1F389} SUCCESS!");
      console.log("\u{1F4CA} Results:");
      console.log("   Input coords: [1245984, 1088]");
      console.log("   Token length:", token?.length || 0);
      console.log("   Token preview:", token?.substring(0, 50) + "...");
      console.log("");
      console.log("\u{1F511} Full token:");
      console.log(token);
      return token;
    } catch (error) {
      console.error("\u274C Failed to generate fp parameter:", error);
      return null;
    }
  }

  // src/js/core/pixel-batch.js
  async function sendBatchWithRetry(pixels, regionX, regionY, maxRetries = 10) {
    let attempt = 0;
    while (attempt < maxRetries && !state.stopFlag) {
      attempt++;
      console.log(
        `\u{1F504} Attempting to send batch (attempt ${attempt}/${maxRetries}) for region ${regionX},${regionY} with ${pixels.length} pixels`
      );
      const result = await sendPixelBatch(pixels, regionX, regionY);
      if (result === true) {
        console.log(`\u2705 Batch succeeded on attempt ${attempt}`);
        return true;
      } else if (result === "token_error") {
        console.log(`\u{1F511} Token error on attempt ${attempt}, regenerating...`);
        updateUI("captchaSolving", "warning");
        try {
          await handleCaptcha();
          attempt--;
          continue;
        } catch (e) {
          console.error(`\u274C Token regeneration failed on attempt ${attempt}:`, e);
          updateUI("captchaFailed", "error");
          await sleep(5e3);
        }
      } else {
        console.warn(`\u26A0\uFE0F Batch failed on attempt ${attempt}, retrying...`);
        const baseDelay = Math.min(1e3 * Math.pow(2, attempt - 1), 3e4);
        const jitter = Math.random() * 1e3;
        await sleep(baseDelay + jitter);
      }
    }
    if (attempt >= maxRetries) {
      console.error(
        `\u274C Batch failed after ${maxRetries} attempts. This will stop painting to prevent infinite loops.`
      );
      updateUI("paintingError", "error");
      return false;
    }
    return false;
  }
  async function sendPixelBatch(pixelBatch, regionX, regionY) {
    let token = getTurnstileToken();
    if (!token) {
      try {
        console.log("\u{1F511} Generating Turnstile token for pixel batch...");
        token = await handleCaptcha();
        setTurnstileToken(token);
      } catch (error) {
        console.error("\u274C Failed to generate Turnstile token:", error);
        return "token_error";
      }
    }
    const coords = new Array(pixelBatch.length * 2);
    const colors = new Array(pixelBatch.length);
    for (let i = 0; i < pixelBatch.length; i++) {
      const pixel = pixelBatch[i];
      coords[i * 2] = pixel.x;
      coords[i * 2 + 1] = pixel.y;
      colors[i] = pixel.color;
    }
    try {
      const payload = { coords, colors, t: token, fp: randStr(10) };
      const wasmToken = await createWasmToken(regionX, regionY, payload);
      const res = await fetch(`https://backend.wplace.live/s0/pixel/${regionX}/${regionY}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          "x-pawtect-token": wasmToken
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      if (res.status === 403) {
        let data2 = null;
        try {
          data2 = await res.json();
        } catch (_) {
        }
        console.error("\u274C 403 Forbidden. Turnstile token might be invalid or expired.");
        try {
          console.log("\u{1F504} Regenerating Turnstile token after 403...");
          token = await handleCaptcha();
          setTurnstileToken(token);
          const retryPayload = {
            coords,
            colors,
            t: token,
            fp: randStr(10)
          };
          const wasmToken2 = await createWasmToken(regionX, regionY, retryPayload);
          const retryRes = await fetch(`https://backend.wplace.live/s0/pixel/${regionX}/${regionY}`, {
            method: "POST",
            headers: {
              "Content-Type": "text/plain;charset=UTF-8",
              "x-pawtect-token": wasmToken2
            },
            credentials: "include",
            body: JSON.stringify(retryPayload)
          });
          if (retryRes.status === 403) {
            setTurnstileToken(null);
            return "token_error";
          }
          const retryData = await retryRes.json();
          return retryData?.painted === pixelBatch.length;
        } catch (retryError) {
          console.error("\u274C Token regeneration failed:", retryError);
          setTurnstileToken(null);
          return "token_error";
        }
      }
      const data = await res.json();
      return data?.painted === pixelBatch.length;
    } catch (e) {
      console.error("Batch paint request failed:", e);
      return false;
    }
  }

  // src/js/core/auto-save.js
  function shouldAutoSave() {
    const now = Date.now();
    const pixelsSinceLastSave = state.userPaintedPixels - state._lastSavePixelCount;
    const timeSinceLastSave = now - state._lastSaveTime;
    return !state._saveInProgress && pixelsSinceLastSave >= 25 && timeSinceLastSave >= 3e4;
  }
  function performSmartSave() {
    if (!shouldAutoSave()) return false;
    state._saveInProgress = true;
    const success = saveProgress();
    if (success) {
      state._lastSavePixelCount = state.userPaintedPixels;
      state._lastSaveTime = Date.now();
      console.log(`\u{1F4BE} Auto-saved at ${state.userPaintedPixels} pixels`);
    }
    state._saveInProgress = false;
    return success;
  }

  // src/js/core/coordinate-generator.js
  function generateCoordinates(width, height, mode, direction, snake, blockWidth, blockHeight) {
    const coords = [];
    console.log(
      "Generating coordinates with \n  mode:",
      mode,
      "\n  direction:",
      direction,
      "\n  snake:",
      snake,
      "\n  blockWidth:",
      blockWidth,
      "\n  blockHeight:",
      blockHeight
    );
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
              const dist = Math.max(Math.abs(x - cx), Math.abs(y - cy));
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
              const dist = Math.max(Math.abs(x - cx), Math.abs(y - cy));
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
        coords.push(...block);
      }
    } else {
      throw new Error(`Unknown mode: ${mode}`);
    }
    return coords;
  }

  // src/js/core/painting-controller.js
  async function flushPixelBatch(batch) {
    if (!batch || batch.pixels.length === 0) return true;
    const batchSize = batch.pixels.length;
    console.log(
      `\u{1F4E6} Sending batch with ${batchSize} pixels (region: ${batch.regionX},${batch.regionY})`
    );
    const success = await sendBatchWithRetry(batch.pixels, batch.regionX, batch.regionY);
    if (success) {
      state.userPaintedPixels += batchSize;
      state.fullChargeData = {
        ...state.fullChargeData,
        spentSinceShot: state.fullChargeData.spentSinceShot + batchSize
      };
      await updateStats();
      updateUI("paintingProgress", "default", {
        painted: state.userPaintedPixels,
        total: state.artTotalPixels
      });
      performSmartSave();
      if (state.paintingSpeedLimitEnabled && state.paintingSpeed > 0 && batchSize > 0) {
        const delayPerPixel = 1e3 / state.paintingSpeed;
        const totalDelay = Math.max(100, delayPerPixel * batchSize);
        await sleep(totalDelay);
      }
    } else {
      console.error(
        `\u274C Batch for ${batch.regionX}, ${batch.regionY} with ${batch.pixels.length} pixels
         failed permanently after retries. Stopping painting.`
      );
      state.stopFlag = true;
      updateUI("paintingBatchFailed", "error");
    }
    batch.pixels = [];
    return success;
  }
  async function processImage() {
    const { width, height, pixels } = state.imageData;
    const { x: startX, y: startY } = state.startPosition;
    const { x: regionX, y: regionY } = state.region;
    const tilesReady = await overlayManager.waitForTiles(
      regionX,
      regionY,
      width,
      height,
      startX,
      startY,
      1e4
    );
    if (!tilesReady) {
      updateUI("overlayTilesNotLoaded", "error");
      state.stopFlag = true;
      return;
    }
    const pixelBatches = /* @__PURE__ */ new Map();
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
          findClosestPaletteColor(r, g, b, state.activeColorPalette),
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
        console.log(`Skipped pixel for ${reason} (id: ${id}, (${rgb.join(", ")})) at (${x}, ${y})`);
      }
      skippedPixels[reason]++;
    }
    try {
      const coords = generateCoordinates(
        width,
        height,
        state.coordinateMode,
        state.coordinateDirection,
        state.coordinateSnake,
        state.blockWidth,
        state.blockHeight
      );
      outerLoop: for (const [x, y] of coords) {
        if (state.stopFlag) {
          for (const [_, batch2] of pixelBatches.entries()) {
            if (batch2.pixels.length > 0) {
              console.log(`\u{1F3AF} Sending last batch before user-stop`);
              await flushPixelBatch(batch2);
            }
          }
          break outerLoop;
        }
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
          const tileKeyParts = [batch.regionX, batch.regionY];
          const tilePixelRGBA = await overlayManager.getTilePixelColor(
            tileKeyParts[0],
            tileKeyParts[1],
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
            console.debug(
              `[COMPARE] Pixel at \u{1F4CD} (${pixelX}, ${pixelY}) in region (${regionX + adderX}, ${regionY + adderY})
  \u251C\u2500\u2500 Current color: rgb(${tilePixelRGBA.join(
                ", "
              )}) (id: ${mappedCanvasColor.id})
  \u251C\u2500\u2500 Target color:  rgb(${targetPixelInfo.r}, ${targetPixelInfo.g}, ${targetPixelInfo.b}, ${targetPixelInfo.a}) (id: ${targetMappedColorId})
  \u2514\u2500\u2500 Status: ${isMatch ? "\u2705 Already painted \u2192 SKIP" : "\u{1F534} Needs paint \u2192 PAINT"}
`
            );
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
        const maxBatchSize = calculateBatchSize();
        if (batch.pixels.length >= maxBatchSize) {
          const success = await flushPixelBatch(batch);
          if (!success) {
            break outerLoop;
          }
          batch.pixels = [];
        }
        if (state.displayCharges < state.cooldownChargeThreshold && !state.stopFlag) {
          await dynamicSleep(() => {
            if (state.displayCharges >= state.cooldownChargeThreshold) {
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
          if (!success) {
            console.warn(`\u26A0\uFE0F Final batch for ${key} failed with ${batch.pixels.length} pixels.`);
          }
        }
      }
    } finally {
      if (window._chargesInterval) clearInterval(window._chargesInterval);
      window._chargesInterval = null;
    }
    if (state.stopFlag) {
      saveProgress();
    } else {
      updateUI("paintingComplete", "success", { count: state.userPaintedPixels });
      saveProgress();
      overlayManager.clear();
      const toggleOverlayBtn2 = document.getElementById("toggleOverlayBtn");
      if (toggleOverlayBtn2) {
        toggleOverlayBtn2.classList.remove("active");
        toggleOverlayBtn2.disabled = true;
      }
    }
    console.log(`\u{1F4CA} Pixel Statistics:`);
    console.log(`   Painted: ${state.userPaintedPixels}`);
    console.log(`   Skipped - Transparent: ${skippedPixels.transparent}`);
    console.log(`   Skipped - White (disabled): ${skippedPixels.white}`);
    console.log(`   Skipped - Already painted: ${skippedPixels.alreadyPainted}`);
    console.log(`   Skipped - Color Unavailable: ${skippedPixels.colorUnavailable}`);
    console.log(
      `   Total processed: ${state.userPaintedPixels + skippedPixels.transparent + skippedPixels.white + skippedPixels.alreadyPainted + skippedPixels.colorUnavailable}`
    );
    updateStats();
  }
  function calculateBatchSize() {
    let targetBatchSize;
    if (state.batchMode === "random") {
      const min = Math.max(1, state.randomBatchMin);
      const max = Math.max(min, state.randomBatchMax);
      targetBatchSize = Math.floor(Math.random() * (max - min + 1)) + min;
      console.log(`\u{1F3B2} Random batch size generated: ${targetBatchSize} (range: ${min}-${max})`);
    } else {
      targetBatchSize = state.paintingSpeed;
    }
    const maxAllowed = state.displayCharges;
    const finalBatchSize = Math.min(targetBatchSize, maxAllowed);
    return finalBatchSize;
  }

  // src/js/ui/handlers/main-panel/handle-start-painting.js
  async function handleStartPainting() {
    if (!state.imageLoaded || !state.startPosition || !state.region) {
      updateUI("missingRequirements", "error");
      return;
    }
    await ensureToken();
    if (!getTurnstileToken()) return;
    state.running = true;
    state.stopFlag = false;
    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const uploadBtn = document.getElementById("uploadBtn");
    const selectPosBtn = document.getElementById("selectPosBtn");
    const resizeBtn = document.getElementById("resizeBtn");
    const saveBtn = document.getElementById("saveBtn");
    const toggleOverlayBtn2 = document.getElementById("toggleOverlayBtn");
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
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
      if (stopBtn) stopBtn.disabled = true;
      if (saveBtn) saveBtn.disabled = false;
      if (state.stopFlag) {
        if (startBtn) startBtn.disabled = false;
      } else {
        if (startBtn) startBtn.disabled = true;
        if (uploadBtn) uploadBtn.disabled = false;
        if (selectPosBtn) selectPosBtn.disabled = false;
        if (resizeBtn) resizeBtn.disabled = false;
      }
      if (toggleOverlayBtn2) toggleOverlayBtn2.disabled = false;
    }
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
    if (state.minimized) {
      container.classList.add("wplace-minimized");
      content.classList.add("wplace-hidden");
      if (btn) {
        btn.innerHTML = '<i class="fas fa-expand"></i>';
        btn.title = t("restore");
      }
    } else {
      container.classList.remove("wplace-minimized");
      content.classList.remove("wplace-hidden");
      if (btn) {
        btn.innerHTML = '<i class="fas fa-minus"></i>';
        btn.title = t("minimize");
      }
    }
    saveBotSettings();
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
    const startBtn = container.querySelector("#startBtn");
    const stopBtn = container.querySelector("#stopBtn");
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
    safeOn(startBtn, "click", handleStartPainting);
    safeOn(stopBtn, "click", handleStopClick);
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
    await initializeTranslations();
    appendLinkOnce("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");
    appendLinkOnce("https://skalsech.github.io/WPlace-AutoBOT/custom-main/auto-image-styles.css", {
      "data-wplace-theme": "true"
    });
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
        <div class="wplace-stat-label"><i class="fas fa-bolt"></i> ${t("charges")}</div>
        <div class="wplace-stat-value" id="wplace-stat-charges-value">0/0</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-battery-half"></i> ${t(
        "fullChargeIn"
      )}</div>
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
        <div class="wplace-stat-label"><i class="fas fa-image"></i> ${t("progress")}</div>
        <div class="wplace-stat-value" id="wplace-stat-progress">--%</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-paint-brush"></i> ${t("pixels")}</div>
        <div class="wplace-stat-value" id="wplace-stat-pixels">0/0</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-clock"></i> ${t("estimatedTime")}</div>
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
      const newText = `${state.displayCharges} / ${state.maxCharges}`;
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
    if (state.imageLoaded) {
      const estimatedEl = document.getElementById("wplace-stat-estimated");
      if (!estimatedEl) return;
      state.estimatedTime = calculateEstimatedTime();
      const newText = formatTime(state.estimatedTime);
      if (estimatedEl.textContent !== newText) {
        estimatedEl.textContent = newText;
      }
    }
  }
  function updateImageStats() {
    if (!state.imageLoaded) return;
    const container = document.getElementById("wplace-image-bot-container");
    const progressBar = container.querySelector("#progressBar");
    const progress = state.artTotalPixels > 0 ? Math.round(state.userPaintedPixels / state.artTotalPixels * 100) : 0;
    state.estimatedTime = calculateEstimatedTime();
    progressBar.style.width = `${progress}%`;
    document.getElementById("wplace-stat-progress").textContent = `${progress}%`;
    document.getElementById("wplace-stat-pixels").textContent = `${state.userPaintedPixels}/${state.artTotalPixels}`;
    document.getElementById("wplace-stat-estimated").textContent = formatTime(state.estimatedTime);
  }
  function updateColorSwatches() {
    if (!state.hasAvailableColors) return;
    const labelEl = document.getElementById("wplace-stat-colors-label");
    const gridEl = document.getElementById("wplace-stat-colors-grid");
    if (!labelEl || !gridEl) return;
    labelEl.innerHTML = `<i class="fas fa-palette"></i> ${t("availableColors", {
      count: state.availableColors.length
    })}`;
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
    const minUpdateInterval = 6e4;
    const maxUpdateInterval = 9e4;
    const randomUpdateThreshold = minUpdateInterval + Math.random() * (maxUpdateInterval - minUpdateInterval);
    const timeSinceLastUpdate = Date.now() - (state.fullChargeData?.startTime || 0);
    const isTimeToUpdate = timeSinceLastUpdate >= randomUpdateThreshold;
    const shouldCallApi = isManualRefresh || isFirstCheck || isTimeToUpdate;
    if (shouldCallApi) {
      const { charges, max, cooldown } = await WPlaceService.getCharges();
      state.displayCharges = Math.floor(charges);
      state.preciseCurrentCharges = charges;
      state.cooldown = cooldown;
      state.maxCharges = Math.floor(max) > 1 ? Math.floor(max) : state.maxCharges;
      state.fullChargeData = {
        current: charges,
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
    state.fullChargeInterval = setInterval(() => updateChargeStatsDisplay(intervalMs), intervalMs);
    const container = document.getElementById("wplace-image-bot-container");
    const cooldownSlider = container.querySelector("#cooldownSlider");
    if (cooldownSlider.max !== state.maxCharges) {
      cooldownSlider.max = state.maxCharges;
    }
    const { availableColors } = extractColors();
    const newCount = Array.isArray(availableColors) ? availableColors.length : 0;
    if (newCount === 0 && isManualRefresh) {
      showAlert(t("noColorsFound"), "warning");
    } else if (newCount > 0 && colorsChanged(state.availableColors, availableColors)) {
      const oldCount = state.availableColors.length;
      showAlert(
        t("colorsUpdated", {
          oldCount,
          newCount,
          diffCount: newCount - oldCount
        }),
        "success"
      );
      state.availableColors = availableColors;
      invalidateColorCache({ availableColors: true });
    }
    let lastEl = document.getElementById("wplace-init-msg");
    if (state.imageLoaded) lastEl = ensureImageStats(lastEl);
    if (state.fullChargeData) lastEl = ensureChargeStats(lastEl);
    if (state.hasAvailableColors) lastEl = ensureColorSwatches(lastEl);
    updateImageStats();
    updateChargeStatsDisplay(intervalMs);
    updateColorSwatches();
    tryRemoveStatsInitMessage();
  }
  var checkSavedProgress = () => {
    const savedData = loadProgress();
    if (savedData && savedData.state.userPaintedPixels > 0) {
      const savedDate = new Date(savedData.timestamp).toLocaleString();
      const progress = Math.round(
        savedData.state.userPaintedPixels / savedData.state.artTotalPixels * 100
      );
      showAlert(
        `${t("savedDataFound")}

Saved: ${savedDate}
Progress: ${savedData.state.userPaintedPixels}/${savedData.state.artTotalPixels} pixels (${progress}%)
${t("clickLoadToContinue")}`,
        "info"
      );
    }
  };
  async function createUI() {
    cleanupExistingUI();
    await initializeDependencies();
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
    setupMainPanelListeners();
    setupStatsListeners();
    setupSettingsListeners();
    makeDraggable(container);
    makeDraggable(statsContainer);
    makeDraggable(settingsContainer);
    updateDataButtons();
    setTimeout(checkSavedProgress, 1e3);
    loadBotSettings();
    syncSettingsUI();
    NotificationManager.syncFromState();
    container.style.display = "block";
  }

  // src/js/startup/startup.js
  function enableFileOperations() {
    state.initialSetupComplete = true;
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
    showAlert(t("fileOperationsAvailable"), "success");
    console.log("\u2705 File operations (Load/Upload) are now available!");
  }
  async function initializeTokenGenerator() {
    if (isTokenValid()) {
      console.log("\u2705 Valid token already available, skipping initialization");
      updateUI("tokenReady", "success");
      enableFileOperations();
      return;
    }
    try {
      console.log("\u{1F527} Initializing Turnstile token generator...");
      updateUI("initializingToken", "default");
      console.log("Attempting to load Turnstile script...");
      await loadTurnstile();
      console.log("Turnstile script loaded. Attempting to generate token...");
      const token = await handleCaptchaWithRetry();
      if (token) {
        setTurnstileToken(token);
        console.log("\u2705 Startup token generated successfully");
        updateUI("tokenReady", "success");
        showAlert(t("tokenGeneratorReady"), "success");
        enableFileOperations();
      } else {
        console.warn(
          "\u26A0\uFE0F Startup token generation failed (no token received), will retry when needed"
        );
        updateUI("tokenRetryLater", "warning");
        enableFileOperations();
      }
    } catch (error) {
      console.error("\u274C Critical error during Turnstile initialization:", error);
      updateUI("tokenRetryLater", "warning");
      enableFileOperations();
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
          if (url.includes("https://backend.wplace.live/s0/pixel/")) {
            try {
              const payload = JSON.parse(args[1].body);
              if (payload.t) {
                console.log(
                  `\u{1F50D}\u2705 Turnstile Token Captured - Type: ${typeof payload.t}, Value: ${payload.t ? typeof payload.t === "string" ? payload.t.length > 50 ? payload.t.substring(0, 50) + "..." : payload.t : JSON.stringify(payload.t) : "null/undefined"}, Length: ${payload.t?.length || 0}`
                );
                window.postMessage({ source: "turnstile-capture", token: payload.t }, "*");
              }
            } catch (_) {
            }
          }
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
  }
  window.addEventListener("message", (event) => {
    const { source, endpoint, blobID, blobData, token } = event.data;
    if (source === "auto-image-tile" && endpoint && blobID && blobData) {
      overlayManager.processAndRespondToTileRequest(event.data);
    }
    if (source === "turnstile-capture" && token) {
      setTurnstileToken(token);
      if (document.querySelector("#statusText")?.textContent.includes("CAPTCHA")) {
        showAlert(t("tokenCapturedSuccess"), "success");
        updateUI("colorsFound", "success", { count: state.availableColors.length });
      }
    }
  });

  // src/js/main.js
  setupFetchInterceptor();
  createUI().then(() => {
    setTimeout(initializeTokenGenerator, 1e3);
    updateStats();
    window.addEventListener("beforeunload", cleanupTurnstile);
  });
})();
//# sourceMappingURL=script.user.js.map
