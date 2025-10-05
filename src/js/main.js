import { createUI, updateStats } from './ui/panel.js';
import { enableFileOperations, initializeTokenGenerator } from './startup/startup.js';
import { cleanupTurnstile } from './security/turnstile.js';
import { setupFetchInterceptor } from './core/fetch-interceptor.js';
import { initPawtect } from './security/wasm-token.js';
import { loadAllLibraries } from './lib/load-all.js';
import { handleLoadClick } from './ui/handlers/main-panel/handle-data-buttons.js';

document.addEventListener('DOMContentLoaded', () => {
  loadAllLibraries().then(() => {
    initPawtect();
    setupFetchInterceptor();

    createUI().then(async () => {
      await updateStats();

      window.addEventListener('beforeunload', cleanupTurnstile);
      await initializeTokenGenerator();
      enableFileOperations();
      await handleLoadClick();
    });
  });
});
