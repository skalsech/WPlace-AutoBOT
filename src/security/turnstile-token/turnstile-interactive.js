import { loadTurnstile } from './turnstile-core.js';
import {
  ensureTurnstileOverlayContainer,
  hideTurnstileOverlay,
  showTurnstileOverlay,
} from './turnstile-ui.js';

let _turnstileWidgetId = null;
let _lastSitekey = null;

export async function createTurnstileWidgetInteractive(sitekey, action) {
  await loadTurnstile();

  return new Promise((resolve) => {
    try {
      // Force cleanup of any existing widget
      if (_turnstileWidgetId && window.turnstile?.remove) {
        try {
          window.turnstile.remove(_turnstileWidgetId);
        } catch (e) {
          console.warn('⚠️ Widget cleanup warning:', e.message);
        }
      }

      const overlay = ensureTurnstileOverlayContainer();
      showTurnstileOverlay();

      const host = overlay.querySelector('#turnstile-overlay-host');
      if (!host) {
        console.error('❌ Turnstile host element not found');
        hideTurnstileOverlay();
        resolve(null);
        return;
      }

      host.innerHTML = '';

      // Set a timeout for interactive mode
      const timeout = setTimeout(() => {
        console.warn('⏰ Interactive Turnstile widget timeout');
        hideTurnstileOverlay();
        resolve(null);
      }, 60000); // 60 seconds for user interaction

      if (!window.turnstile?.render) {
        console.error('❌ Turnstile not available for rendering');
        clearTimeout(timeout);
        hideTurnstileOverlay();
        resolve(null);
        return;
      }

      const widgetId = window.turnstile.render(host, {
        sitekey,
        action,
        size: 'normal',
        theme: 'light',
        callback: (token) => {
          clearTimeout(timeout);
          hideTurnstileOverlay();
          console.log('✅ Interactive Turnstile completed successfully');

          if (typeof token === 'string' && token.length > 20) {
            resolve(token);
          } else {
            console.warn('❌ Invalid token from interactive widget');
            resolve(null);
          }
        },
        'error-callback': (error) => {
          clearTimeout(timeout);
          hideTurnstileOverlay();
          console.warn('❌ Interactive Turnstile error:', error);
          resolve(null);
        },
      });

      _turnstileWidgetId = widgetId;
      _lastSitekey = sitekey;

      if (!widgetId) {
        clearTimeout(timeout);
        hideTurnstileOverlay();
        console.warn('❌ Failed to create interactive Turnstile widget');
        resolve(null);
      } else {
        console.log('✅ Interactive Turnstile widget created, waiting for user interaction...');
      }
    } catch (e) {
      console.error('❌ Interactive Turnstile creation failed:', e);
      resolve(null);
    }
  });
}
