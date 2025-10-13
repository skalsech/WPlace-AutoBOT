/**
 * wasm-token.js
 *
 * Module for handling pawtect — anti-automation protection on wplace.live
 *
 * Features:
 * 1. Dynamic detection of WASM logic script URL
 * 2. Safe execution in main world via blob-URL
 * 3. CSP compatibility
 * 4. Support for multiple output formats from WASM function
 */

const MESSAGE_ID = 'pawtect-proxy-' + Math.random().toString(36).slice(2, 11);

/**
 * Returns code to be executed in the main world context as a function
 * @returns {Function} Function to run in the main context
 */
function getMainWorldCode() {
  return function mainWorldCode(messageId) {
    if (window.__pawtect_injected) return;
    window.__pawtect_injected = true;

    let pawtectModuleUrl = null;
    let wasmModule = null;

    /**
     * Finds the script URL containing pawtect logic
     * @returns {Promise<string|null>} Script URL or null if not found
     */
    async function findTokenModule(str) {
      try {
        const links = Array.from(
          document.querySelectorAll('link[rel="modulepreload"][href$=".js"]')
        );

        for (const link of links) {
          try {
            const url = new URL(link.getAttribute('href'), location.origin).href;
            const code = await fetch(url, { credentials: 'omit' }).then((r) => r.text());

            if (code.includes(str)) {
              pawtectModuleUrl = url;
              return url;
            }
          } catch (error) {
            console.warn(`[WPlace-AutoBOT]: ⚠️ Failed to check script:`, error.message);
          }
        }

        console.error('[wasm-token]: ❌ Could not find Pawtect module');
        return null;
      } catch (error) {
        console.error('[wasm-token]: 🛑 Error finding Pawtect module:', error);
        return null;
      }
    }

    /**
     * Loads and initializes the WASM module
     * @returns {Promise<object>} WASM module and exports
     */
    async function loadWasmModule() {
      if (wasmModule) return wasmModule;

      const moduleUrl = await findTokenModule('pawtect_wasm_bg.wasm');
      if (!moduleUrl) {
        throw new Error('pawtect module URL not found');
      }

      const mod = await import(moduleUrl);
      if (!mod || typeof mod._ !== 'function') {
        throw new Error('Invalid pawtect module structure');
      }

      const wasm = await mod._();

      wasmModule = { mod, wasm };
      return wasmModule;
    }

    /**
     * Computes pawtect token for given data
     * @param {Object} payload - Data to process (url, bodyStr)
     * @returns {Promise<string>} pawtect token
     */
    async function computePawtect(payload) {
      try {
        const { url, bodyStr } = payload;

        const { mod, wasm } = await loadWasmModule();

        // Set user ID if available
        try {
          const me = await fetch('https://backend.wplace.live/me', { credentials: 'include' }).then(
            (r) => (r.ok ? r.json() : null)
          );
          if (me?.id && typeof mod.p === 'function') {
            try {
              mod.p(me.id);
            } catch (userIdError) {
              console.log('[wasm-token]: ⚠️ Error setting user ID:', userIdError.message);
            }
          }
        } catch (error) {
          console.warn('[wasm-token]: ⚠️ Failed to set user ID:', error.message);
        }

        // Set request URL
        try {
          if (typeof mod.r === 'function') {
            mod.r(url);
          }
        } catch (urlError) {
          console.log('[wasm-token]: ⚠️ Error setting request URL:', urlError.message);
        }

        const enc = new TextEncoder();
        const dec = new TextDecoder();
        const bytes = enc.encode(bodyStr);

        // Allocate memory in WASM
        let inPtr;
        try {
          if (!wasm.__wbindgen_malloc) {
            throw new Error('__wbindgen_malloc function not found');
          }

          inPtr = wasm.__wbindgen_malloc(bytes.length, 1);
          const wasmBuffer = new Uint8Array(wasm.memory.buffer, inPtr, bytes.length);
          wasmBuffer.set(bytes);
        } catch (memError) {
          console.error('[wasm-token]: ❌ Memory allocation error:', memError);
          throw memError;
        }

        // Call the token generation function
        let token = null;
        let outPtr, outLen;
        try {
          const result = wasm.get_pawtected_endpoint_payload(inPtr, bytes.length);

          if (Array.isArray(result) && result.length === 2) {
            [outPtr, outLen] = result;
            const outputBuffer = new Uint8Array(wasm.memory.buffer, outPtr, outLen);
            token = dec.decode(outputBuffer);
          } else {
            throw new Error('Unexpected result format from WASM');
          }
        } catch (funcError) {
          console.error('[wasm-token]: ❌ Function call error:', funcError);
          throw funcError;
        } finally {
          try {
            if (wasm.__wbindgen_free) {
              if (outPtr && outLen) {
                wasm.__wbindgen_free(outPtr, outLen, 1);
              }
            } else {
              console.log('[wasm-token]: ⚠️ Cleanup warning: __wbindgen_free function not found');
            }
          } catch (cleanupError) {
            console.log('[wasm-token]: ⚠️ Cleanup warning:', cleanupError.message);
          }
        }

        if (token) {
          let displayToken = token;

          if (token.length > 64) {
            const prefix = token.substring(0, 20);
            const suffix = token.substring(token.length - 12);

            const middleHash = Array.from(
              { length: 8 },
              (_, i) =>
                token[
                  Math.floor(
                    prefix.length + (i * (token.length - prefix.length - suffix.length)) / 7
                  )
                ]
            ).join('');

            displayToken = `${prefix}...${middleHash}...${suffix}`;
          }
          console.log(
            `[wasm-token]: 🔑 Full token: ${displayToken}, 🔍 Length: ${token?.length || 0}`
          );
        }

        return token;
      } catch (error) {
        console.error('[wasm-token]: 🛑 pawtect computation failed:', error);
        throw error;
      }
    }

    // Listen for messages from isolated world
    window.addEventListener('message', async (event) => {
      if (
        event.data &&
        event.data.source === messageId &&
        event.data.action === 'compute-pawtect'
      ) {
        try {
          const token = await computePawtect(event.data.payload);

          window.postMessage(
            {
              source: messageId,
              action: 'pawtect-result',
              token,
            },
            '*'
          );
        } catch (error) {
          window.postMessage(
            {
              source: messageId,
              action: 'pawtect-error',
              error: error.message,
            },
            '*'
          );
        }
      }
    });

    // Signal readiness
    window.postMessage(
      {
        source: messageId,
        action: 'request-ready',
      },
      '*'
    );
  };
}

/**
 * Injects code into the main world context
 */
function injectIntoMainWorld() {
  if (window.__pawtect_injector_installed) return;
  window.__pawtect_injector_installed = true;

  const mainWorldFunction = getMainWorldCode();
  const functionString = mainWorldFunction.toString();

  const script = document.createElement('script');
  script.textContent = `
    (function() {
      try {
        const mainWorldCode = ${functionString};
        mainWorldCode('${MESSAGE_ID}');
      } catch (error) {
        console.error('[wasm-token] Failed to initialize main world code:', error);
      }
    })();
  `;

  document.documentElement.appendChild(script);
  script.remove();
}

/**
 * Initializes the pawtect module
 */
export function initPawtect() {
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

  injectIntoMainWorld();
}

/**
 * Computes pawtect token for given URL and JSON body string
 * @param {string} url - Endpoint URL
 * @param {string} bodyStr - JSON string (colors, coords, fp, t)
 * @returns {Promise<string>} Promise resolving to pawtect token
 */
export async function computePawtectToken(url, bodyStr) {
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
