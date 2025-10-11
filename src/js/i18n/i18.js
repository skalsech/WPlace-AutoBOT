import { sleep } from '../utils/helpers.js';
import { APP_CONSTANTS } from '../config/APP_CONSTANTS.js';
import { state } from '../core/state.js';
import { isSavedSettingsEmpty } from '../storage/settings-manager.js';
import { FALLBACK_TEXT } from './fallback.js';

const loadedTranslations = {};

export const loadTranslations = async (languageKey, retryCount = 0) => {
  if (loadedTranslations[languageKey]) {
    return loadedTranslations[languageKey];
  }

  const url =
    `https://skalsech.github.io/WPlace-AutoBOT/custom-main/dist/i18n/${languageKey}.json`.trim();
  const maxRetries = 3;
  const baseDelay = 1000;

  try {
    if (retryCount === 0) {
      console.log(`🔄 Loading ${languageKey} translations from CDN...`);
    } else {
      console.log(
        `🔄 Retrying ${languageKey} translations (attempt ${retryCount + 1}/${maxRetries + 1})...`
      );
    }

    const response = await fetch(url);
    if (response.ok) {
      const translations = await response.json();

      if (
        typeof translations === 'object' &&
        translations !== null &&
        Object.keys(translations).length > 0
      ) {
        loadedTranslations[languageKey] = translations;
        console.log(
          `📚 Loaded ${languageKey} translations successfully from CDN (${
            Object.keys(translations).length
          } keys)`
        );
        return translations;
      } else {
        console.warn(`❌ Invalid translation format for ${languageKey}`);
        throw new Error('Invalid translation format');
      }
    } else {
      console.warn(
        `❌ CDN returned HTTP ${response.status}: ${response.statusText} for ${languageKey} translations`
      );
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error(
      `❌ Failed to load ${languageKey} translations from CDN (attempt ${retryCount + 1}):`,
      error
    );

    if (retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await sleep(delay);
      return loadTranslations(languageKey, retryCount + 1);
    }
  }

  return null;
};
/**
 * Determines the best matching language from the user's browser preferences
 * based on the list of supported languages.
 * @returns {string} The matched language code (e.g. 'en', 'ru-RU')
 */
export const resolvePreferredLanguage = () => {
  const browserLocale = navigator.language;
  const browserLanguage = browserLocale.split('-')[0];

  if (APP_CONSTANTS.LANGUAGES.includes(browserLocale)) {
    return browserLocale;
  }
  if (APP_CONSTANTS.LANGUAGES.includes(browserLanguage)) {
    return browserLanguage;
  }
  return 'en';
};

const showTranslationWarning = (message) => {
  try {
    const warning = document.createElement('div');
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
    }, 8000);
  } catch (e) {
    console.warn('Failed to show translation warning UI:', e);
  }
};

export const initializeTranslations = async () => {
  if (!loadedTranslations['en']) {
    const englishLoaded = await loadTranslations('en');
    if (!englishLoaded) {
      console.warn('⚠️ Failed to load English translations from CDN, using fallback');
      showTranslationWarning('⚠️ Translation loading failed, using basic fallbacks');
    }
  }

  if (isSavedSettingsEmpty()) {
    const bestLanguage = resolvePreferredLanguage();
    if (!loadedTranslations[bestLanguage]) {
      await loadTranslations(bestLanguage);
      state.update({
        languageKey: bestLanguage,
      });
    }
  } else {
    await loadTranslations(state.languageKey);
    updateTranslations();
  }
  console.log(`✅ Translation system initialized. Active language: ${state.languageKey}`);
};

export function t(key, params = {}) {
  let text = loadedTranslations[state.languageKey]?.[key];

  if ((!text || text === key) && state.languageKey !== 'en') {
    text = loadedTranslations['en']?.[key];
  }

  if (!text) {
    text = FALLBACK_TEXT[state.languageKey]?.[key] || FALLBACK_TEXT.en?.[key] || key;
    if (text === key) {
      console.warn(`⚠️ Missing translation for key: ${key} (language: ${state.languageKey})`);
    }
  }

  const formatter = new window.IntlMessageFormat.IntlMessageFormat(text, state.languageKey);
  return formatter.format(params);
}

export function updateTranslations() {
  document.querySelectorAll('[data-i18n-key]').forEach((el) => {
    const key = el.dataset.i18nKey;
    const params = el.dataset.i18nParams ? JSON.parse(el.dataset.i18nParams) : {};

    const newText = t(key, params);

    if (el.dataset.i18nAttr === 'title') {
      el.title = newText;
    } else if (el.dataset.i18nAttr === 'placeholder') {
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
