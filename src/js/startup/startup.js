// Function to enable file operations after initial startup setup is complete
function enableFileOperations() {
  state.initialSetupComplete = true;

  const loadBtn = document.querySelector('#loadBtn');
  const loadFromFileBtn = document.querySelector('#loadFromFileBtn');
  const uploadBtn = document.querySelector('#uploadBtn');

  if (loadBtn) {
    loadBtn.disabled = false;
    loadBtn.title = '';
    // Add a subtle animation to indicate the button is now available
    loadBtn.style.animation = 'pulse 0.6s ease-in-out';
    setTimeout(() => {
      if (loadBtn) loadBtn.style.animation = '';
    }, 600);
  }

  if (loadFromFileBtn) {
    loadFromFileBtn.disabled = false;
    loadFromFileBtn.title = '';
    // Add a subtle animation to indicate the button is now available
    loadFromFileBtn.style.animation = 'pulse 0.6s ease-in-out';
    setTimeout(() => {
      if (loadFromFileBtn) loadFromFileBtn.style.animation = '';
    }, 600);
  }

  if (uploadBtn) {
    uploadBtn.disabled = false;
    uploadBtn.title = '';
    // Add a subtle animation to indicate the button is now available
    uploadBtn.style.animation = 'pulse 0.6s ease-in-out';
    setTimeout(() => {
      if (uploadBtn) uploadBtn.style.animation = '';
    }, 600);
  }

  // Show a notification that file operations are now available
  showAlert(t('fileOperationsAvailable'), 'success');
  console.log('✅ File operations (Load/Upload) are now available!');
}

// Optimized token initialization with better timing and error handling
export async function initializeTokenGenerator() {
  // Skip if already have valid token
  if (isTokenValid()) {
    console.log('✅ Valid token already available, skipping initialization');
    updateUI('tokenReady', 'success');
    enableFileOperations(); // Enable file operations since initial setup is complete
    return;
  }

  try {
    console.log('🔧 Initializing Turnstile token generator...');
    updateUI('initializingToken', 'default');

    console.log('Attempting to load Turnstile script...');
    await loadTurnstile();
    console.log('Turnstile script loaded. Attempting to generate token...');

    const token = await handleCaptchaWithRetry();
    if (token) {
      setTurnstileToken(token);
      console.log('✅ Startup token generated successfully');
      updateUI('tokenReady', 'success');
      showAlert(t('tokenGeneratorReady'), 'success');
      enableFileOperations(); // Enable file operations since initial setup is complete
    } else {
      console.warn(
        '⚠️ Startup token generation failed (no token received), will retry when needed'
      );
      updateUI('tokenRetryLater', 'warning');
      // Still enable file operations even if initial token generation fails
      // Users can load progress and use manual/hybrid modes
      enableFileOperations();
    }
  } catch (error) {
    console.error('❌ Critical error during Turnstile initialization:', error); // More specific error
    updateUI('tokenRetryLater', 'warning');
    // Still enable file operations even if initial setup fails
    // Users can load progress and use manual/hybrid modes
    enableFileOperations();
    // Don't show error alert for initialization failures, just log them
  }
}
