import { state } from '../state.js';
import { showAlert } from '../../shared/ui/alerts.js';
import { t } from '../../i18n/index.js';
import { updateUI } from '../../app/startup/create-ui.js';
import { overlayManager } from '../overlay/overlay-manager.js';
import { wplaceUI } from '../overlay/wplace-ui.js';
import { onPositionSet } from '../../ui/listeners/start-position-dialog.js';

export class SelectionController {
  constructor() {
    this.originalFetch = window.fetch;
    this.timeoutId = null;
    this.timeoutMs = 120_000;
  }

  enable() {
    if (state.selectingPosition) return;

    state.update({
      selectingPosition: true,
      startPosition: null,
      region: null,
    });

    this.disableControlButton();
    showAlert(t('selectPositionAlert'), 'info');
    updateUI('waitingPosition', 'default');

    window.fetch = this.fetchInterceptor.bind(this);

    this.timeoutId = setTimeout(() => {
      if (state.selectingPosition) {
        this.cleanup();
        updateUI('positionTimeout', 'error');
        showAlert(t('positionTimeout'), 'error');
      }
    }, this.timeoutMs);
  }

  disableControlButton() {
    const btn = document.getElementById('controlBtn');
    if (btn) btn.disabled = true;
  }

  restoreControlButton() {
    if (state.imageLoaded) {
      const btn = document.getElementById('controlBtn');
      if (btn) btn.disabled = false;
    }
  }

  cleanup() {
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
      this.originalFetch = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    state.update({
      selectingPosition: false,
    });
  }

  async fetchInterceptor(url, options) {
    const method = options?.method?.toUpperCase?.() ?? 'GET';
    const isPixelRequest =
      typeof url === 'string' &&
      url.includes('https://backend.wplace.live/s0/pixel/') &&
      method === 'GET';

    if (!isPixelRequest) {
      return this.originalFetch(url, options);
    }

    try {
      const { region, startPosition } = parsePixelUrl(url);
      if (!region || !startPosition) {
        return this.originalFetch(url, options);
      }

      Object.assign(state, { region, startPosition });

      await overlayManager.setPosition(state.startPosition, state.region);
      await wplaceUI.forceRefreshCanvas();

      onPositionSet();
      return this.originalFetch(url, options);
    } catch (error) {
      console.error('Fetch hook error:', error);
      this.cleanup();
      updateUI('positionError', 'error');
      return this.originalFetch(url, options);
    }
  }
}

function parsePixelUrl(url) {
  try {
    const urlObj = new URL(url);
    const x = Number.parseInt(urlObj.searchParams.get('x'), 10);
    const y = Number.parseInt(urlObj.searchParams.get('y'), 10);
    const match = url.match(/\/pixel\/(\d+)\/(\d+)/);

    if (!match || Number.isNaN(x) || Number.isNaN(y)) return {};

    return {
      region: { x: Number.parseInt(match[1], 10), y: Number.parseInt(match[2], 10) },
      startPosition: { x, y },
    };
  } catch {
    return {};
  }
}
