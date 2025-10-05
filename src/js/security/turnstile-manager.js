import { sleep, waitForSelector } from '../utils/helpers.js';
import { executeTurnstile, obtainSitekey } from './turnstile.js';
import { truncateString } from '../utils/dev-utils.js';

const TurnstileState = {
  /** @type {string | null} */
  token: null,
  expiryTime: 0,
  generationInProgress: false,
  resolveToken: null,
  tokenPromise: null,
};

TurnstileState.tokenPromise = new Promise((resolve) => {
  TurnstileState.resolveToken = resolve;
});

const TOKEN_LIFETIME = 240000;

export function setTurnstileToken(token) {
  if (TurnstileState.token === token) {
    console.log('[turnstile-token]: ⏭️ Token is the same, skipping update');
    return;
  }
  const displayToken = truncateString(token);
  console.debug(
    `[turnstile-token]: 🔑 New set - Type: ${typeof token}, Value: ${displayToken}, 🔍 Length: ${token.length}`
  );

  if (TurnstileState.resolveToken) {
    TurnstileState.resolveToken(token);
    TurnstileState.resolveToken = null;
  }
  TurnstileState.token = token;
  TurnstileState.expiryTime = Date.now() + TOKEN_LIFETIME;
  console.log('[turnstile-token]: ✅ Cached successfully');
}

export function getTurnstileToken() {
  return TurnstileState.token;
}

export function isTokenValid() {
  return TurnstileState.token && Date.now() < TurnstileState.expiryTime;
}

function invalidateToken() {
  TurnstileState.token = null;
  TurnstileState.expiryTime = 0;
  console.log('[turnstile-token]: 🗑️ Token invalidated, will force fresh generation');
}

export async function ensureToken(forceRefresh = false) {
  if (isTokenValid() && !forceRefresh) {
    return TurnstileState.token;
  }

  if (forceRefresh) invalidateToken();

  if (TurnstileState.generationInProgress) {
    console.log('[turnstile-token]: 🔄 Token generation already in progress, waiting...');
    await sleep(2000);
    return isTokenValid() ? TurnstileState.token : null;
  }

  TurnstileState.generationInProgress = true;

  try {
    console.log('[turnstile-token]: 🔄 Token expired or missing, generating new one...');
    const token = await handleCaptchaWithRetry();
    if (token) {
      setTurnstileToken(token);
      return token;
    }

    console.log('[turnstile-token]: ⚠️ Invisible Turnstile failed, forcing browser automation...');
    const fallbackToken = await handleCaptchaFallback();
    if (fallbackToken && fallbackToken.length > 20) {
      setTurnstileToken(fallbackToken);
      console.log('[turnstile-token]: ✅ Fallback token captured successfully');
      return fallbackToken;
    }

    console.log('[turnstile-token]: ❌ All token generation methods failed');
    return null;
  } finally {
    TurnstileState.generationInProgress = false;
  }
}

export async function handleCaptchaWithRetry() {
  const startTime = performance.now();

  try {
    const sitekey = await obtainSitekey();

    if (!sitekey) {
      throw new Error('No valid sitekey found');
    }

    console.log('[turnstile-token]: 🔐 Getting cached Turnstile token');
    const token = getTurnstileToken();

    if (token && typeof token === 'string' && token.length > 20) {
      const elapsed = Math.round(performance.now() - startTime);
      console.log(`[turnstile-token]: ✅ Turnstile token generated successfully in ${elapsed}ms`);
      return token;
    } else {
      throw new Error(`Invalid or empty token received - Length: ${token?.length || 0}`);
    }
  } catch (error) {
    const elapsed = Math.round(performance.now() - startTime);
    console.error(
      `[turnstile-token]: ❌ Turnstile token generation failed after ${elapsed}ms:`,
      error
    );
    throw error;
  }
}

export async function handleCaptchaFallback() {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      // Reset promise for new capture
      if (!TurnstileState.resolveToken) {
        TurnstileState.tokenPromise = new Promise((res) => {
          TurnstileState.resolveToken = res;
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

        await sleep(800);

        const confirmLoop = async () => {
          while (!TurnstileState.token) {
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
            await sleep(500);
          }
        };

        confirmLoop();
        const token = await TurnstileState.tokenPromise;
        await sleep(300);
        resolve(token);
      })();

      await Promise.race([solvePromise, timeoutPromise]);
    } catch (error) {
      console.error('[turnstile-token]: Auto-CAPTCHA process failed:', error);
      reject(error);
    }
  });
}
