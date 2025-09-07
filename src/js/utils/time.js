import { state } from '../core/state.js';
import { getMsToTargetCharges } from './painting-helpers.js';

export function formatTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0 || days > 0) result += `${hours}h `;
  if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m `;
  result += `${seconds}s`;

  return result;
}

export function calculateEstimatedTime() {
  const remainingPixels = state.artTotalPixels - state.userPaintedPixels;
  return getMsToTargetCharges(state.preciseCurrentCharges, remainingPixels, state.cooldown);
}
