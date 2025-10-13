import { appendResourceOnce } from '../../utils/helpers.js';
import { APP_CONSTANTS } from '../../app/config/app-constants.js';

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

  /** @constant {boolean} __CSS_BASE_URL__ - Set by esbuild define in build.mjs */
  const themeUrl = `${__CSS_BASE_URL__}/themes/${themeKey}.css`;
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
