import { state } from '../../../core/state.js';
import { showAlert } from '../../alerts.js';
import { t } from '../../../i18n/i18.js';
import { updateUI } from '../../panel.js';
import { overlayManager } from '../../../tiles/overlay-manager.js';

export function handleSelectPositionClick() {
  if (state.selectingPosition) return;

  state.selectingPosition = true;
  state.startPosition = null;
  state.region = null;

  const startBtn = document.getElementById('startBtn');
  if (startBtn) startBtn.disabled = true;

  showAlert(t('selectPositionAlert'), 'info');
  updateUI('waitingPosition', 'default');

  const tempFetch = async (url, options) => {
    if (
      typeof url === 'string' &&
      url.includes('https://backend.wplace.live/s0/pixel/') &&
      options?.method?.toUpperCase() === 'POST'
    ) {
      try {
        const response = await originalFetch(url, options);
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();

        if (data?.painted === 1) {
          const regionMatch = url.match(/\/pixel\/(\d+)\/(\d+)/);
          if (regionMatch && regionMatch.length >= 3) {
            state.region = {
              x: Number.parseInt(regionMatch[1]),
              y: Number.parseInt(regionMatch[2]),
            };
          }

          const payload = JSON.parse(options.body);
          if (payload?.coords && Array.isArray(payload.coords)) {
            state.startPosition = {
              x: payload.coords[0],
              y: payload.coords[1],
            };

            await overlayManager.setPosition(state.startPosition, state.region);

            if (state.imageLoaded) {
              const startBtn = document.getElementById('startBtn');
              if (startBtn) startBtn.disabled = false;
            }

            window.fetch = originalFetch;
            state.selectingPosition = false;
            updateUI('positionSet', 'success');
          }
        }

        return response;
      } catch (error) {
        console.error('Fetch hook error:', error);
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
