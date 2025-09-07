import { CONFIG } from '../core/config.js';
import { state } from '../core/state.js';
import { appendLinkOnce } from '../utils/helpers.js';
import { loadFromStorage, saveToStorage } from '../core/storage.js';

function applyTheme() {
  const theme = CONFIG.THEMES[CONFIG.currentThemeKey];

  if (!theme) {
    console.error(`Unknown theme: ${CONFIG.currentThemeKey}`);
    return;
  }

  const root = document.documentElement;
  Array.from(root.classList).forEach((cls) => {
    if (cls.startsWith('wplace-theme-')) {
      root.classList.remove(cls);
    }
  });

  root.classList.add(theme.cssClass);
}

export const switchTheme = (themeKey) => {
  if (!CONFIG.THEMES[themeKey]) {
    console.warn(`Theme not found: ${themeKey}`);
    return;
  }

  if (themeKey === 'neon-retro') {
    appendLinkOnce('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
  }
  CONFIG.currentThemeKey = themeKey;
  saveToStorage('wplace_theme', themeKey);
  applyTheme();
};

export const loadThemePreference = () => {
  const saved = loadFromStorage('wplace_theme');

  if (saved && CONFIG.THEMES[saved]) {
    CONFIG.currentThemeKey = saved;
  } else {
    CONFIG.currentThemeKey = 'classic';
  }
};
