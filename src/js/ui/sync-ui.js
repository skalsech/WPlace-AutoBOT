import { state } from '../core/state.js';
import { UI_BINDINGS, SPECIAL_HANDLERS } from './sync-config.js';

export function syncSettingsUI() {
  for (const binding of UI_BINDINGS) {
    const el = document.querySelector(binding.selector);
    if (el && Object.prototype.hasOwnProperty.call(state, binding.key)) {
      el[binding.prop] = state[binding.key];
    }
  }

  for (const handler of SPECIAL_HANDLERS) {
    if (handler.keys.some((key) => Object.prototype.hasOwnProperty.call(state, key))) {
      handler.update(state);
    }
  }
}
