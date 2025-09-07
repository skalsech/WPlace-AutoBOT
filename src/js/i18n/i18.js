// Simple translation cache
const translationCache = new Map();

// Dynamically loaded translations
let loadedTranslations = {};

// Available languages
const AVAILABLE_LANGUAGES = [
  'en',
  'ru',
  'pt',
  'vi',
  'fr',
  'id',
  'tr',
  'zh-CN',
  'zh-TW',
  'ja',
  'ko',
  'uk',
];

// Function to load translations from JSON file with retry mechanism
export const loadTranslations = async (languageKey, retryCount = 0) => {
  if (loadedTranslations[languageKey]) {
    return loadedTranslations[languageKey];
  }

  const url = `https://skalsech.github.io/WPlace-AutoBOT/custom-main/lang/${languageKey}.json`;
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

      // Validate that translations is an object with keys
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

    // Retry with exponential backoff
    if (retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await sleep(delay);
      return loadTranslations(languageKey, retryCount + 1);
    }
  }

  return null;
};

const loadLanguagePreference = async () => {
  const savedLanguage = loadFromStorage('wplace_language');

  const browserLocale = navigator.language;
  const browserLanguage = browserLocale.split('-')[0];

  let selectedLanguage = 'en'; // Default fallback

  try {
    // Check if we have the saved language available
    if (savedLanguage && AVAILABLE_LANGUAGES.includes(savedLanguage)) {
      selectedLanguage = savedLanguage;
      console.log(`🔄 Using saved language preference: ${selectedLanguage}`);
    }
    // Try full locale match (e.g. "zh-CN", "zh-TW" etc)
    else if (AVAILABLE_LANGUAGES.includes(browserLocale)) {
      selectedLanguage = browserLocale;
      saveToStorage('wplace_language', browserLocale);
      console.log(`🔄 Using browser locale: ${selectedLanguage}`);
    }
    // Try base language match (e.g. "en" for "en-US" or "en-GB" etc)
    else if (AVAILABLE_LANGUAGES.includes(browserLanguage)) {
      selectedLanguage = browserLanguage;
      saveToStorage('wplace_language', browserLanguage);
      console.log(`🔄 Using browser language: ${selectedLanguage}`);
    }
    // Use English as fallback
    else {
      console.log(`🔄 No matching language found, using English fallback`);
    }

    // Set the language in state first
    state.languageKey = selectedLanguage;

    // Only load translations if not already loaded and not English (which should already be loaded)
    if (selectedLanguage !== 'en' && !loadedTranslations[selectedLanguage]) {
      const loaded = await loadTranslations(selectedLanguage);
      if (!loaded) {
        console.warn(`⚠️ Failed to load ${selectedLanguage} translations, falling back to English`);
        state.languageKey = 'en';
        saveToStorage('wplace_language', 'en');
      }
    }
  } catch (error) {
    console.error(`❌ Error in loadLanguagePreference:`, error);
    state.languageKey = 'en'; // Always ensure we have a valid language
  }
};

// Simple user notification function for critical issues
const showTranslationWarning = (message) => {
  try {
    // Create a simple temporary notification banner
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

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (warning.parentNode) {
        warning.remove();
      }
    }, 8000);
  } catch (e) {
    // If DOM manipulation fails, just log
    console.warn('Failed to show translation warning UI:', e);
  }
};

// Initialize translations function
export const initializeTranslations = async () => {
  try {
    console.log('🌐 Initializing translation system...');

    // Always ensure English is loaded as fallback first
    if (!loadedTranslations['en']) {
      const englishLoaded = await loadTranslations('en');
      if (!englishLoaded) {
        console.warn('⚠️ Failed to load English translations from CDN, using fallback');
        showTranslationWarning('⚠️ Translation loading failed, using basic fallbacks');
      }
    }

    // Then load user's language preference
    await loadLanguagePreference();

    console.log(`✅ Translation system initialized. Active language: ${state.languageKey}`);
  } catch (error) {
    console.error('❌ Translation initialization failed:', error);
    // Ensure state has a valid language even if loading fails
    if (!state.languageKey) {
      state.languageKey = 'en';
    }
    console.warn('⚠️ Using fallback translations due to initialization failure');
    showTranslationWarning('⚠️ Translation system error, using basic English');
  }
};

export function t(key, params = {}) {
  // Try to get from cache first
  const cacheKey = `${state.languageKey}_${key}`;
  if (translationCache.has(cacheKey)) {
    let text = translationCache.get(cacheKey);
    Object.keys(params).forEach((param) => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  }

  // Try dynamically loaded translations (already loaded)
  if (loadedTranslations[state.languageKey]?.[key]) {
    let text = loadedTranslations[state.languageKey][key];
    // Cache for future use
    translationCache.set(cacheKey, text);
    Object.keys(params).forEach((param) => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  }

  // Fallback to English if current language failed
  if (state.languageKey !== 'en' && loadedTranslations['en']?.[key]) {
    let text = loadedTranslations['en'][key];
    Object.keys(params).forEach((param) => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  }

  // Final fallback to emergency fallback or key
  let text = FALLBACK_TEXT[state.languageKey]?.[key] || FALLBACK_TEXT.en?.[key] || key;
  Object.keys(params).forEach((param) => {
    text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
  });

  // Log missing translations for debugging
  if (text === key && key !== 'undefined') {
    console.warn(`⚠️ Missing translation for key: ${key} (language: ${state.languageKey})`);
  }

  return text;
}
