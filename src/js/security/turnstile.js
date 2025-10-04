import { t } from '../i18n/i18.js';
import { getTurnstileToken, isTokenValid, setTurnstileToken } from './turnstile-manager.js';

let turnstileLoaded = false;
let _turnstileContainer = null;
let _turnstileOverlay = null;
let _turnstileWidgetId = null;
let _lastSitekey = null;
let _cachedSitekey = null;

export async function loadTurnstile() {
  // If Turnstile is already present, just resolve.
  if (window.turnstile) {
    turnstileLoaded = true;
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    // Avoid adding the script twice
    if (
      document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]')
    ) {
      const checkReady = () => {
        if (window.turnstile) {
          turnstileLoaded = true;
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      return checkReady();
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      turnstileLoaded = true;
      console.log('✅ Turnstile script loaded successfully');
      resolve();
    };
    script.onerror = () => {
      console.error('❌ Failed to load Turnstile script');
      reject(new Error('Failed to load Turnstile'));
    };
    document.head.appendChild(script);
  });
}

// Create or reuse the turnstile container - completely hidden for token generation
export function ensureTurnstileContainer() {
  if (!_turnstileContainer || !document.body.contains(_turnstileContainer)) {
    // Clean up old container if it exists
    if (_turnstileContainer) {
      _turnstileContainer.remove();
    }

    _turnstileContainer = document.createElement('div');
    _turnstileContainer.className = 'wplace-turnstile-hidden';
    _turnstileContainer.setAttribute('aria-hidden', 'true');
    _turnstileContainer.id = 'turnstile-widget-container';
    document.body.appendChild(_turnstileContainer);
  }
  return _turnstileContainer;
}

// Interactive overlay container for visible widgets when needed
export function ensureTurnstileOverlayContainer() {
  if (_turnstileOverlay && document.body.contains(_turnstileOverlay)) {
    return _turnstileOverlay;
  }

  const overlay = document.createElement('div');
  overlay.id = 'turnstile-overlay-container';
  overlay.className = 'wplace-turnstile-overlay wplace-overlay-hidden';

  const title = document.createElement('div');
  title.textContent = t('turnstileInstructions');
  title.dataset.i18nKey = 'turnstileInstructions';
  title.className = 'wplace-turnstile-title';

  const host = document.createElement('div');
  host.id = 'turnstile-overlay-host';
  host.className = 'wplace-turnstile-host';

  const hideBtn = document.createElement('button');
  hideBtn.textContent = t('hideTurnstileBtn');
  hideBtn.dataset.i18nKey = 'hideTurnstileBtn';
  hideBtn.className = 'wplace-turnstile-hide-btn';
  hideBtn.addEventListener('click', () => overlay.remove());

  overlay.appendChild(title);
  overlay.appendChild(host);
  overlay.appendChild(hideBtn);
  document.body.appendChild(overlay);

  _turnstileOverlay = overlay;
  return overlay;
}

export async function executeTurnstile(sitekey, action = 'paint') {
  await loadTurnstile();

  if (_turnstileWidgetId && _lastSitekey === sitekey && window.turnstile?.execute) {
    try {
      console.log('🔄 Reusing existing Turnstile widget...');
      const token = await Promise.race([
        window.turnstile.execute(_turnstileWidgetId, { action }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Execute timeout')), 15000)),
      ]);
      if (token && token.length > 20) {
        console.log('✅ Token generated via widget reuse');
        return token;
      }
    } catch (error) {
      console.log('🔴 Widget reuse failed, will create a fresh widget:', error.message);
    }
  }

  const invisibleToken = await createTurnstileWidget(sitekey, action);
  if (invisibleToken && invisibleToken.length > 20) {
    return invisibleToken;
  }

  console.log('🔴 Falling back to interactive Turnstile (visible).');
  return await createTurnstileWidgetInteractive(sitekey, action);
}

export async function createTurnstileWidget(sitekey, action) {
  return new Promise((resolve) => {
    try {
      // Force cleanup of any existing widget
      if (_turnstileWidgetId && window.turnstile?.remove) {
        try {
          window.turnstile.remove(_turnstileWidgetId);
          console.log('🧹 Cleaned up existing Turnstile widget');
        } catch (e) {
          console.warn('⚠️ Widget cleanup warning:', e.message);
        }
      }

      const container = ensureTurnstileContainer();
      container.innerHTML = '';

      // Verify Turnstile is available
      if (!window.turnstile?.render) {
        console.error('❌ Turnstile not available for rendering');
        resolve(null);
        return;
      }

      console.log('🔧 Creating invisible Turnstile widget...');
      const widgetId = window.turnstile.render(container, {
        sitekey,
        action,
        size: 'invisible',
        retry: 'auto',
        'retry-interval': 8000,
        callback: (token) => {
          console.log('✅ Invisible Turnstile callback');
          resolve(token);
        },
        'error-callback': () => resolve(null),
        'timeout-callback': () => resolve(null),
      });

      _turnstileWidgetId = widgetId;
      _lastSitekey = sitekey;

      if (!widgetId) {
        return resolve(null);
      }

      // Execute the widget and race with timeout
      Promise.race([
        window.turnstile.execute(widgetId, { action }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Invisible execute timeout')), 12000)
        ),
      ])
        .then(resolve)
        .catch(() => resolve(null));
    } catch (e) {
      console.error('❌ Invisible Turnstile creation failed:', e);
      resolve(null);
    }
  });
}

export async function createTurnstileWidgetInteractive(sitekey, action) {
  // Create a visible widget that users can interact with if needed
  console.log('🔄 Creating interactive Turnstile widget (visible)');

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
      overlay.classList.remove('wplace-overlay-hidden');
      overlay.style.display = 'block';

      const host = overlay.querySelector('#turnstile-overlay-host');
      host.innerHTML = '';

      // Set a timeout for interactive mode
      const timeout = setTimeout(() => {
        console.warn('⏰ Interactive Turnstile widget timeout');
        overlay.classList.add('wplace-overlay-hidden');
        overlay.style.display = 'none';
        resolve(null);
      }, 60000); // 60 seconds for user interaction

      const widgetId = window.turnstile.render(host, {
        sitekey,
        action,
        size: 'normal',
        theme: 'light',
        callback: (token) => {
          clearTimeout(timeout);
          overlay.classList.add('wplace-overlay-hidden');
          overlay.style.display = 'none';
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
          overlay.classList.add('wplace-overlay-hidden');
          overlay.style.display = 'none';
          console.warn('❌ Interactive Turnstile error:', error);
          resolve(null);
        },
      });

      _turnstileWidgetId = widgetId;
      _lastSitekey = sitekey;

      if (!widgetId) {
        clearTimeout(timeout);
        overlay.classList.add('wplace-overlay-hidden');
        overlay.style.display = 'none';
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

// Cleanup method for when the script is disabled/reloaded
export function cleanupTurnstile() {
  if (_turnstileWidgetId && window.turnstile?.remove) {
    try {
      window.turnstile.remove(_turnstileWidgetId);
    } catch (e) {
      console.warn('Failed to cleanup Turnstile widget:', e);
    }
  }

  if (_turnstileContainer && document.body.contains(_turnstileContainer)) {
    _turnstileContainer.remove();
  }

  if (_turnstileOverlay && document.body.contains(_turnstileOverlay)) {
    _turnstileOverlay.remove();
  }

  _turnstileWidgetId = null;
  _turnstileContainer = null;
  _turnstileOverlay = null;
  _lastSitekey = null;
}

export async function obtainSitekey(fallback = '0x4AAAAAABpqJe8FO0N84q0F') {
  if (_cachedSitekey) {
    console.log('🔍 Using cached sitekey:', _cachedSitekey);
    return _cachedSitekey;
  }

  const potentialSitekeys = [
    '0x4AAAAAABpqJe8FO0N84q0F', // WPlace common sitekey
    '0x4AAAAAABpHqZ-6i7uL0nmG', // Alternative WPlace sitekey
    '0x4AAAAAAAJ7xjKAp6Mt_7zw', // Alternative WPlace sitekey
    '0x4AAAAAADm5QWx6Ov2LNF2g', // Another common sitekey
  ];

  const testSitekey = async (sitekey, source) => {
    if (!sitekey || sitekey.length < 10) return null;

    console.log(`🔍 Testing sitekey from ${source}:`, sitekey);

    try {
      const token = await executeTurnstile(sitekey);

      if (token && typeof token === 'string' && token.length >= 20) {
        console.log(`✅ Valid sitekey found from ${source}`);
        setTurnstileToken(token);
        _cachedSitekey = sitekey;
        return sitekey;
      } else {
        console.log(`❌ Invalid token for sitekey from ${source}`);
        return null;
      }
    } catch (error) {
      console.log(`❌ Error testing sitekey from ${source}:`, error.message);
      return null;
    }
  };

  try {
    // 1️⃣ data-sitekey attribute
    const sitekeySel = document.querySelector('[data-sitekey]');
    if (sitekeySel) {
      const sitekey = sitekeySel.getAttribute('data-sitekey');
      const result = await testSitekey(sitekey, 'data attribute');
      if (result) return result;
    }

    // 2️⃣ Turnstile element
    const turnstileEl = document.querySelector('.cf-turnstile');
    if (turnstileEl?.dataset?.sitekey) {
      const sitekey = turnstileEl.dataset.sitekey;
      const result = await testSitekey(sitekey, 'turnstile element');
      if (result) return result;
    }

    // 3️⃣ Meta tags
    const metaTags = document.querySelectorAll(
      'meta[name*="turnstile"], meta[property*="turnstile"]'
    );
    for (const meta of metaTags) {
      const content = meta.getAttribute('content');
      const result = await testSitekey(content, 'meta tag');
      if (result) return result;
    }

    // 4️⃣ Global variable
    if (window.__TURNSTILE_SITEKEY) {
      const result = await testSitekey(window.__TURNSTILE_SITEKEY, 'global variable');
      if (result) return result;
    }

    // 5️⃣ Script tags
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const content = script.textContent || script.innerHTML;
      const match = content.match(
        /(?:sitekey|data-sitekey)['"\s[\]:=(]*['"]?([0-9a-zA-Z_-]{20,})['"]?/i
      );
      if (match && match[1]) {
        const extracted = match[1].replace(/['"]/g, '');
        const result = await testSitekey(extracted, 'script content');
        if (result) return result;
      }
    }

    // 6️⃣ Known potential sitekeys
    for (const testSitekeyValue of potentialSitekeys) {
      const result = await testSitekey(testSitekeyValue, 'known list');
      if (result) return result;
    }
  } catch (error) {
    console.warn('⚠️ Error during sitekey detection:', error);
  }

  // 7️⃣ Fallback
  console.log('🔧 Trying fallback sitekey:', fallback);
  const fallbackResult = await testSitekey(fallback, 'fallback');
  if (fallbackResult) {
    return fallbackResult;
  }

  console.error('❌ No working sitekey found.');
  return null;
}
