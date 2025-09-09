import { overlayManager } from '../overlay/overlay-manager.js';
import { setTurnstileToken } from '../security/turnstile-manager.js';
import { showAlert } from '../ui/alerts.js';
import { updateUI } from '../ui/panel.js';
import { t } from '../i18n/i18.js';
import { state } from './state.js';

function inject(callback) {
  const script = document.createElement('script');
  script.textContent = `(${callback})();`;
  document.documentElement?.appendChild(script);
  script.remove();
}

inject(() => {
  const fetchedBlobQueue = new Map();

  window.addEventListener('message', (event) => {
    const { source, blobID, blobData } = event.data;
    if (source === 'auto-image-overlay' && blobID && blobData) {
      const callback = fetchedBlobQueue.get(blobID);
      if (typeof callback === 'function') {
        callback(blobData);
      }
      fetchedBlobQueue.delete(blobID);
    }
  });

  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    const url = args[0] instanceof Request ? args[0].url : args[0];

    if (typeof url === 'string') {
      if (url.includes('https://backend.wplace.live/s0/pixel/')) {
        try {
          const payload = JSON.parse(args[1].body);
          if (payload.t) {
            // 📊 Debug log
            console.log(
              `🔍✅ Turnstile Token Captured - Type: ${typeof payload.t}, Value: ${
                payload.t
                  ? typeof payload.t === 'string'
                    ? payload.t.length > 50
                      ? payload.t.substring(0, 50) + '...'
                      : payload.t
                    : JSON.stringify(payload.t)
                  : 'null/undefined'
              }, Length: ${payload.t?.length || 0}`
            );
            window.postMessage({ source: 'turnstile-capture', token: payload.t }, '*');
          }
        } catch (_) {
          /* ignore */
        }
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('image/png') && url.includes('.png')) {
        const cloned = response.clone();
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
          const blobUUID = crypto.randomUUID();
          const originalBlob = await cloned.blob();

          fetchedBlobQueue.set(blobUUID, (processedBlob) => {
            resolve(
              new Response(processedBlob, {
                headers: cloned.headers,
                status: cloned.status,
                statusText: cloned.statusText,
              })
            );
          });

          window.postMessage(
            {
              source: 'auto-image-tile',
              endpoint: url,
              blobID: blobUUID,
              blobData: originalBlob,
            },
            '*'
          );
        });
      }
    }

    return response;
  };
});

window.addEventListener('message', (event) => {
  const { source, endpoint, blobID, blobData, token } = event.data;

  if (source === 'auto-image-tile' && endpoint && blobID && blobData) {
    overlayManager.processAndRespondToTileRequest(event.data);
  }

  if (source === 'turnstile-capture' && token) {
    setTurnstileToken(token);
    if (document.querySelector('#statusText')?.textContent.includes('CAPTCHA')) {
      showAlert(t('tokenCapturedSuccess'), 'success');
      updateUI('colorsFound', 'success', { count: state.availableColors.length });
    }
  }
});
