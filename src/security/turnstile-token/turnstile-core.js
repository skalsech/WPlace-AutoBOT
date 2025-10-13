let _turnstileWidgetId = null;
let _lastSitekey = null;

export async function loadTurnstile() {
  if (window.turnstile) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    // Avoid adding the script twice
    const existingScript = document.querySelector(
      'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
    );
    if (existingScript) {
      const checkReady = () => {
        if (window.turnstile) {
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
      return null;
    }
  }
}

export function cleanupTurnstile() {
  if (_turnstileWidgetId && window.turnstile?.remove) {
    try {
      window.turnstile.remove(_turnstileWidgetId);
    } catch (e) {
      console.warn('Failed to cleanup Turnstile widget:', e);
    }
  }

  _turnstileWidgetId = null;
  _lastSitekey = null;
}
