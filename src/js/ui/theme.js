import { appendResourceOnce } from '../utils/helpers.js';
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

export const switchTheme = async (themeKey) => {
  if (!APP_CONSTANTS.THEMES[themeKey]) {
    console.warn(`Theme not found: ${themeKey}`);
    return;
  }

  /** @constant {boolean} __DEV__ - Set by esbuild define in build.mjs */
  const themeUrl = __DEV__
    ? `http://localhost:8000/dist/css/themes/${themeKey}.css`
    : `https://skalsech.github.io/WPlace-AutoBOT/custom-main/dist/css/themes/${themeKey}.css`;

  await appendResourceOnce(themeUrl, {
    type: 'link',
    attributes: {
      'data-wplace-theme': 'true',
    },
  });

  if (themeKey === 'neon-retro') {
    await appendResourceOnce(
      'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap',
      { type: 'link' }
    );
  }
  applyThemeWithKey(themeKey);
};
