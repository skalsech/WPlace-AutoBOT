import { createUI, updateStats, updateUI } from './startup/create-ui.js';
import { enableFileOperations, initializeTokenGenerator } from './startup/startup.js';
import { setupFetchInterceptor } from './startup/fetch-interceptor.js';
import { wplaceService } from '../core/api/api-service.js';
import { showAlert } from '../shared/ui/alerts.js';
import { handleLoadClick } from '../ui/main-panel/handlers/handle-data-buttons.js';
import { loadAllLibraries } from './startup/load-all-vendors.js';
import { cleanupTurnstile } from '../security/turnstile-token/turnstile-manager.js';
import { initPawtect } from '../security/wasm-token/pawtect-worker.js';

document.addEventListener('DOMContentLoaded', () => {
  loadAllLibraries().then(() => {
    setupFetchInterceptor();

    createUI().then(async () => {
      await updateStats();
      try {
        await wplaceService.requireValidExperiments();
      } catch (error) {
        console.error('🛑 CRITICAL: Invalid experiment configuration. App cannot start.');
        console.error(error.message);

        const message =
          'Security settings have been updated. This app requires the latest version to run. ' +
          'Please try again later or contact support if the issue persists.';
        showAlert(message, 'error');
        updateUI(message, 'error');
        return;
      }

      window.addEventListener('beforeunload', cleanupTurnstile);
      initPawtect();
      await initializeTokenGenerator();
      enableFileOperations();
      //todo make option in settings for auto-load
      await handleLoadClick();
    });
  });
});
