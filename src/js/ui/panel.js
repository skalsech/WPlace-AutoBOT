import { createSettingsContainer } from './components/create-settings.js';
import { appendLinkOnce, msToTimeText } from '../utils/helpers.js';
import { createMainContainer } from './components/create-panel.js';
import { createStatsContainer, tryRemoveStatsInitMessage } from './components/create-stats.js';
import { createResizeContainer } from './components/create-resize.js';
import { NotificationManager } from '../core/notification-manager.js';
import { loadBotSettings } from '../core/settings-manager.js';
import { state } from '../core/state.js';
import { showAlert } from './alerts.js';
import { initializeTranslations, t } from '../i18n/i18.js';
import { loadProgress } from '../core/progress-manager.js';
import { wplaceService } from '../core/api-service.js';
import { calculateEstimatedTime, formatTime, getMsToTargetCharges } from '../utils/time.js';
import { updateChargesThresholdUI } from '../utils/painting-helpers.js';
import { getAvailableColors } from '../utils/dom.js';
import { colorsChanged, invalidateColorCache } from '../utils/color-matching.js';
import { setupSettingsListeners } from './listeners/settings.js';
import { setupStatsListeners } from './listeners/stats.js';
import { setupMainPanelListeners } from './listeners/main-panel.js';
import { updateDataButtons } from './handlers/main-panel/handle-data-buttons.js';
import { syncSettingsUI } from './sync-ui.js';
import { overlayManager } from '../overlay/overlay-manager.js';

function cleanupExistingUI() {
  const ids = ['wplace-image-bot-container', 'wplace-settings-container', 'wplace-stats-container'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    el?.remove();
  });

  document.querySelector('.resize-container')?.remove();
  document.querySelector('.resize-overlay')?.remove();
}

async function initializeDependencies() {
  await initializeTranslations();
  appendLinkOnce('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

  appendLinkOnce('https://skalsech.github.io/WPlace-AutoBOT/custom-main/dist/css/main.css', {
    'data-wplace-theme': 'true',
  });
}

function makeDraggable(element) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  let isDragging = false;
  const header =
    element.querySelector('.wplace-header') || element.querySelector('.wplace-settings-header');

  if (!header) {
    console.warn('No draggable header found for element:', element);
    return;
  }

  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (e.target.closest('.wplace-header-btn') || e.target.closest('button')) return;

    e.preventDefault();
    isDragging = true;

    const rect = element.getBoundingClientRect();

    element.style.transform = 'none';
    element.style.top = rect.top + 'px';
    element.style.left = rect.left + 'px';

    pos3 = e.clientX;
    pos4 = e.clientY;
    element.classList.add('wplace-dragging');
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;

    document.body.style.userSelect = 'none';
  }

  function elementDrag(e) {
    if (!isDragging) return;

    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    let newTop = element.offsetTop - pos2;
    let newLeft = element.offsetLeft - pos1;

    const rect = element.getBoundingClientRect();
    const maxTop = window.innerHeight - rect.height;
    const maxLeft = window.innerWidth - rect.width;

    newTop = Math.max(0, Math.min(newTop, maxTop));
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));

    element.style.top = newTop + 'px';
    element.style.left = newLeft + 'px';
  }

  function closeDragElement() {
    isDragging = false;
    element.classList.remove('wplace-dragging');
    document.onmouseup = null;
    document.onmousemove = null;
    document.body.style.userSelect = '';
  }
}

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

function ensureChargeStats(afterEl = null) {
  const statsContainer = document.getElementById('wplace-stats-container');
  const statsArea = statsContainer?.querySelector('#statsArea');
  let el = document.getElementById('wplace-charge-stats');
  if (!el) {
    el = document.createElement('div');
    el.id = 'wplace-charge-stats';
    el.innerHTML = `
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-bolt"></i> ${t('charges')}</div>
        <div class="wplace-stat-value" id="wplace-stat-charges-value">0/0</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-battery-half"></i> ${t(
          'fullChargeIn'
        )}</div>
        <div class="wplace-stat-value" id="wplace-stat-fullcharge-value">--:--:--</div>
      </div>
    `;
    if (afterEl && afterEl.parentNode === statsArea) {
      statsArea.insertBefore(el, afterEl.nextSibling);
    } else {
      statsArea.appendChild(el);
    }
  }
  return el;
}

function ensureImageStats(afterEl = null) {
  const statsContainer = document.getElementById('wplace-stats-container');
  const statsArea = statsContainer?.querySelector('#statsArea');
  let el = document.getElementById('wplace-image-stats');
  if (!el) {
    el = document.createElement('div');
    el.id = 'wplace-image-stats';
    el.innerHTML = `
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-image"></i> ${t('progress')}</div>
        <div class="wplace-stat-value" id="wplace-stat-progress">--%</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-paint-brush"></i> ${t('pixels')}</div>
        <div class="wplace-stat-value" id="wplace-stat-pixels">0/0</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label"><i class="fas fa-clock"></i> ${t('estimatedTime')}</div>
        <div class="wplace-stat-value" id="wplace-stat-estimated">--:--</div>
      </div>
    `;
    if (afterEl && afterEl.parentNode === statsArea) {
      statsArea.insertBefore(el, afterEl.nextSibling);
    } else {
      statsArea.appendChild(el);
    }
  }
  return el;
}

function ensureColorSwatches(afterEl = null) {
  const statsContainer = document.getElementById('wplace-stats-container');
  const statsArea = statsContainer?.querySelector('#statsArea');
  let el = document.getElementById('wplace-colors-section');
  if (!el) {
    el = document.createElement('div');
    el.id = 'wplace-colors-section';
    el.className = 'wplace-colors-section';
    el.innerHTML = `
      <div class="wplace-stat-label" id="wplace-stat-colors-label"></div>
      <div class="wplace-stat-colors-grid" id="wplace-stat-colors-grid"></div>
    `;
    if (afterEl && afterEl.parentNode === statsArea) {
      statsArea.insertBefore(el, afterEl.nextSibling);
    } else {
      statsArea.appendChild(el);
    }
  }
  return el;
}

function updateChargeStatsDisplay(intervalMs) {
  const currentChargesEl = document.getElementById('wplace-stat-charges-value');
  const fullChargeEl = document.getElementById('wplace-stat-fullcharge-value');
  if (!fullChargeEl && !currentChargesEl) return;
  if (!state.fullChargeData) {
    fullChargeEl.textContent = '--:--:--';
    return;
  }

  const { current, max, cooldownMs, startTime, spentSinceShot } = state.fullChargeData;
  const elapsed = Date.now() - startTime;

  // total charges including elapsed time and spent during painting since snapshot
  const chargesGained = elapsed / cooldownMs;
  const rawCharges = current + chargesGained - spentSinceShot;
  const cappedCharges = Math.min(rawCharges, max);

  // rounding with 0.95 threshold
  let displayCharges;
  const fraction = cappedCharges - Math.floor(cappedCharges);
  if (fraction >= 0.95) {
    displayCharges = Math.ceil(cappedCharges);
  } else {
    displayCharges = Math.floor(cappedCharges);
  }

  state.displayCharges = Math.max(0, displayCharges);
  state.preciseCurrentCharges = cappedCharges;

  const remainingMs = getMsToTargetCharges(cappedCharges, max, state.cooldown, intervalMs);
  const timeText = msToTimeText(remainingMs);

  if (currentChargesEl) {
    const newText = `${state.displayCharges} / ${state.maxCharges}`;
    if (currentChargesEl.textContent !== newText) {
      currentChargesEl.textContent = newText;
    }
  }

  if (state.displayCharges < state.cooldownChargeThreshold && !state.stopFlag && state.running) {
    updateChargesThresholdUI(intervalMs);
  }

  if (fullChargeEl) {
    let newFullText;
    if (state.displayCharges >= max) {
      newFullText = `<span style="color:#10b981;">FULL</span>`;
    } else {
      newFullText = `<span style="color:#f59e0b;">${timeText}</span>`;
    }
    if (fullChargeEl.innerHTML !== newFullText) {
      fullChargeEl.innerHTML = newFullText;
    }
  }
}

function updateImageStats(intervalMs) {
  if (!state.imageLoaded) return;
  const container = document.getElementById('wplace-image-bot-container');
  const progressBar = container.querySelector('#progressBar');
  const progress = overlayManager.getOverallProgress();
  state.totalPaintedPixels = progress.painted;
  state.estimatedTime = calculateEstimatedTime(intervalMs);

  const newWidth = `${progress.percentage}%`;
  if (progressBar.style.width !== newWidth) progressBar.style.width = newWidth;

  const updates = [
    { el: 'wplace-stat-progress', text: `${progress.percentage}%` },
    { el: 'wplace-stat-pixels', text: `${state.currentPaintedPixels}/${state.artTotalPixels}` },
    { el: 'wplace-stat-estimated', text: formatTime(state.estimatedTime) },
  ];

  updates.forEach(({ el, text }) => {
    const elem = document.getElementById(el);
    if (elem && elem.textContent !== text) elem.textContent = text;
  });
}

function updateColorSwatches() {
  if (!state.hasAvailableColors) return;

  const labelEl = document.getElementById('wplace-stat-colors-label');
  const gridEl = document.getElementById('wplace-stat-colors-grid');
  if (!labelEl || !gridEl) return;

  labelEl.innerHTML = `<i class="fas fa-palette"></i> ${t('availableColors', {
    count: state.availableColors.length,
  })}`;

  gridEl.innerHTML = state.availableColors
    .map((color) => {
      const rgbString = `rgb(${color.rgb.join(',')})`;
      const style =
        color.id === 0
          ? 'background: repeating-linear-gradient(45deg, #ccc 0 2px, #fff 2px 4px);background-size: cover;'
          : `background-color: ${rgbString};`;
      return `<div class="wplace-stat-color-swatch" style="${style}" title="${t('colorTooltip', {
        name: color.name,
        id: color.id,
        rgb: color.rgb.join(', '),
      })}"></div>`;
    })
    .join('');
}

export async function updateStats(isManualRefresh = false) {
  const isFirstCheck = !state.fullChargeData?.startTime;

  if (isManualRefresh || isFirstCheck) {
    wplaceService.invalidateCache();
  }
  const { count, max, cooldown, fromCache: chargesFromCache } = await wplaceService.getCharges();

  if (!chargesFromCache) {
    state.displayCharges = Math.floor(count);
    state.preciseCurrentCharges = count;
    state.cooldown = cooldown;
    state.maxCharges = Math.floor(max) > 1 ? Math.floor(max) : state.maxCharges;

    state.fullChargeData = {
      current: count,
      max,
      cooldownMs: cooldown,
      startTime: Date.now(),
      spentSinceShot: 0,
    };

    NotificationManager.maybeNotifyChargesReached();
  }

  if (state.fullChargeInterval) {
    clearInterval(state.fullChargeInterval);
    state.fullChargeInterval = null;
  }
  const intervalMs = 1000;
  state.fullChargeInterval = setInterval(() => {
    updateImageStats(intervalMs);
    updateChargeStatsDisplay(intervalMs);
  }, intervalMs);
  const container = document.getElementById('wplace-image-bot-container');
  const cooldownSlider = container.querySelector('#cooldownSlider');

  if (cooldownSlider.max !== state.maxCharges) {
    cooldownSlider.max = state.maxCharges;
  }

  const { value: colorsBitmap } = await wplaceService.getExtraColorsBitmap();

  const newAvailableColors = getAvailableColors(colorsBitmap);
  const foundColorsCount = Array.isArray(newAvailableColors) ? newAvailableColors.length : 0;

  if (foundColorsCount === 0 && isManualRefresh) {
    showAlert(t('noColorsFound'), 'warning');
  } else if (foundColorsCount > 0 && colorsChanged(state.availableColors, newAvailableColors)) {
    const oldCount = state.availableColors.length;

    showAlert(
      t('colorsUpdated', {
        oldCount,
        newCount: foundColorsCount,
        diffCount: foundColorsCount - oldCount,
      }),
      'success'
    );

    state.availableColors = newAvailableColors;
    invalidateColorCache({ availableColors: true });
  }

  let lastEl = document.getElementById('wplace-init-msg');
  if (state.imageLoaded) lastEl = ensureImageStats(lastEl);
  if (state.fullChargeData) lastEl = ensureChargeStats(lastEl);
  if (state.hasAvailableColors) lastEl = ensureColorSwatches(lastEl);

  updateImageStats(intervalMs);
  updateChargeStatsDisplay(intervalMs);
  updateColorSwatches();
  tryRemoveStatsInitMessage();
}

const checkSavedProgress = () => {
  const savedData = loadProgress();
  if (savedData && savedData.state.totalPaintedPixels > 0) {
    const savedDate = new Date(savedData.timestamp).toLocaleString();
    const progress = Math.round(
      (savedData.state.totalPaintedPixels / savedData.state.artTotalPixels) * 100
    );

    showAlert(
      `${t('savedDataFound')}\n\n` +
        `Saved: ${savedDate}\n` +
        `Progress: ${savedData.state.totalPaintedPixels}/${savedData.state.artTotalPixels} pixels (${progress}%)\n` +
        `${t('clickLoadToContinue')}`,
      'info'
    );
  }
};

export async function createUI() {
  cleanupExistingUI();

  loadBotSettings();
  await initializeDependencies();
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

  setupMainPanelListeners();
  setupStatsListeners();
  setupSettingsListeners();

  makeDraggable(container);
  makeDraggable(statsContainer);
  makeDraggable(settingsContainer);

  updateDataButtons();
  setTimeout(checkSavedProgress, 1000);

  syncSettingsUI();
  NotificationManager.syncFromState();

  container.style.display = 'block';
}
