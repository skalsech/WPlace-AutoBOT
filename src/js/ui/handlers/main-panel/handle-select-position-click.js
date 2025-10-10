import { state } from '../../../core/state.js';
import { showAlert } from '../../alerts.js';
import { t } from '../../../i18n/i18.js';
import { updateUI } from '../../panel.js';
import { overlayManager } from '../../../tiles/overlay-manager.js';

// todo create a floating UI on clicking, where region and pixel position can be adjusted by input
//  and by clicking apply, the changes force update to canvas
export function handleSelectPositionClick() {
  if (state.selectingPosition) {
    return;
  }

  state.selectingPosition = true;
  state.startPosition = null;
  state.region = null;

  const controlBtn = document.getElementById('controlBtn');
  if (controlBtn) {
    controlBtn.disabled = true;
  }

  showAlert(t('selectPositionAlert'), 'info');
  updateUI('waitingPosition', 'default');

  const tempFetch = async (url, options) => {
    const method = options?.method ? options.method.toUpperCase() : 'GET';

    if (
      typeof url === 'string' &&
      url.includes('https://backend.wplace.live/s0/pixel/') &&
      method === 'GET'
    ) {
      try {
        const urlObj = new URL(url);
        const x = parseInt(urlObj.searchParams.get('x'), 10);
        const y = parseInt(urlObj.searchParams.get('y'), 10);

        const regionMatch = url.match(/\/pixel\/(\d+)\/(\d+)/);

        if (!regionMatch || regionMatch.length < 3 || isNaN(x) || isNaN(y)) {
          return originalFetch(url, options);
        }

        state.region = {
          x: Number.parseInt(regionMatch[1]),
          y: Number.parseInt(regionMatch[2]),
        };
        state.startPosition = { x, y };

        await overlayManager.setPosition(state.startPosition, state.region);

        if (state.imageLoaded) {
          const controlBtn = document.getElementById('controlBtn');
          if (controlBtn) {
            controlBtn.disabled = false;
          }
        }

        window.fetch = originalFetch;
        state.selectingPosition = false;
        updateUI('positionSet', 'success');

        return originalFetch(url, options);
      } catch (error) {
        console.error('Fetch hook error:', error);

        window.fetch = originalFetch;
        state.selectingPosition = false;
        updateUI('positionError', 'error');
        return originalFetch(url, options);
      }
    }
    return originalFetch(url, options);
  };

  const originalFetch = window.fetch;
  window.fetch = tempFetch;

  setTimeout(() => {
    if (state.selectingPosition) {
      window.fetch = originalFetch;
      state.selectingPosition = false;
      updateUI('positionTimeout', 'error');
      showAlert(t('positionTimeout'), 'error');
    }
  }, 120000);
}
