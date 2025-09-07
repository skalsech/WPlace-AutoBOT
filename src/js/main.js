// src/js/main.js
import './startup/theme.js'; // applyTheme, loadThemePreference
import { createUI } from './ui/panel.js';
import { initializeTokenGenerator } from './startup/startup.js';
import { updateStats } from './ui/panel.js';
import { setupAdvancedColorListeners } from './ui/resize-dialog.js';
import { cleanupTurnstile } from './security/turnstile-manager.js';

applyTheme();

createUI().then(() => {
  setTimeout(initializeTokenGenerator, 1000);
  updateStats();

  // Инициализация обработчиков после построения UI
  setupAdvancedColorListeners();

  // Очистка при выгрузке
  window.addEventListener('beforeunload', cleanupTurnstile);
});