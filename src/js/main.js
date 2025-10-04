import { createUI, updateStats } from './ui/panel.js';
import { enableFileOperations, initializeTokenGenerator } from './startup/startup.js';
import { cleanupTurnstile } from './security/turnstile.js';
import { setupFetchInterceptor } from './core/fetch-interceptor.js';
import { createDevReloadButton } from './utils/dev-utils.js';
import { getFingerprint } from './lib/fingerprint.js';
import { initPawtect } from './security/wasm-token.js';
import { loadAllLibraries } from './lib/load-all.js';

document.addEventListener('DOMContentLoaded', () => {
  loadAllLibraries().then(() => {
    initPawtect();
    setupFetchInterceptor();

    createUI().then(async () => {
      await updateStats();

      /** @constant {boolean} __DEV__ - Set by esbuild define in build.mjs */
      if (__DEV__) {
        createDevReloadButton();
        try {
          const fingerprint = await getFingerprint();
          console.log('Fingerprint result:', fingerprint);
        } catch (error) {
          console.error('❌ Fingerprint error:', error);
        }
      }

      window.addEventListener('beforeunload', cleanupTurnstile);
      await initializeTokenGenerator();
      enableFileOperations();
    });
  });
});
