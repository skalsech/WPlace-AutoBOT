import { injectLibrary, waitForLibrary } from './inject-library.js';
import { getIntlMessageFormatCode } from './intl-messageformat.js';
import { getFingerprintJSCode } from './fingerprint.js';

/**
 * Loads IntlMessageFormat into global scope
 * @returns {Promise<typeof IntlMessageFormat>}
 */
export async function loadIntlMessageFormat() {
  await injectLibrary(getIntlMessageFormatCode, 'IntlMessageFormat');
  await waitForLibrary('IntlMessageFormat');

  if (!window.IntlMessageFormat) {
    throw new Error('IntlMessageFormat is not available on window');
  }

  console.log('✅ IntlMessageFormat loaded successfully');
  return window.IntlMessageFormat;
}

export async function loadFingerprintJS() {
  await injectLibrary(getFingerprintJSCode, 'FingerprintJS');
  await waitForLibrary('FingerprintJS');

  if (!window.FingerprintJS) {
    throw new Error('IntlMessageFormat is not available on window');
  }

  console.log('✅ FingerprintJS loaded successfully');
  return window.FingerprintJS;
}

export async function loadAllLibraries() {
  await Promise.all([loadIntlMessageFormat(), loadFingerprintJS()]);
}
