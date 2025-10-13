import { state } from '../state.js';
import { updateUI } from '../../app/startup/create-ui.js';
import { sleep } from '../../utils/helpers.js';
import { ensureToken } from '../../security/turnstile-token/turnstile-manager.js';
import { getFingerprint } from '../../vendor/fingerprint.js';
import { wplaceService } from '../api/api-service.js';
import { computePawtectToken } from '../../security/wasm-token/pawtect-worker.js';

/**
 * Attempts to send a batch with current token, retries once on 403.
 */
async function trySendPixelBatch(pixelBatch, regionX, regionY) {
  const fingerprint = await getFingerprint();
  const pawtectVariant = (await wplaceService.getPawtectVariant()).value;

  if (!fingerprint) throw new Error('Missing fingerprint');
  if (!pawtectVariant) throw new Error('Missing pawtect variant');

  const token = await ensureToken(state.tokenSource);
  if (!token) return 'token_error';

  const payload = makePayload(pixelBatch, token, fingerprint);
  const url = `https://backend.wplace.live/s0/pixel/${regionX}/${regionY}`;
  const wasmToken =
    pawtectVariant !== 'disabled' ? await computePawtectToken(url, JSON.stringify(payload)) : '';

  const res = await wplaceService.sendPixelRequest(url, payload, pawtectVariant, wasmToken);

  if (res.status === 403) {
    console.warn('403 Forbidden — token may be expired. Regenerating...');
    return handle403AndRetry(pixelBatch, url, fingerprint, pawtectVariant);
  }

  return parsePixelResponse(res, pixelBatch.length);
}

/**
 * Handles 403 Forbidden by regenerating captcha token and retrying once.
 */
async function handle403AndRetry(pixelBatch, url, fingerprint, pawtectVariant) {
  try {
    const newToken = await ensureToken(state.tokenSource, true);
    const retryPayload = makePayload(pixelBatch, newToken, fingerprint);
    const retryWasmToken =
      pawtectVariant !== 'disabled'
        ? await computePawtectToken(url, JSON.stringify(retryPayload))
        : '';

    const retryRes = await wplaceService.sendPixelRequest(
      url,
      retryPayload,
      pawtectVariant,
      retryWasmToken
    );
    if (retryRes.status === 403) {
      console.error('Token still invalid after regeneration');
      return 'token_error';
    }

    return parsePixelResponse(retryRes, pixelBatch.length);
  } catch (e) {
    console.error('Token regeneration failed:', e);
    return 'token_error';
  }
}

/**
 * Parses server response and updates stored token if successful.
 */
async function parsePixelResponse(res, expectedCount) {
  try {
    const data = await res.json();
    return data?.painted === expectedCount;
  } catch (e) {
    console.error('Invalid server response:', e);
    return false;
  }
}

/**
 * Builds compact payload arrays.
 */
function makePayload(pixelBatch, token, fingerprint) {
  const coords = new Array(pixelBatch.length * 2);
  const colors = new Array(pixelBatch.length);
  for (let i = 0; i < pixelBatch.length; i++) {
    const p = pixelBatch[i];
    coords[i * 2] = p.x;
    coords[i * 2 + 1] = p.y;
    colors[i] = p.color;
  }
  return { coords, colors, t: token, fp: fingerprint };
}

/**
 * Retries pixel batch sending with exponential backoff.
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
      `🔄 Attempt ${attempt}/${maxRetries} — region ${regionX},${regionY}, pixels=${pixels.length}`
    );

    const result = await trySendPixelBatch(pixels, regionX, regionY);

    if (result === true) {
      console.log(`✅ Batch succeeded on attempt ${attempt}`);
      return true;
    }

    if (result === 'token_error') {
      console.log('🔑 Token error. Will retry after captcha.');
      updateUI('captchaSolving', 'warning');
      await sleep(5000); // small cooldown before retry
      continue;
    }

    console.warn(`⚠️ Batch failed (attempt ${attempt}), retrying...`);
    const delay = Math.min(1000 * 2 ** (attempt - 1), 30000) + Math.random() * 1000;
    await sleep(delay);
  }

  if (!state.stopFlag) {
    console.error(`❌ Failed after ${attempt} attempts. Aborting.`);
  }
  return false;
}
