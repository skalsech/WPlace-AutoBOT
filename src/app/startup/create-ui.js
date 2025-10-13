import { createSettingsContainer } from '../../ui/settings/create-settings.js';
import { createMainContainer } from '../../ui/main-panel/create-panel.js';
import { createStatsContainer, tryRemoveStatsInitMessage } from '../../ui/stats/create-stats.js';
import { createResizeContainer } from '../../ui/resize-panel/create-resize.js';
import { NotificationManager } from '../../core/system/notification-manager.js';
import { loadBotSettings } from '../../storage/settings-manager.js';
import { state } from '../../core/state.js';
import { showAlert } from '../../shared/ui/alerts.js';
import { initializeTranslations, t } from '../../i18n/index.js';
import { setupSettingsListeners } from '../../ui/settings/setup-listeners.js';
import { setupStatsListeners } from '../../ui/stats/setup-listeners.js';
import { setupMainPanelListeners } from '../../ui/main-panel/setup-listeners.js';
import { updateDataButtons } from '../../ui/main-panel/handlers/handle-data-buttons.js';
import { syncSettingsUI } from '../../ui/settings/sync-ui.js';
import { createDevReloadButton } from '../../utils/dev-utils.js';
import { switchTheme } from '../../shared/ui/theme.js';
import { initializeDependencies } from './startup.js';
import { refreshStatsAndColors } from '../../ui/stats/dom-updaters.js';
import { makeDraggable } from '../../shared/ui/drag.js';
import { loadProgress } from '../../storage/progress-service.js';

function cleanupExistingUI() {
  const ids = ['wplace-image-bot-container', 'wplace-settings-container', 'wplace-stats-container'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    el?.remove();
  });

  document.querySelector('.resize-container')?.remove();
  document.querySelector('.resize-overlay')?.remove();
}

/**
 * Updates the UI status message.
 * Supports both i18n keys and direct strings. Automatically interpolates params.
 *
 * @param {string} messageKey - i18n key or direct message string
 * @param {'default' | 'info' | 'success' | 'error' | 'warning' } [type='default'] - Message type
 * @param {Object} [params={}] - Parameters for i18n interpolation
 * @param {boolean} [silent=false] - If true, suppresses slide-in animation
 */
export function updateUI(messageKey, type = 'default', params = {}, silent = false) {
  const message = t(messageKey, params);
  const container = document.getElementById('wplace-image-bot-container');
  const statusText = container.querySelector('#statusText');

  statusText.textContent = message;
  statusText.className = `wplace-status status-${type}`;

  if (!silent) {
    statusText.style.animation = 'none';
    void statusText.offsetWidth; // trick to restart the animation
    statusText.style.animation = 'slide-in 0.3s ease-out';
  }
}

export async function updateStats(isManualRefresh = false) {
  await refreshStatsAndColors(isManualRefresh);
  tryRemoveStatsInitMessage();
}

const checkSavedProgress = async () => {
  const savedData = await loadProgress();
  if (savedData && savedData.state.artTotalPixels > 0) {
    const savedDate = new Date(savedData.timestamp).toLocaleString();

    showAlert(
      `${t('savedDataFound')}\n` +
        `Timestamp: ${savedDate} - Art size: ${savedData.imageData.width} × ${savedData.imageData.height}.\n` +
        `Start position: ${savedData.state.startPosition.x},${savedData.state.startPosition.y} - ` +
        `Region: ${savedData.state.region.x},${savedData.state.region.y}\n` +
        `Total: ${savedData.state.artTotalPixels} pixels. \n${t('clickLoadToContinue')}`,
      'info'
    );
  }
};

export async function createUI() {
  cleanupExistingUI();
  await initializeDependencies();

  loadBotSettings();
  await switchTheme(state.themeKey);
  const container = createMainContainer();
  const statsContainer = createStatsContainer();
  const settingsContainer = createSettingsContainer();
  const resizeContainer = createResizeContainer();
  const resizeOverlay = document.createElement('div');
  resizeOverlay.className = 'resize-overlay';

  document.body.append(
    container,
    resizeOverlay,
    resizeContainer,
    statsContainer,
    settingsContainer
  );

  // /** @constant {boolean} __DEV__ - Set by esbuild define in build.mjs */
  // if (__DEV__) {
  //   createDevReloadButton();
  // }
  createDevReloadButton();

  setupMainPanelListeners();
  setupStatsListeners();
  setupSettingsListeners();

  makeDraggable(container);
  makeDraggable(statsContainer);
  makeDraggable(settingsContainer);

  updateDataButtons();
  syncSettingsUI();
  NotificationManager.syncFromState();

  await initializeTranslations();
  container.style.display = 'block';
  await checkSavedProgress();
}
