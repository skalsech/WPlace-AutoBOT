import { NotificationManager } from '../../../core/notification-manager.js';
import { t } from '../../../i18n/i18.js';
import { showAlert } from '../../alerts.js';
import { saveBotSettings } from '../../../core/settings-manager.js';
import { state } from '../../../core/state.js';
import { createCheckboxHandler } from '../checkbox-handlers.js';

export const handleNotificationsEnabledToggle = createCheckboxHandler(
  'notificationsEnabled',
  'notificationsEnabledGlobally',
  'notificationsDisabledGlobally'
);

export const handleNotifyOnChargesReachedToggle = createCheckboxHandler(
  'notifyOnChargesReached',
  'notifyOnChargesEnabled',
  'notifyOnChargesDisabled'
);

export const handleNotifyOnlyWhenUnfocusedToggle = createCheckboxHandler(
  'notifyOnlyWhenUnfocused',
  'notifyOnlyUnfocusedEnabled',
  'notifyOnlyUnfocusedDisabled'
);

export function handleNotificationIntervalInput(e) {
  const value = parseInt(e.target.value, 10);
  if (isNaN(value) || value < 1 || value > 60) return;

  state.notificationIntervalMinutes = value;
  saveBotSettings();
  console.log(`⏰ Notification interval set to: ${value} min`);
  showAlert(t('notificationIntervalUpdated', { minutes: value }), 'success');
}

export async function handleRequestNotificationPermission() {
  const perm = await NotificationManager.requestPermission();
  if (perm === 'granted') {
    showAlert(t('notificationsPermissionGranted'), 'success');
  } else {
    showAlert(t('notificationsPermissionDenied'), 'warning');
  }

  NotificationManager.syncFromState();
}

export function handleTestNotification() {
  NotificationManager.notify(
    t('testNotificationTitle'),
    t('testNotificationMessage'),
    'wplace-notify-test',
    true
  );
}