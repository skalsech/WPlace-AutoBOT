// Helper function to retry batch until success with exponential backoff
import { state } from './state.js';
import { updateUI } from '../ui/panel.js';
import { handleCaptcha } from './captcha-handler.js';
import { sleep } from '../utils/helpers.js';
import { APP_CONSTANTS } from '../config/APP_CONSTANTS.js';

export async function sendBatchWithRetry(pixels, regionX, regionY, maxRetries = 10) {
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
    } else if (result === 'token_error') {
      console.log(`🔑 Token error on attempt ${attempt}, regenerating...`);
      updateUI('captchaSolving', 'warning');
      try {
        await handleCaptcha();
        // Don't count token regeneration as a failed attempt
        attempt--;
        continue;
      } catch (e) {
        console.error(`❌ Token regeneration failed on attempt ${attempt}:`, e);
        updateUI('captchaFailed', 'error');
        // Wait longer before retrying after token failure
        await sleep(5000);
      }
    } else {
      console.warn(`⚠️ Batch failed on attempt ${attempt}, retrying...`);
      // Exponential backoff with jitter
      const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Max 30s
      const jitter = Math.random() * 1000; // Add up to 1s random delay
      await sleep(baseDelay + jitter);
    }
  }

  if (attempt >= maxRetries) {
    console.error(
      `❌ Batch failed after ${maxRetries} attempts. This will stop painting to prevent infinite loops.`
    );
    updateUI('paintingError', 'error');
    return false;
  }

  return false;
}

async function sendPixelBatch(pixelBatch, regionX, regionY) {
  let token = turnstileToken;

  // Generate new token if we don't have one
  if (!token) {
    try {
      console.log('🔑 Generating Turnstile token for pixel batch...');
      token = await handleCaptcha();
      turnstileToken = token; // Store for potential reuse
    } catch (error) {
      console.error('❌ Failed to generate Turnstile token:', error);
      tokenPromise = new Promise((resolve) => {
        _resolveToken = resolve;
      });
      return 'token_error';
    }
  }

  const coords = new Array(pixelBatch.length * 2);
  const colors = new Array(pixelBatch.length);
  for (let i = 0; i < pixelBatch.length; i++) {
    const pixel = pixelBatch[i];
    coords[i * 2] = pixel.x;
    coords[i * 2 + 1] = pixel.y;
    colors[i] = pixel.color;
  }

  try {
    const payload = { coords, colors, t: token, fp: randStr(10) };
    const wasmToken = await createWasmToken(regionX, regionY, payload);

    const res = await fetch(`https://backend.wplace.live/s0/pixel/${regionX}/${regionY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
        'x-pawtect-token': wasmToken,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (res.status === 403) {
      let data = null;
      try {
        data = await res.json();
      } catch (_) {
        /* empty */
      }
      console.error('❌ 403 Forbidden. Turnstile token might be invalid or expired.');

      // Try to generate a new token and retry once
      try {
        console.log('🔄 Regenerating Turnstile token after 403...');
        token = await handleCaptcha();
        turnstileToken = token;

        // Retry the request with new token
        const retryPayload = {
          coords,
          colors,
          t: token,
          fp: randStr(10),
        };
        const wasmToken = await createWasmToken(regionX, regionY, retryPayload);
        const retryRes = await fetch(`https://backend.wplace.live/s0/pixel/${regionX}/${regionY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
            'x-pawtect-token': wasmToken,
          },
          credentials: 'include',
          body: JSON.stringify(retryPayload),
        });

        if (retryRes.status === 403) {
          turnstileToken = null;
          tokenPromise = new Promise((resolve) => {
            _resolveToken = resolve;
          });
          return 'token_error';
        }

        const retryData = await retryRes.json();
        return retryData?.painted === pixelBatch.length;
      } catch (retryError) {
        console.error('❌ Token regeneration failed:', retryError);
        turnstileToken = null;
        tokenPromise = new Promise((resolve) => {
          _resolveToken = resolve;
        });
        return 'token_error';
      }
    }

    const data = await res.json();
    return data?.painted === pixelBatch.length;
  } catch (e) {
    console.error('Batch paint request failed:', e);
    return false;
  }
}
