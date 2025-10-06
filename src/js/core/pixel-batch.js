import { state } from './state.js';
import { updateUI } from '../ui/panel.js';
import { handleCaptcha } from './captcha-handler.js';
import { sleep } from '../utils/helpers.js';
import { getTurnstileToken, setTurnstileToken } from '../security/turnstile-manager.js';
import { computePawtectToken } from '../security/wasm-token.js';
import { getFingerprint } from '../lib/fingerprint.js';
import { wplaceService } from './api-service.js';

/**
 * Sends a batch of pixels with retry logic and exponential backoff
 * @param {Array} pixels - Array of pixel objects {x, y, color}
 * @param {number} regionX - X coordinate of the region
 * @param {number} regionY - Y coordinate of the region
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<boolean>} Whether the batch was successfully sent
 */
export async function sendBatchWithRetry(pixels, regionX, regionY, maxRetries = 5) {
  let attempt = 0;
  while (attempt < maxRetries && !state.stopFlag) {
    attempt++;
    console.log(
      `🔄 Attempting to send batch (attempt ${attempt}/${maxRetries}) for region ${regionX},${regionY} with ${pixels.length} pixels`
    );

    const result = await sendPixelBatch(pixels, regionX, regionY);

    if (result === true) {
      console.log(`✅ Batch succeeded on attempt ${attempt}`);
      return true;
    }

    if (result === 'token_error') {
      console.log(`🔑 Token error on attempt ${attempt}, regenerating...`);
      updateUI('captchaSolving', 'warning');
      try {
        await handleCaptcha();
        attempt--;
        continue;
      } catch (e) {
        console.error(`❌ Token regeneration failed on attempt ${attempt}:`, e);
        updateUI('captchaFailed', 'error');
        await sleep(5000);
      }
    } else {
      console.warn(`⚠️ Batch failed on attempt ${attempt}, retrying...`);

      const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
      const jitter = Math.random() * 1000;
      await sleep(baseDelay + jitter);
    }
  }

  if (attempt >= maxRetries) {
    console.error(
      `❌ Batch failed after ${maxRetries} attempts. Stopping to prevent infinite loops.`
    );
    updateUI('paintingError', 'error');
    return false;
  }

  return false;
}

/**
 * Sends a batch of pixel data to the server
 * @param {Array} pixelBatch - Pixels to paint
 * @param {number} regionX - Region X coordinate
 * @param {number} regionY - Region Y coordinate
 * @returns {Promise<boolean|string>} true on success, false on network/error, 'token_error' on auth failure
 */
async function sendPixelBatch(pixelBatch, regionX, regionY) {
  const fingerprint = await getFingerprint();
  const pawtectVariant = (await wplaceService.getPawtectVariant()).value;
  const url = `https://backend.wplace.live/s0/pixel/${regionX}/${regionY}`;

  if (!fingerprint) {
    throw new Error(
      'FingerprintJS failed to generate a visitor ID. ' +
        'This is required for pixel painting. Check if FingerprintJS loaded properly, ' +
        'or if the user is blocking scripts (adblock, privacy mode, etc.).'
    );
  }
  if (!pawtectVariant) {
    throw new Error('Pawtect protection variant is unavailable.');
  }
  const token = getTurnstileToken();
  if (!token) return 'token_error';

  // Prepare coordinates and colors
  const coords = new Array(pixelBatch.length * 2);
  const colors = new Array(pixelBatch.length);
  for (let i = 0; i < pixelBatch.length; i++) {
    const pixel = pixelBatch[i];
    coords[i * 2] = pixel.x;
    coords[i * 2 + 1] = pixel.y;
    colors[i] = pixel.color;
  }

  const payload = { coords, colors, t: token, fp: fingerprint };

  try {
    // Compute pawtect token
    const wasmToken = await computePawtectToken(url, JSON.stringify(payload));

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
        'x-pawtect-token': wasmToken,
        'x-pawtect-variant': pawtectVariant,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    // Handle 403 — likely invalid/expired Turnstile token
    // REVIEW: Current handling of 403 (Forbidden) is functional but suboptimal.
    //  - Duplicates the fetch logic, making it hard to maintain.
    //  - Combines multiple responsibilities (fetch, captcha handling, wasm token) in one function.
    //  - Retry logic lacks backoff for regenerated tokens and may fail silently.
    //  Suggestion: refactor into smaller functions:
    //    1. sendPixelRequest(payload, url, token) – just sends the request.
    //    2. handle403AndRetry(pixelBatch, url, fingerprint) – deals with 403, regenerates token, retries.
    //  This will simplify testing, error handling, and make future changes easier.

    if (res.status === 403) {
      console.error('❌ 403 Forbidden. Turnstile token might be invalid or expired.');
      console.log('🔄 Regenerating Turnstile token after 403...');

      try {
        const newToken = await handleCaptcha();
        const retryPayload = { coords, colors, t: newToken, fp: fingerprint };
        const retryWasmToken = await computePawtectToken(url, JSON.stringify(retryPayload));

        const retryRes = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
            'x-pawtect-token': retryWasmToken,
            'x-pawtect-variant': pawtectVariant,
          },
          credentials: 'include',
          body: JSON.stringify(retryPayload),
        });

        if (retryRes.status === 403) {
          console.error('❌ Token still invalid after regeneration');
          setTurnstileToken(null);
          return 'token_error';
        }

        const retryData = await retryRes.json();
        const retrySuccess = retryData?.painted === pixelBatch.length;
        if (retrySuccess) setTurnstileToken(newToken);
        return retrySuccess;
      } catch (retryError) {
        console.error('❌ Token regeneration failed:', retryError);
        setTurnstileToken(null);
        return 'token_error';
      }
    }

    const data = await res.json();
    const success = data?.painted === pixelBatch.length;
    if (success) setTurnstileToken(token);
    return success;
  } catch (e) {
    console.error('Batch paint request failed:', e);
    return false;
  }
}
