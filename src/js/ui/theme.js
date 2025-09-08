import { appendLinkOnce } from '../utils/helpers.js';
import { APP_CONSTANTS } from '../config/APP_CONSTANTS.js';

function applyThemeWithKey(themeKey) {
  const theme = APP_CONSTANTS.THEMES[themeKey];

  if (!theme) {
    console.error(`Unknown theme: ${themeKey}`);
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
  if (!APP_CONSTANTS.THEMES[themeKey]) {
    console.warn(`Theme not found: ${themeKey}`);
    return;
  }

  if (themeKey === 'neon-retro') {
    appendLinkOnce('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
  }
  applyThemeWithKey(themeKey);
};
