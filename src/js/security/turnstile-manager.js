// Optimized Turnstile token handling with improved caching and retry logic
import { sleep, waitForSelector } from '../utils/helpers.js';
import { executeTurnstile, obtainSitekeyAndToken } from './turnstile.js';

export let turnstileToken = null;
export let tokenExpiryTime = 0;
export let tokenGenerationInProgress = false;
export let _resolveToken = null;
export let tokenPromise = new Promise((resolve) => {
  _resolveToken = resolve;
});
const TOKEN_LIFETIME = 240000; // 4 minutes (tokens typically last 5 min, use 4 for safety)

export function setTurnstileToken(token) {
  if (_resolveToken) {
    _resolveToken(token);
    _resolveToken = null;
  }
  turnstileToken = token;
  tokenExpiryTime = Date.now() + TOKEN_LIFETIME;
  console.log('✅ Turnstile token set successfully');
}

export function isTokenValid() {
  return turnstileToken && Date.now() < tokenExpiryTime;
}

function invalidateToken() {
  turnstileToken = null;
  tokenExpiryTime = 0;
  console.log('🗑️ Token invalidated, will force fresh generation');
}

export async function ensureToken(forceRefresh = false) {
  // Return cached token if still valid and not forcing refresh
  if (isTokenValid() && !forceRefresh) {
    return turnstileToken;
  }

  // Invalidate token if forcing refresh
  if (forceRefresh) invalidateToken();

  // Avoid multiple simultaneous token generations
  if (tokenGenerationInProgress) {
    console.log('🔄 Token generation already in progress, waiting...');
    await sleep(2000);
    return isTokenValid() ? turnstileToken : null;
  }

  tokenGenerationInProgress = true;

  try {
    console.log('🔄 Token expired or missing, generating new one...');
    const token = await handleCaptchaWithRetry();
    if (token && token.length > 20) {
      setTurnstileToken(token);
      console.log('✅ Token captured and cached successfully');
      return token;
    }

    console.log('⚠️ Invisible Turnstile failed, forcing browser automation...');
    const fallbackToken = await handleCaptchaFallback();
    if (fallbackToken && fallbackToken.length > 20) {
      setTurnstileToken(fallbackToken);
      console.log('✅ Fallback token captured successfully');
      return fallbackToken;
    }

    console.log('❌ All token generation methods failed');
    return null;
  } finally {
    tokenGenerationInProgress = false;
  }
}

async function handleCaptchaWithRetry() {
  const startTime = performance.now();

  try {
    const { sitekey, token: preGeneratedToken } = await obtainSitekeyAndToken();

    if (!sitekey) {
      throw new Error('No valid sitekey found');
    }

    console.log('🔑 Using sitekey:', sitekey);

    if (typeof window !== 'undefined' && window.navigator) {
      console.log(
        '🧭 UA:',
        window.navigator.userAgent.substring(0, 50) + '...',
        'Platform:',
        window.navigator.platform
      );
    }

    let token;

    if (
      preGeneratedToken &&
      typeof preGeneratedToken === 'string' &&
      preGeneratedToken.length > 20
    ) {
      console.log('♻️ Reusing pre-generated Turnstile token');
      token = preGeneratedToken;
    } else {
      if (isTokenValid()) {
        console.log('♻️ Using existing cached token (from previous session)');
        token = turnstileToken;
      } else {
        console.log('🔐 Generating new token with executeTurnstile...');
        token = await executeTurnstile(sitekey, 'paint');
        if (token) setTurnstileToken(token);
      }
    }

    if (token && typeof token === 'string' && token.length > 20) {
      const elapsed = Math.round(performance.now() - startTime);
      console.log(`✅ Turnstile token generated successfully in ${elapsed}ms`);
      return token;
    } else {
      throw new Error(`Invalid or empty token received - Length: ${token?.length || 0}`);
    }
  } catch (error) {
    const elapsed = Math.round(performance.now() - startTime);
    console.error(`❌ Turnstile token generation failed after ${elapsed}ms:`, error);
    throw error;
  }
}

export async function handleCaptchaFallback() {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure we have a fresh promise to await for a new token capture
      if (!_resolveToken) {
        tokenPromise = new Promise((res) => {
          _resolveToken = res;
        });
      }
      const timeoutPromise = sleep(20000).then(() => reject(new Error('Auto-CAPTCHA timed out.')));

      const solvePromise = (async () => {
        const mainPaintBtn = await waitForSelector(
          'button.btn.btn-primary.btn-lg, button.btn-primary.sm\\:btn-xl',
          200,
          10000
        );
        if (!mainPaintBtn) throw new Error('Could not find the main paint button.');
        mainPaintBtn.click();
        await sleep(500);

        const transBtn = await waitForSelector('button#color-0', 200, 5000);
        if (!transBtn) throw new Error('Could not find the transparent color button.');
        transBtn.click();
        await sleep(500);

        const canvas = await waitForSelector('canvas', 200, 5000);
        if (!canvas) throw new Error('Could not find the canvas element.');

        canvas.setAttribute('tabindex', '0');
        canvas.focus();
        const rect = canvas.getBoundingClientRect();
        const centerX = Math.round(rect.left + rect.width / 2);
        const centerY = Math.round(rect.top + rect.height / 2);

        canvas.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: centerX,
            clientY: centerY,
            bubbles: true,
          })
        );
        canvas.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: ' ',
            code: 'Space',
            bubbles: true,
          })
        );
        await sleep(50);
        canvas.dispatchEvent(
          new KeyboardEvent('keyup', {
            key: ' ',
            code: 'Space',
            bubbles: true,
          })
        );
        await sleep(500);

        // 800ms delay before sending confirmation
        await sleep(800);

        // Keep confirming until token is captured
        const confirmLoop = async () => {
          while (!turnstileToken) {
            let confirmBtn = await waitForSelector(
              'button.btn.btn-primary.btn-lg, button.btn.btn-primary.sm\\:btn-xl'
            );
            if (!confirmBtn) {
              const allPrimary = Array.from(document.querySelectorAll('button.btn-primary'));
              confirmBtn = allPrimary.length ? allPrimary[allPrimary.length - 1] : null;
            }
            if (confirmBtn) {
              confirmBtn.click();
            }
            await sleep(500); // 500ms delay between confirmation attempts
          }
        };

        // Start confirmation loop and wait for token
        confirmLoop();
        const token = await tokenPromise;
        await sleep(300); // small delay after token is captured
        resolve(token);
      })();

      await Promise.race([solvePromise, timeoutPromise]);
    } catch (error) {
      console.error('Auto-CAPTCHA process failed:', error);
      reject(error);
    }
  });
}
