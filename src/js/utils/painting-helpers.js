import { state } from '../core/state.js';
import { msToTimeText } from './helpers.js';
import { updateUI } from '../ui/panel.js';

export function getMsToTargetCharges(current, target, cooldown, intervalMs = 0) {
  const remainingCharges = target - current;
  return Math.max(0, remainingCharges * cooldown - intervalMs);
}

export function updateChargesThresholdUI(intervalMs) {
  if (state.stopFlag) return;

  const threshold = state.cooldownChargeThreshold;
  const remainingMs = getMsToTargetCharges(
    state.preciseCurrentCharges,
    threshold,
    state.cooldown,
    intervalMs
  );
  const timeText = msToTimeText(remainingMs);

  updateUI(
    'noChargesThreshold',
    'warning',
    {
      threshold,
      current: state.displayCharges,
      time: timeText,
    },
    true
  );
}