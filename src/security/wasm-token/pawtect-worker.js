/**
 * pawtect-worker.js
 *
 * Module for high-level interaction with pawtect system
 * Orchestrates injection, communication, and token computation
 */

import { injectIntoMainWorld } from './pawtect-injector.js';
import {
  getMessageId,
  getPawtectError,
  initPawtectBridge,
  isPawtectReady,
  requestPawtectToken,
} from './pawtect-bridge.js';

let pawtectInitialized = false;

/**
 * Initializes the complete pawtect system
 * Injects code into main world and sets up communication bridge
 */
export function initPawtect() {
  if (pawtectInitialized) return;

  // Initialize communication bridge
  initPawtectBridge();

  // Inject code into main world
  injectIntoMainWorld(getMessageId());

  pawtectInitialized = true;
}

/**
 * Computes pawtect token for given URL and JSON body string
 * @param {string} url - Endpoint URL
 * @param {string} bodyStr - JSON string (colors, coords, fp, t)
 * @returns {Promise<string>} Promise resolving to pawtect token
 */
export async function computePawtectToken(url, bodyStr) {
  if (!pawtectInitialized) {
    initPawtect();
  }

  // Wait for system to be ready
  if (!isPawtectReady()) {
    await waitForPawtectReady();
  }

  // Check for errors
  const error = getPawtectError();
  if (error) {
    throw error;
  }

  return await requestPawtectToken(url, bodyStr);
}

/**
 * Waits for pawtect system to become ready
 * @returns {Promise<void>} Promise that resolves when ready
 */
function waitForPawtectReady() {
  return new Promise((resolve, reject) => {
    const checkReady = () => {
      if (isPawtectReady()) {
        resolve();
      } else if (getPawtectError()) {
        reject(getPawtectError());
      } else {
        setTimeout(checkReady, 100);
      }
    };
    checkReady();
  });
}

/**
 * Checks if pawtect system is initialized and ready
 * @returns {boolean} True if ready, false otherwise
 */
export function isPawtectSystemReady() {
  return pawtectInitialized && isPawtectReady();
}

/**
 * Gets the current pawtect error state
 * @returns {Error|null} Error object or null if no error
 */
export function getPawtectSystemError() {
  return getPawtectError();
}

/**
 * Resets the pawtect system state
 */
export function resetPawtectSystem() {
  pawtectInitialized = false;
  if (window.__pawtect_store) {
    window.__pawtect_store = {
      ready: false,
      pendingRequests: [],
      error: null,
    };
  }
}
