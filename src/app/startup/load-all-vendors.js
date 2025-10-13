import { loadFingerprintJS, loadIntlMessageFormat } from '../../vendor/vendor-loaders.js';

export async function loadAllLibraries() {
  await Promise.all([loadIntlMessageFormat(), loadFingerprintJS()]);
}
