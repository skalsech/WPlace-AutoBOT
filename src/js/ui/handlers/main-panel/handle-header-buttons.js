import { state } from '../../../core/state.js';
import { saveBotSettings } from '../../../core/settings-manager.js';
import { t } from '../../../i18n/i18.js';

export function handleSettingsClick() {
  const container = document.getElementById('wplace-settings-container');
  if (!container) return;

  const isVisible = container.classList.contains('show');
  if (isVisible) {
    container.style.animation = 'settings-fade-out 0.3s ease-out forwards';
    container.classList.remove('show');
    setTimeout(() => {
      container.style.animation = '';
    }, 300);
  } else {
    container.classList.add('show');
    container.style.animation = 'settings-slide-in 0.4s ease-out';
  }
}

export function handleStatsClick() {
  const statsContainer = document.getElementById('wplace-stats-container');
  const statsBtn = document.getElementById('statsBtn');
  if (!statsContainer || !statsBtn) return;

  const isVisible = statsContainer.style.display !== 'none';
  if (isVisible) {
    statsContainer.style.display = 'none';
    statsBtn.innerHTML = '<i class="fas fa-chart-bar"></i>';
    statsBtn.title = t('showStats');
  } else {
    statsContainer.style.display = 'block';
    statsBtn.innerHTML = '<i class="fas fa-chart-line"></i>';
    statsBtn.title = t('hideStats');
  }
}

export function handleMinimizeClick() {
  state.minimized = !state.minimized;
  const container = document.getElementById('wplace-container');
  const content = container?.querySelector('.wplace-content');
  const btn = document.getElementById('minimizeBtn');

  if (state.minimized) {
    container.classList.add('wplace-minimized');
    content.classList.add('wplace-hidden');
    if (btn) {
      btn.innerHTML = '<i class="fas fa-expand"></i>';
      btn.title = t('restore');
    }
  } else {
    container.classList.remove('wplace-minimized');
    content.classList.remove('wplace-hidden');
    if (btn) {
      btn.innerHTML = '<i class="fas fa-minus"></i>';
      btn.title = t('minimize');
    }
  }
  saveBotSettings();
}

export function handleCompactClick() {
  const container = document.getElementById('wplace-container');
  const btn = document.getElementById('compactBtn');
  container.classList.toggle('wplace-compact');
  const isCompact = container.classList.contains('wplace-compact');

  if (isCompact) {
    if (btn) {
      btn.innerHTML = '<i class="fas fa-expand"></i>';
      btn.title = t('expandMode');
    }
  } else {
    if (btn) {
      btn.innerHTML = '<i class="fas fa-compress"></i>';
      btn.title = t('compactMode');
    }
  }
}
