import { overlayManager } from '../tiles/overlay-manager.js';

export function setupFetchInterceptor() {
  const injectedFunction = () => {
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
  };

  // CSP-safe injection via blob URL
  const code = `(${injectedFunction.toString()})()`;
  const blob = new Blob([code], { type: 'application/javascript' });
  const blobUrl = URL.createObjectURL(blob);

  const script = document.createElement('script');
  script.src = blobUrl;
  script.async = true;

  script.onload = () => {
    URL.revokeObjectURL(blobUrl);
    script.remove();
  };

  script.onerror = () => {
    URL.revokeObjectURL(blobUrl);
    console.error('[WPlace-AutoBOT] Failed to inject fetch interceptor via blob');
  };

  (document.head || document.documentElement).appendChild(script);

  // Main world listeners (safe, no CSP issues)
  window.addEventListener('message', (event) => {
    const { source, endpoint, blobID, blobData, token } = event.data;

    if (source === 'auto-image-tile' && endpoint && blobID && blobData) {
      overlayManager.processAndRespondToTileRequest(event.data);
    }

    // if (source === 'turnstile-capture' && token) {
    //   setTurnstileToken(token);
    //   if (document.querySelector('#statusText')?.textContent.includes('CAPTCHA')) {
    //     showAlert(t('tokenCapturedSuccess'), 'success');
    //     updateUI('colorsFound', 'success', { count: state.availableColors.length });
    //   }
    // }
  });
}
