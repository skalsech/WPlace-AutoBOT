import { makeDraggable } from '../../../app/startup/create-ui.js';
import { safeEvalMathExpression } from '../../../utils/math-utils.js';
import {
  isMathExpressionValid,
  updateApplyButtonState,
  updateInputFeedback,
} from '../../utils/dialog-utils.js';

export class StartPositionDialog {
  constructor() {
    this.dialog = null;
    this.applyBtn = null;
    this.closeBtn = null;
    this.inputElements = {};
    this.errorFields = new Set();
    this.initialValues = {};
    this.selectionController = null;
  }

  open(createDialogFn, selectionControllerInstance = null) {
    if (this.dialog?.style.display === 'block') return;

    if (!this.dialog) {
      this.dialog = createDialogFn();
      document.body.appendChild(this.dialog);
      makeDraggable(this.dialog);
      this._attachDialogListeners();
    }

    this.selectionController = selectionControllerInstance;
    this.errorFields.clear();
    this._updateApplyButton();
    this.dialog.style.display = 'block';
  }

  close() {
    if (this.dialog) {
      this.dialog.style.display = 'none';
      this.selectionController?.cleanup();
      this.selectionController = null;
    }
  }

  setValues(region, position) {
    if (!this.dialog) return;
    this.inputElements.startPosTileX.value = region?.x ?? '';
    this.inputElements.startPosTileY.value = region?.y ?? '';
    this.inputElements.startPosPixelX.value = position?.x ?? '';
    this.inputElements.startPosPixelY.value = position?.y ?? '';
  }

  saveInitialValues(region, position) {
    if (!this.dialog) return;
    this.initialValues = {
      startPosTileX: (region?.x ?? '').toString(),
      startPosTileY: (region?.y ?? '').toString(),
      startPosPixelX: (position?.x ?? '').toString(),
      startPosPixelY: (position?.y ?? '').toString(),
    };
  }

  isValueModified(inputId) {
    if (!this.initialValues) return false;
    const currentValue = this.inputElements[inputId]?.value;
    return currentValue !== this.initialValues[inputId];
  }

  _attachDialogListeners() {
    this.closeBtn = document.getElementById('closeStartPositionDialogBtn');
    this.applyBtn = document.getElementById('applyStartPositionBtn');

    const inputIds = ['startPosTileX', 'startPosTileY', 'startPosPixelX', 'startPosPixelY'];
    inputIds.forEach((id) => {
      this.inputElements[id] = document.getElementById(id);
      if (this.inputElements[id]) {
        this.inputElements[id].addEventListener('blur', () =>
          this._evaluateInput(this.inputElements[id])
        );
        this.inputElements[id].addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this._evaluateInput(this.inputElements[id]);
          }
        });
      }
    });

    this.closeBtn?.addEventListener('click', () => this.close());
  }

  _evaluateInput(input) {
    const originalValue = input.value.trim();
    const inputId = input.id;

    if (originalValue === '') {
      input.style.backgroundColor = '';
      delete input.dataset.feedbackTimeout;
      this._removeError(inputId);
      this._updateApplyButton();
      return;
    }

    const isValid = isMathExpressionValid(originalValue);
    const wasInvalid = this.errorFields.has(inputId);
    const wasModified = this.isValueModified(inputId);

    updateInputFeedback(input, isValid, wasModified, wasInvalid);

    if (isValid) {
      if (wasModified || wasInvalid) {
        try {
          const result = safeEvalMathExpression(originalValue);
          if (result !== null) {
            input.value = result.toString();
          }
        } catch (e) {
          console.error('Unexpected error in safeEvalMathExpression during update:', e);
        }
      }
      this._removeError(inputId);
    } else {
      this._addError(inputId);
      console.warn(`Math expression error in ${inputId}:`, originalValue);
    }

    this._updateApplyButton();
  }

  _addError(inputId) {
    this.errorFields.add(inputId);
  }

  _removeError(inputId) {
    this.errorFields.delete(inputId);
  }

  _updateApplyButton() {
    updateApplyButtonState(this.applyBtn, this.errorFields.size);
  }

  getApplyBtn() {
    return this.applyBtn;
  }
  getDialog() {
    return this.dialog;
  }
  getErrorFields() {
    return this.errorFields;
  }
  getInputValue(id) {
    return this.inputElements[id]?.value ?? null;
  }
}
