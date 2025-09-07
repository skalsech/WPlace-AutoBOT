// WPLACE API SERVICE
export const WPlaceService = {
  async paintPixelInRegion(regionX, regionY, pixelX, pixelY, color) {
    try {
      await ensureToken();
      if (!turnstileToken) return 'token_error';
      const payload = {
        coords: [pixelX, pixelY],
        colors: [color],
        t: turnstileToken,
      };
      const res = await fetch(`https://backend.wplace.live/s0/pixel/${regionX}/${regionY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (res.status === 403) {
        console.error('❌ 403 Forbidden. Turnstile token might be invalid or expired.');
        turnstileToken = null;
        tokenPromise = new Promise((resolve) => {
          _resolveToken = resolve;
        });
        return 'token_error';
      }
      const data = await res.json();
      return data?.painted === 1;
    } catch (e) {
      console.error('Paint request failed:', e);
      return false;
    }
  },

  async getCharges() {
    const defaultResult = {
      charges: 0,
      max: 1,
      cooldown: CONFIG.COOLDOWN_DEFAULT,
    };

    try {
      const res = await fetch('https://backend.wplace.live/me', {
        credentials: 'include',
      });

      if (!res.ok) {
        console.error(`Failed to get charges: HTTP ${res.status}`);
        return defaultResult;
      }

      const data = await res.json();

      return {
        charges: data.charges?.count ?? 0,
        max: data.charges?.max ?? 1,
        cooldown: data.charges?.cooldownMs ?? CONFIG.COOLDOWN_DEFAULT,
      };
    } catch (e) {
      console.error('Failed to get charges:', e);
      return defaultResult;
    }
  },
};
