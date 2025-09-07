import { safeOn } from '../../utils/dom.js';
import { t } from '../../i18n/i18.js';
import { updateStats } from '../panel.js';

export function setupStatsListeners() {
  const container = document.getElementById('wplace-stats-container');
  const mainContainer = document.getElementById('wplace-image-bot-container');
  const statsBtn = mainContainer?.querySelector('#statsBtn');
  if (!container || !statsBtn) return;
  const closeStatsBtn = container.querySelector('#closeStatsBtn');
  const refreshChargesBtn = container.querySelector('#refreshChargesBtn');

  safeOn(statsBtn, 'click', () => {
    const isVisible = container.style.display !== 'none';
    if (isVisible) {
      container.style.display = 'none';
      statsBtn.innerHTML = '<i class="fas fa-chart-bar"></i>';
      statsBtn.title = t('showStats');
    } else {
      container.style.display = 'block';
      statsBtn.innerHTML = '<i class="fas fa-chart-line"></i>';
      statsBtn.title = t('hideStats');
    }
  });

  safeOn(closeStatsBtn, 'click', () => {
    container.style.display = 'none';
    statsBtn.innerHTML = '<i class="fas fa-chart-bar"></i>';
    statsBtn.title = t('showStats');
  });

  safeOn(refreshChargesBtn, 'click', async () => {
    refreshChargesBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    refreshChargesBtn.disabled = true;

    try {
      await updateStats(true);
    } catch (error) {
      console.error('Error refreshing charges:', error);
    } finally {
      refreshChargesBtn.innerHTML = '<i class="fas fa-sync"></i>';
      refreshChargesBtn.disabled = false;
    }
  });
}
