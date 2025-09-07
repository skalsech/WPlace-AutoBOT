// Desktop Notification Manager
import { showAlert } from '../ui/alerts.js';
import { t } from '../i18n/i18.js';
import { state } from './state.js';
import { WPlaceService } from './api-service.js';

export const NotificationManager = {
  pollTimer: null,
  pollIntervalMs: 60_000,
  icon() {
    const link = document.querySelector("link[rel~='icon']");
    return link?.href || location.origin + '/favicon.ico';
  },
  async requestPermission() {
    if (!('Notification' in window)) {
      showAlert(t('notificationsNotSupported'), 'warning');
      return 'denied';
    }
    if (Notification.permission === 'granted') return 'granted';
    try {
      return await Notification.requestPermission();
    } catch {
      return Notification.permission;
    }
  },
  canNotify() {
    return (
      state.notificationsEnabled &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    );
  },
  notify(title, body, tag = 'wplace-charges', force = false) {
    if (!this.canNotify()) return false;
    if (!force && state.notifyOnlyWhenUnfocused && document.hasFocus()) return false;
    try {
      new Notification(title, {
        body,
        tag,
        renotify: true,
        icon: this.icon(),
        badge: this.icon(),
        silent: false,
      });
      return true;
    } catch {
      // Graceful fallback
      showAlert(body, 'info');
      return false;
    }
  },
  resetEdgeTracking() {
    state._lastChargesBelow = state.displayCharges < state.cooldownChargeThreshold;
    state._lastChargesNotifyAt = 0;
  },
  maybeNotifyChargesReached(force = false) {
    if (!state.notificationsEnabled || !state.notifyOnChargesReached) return;
    const reached = state.displayCharges >= state.cooldownChargeThreshold;
    const now = Date.now();
    const repeatMs = Math.max(1, Number(state.notificationIntervalMinutes || 5)) * 60_000;
    if (reached) {
      const shouldEdge = state._lastChargesBelow || force;
      const shouldRepeat = now - (state._lastChargesNotifyAt || 0) >= repeatMs;
      if (shouldEdge || shouldRepeat) {
        const msg = t('chargesReadyMessage', {
          current: state.displayCharges,
          max: state.maxCharges,
          threshold: state.cooldownChargeThreshold,
        });
        this.notify(t('chargesReadyNotification'), msg, 'wplace-notify-charges');
        state._lastChargesNotifyAt = now;
      }
      state._lastChargesBelow = false;
    } else {
      state._lastChargesBelow = true;
    }
  },
  startPolling() {
    this.stopPolling();
    if (!state.notificationsEnabled || !state.notifyOnChargesReached) return;
    // lightweight background polling
    this.pollTimer = setInterval(async () => {
      try {
        const { charges, cooldown, max } = await WPlaceService.getCharges();
        state.displayCharges = Math.floor(charges);
        state.cooldown = cooldown;
        state.maxCharges = Math.max(1, Math.floor(max));
        this.maybeNotifyChargesReached();
      } catch {
        /* ignore */
      }
    }, this.pollIntervalMs);
  },
  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  },
  syncFromState() {
    this.resetEdgeTracking();
    if (state.notificationsEnabled && state.notifyOnChargesReached) this.startPolling();
    else this.stopPolling();
  },
};
