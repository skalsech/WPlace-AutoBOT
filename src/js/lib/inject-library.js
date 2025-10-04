const LIBRARY_ID = 'wplace-lib-' + Math.random().toString(36).slice(2, 11);

/**
 * Dynamically injects a minified JS library as a Blob script into the page.
 * Works around CSP, adblockers, and network restrictions.
 *
 * @param {Function} getCodeFn - Function that returns minified JS code as string
 * @param {string} globalVarName - Name of global variable to expose (e.g., 'IntlMessageFormat')
 * @returns {Promise<void>} Resolves when library is loaded
 */
export async function injectLibrary(getCodeFn, globalVarName) {
  if (window[globalVarName]) {
    console.log(`✅ ${globalVarName} already loaded`);
    return;
  }

  const script = document.createElement('script');
  script.textContent = `
    (function() {
      if (window.__wplace_lib_injected_${globalVarName}) return;
      window.__wplace_lib_injected_${globalVarName} = true;

      window.addEventListener('message', function(event) {
        if (event.data && event.data.source === '${LIBRARY_ID}' && event.data.action === 'request-library') {
          try {
            const code = ${JSON.stringify(getCodeFn())};

            const blob = new Blob([code], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);

            const libScript = document.createElement('script');
            libScript.src = blobUrl;

            libScript.onload = function() {
              URL.revokeObjectURL(blobUrl);
              window.postMessage({
                source: '${LIBRARY_ID}',
                action: 'library-loaded',
                name: '${globalVarName}'
              }, '*');
            };

            libScript.onerror = function() {
              URL.revokeObjectURL(blobUrl);
              window.postMessage({
                source: '${LIBRARY_ID}',
                action: 'library-error',
                name: '${globalVarName}',
                error: 'Failed to load library script'
              }, '*');
            };

            document.head.appendChild(libScript);
          } catch (error) {
            window.postMessage({
              source: '${LIBRARY_ID}',
              action: 'library-error',
              name: '${globalVarName}',
              error: 'Failed to process library code: ' + error.message
            }, '*');
          }
        }
      });

      window.postMessage({
        source: '${LIBRARY_ID}',
        action: 'request-library'
      }, '*');
    })();
  `;
  document.documentElement.appendChild(script);
  script.remove();
}

/**
 * Waits for library to be loaded via message channel
 * @param {string} globalVarName - Name of global variable (e.g., 'IntlMessageFormat')
 * @param timeout
 * @returns {Promise<boolean>} Resolves when library is available on window
 */
export async function waitForLibrary(globalVarName, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const check = () => {
      if (window[globalVarName]) {
        resolve(true);
        return;
      }
      setTimeout(check, 10);
    };

    const timer = setTimeout(() => {
      reject(new Error(`Library ${globalVarName} not loaded within ${timeout}ms`));
    }, timeout);

    window.addEventListener('message', (event) => {
      if (event.data?.source === LIBRARY_ID) {
        if (event.data.action === 'library-loaded' && event.data.name === globalVarName) {
          clearTimeout(timer);
          resolve(true);
        } else if (event.data.action === 'library-error') {
          clearTimeout(timer);
          reject(new Error(`Library ${globalVarName} failed to load: ${event.data.error}`));
        }
      }
    });

    check();
  });
}
