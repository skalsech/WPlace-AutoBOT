import {
  handleBlockHeightInput,
  handleBlockWidthInput,
  handleCoordinateDirectionChange,
  handleCoordinateModeChange,
  handleCoordinateSnakeChange,
} from '../handlers/settings/coordinate-handler.js';
import { safeOn } from '../../utils/dom.js';
import {
  handleBatchModeChange,
  handleBlueMarbleToggle, handleCloseSettingsClick,
  handleLanguageChange,
  handleOverlayOpacityChange,
  handlePaintSpeedToggle,
  handlePaintTransparentPixelsToggle,
  handlePaintUnavailablePixelsToggle,
  handlePaintWhitePixelsToggle,
  handleRandomBatchMaxInput,
  handleRandomBatchMinInput,
  handleSpeedSliderInput,
  handleThemeChange,
  handleTokenSourceChange,
} from '../handlers/settings/settings-handler.js';
import {
  handleNotificationIntervalInput,
  handleNotificationsEnabledToggle,
  handleNotifyOnChargesReachedToggle,
  handleNotifyOnlyWhenUnfocusedToggle,
  handleRequestNotificationPermission,
  handleTestNotification,
} from '../handlers/settings/notification-handler.js';

export function setupSettingsListeners() {
  const container = document.getElementById('wplace-settings-container');
  if (!container) return;

  // -- Header --
  const closeSettingsBtn = container.querySelector('#closeSettingsBtn');
  safeOn(closeSettingsBtn, 'click', handleCloseSettingsClick);

  // --- Turnstile source ---
  const tokenSourceSelect = container.querySelector('#tokenSourceSelect');
  safeOn(tokenSourceSelect, 'change', handleTokenSourceChange);

  // --- Overlay settings ---
  const overlayOpacitySlider = container.querySelector('#overlayOpacitySlider');
  const enableBlueMarbleToggle = container.querySelector('#enableBlueMarbleToggle');
  safeOn(overlayOpacitySlider, 'input', handleOverlayOpacityChange);
  safeOn(enableBlueMarbleToggle, 'change', handleBlueMarbleToggle);

  // --- Paint Filter Options ---
  const paintUnavailableToggle = container.querySelector('#paintUnavailablePixelsToggle');
  const paintTransparentToggle = container.querySelector('#settingsPaintTransparentToggle');
  const settingsPaintWhiteToggle = container.querySelector('#settingsPaintWhiteToggle');
  safeOn(paintUnavailableToggle, 'change', handlePaintUnavailablePixelsToggle);
  safeOn(paintTransparentToggle, 'change', handlePaintTransparentPixelsToggle);
  safeOn(settingsPaintWhiteToggle, 'change', handlePaintWhitePixelsToggle);

  // --- Batch mode controls ---
  const batchModeSelect = container.querySelector('#batchModeSelect');
  safeOn(batchModeSelect, 'change', handleBatchModeChange);

  // --- Batch size ---
  const speedSlider = container.querySelector('#speedSlider');
  safeOn(speedSlider, 'input', handleSpeedSliderInput);

  const randomBatchMin = container.querySelector('#randomBatchMin');
  const randomBatchMax = container.querySelector('#randomBatchMax');
  safeOn(randomBatchMin, 'input', handleRandomBatchMinInput);
  safeOn(randomBatchMax, 'input', handleRandomBatchMaxInput);

  // --- Paint Speed ---
  const paintSpeedToggle = container.getElementById('enableSpeedToggle');
  safeOn(paintSpeedToggle, 'change', handlePaintSpeedToggle);

  // --- Coordinate Mode ---
  const coordinateModeSelect = container.querySelector('#coordinateModeSelect');
  const coordinateDirectionSelect = container.querySelector('#coordinateDirectionSelect');
  const coordinateSnakeToggle = container.querySelector('#coordinateSnakeToggle');
  const blockWidthInput = container.querySelector('#blockWidthInput');
  const blockHeightInput = container.querySelector('#blockHeightInput');
  safeOn(coordinateModeSelect, 'change', handleCoordinateModeChange);
  safeOn(coordinateDirectionSelect, 'change', handleCoordinateDirectionChange);
  safeOn(coordinateSnakeToggle, 'change', handleCoordinateSnakeChange);
  safeOn(blockWidthInput, 'input', handleBlockWidthInput);
  safeOn(blockHeightInput, 'input', handleBlockHeightInput);

  // --- Notifications ---
  const notifEnabledToggle = container.querySelector('#notifEnabledToggle');
  const notifOnChargesToggle = container.querySelector('#notifOnChargesToggle');
  const notifOnlyUnfocusedToggle = container.querySelector('#notifOnlyUnfocusedToggle');
  const notifIntervalInput = container.querySelector('#notifIntervalInput');

  const notificationPermissionBtn = container.querySelector('#notifRequestPermBtn');
  const notificationTestBtn = container.querySelector('#notifTestBtn');

  safeOn(notifEnabledToggle, 'change', handleNotificationsEnabledToggle);
  safeOn(notifOnChargesToggle, 'change', handleNotifyOnChargesReachedToggle);
  safeOn(notifOnlyUnfocusedToggle, 'change', handleNotifyOnlyWhenUnfocusedToggle);
  safeOn(notifIntervalInput, 'input', handleNotificationIntervalInput);
  safeOn(notificationPermissionBtn, 'click', handleRequestNotificationPermission);
  safeOn(notificationTestBtn, 'click', handleTestNotification);

  // --- Theme ---
  const themeSelect = container.querySelector('#themeSelect');
  safeOn(themeSelect, 'change', handleThemeChange);

  // --- Language ---
  const languageSelect = container.querySelector('#languageSelect');
  safeOn(languageSelect, 'change', handleLanguageChange);
}
