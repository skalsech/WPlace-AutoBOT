import { createUI, updateStats } from './ui/panel.js';
import { initializeTokenGenerator } from './startup/startup.js';
import { cleanupTurnstile } from './security/turnstile.js';
import { setupFetchInterceptor } from './core/fetch-interceptor.js';
import { createDevReloadButton } from './utils/dev-utils.js';
import { getFingerprint, initFingerprint } from './security/fingerprint.js';

initFingerprint();
setupFetchInterceptor();

createUI().then(() => {
  setTimeout(initializeTokenGenerator, 1000);
  updateStats();

  /** @constant {boolean} __DEV__ - Set by esbuild define in build.mjs */
  if (__DEV__) {
    createDevReloadButton();
    getFingerprint()
      .then((r) => {
        console.log('Fingerprint result:', r);
      })
      .catch((error) => {
        console.error('❌ Fingerprint error:', error);
      });
  }

  window.addEventListener('beforeunload', cleanupTurnstile);
});
