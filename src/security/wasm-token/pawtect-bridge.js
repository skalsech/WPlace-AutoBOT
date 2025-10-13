/**
 * pawtect-bridge.js
 *
 * Module for handling postMessage communication protocol
 * Manages message passing between isolated world and main world
 */

const MESSAGE_ID = 'pawtect-proxy-' + Math.random().toString(36).slice(2, 11);

/**
 * Initializes the pawtect communication bridge
 * Sets up message listeners and request management
 */
export function initPawtectBridge() {
  if (!window.__pawtect_store) {
    window.__pawtect_store = {
      ready: false,
      pendingRequests: [],
      error: null,
    };
  }

  window.addEventListener('message', (event) => {
    if (event.data && event.data.source === MESSAGE_ID) {
      if (event.data.action === 'pawtect-result') {
        const store = window.__pawtect_store;

        while (store.pendingRequests.length > 0) {
          const resolve = store.pendingRequests.shift();
          resolve(event.data.token);
        }
      } else if (event.data.action === 'pawtect-error') {
        const store = window.__pawtect_store;

        while (store.pendingRequests.length > 0) {
          const reject = store.pendingRequests.shift();
          reject(new Error(event.data.error));
        }

        store.error = new Error(event.data.error);
        console.error('[wasm-token] Pawtect error:', event.data.error);
      } else if (event.data.action === 'request-ready') {
        window.__pawtect_store.ready = true;
      }
    }
  });
}

/**
 * Sends a request to compute pawtect token
 * @param {string} url - Endpoint URL
 * @param {string} bodyStr - JSON string (colors, coords, fp, t)
 * @returns {Promise<string>} Promise resolving to pawtect token
 */
export function requestPawtectToken(url, bodyStr) {
  return new Promise((resolve, reject) => {
    const store = window.__pawtect_store;

    if (store.error) {
      reject(store.error);
      return;
    }

    store.pendingRequests.push(resolve);
    store.pendingRequests.push(reject);

    window.postMessage(
      {
        source: MESSAGE_ID,
        action: 'compute-pawtect',
        payload: { url, bodyStr },
      },
      '*'
    );

    // Timeout fallback
    setTimeout(() => {
      const resolveIndex = store.pendingRequests.indexOf(resolve);
      if (resolveIndex !== -1) {
        store.pendingRequests.splice(resolveIndex, 1);
        store.pendingRequests.splice(store.pendingRequests.indexOf(reject), 1);
        reject(new Error('Pawtect computation timeout'));
      }
    }, 10000);
  });
}

/**
 * Gets the unique message identifier
 * @returns {string} Message ID for this instance
 */
export function getMessageId() {
  return MESSAGE_ID;
}

/**
 * Checks if the pawtect system is ready
 * @returns {boolean} True if ready, false otherwise
 */
export function isPawtectReady() {
  return window.__pawtect_store?.ready === true;
}

/**
 * Gets the current error state
 * @returns {Error|null} Error object or null if no error
 */
export function getPawtectError() {
  return window.__pawtect_store?.error || null;
}
