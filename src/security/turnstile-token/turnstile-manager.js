import { sleep, waitForSelector } from '../../utils/helpers.js';
import { cleanupTurnstile as cleanupCore, executeTurnstile } from './turnstile-core.js';
import { createTurnstileWidgetInteractive } from './turnstile-interactive.js';
import { cleanupUI } from './turnstile-ui.js';
import { truncateString } from '../../utils/dev-utils.js';

const TurnstileState = {
  /** @type {string | null} */
  token: null,
  expiryTime: 0,
  generationInProgress: false,
  resolveToken: null,
  tokenPromise: null,
  _cachedSitekey: null,
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
    `[turnstile-token]: 🔑 New set - Type: ${typeof token}, Value: ${displayToken}, 🔍 Length: ${token?.length || 0}`
  );

  if (TurnstileState.resolveToken) {
    TurnstileState.resolveToken(token);
    TurnstileState.resolveToken = null;
  }
  TurnstileState.token = token;
  TurnstileState.expiryTime = Date.now() + TOKEN_LIFETIME;
  console.log('[turnstile-token]: ✅ Cached successfully');
}

/** @returns {string | null} */
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

export async function ensureToken(tokenSource, forceRefresh = false) {
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
    return await handleCaptcha(tokenSource);
  } finally {
    TurnstileState.generationInProgress = false;
  }
}

export async function executeTurnstileStrategy(sitekey, strategy = 'auto') {
  switch (strategy) {
    case 'invisible':
      return await executeTurnstile(sitekey);
    case 'interactive':
      return await createTurnstileWidgetInteractive(sitekey);
    case 'auto':
    default: {
      // Try reuse widget first
      let token = await executeTurnstile(sitekey);
      if (token && token.length > 20) {
        return token;
      }

      // Fall back to interactive
      token = await createTurnstileWidgetInteractive(sitekey);
      if (token && token.length > 20) {
        return token;
      }

      // Final fallback - try reuse widget again (in case it works now)
      return await executeTurnstile(sitekey);
    }
  }
}

export async function obtainSitekey() {
  if (TurnstileState.cachedSitekey) {
    console.log('🔍 Using cached sitekey:', TurnstileState.cachedSitekey);
    return TurnstileState.cachedSitekey;
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
      const token = await executeTurnstileStrategy(sitekey);

      if (token && typeof token === 'string' && token.length >= 20) {
        console.log(`✅ Valid sitekey found from ${source}`);
        setTurnstileToken(token);
        TurnstileState.cachedSitekey = sitekey;
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
    for (const testSitekeyValue of potentialSitekeys) {
      const result = await testSitekey(testSitekeyValue, 'known list');
      if (result) return result;
    }
  } catch (error) {
    console.warn('⚠️ Error during sitekey detection:', error);
  }

  console.error('❌ No working sitekey found.');
  return null;
}

export async function obtainToken() {
  const sitekey = await obtainSitekey();
  if (!sitekey) {
    console.error('❌ Could not find a valid sitekey');
    return null;
  }

  if (isTokenValid()) {
    return TurnstileState.token;
  }
  const token = await executeTurnstileStrategy(sitekey);
  if (token && token.length > 20) {
    setTurnstileToken(token);
    return token;
  }

  console.error('❌ Could not generate a valid turnstile token');
  return null;
}

export function cleanupTurnstile() {
  cleanupCore();
  cleanupUI();
  TurnstileState.token = null;
  TurnstileState.expiryTime = 0;
  TurnstileState.generationInProgress = false;
  if (TurnstileState.resolveToken) {
    TurnstileState.resolveToken(null);
    TurnstileState.resolveToken = null;
  }
  TurnstileState.tokenPromise = new Promise((resolve) => {
    TurnstileState.resolveToken = resolve;
  });
}

/**
 * Handles captcha token generation with fallback strategy
 */
export async function handleCaptcha(tokenSource) {
  const startTime = performance.now();

  if (tokenSource === 'manual') {
    console.log('🎯 Manual token source selected - using pixel placement automation');
    return await handleCaptchaFallback();
  }

  try {
    const token = await obtainToken();
    if (!token || typeof token !== 'string' || token.length < 20) {
      throw new Error(
        `Invalid or empty token received - Type: ${typeof token}, Value: ${JSON.stringify(token)}, Length: ${token?.length || 0}`
      );
    }
    return token;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    console.error(`❌ Turnstile token generation failed after ${duration}ms:`, error);

    if (tokenSource === 'hybrid') {
      console.log(
        '🔄 Hybrid mode: Generator failed, automatically switching to manual pixel placement...'
      );
      return await handleCaptchaFallback();
    } else {
      throw error;
    }
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
