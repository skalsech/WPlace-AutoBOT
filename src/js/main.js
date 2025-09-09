import { createUI, updateStats } from './ui/panel.js';
import { initializeTokenGenerator } from './startup/startup.js';
import { cleanupTurnstile } from './security/turnstile.js';
import { setupFetchInterceptor } from './core/fetch-interceptor.js';
import { createDevReloadButton } from './utils/dev-utils.js';

setupFetchInterceptor();

createUI().then(() => {
  setTimeout(initializeTokenGenerator, 1000);
  updateStats();

  /** @constant {boolean} __DEV__ - Set by esbuild define in build.mjs */
  if (__DEV__) {
    createDevReloadButton();
  }

  window.addEventListener('beforeunload', cleanupTurnstile);
});
