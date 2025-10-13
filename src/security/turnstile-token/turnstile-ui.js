import { t } from '../../i18n/index.js';

let _turnstileOverlay = null;

// Interactive overlay container for visible widgets when needed
export function ensureTurnstileOverlayContainer() {
  if (_turnstileOverlay && document.body.contains(_turnstileOverlay)) {
    return _turnstileOverlay;
  }

  const overlay = document.createElement('div');
  overlay.id = 'turnstile-overlay-container';
  overlay.className = 'wplace-turnstile-overlay wplace-overlay-hidden';

  const title = document.createElement('div');
  title.textContent = t('turnstileInstructions');
  title.dataset.i18nKey = 'turnstileInstructions';
  title.className = 'wplace-turnstile-title';

  const host = document.createElement('div');
  host.id = 'turnstile-overlay-host';
  host.className = 'wplace-turnstile-host';

  const hideBtn = document.createElement('button');
  hideBtn.textContent = t('hideTurnstileBtn');
  hideBtn.dataset.i18nKey = 'hideTurnstileBtn';
  hideBtn.className = 'wplace-turnstile-hide-btn';

  hideBtn.addEventListener('click', () => {
    if (overlay && document.body.contains(overlay)) {
      overlay.remove();
    }
  });

  overlay.appendChild(title);
  overlay.appendChild(host);
  overlay.appendChild(hideBtn);
  document.body.appendChild(overlay);

  _turnstileOverlay = overlay;
  return overlay;
}

export function showTurnstileOverlay() {
  if (_turnstileOverlay) {
    _turnstileOverlay.classList.remove('wplace-overlay-hidden');
    _turnstileOverlay.style.display = 'block';
  }
}

export function hideTurnstileOverlay() {
  if (_turnstileOverlay) {
    _turnstileOverlay.classList.add('wplace-overlay-hidden');
    _turnstileOverlay.style.display = 'none';
  }
}

export function cleanupUI() {
  if (_turnstileOverlay && document.body.contains(_turnstileOverlay)) {
    _turnstileOverlay.remove();
  }

  _turnstileOverlay = null;
}
