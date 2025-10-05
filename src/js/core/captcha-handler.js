import { state } from './state.js';
import { handleCaptchaFallback, setTurnstileToken } from '../security/turnstile-manager.js';
import { executeTurnstile, loadTurnstile, obtainSitekey } from '../security/turnstile.js';

export async function handleCaptcha() {
  const startTime = performance.now();

  if (state.tokenSource === 'manual') {
    console.log('🎯 Manual token source selected - using pixel placement automation');
    return await handleCaptchaFallback();
  }

  // Generator mode (pure) or Hybrid mode - always generate fresh token
  try {
    const sitekey = await obtainSitekey();
    if (!sitekey) {
      throw new Error('No valid sitekey found');
    }
    console.log('🔑 Generating Turnstile token for sitekey:', sitekey);

    if (!window.turnstile) {
      await loadTurnstile();
    }

    const token = await executeTurnstile(sitekey, 'paint');
    if (!token || typeof token !== 'string' || token.length < 20) {
      throw new Error(`Invalid token received: ${JSON.stringify(token)}`);
    }
    setTurnstileToken(token);

    if (token.length > 20) {
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

    if (state.tokenSource === 'hybrid') {
      console.log(
        '🔄 Hybrid mode: Generator failed, automatically switching to manual pixel placement...'
      );
      return await handleCaptchaFallback();
    } else {
      throw error;
    }
  }
}
