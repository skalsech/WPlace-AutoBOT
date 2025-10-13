import { state } from '../core/state.js';
import { msToTimeText } from './helpers.js';
import { updateUI } from '../app/startup/create-ui.js';
import { getMsToTargetCharges } from './time.js';

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
