import { createUI, updateStats } from './ui/panel.js';
import { initializeTokenGenerator } from './startup/startup.js';
import { cleanupTurnstile } from './security/turnstile.js';
import { setupFetchInterceptor } from './core/fetch-interceptor.js';

setupFetchInterceptor();

createUI().then(() => {
  setTimeout(initializeTokenGenerator, 1000);
  updateStats();

  // setupAdvancedColorListeners();

  window.addEventListener('beforeunload', cleanupTurnstile);
});
