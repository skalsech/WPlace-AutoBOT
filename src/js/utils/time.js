import { state } from '../core/state.js';

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

export function calculateEstimatedTime(
  intervalMs = 0,
  efficientAccountsCount = 1,
  normalAccountsCount = 9
) {
  const totalAccounts = normalAccountsCount + efficientAccountsCount;

  const remainingPixels =
    state.artTotalPixels - state.currentPaintedPixels - state.preciseCurrentCharges * totalAccounts;

  const efficiencyRatio = (normalAccountsCount + efficientAccountsCount * 0.9) / totalAccounts;
  const totalChargeCost = efficiencyRatio * remainingPixels;

  const result = (totalChargeCost * state.cooldown) / totalAccounts;

  return Math.max(0, result - intervalMs);
}

export function getMsToTargetCharges(current, target, cooldown, intervalMs = 0) {
  const remainingCharges = target - current;
  return Math.max(0, remainingCharges * cooldown - intervalMs);
}
