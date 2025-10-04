import { isTokenValid } from '../security/turnstile-manager.js';
import { updateUI } from '../ui/panel.js';
import { loadTurnstile } from '../security/turnstile.js';

export function enableFileOperations() {
  const loadBtn = document.querySelector('#loadBtn');
  const loadFromFileBtn = document.querySelector('#loadFromFileBtn');
  const uploadBtn = document.querySelector('#uploadBtn');

  if (loadBtn) {
    loadBtn.disabled = false;
    loadBtn.title = '';

    loadBtn.style.animation = 'pulse 0.6s ease-in-out';
    setTimeout(() => {
      if (loadBtn) loadBtn.style.animation = '';
    }, 600);
  }

  if (loadFromFileBtn) {
    loadFromFileBtn.disabled = false;
    loadFromFileBtn.title = '';

    loadFromFileBtn.style.animation = 'pulse 0.6s ease-in-out';
    setTimeout(() => {
      if (loadFromFileBtn) loadFromFileBtn.style.animation = '';
    }, 600);
  }

  if (uploadBtn) {
    uploadBtn.disabled = false;
    uploadBtn.title = '';

    uploadBtn.style.animation = 'pulse 0.6s ease-in-out';
    setTimeout(() => {
      if (uploadBtn) uploadBtn.style.animation = '';
    }, 600);
  }

  console.log('✅ File operations (Load/Upload) are now available!');
}

export async function initializeTokenGenerator() {
  if (isTokenValid()) {
    console.log('✅ Valid token already available, skipping initialization');
    updateUI('tokenReady', 'success');
    return;
  }

  try {
    updateUI('initializingToken', 'default');

    await loadTurnstile();
    console.log('🔧 Turnstile token generator initialized.');
    updateUI('tokenReady', 'success');
  } catch (error) {
    console.error('❌ Critical error during Turnstile initialization:', error);
    updateUI('tokenRetryLater', 'warning');
  }
}
