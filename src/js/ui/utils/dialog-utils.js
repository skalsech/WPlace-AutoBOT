import { safeEvalMathExpression } from '../../utils/math-utils.js';
import { modifyColorOpacity } from './dom.js';
import { t } from '../../i18n/i18.js';

/**
 * Checks whether the given string is a valid mathematical expression.
 * @param {string} expr - Input string.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function isMathExpressionValid(expr) {
  if (typeof expr !== 'string' || !expr.trim()) {
    return true;
  }
  try {
    const result = safeEvalMathExpression(expr);
    return result === null || (typeof result === 'number' && !isNaN(result));
  } catch {
    return false;
  }
}

/**
 * Handles visual feedback for an input field background.
 * @param {HTMLElement} input - The input element.
 * @param {boolean} isValid - Whether the expression is valid.
 * @param {boolean} wasModified - Whether the value was modified since dialog open.
 * @param {boolean} wasInvalid - Whether the field was invalid before this check.
 */
export function updateInputFeedback(input, isValid, wasModified, wasInvalid) {
  if (isValid) {
    if (wasModified || wasInvalid) {
      const successColor = getComputedStyle(input).getPropertyValue('--wplace-success').trim();
      input.style.transition = 'background-color 0.3s ease';
      input.style.backgroundColor = modifyColorOpacity(successColor, 0.5);

      const timeoutId = setTimeout(() => {
        if (input.dataset.feedbackTimeout === timeoutId.toString()) {
          input.style.backgroundColor = '';
        }
      }, 500);
      input.dataset.feedbackTimeout = timeoutId.toString();
    }
    // todo switch to css classes
    //input.classList.add('wplace-input-valid');
    //input.classList.remove('wplace-input-invalid');
  } else {
    if (!wasInvalid) {
      const errorColor = getComputedStyle(input).getPropertyValue('--wplace-error').trim();
      input.style.backgroundColor = modifyColorOpacity(errorColor, 0.5);
    }
    //input.classList.remove('wplace-input-valid');
    //input.classList.add('wplace-input-invalid');
  }
}

/**
 * Updates the state of the Apply button.
 * @param {HTMLElement | null} applyBtn - The Apply button element.
 * @param {number} errorCount - The number of fields with validation errors.
 */
export function updateApplyButtonState(applyBtn, errorCount) {
  if (!applyBtn) return;
  applyBtn.disabled = errorCount > 0;
  applyBtn.title = errorCount > 0 ? t('applyDisabledDueToErrors') : '';
}
