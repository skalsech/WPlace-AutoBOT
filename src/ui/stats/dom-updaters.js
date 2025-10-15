import { t } from '../../i18n/index.js';
import { state } from '../../core/state.js';
import { overlayManager } from '../../core/overlay/overlay-manager.js';
import { calculateEstimatedTime, formatTime, getMsToTargetCharges } from '../../utils/time.js';
import { getAvailableColors, msToTimeText } from '../../utils/helpers.js';
import { updateChargesThresholdUI } from '../../utils/painting-helpers.js';
import { colorsChanged } from '../../utils/color-matching.js';
import { wplaceService } from '../../core/api/api-service.js';
import { showAlert } from '../../shared/ui/alerts.js';
import { NotificationManager } from '../../core/system/notification-manager.js';
import { invalidateColorCache } from '../../utils/color-matching/cache.js';
import { APP_CONSTANTS } from '../../app/config/app-constants.js';

// fixme .wplace-stat-item:last-child in statsArea
export function ensureChargeStats(afterEl = null) {
  const statsContainer = document.getElementById('wplace-stats-container');
  const statsArea = statsContainer?.querySelector('#statsArea');
  let el = document.getElementById('wplace-charge-stats');
  if (!el) {
    el = document.createElement('div');
    el.id = 'wplace-charge-stats';
    el.innerHTML = `
      <div class="wplace-stat-item">
        <div class="wplace-stat-label" data-i18n-key="charges"><i class="fas fa-bolt"></i>${t('charges')}</div>
        <div class="wplace-stat-value" id="wplace-stat-charges-value">0/0</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label" data-i18n-key="fullChargeIn"><i class="fas fa-battery-half"></i>${t('fullChargeIn')}</div>
        <div class="wplace-stat-value" id="wplace-stat-fullcharge-value">--:--:--</div>
      </div>
    `;
    if (afterEl && afterEl.parentNode === statsArea) {
      statsArea.insertBefore(el, afterEl.nextSibling);
    } else if (statsArea) {
      statsArea.appendChild(el);
    }
  }
  return el;
}

export function ensureImageStats(afterEl = null) {
  const statsContainer = document.getElementById('wplace-stats-container');
  const statsArea = statsContainer?.querySelector('#statsArea');
  let el = document.getElementById('wplace-image-stats');
  if (!el) {
    el = document.createElement('div');
    el.id = 'wplace-image-stats';
    el.innerHTML = `
      <div class="wplace-stat-item">
        <div class="wplace-stat-label" data-i18n-key="progress"><i class="fas fa-image"></i>${t('progress')}</div>
        <div class="wplace-stat-value" id="wplace-stat-progress">--%</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label" data-i18n-key="pixels"><i class="fas fa-paint-brush"></i>${t('pixels')}</div>
        <div class="wplace-stat-value" id="wplace-stat-pixels">0/0</div>
      </div>
      <div class="wplace-stat-item">
        <div class="wplace-stat-label" data-i18n-key="estimatedTime"><i class="fas fa-clock"></i>${t('estimatedTime')}</div>
        <div class="wplace-stat-value" id="wplace-stat-estimated">--:--</div>
      </div>
    `;
    if (afterEl && afterEl.parentNode === statsArea) {
      statsArea.insertBefore(el, afterEl.nextSibling);
    } else if (statsArea) {
      statsArea.appendChild(el);
    }
  }
  return el;
}

export function ensureColorSwatches(afterEl = null) {
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
    } else if (statsArea) {
      statsArea.appendChild(el);
    }
  }
  return el;
}

export function updateChargeStatsDisplay(intervalMs) {
  const currentChargesEl = document.getElementById('wplace-stat-charges-value');
  const fullChargeEl = document.getElementById('wplace-stat-fullcharge-value');
  if (!fullChargeEl && !currentChargesEl) return;
  if (!state.fullChargeData) {
    if (fullChargeEl) fullChargeEl.textContent = '--:--:--';
    return;
  }

  const { current, max, cooldownMs, startTime, spentSinceShot } = state.fullChargeData;
  const elapsed = Date.now() - startTime;

  const chargesGained = elapsed / cooldownMs;
  const rawCharges = current + chargesGained - spentSinceShot;
  const cappedCharges = Math.min(rawCharges, max);

  let displayCharges;
  const fraction = cappedCharges - Math.floor(cappedCharges);
  if (fraction >= 0.95) {
    displayCharges = Math.ceil(cappedCharges);
  } else {
    displayCharges = Math.floor(cappedCharges);
  }

  state.update({
    displayCharges: Math.max(0, displayCharges),
    preciseCurrentCharges: cappedCharges,
  });

  const remainingMs = getMsToTargetCharges(cappedCharges, max, state.cooldown, intervalMs);
  const timeText = msToTimeText(remainingMs);

  if (currentChargesEl) {
    const newText = `${state.displayCharges} / ${state.fullChargeData.max}`;
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

export function updateImageStats(intervalMs) {
  if (!state.imageLoaded) return;
  const container = document.getElementById('wplace-image-bot-container');
  const progressBar = container.querySelector('#progressBar');
  const progress = overlayManager.getOverallProgress();
  state.update({
    totalPaintedPixels: progress.painted,
    estimatedTime: calculateEstimatedTime(intervalMs),
  });
  const percentage =
    state.artTotalPixels > 0 ? (state.currentPaintedPixels / state.artTotalPixels) * 100 : 0;
  const displayPercentage = parseFloat(percentage.toFixed(2));

  const newWidth = `${displayPercentage}%`;
  if (progressBar.style.width !== newWidth) progressBar.style.width = newWidth;

  const updates = [
    { el: 'wplace-stat-progress', text: `${displayPercentage}%` },
    { el: 'wplace-stat-pixels', text: `${state.currentPaintedPixels}/${state.artTotalPixels}` },
    { el: 'wplace-stat-estimated', text: formatTime(state.estimatedTime) },
  ];

  updates.forEach(({ el, text }) => {
    const elem = document.getElementById(el);
    if (elem && elem.textContent !== text) elem.textContent = text;
  });
}

export function updateColorSwatches() {
  if (!state.hasAvailableColors) return;

  const labelEl = document.getElementById('wplace-stat-colors-label');
  const gridEl = document.getElementById('wplace-stat-colors-grid');
  if (!labelEl || !gridEl) return;
  // todo make available colors foldable
  labelEl.innerHTML = `
    <i class="fas fa-palette"></i> 
    <span data-i18n-key="availableColors">
      ${t('availableColors', { count: state.availableColors.size })}
    </span>
  `;

  gridEl.innerHTML = Array.from(state.availableColors)
    .map((colorId) => {
      const colorData = APP_CONSTANTS.COLOR_MAP[colorId];
      const rgbString = `rgb(${Object.values(colorData.rgb).join(',')})`;
      const style =
        colorId === 0
          ? 'background: repeating-linear-gradient(45deg, #ccc 0 2px, #fff 2px 4px);background-size: cover;'
          : `background-color: ${rgbString};`;
      return `<div class="wplace-stat-color-swatch" style="${style}" title="${t('colorTooltip', {
        name: colorData.name,
        id: colorId,
        rgb: Object.values(colorData.rgb).join(', '),
      })}"></div>`;
    })
    .join('');
}

export async function refreshStatsAndColors(isManualRefresh = false) {
  const isFirstCheck = !state.fullChargeData?.startTime;

  if (isManualRefresh || isFirstCheck) {
    wplaceService.invalidateCache();
  }
  const { count, max, cooldown, fromCache: chargesFromCache } = await wplaceService.getCharges();

  if (!chargesFromCache) {
    state.update({
      displayCharges: Math.floor(count),
      preciseCurrentCharges: count,
      cooldown,
      fullChargeData: {
        current: count,
        max,
        cooldownMs: cooldown,
        startTime: Date.now(),
        spentSinceShot: 0,
      },
    });
    NotificationManager.maybeNotifyChargesReached();
  }

  if (state.fullChargeInterval) {
    clearInterval(state.fullChargeInterval);
    state.update({ fullChargeInterval: null });
  }
  const intervalMs = 1000;
  state.update({
    fullChargeInterval: setInterval(() => {
      updateImageStats(intervalMs);
      updateChargeStatsDisplay(intervalMs);
    }, intervalMs),
  });

  const container = document.getElementById('wplace-image-bot-container');
  const cooldownSlider = container.querySelector('#cooldownSlider');
  if (cooldownSlider && cooldownSlider.max !== state.fullChargeData.max) {
    cooldownSlider.max = state.fullChargeData.max;
  }

  const { value: colorsBitmap } = await wplaceService.getExtraColorsBitmap();
  const newAvailableColors = getAvailableColors(colorsBitmap);
  const foundColorsCount = newAvailableColors.size;

  if (foundColorsCount === 0 && isManualRefresh) {
    showAlert(t('noColorsFound'), 'warning');
  } else if (foundColorsCount > 0 && colorsChanged(state.availableColors, newAvailableColors)) {
    state.update({ availableColors: newAvailableColors });
    invalidateColorCache({ availableColors: true });
  }

  let lastEl = document.getElementById('wplace-init-msg');
  if (state.imageLoaded) lastEl = ensureImageStats(lastEl);
  if (state.fullChargeData) lastEl = ensureChargeStats(lastEl);
  // eslint-disable-next-line no-unused-vars
  if (state.hasAvailableColors) lastEl = ensureColorSwatches(lastEl);

  updateImageStats(intervalMs);
  updateChargeStatsDisplay(intervalMs);
  updateColorSwatches();
}
