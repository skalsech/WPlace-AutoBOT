import { state } from './state.js';
import {
  getTurnstileToken,
  handleCaptchaFallback,
  isTokenValid,
  setTurnstileToken,
} from '../security/turnstile-manager.js';
import { executeTurnstile, loadTurnstile, obtainSitekeyAndToken } from '../security/turnstile.js';

export async function handleCaptcha() {
  const startTime = performance.now();

  // Check user's token source preference
  if (state.tokenSource === 'manual') {
    console.log('🎯 Manual token source selected - using pixel placement automation');
    return await handleCaptchaFallback();
  }

  // Generator mode (pure) or Hybrid mode - try generator first
  try {
    // Use optimized token generation with automatic sitekey detection
    const { sitekey, token: preGeneratedToken } = await obtainSitekeyAndToken();

    if (!sitekey) {
      throw new Error('No valid sitekey found');
    }

    console.log('🔑 Generating Turnstile token for sitekey:', sitekey);
    console.log(
      '🧭 UA:',
      navigator.userAgent.substring(0, 50) + '...',
      'Platform:',
      navigator.platform
    );

    // Add additional checks before token generation
    if (!window.turnstile) {
      await loadTurnstile();
    }

    let token = null;

    // ✅ Reuse pre-generated token if available and valid
    if (
      preGeneratedToken &&
      typeof preGeneratedToken === 'string' &&
      preGeneratedToken.length > 20
    ) {
      console.log('♻️ Reusing pre-generated token from sitekey detection phase');
      token = preGeneratedToken;
    }
    // ✅ Or use globally cached token if still valid
    else if (isTokenValid()) {
      console.log('♻️ Using existing cached token (from previous operation)');
      token = getTurnstileToken();
    }
    // ✅ Otherwise generate a new one
    else {
      console.log('🔐 No valid pre-generated or cached token, creating new one...');
      token = await executeTurnstile(sitekey, 'paint');
      if (token) {
        setTurnstileToken(token);
      }
    }

    // 📊 Debug log
    console.log(
      `🔍 Token received - Type: ${typeof token}, Value: ${
        token
          ? typeof token === 'string'
            ? token.length > 50
              ? token.substring(0, 50) + '...'
              : token
            : JSON.stringify(token)
          : 'null/undefined'
      }, Length: ${token?.length || 0}`
    );

    // ✅ Final validation
    if (typeof token === 'string' && token.length > 20) {
      const duration = Math.round(performance.now() - startTime);
      console.log(`✅ Turnstile token generated successfully in ${duration}ms`);
      return token;
    } else {
      throw new Error(
        `Invalid or empty token received - Type: ${typeof token}, Value: ${JSON.stringify(
          token
        )}, Length: ${token?.length || 0}`
      );
    }
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    console.error(`❌ Turnstile token generation failed after ${duration}ms:`, error);

    // Fallback to manual pixel placement for hybrid mode
    if (state.tokenSource === 'hybrid') {
      console.log(
        '🔄 Hybrid mode: Generator failed, automatically switching to manual pixel placement...'
      );
      const fbToken = await handleCaptchaFallback();
      return fbToken;
    } else {
      // Pure generator mode - don't fallback, just fail
      throw error;
    }
  }
}
