import { state } from '../../core/state.js';
import { showAlert } from '../alerts.js';
import { updateUI } from '../panel.js';
import { t } from '../../i18n/i18.js';
import { wplaceUI } from '../../core/wplace-ui.js';
import { createStartPositionDialog } from '../components/create-start-position-dialog.js';
import { overlayManager } from '../../tiles/overlay-manager.js';
import { SelectionController } from '../../core/selection-controller.js';
import { safeEvalMathExpression } from '../../utils/math-utils.js';
import { StartPositionDialog } from '../dialogs/StartPositionDialog.js';

const startPositionDialogInstance = new StartPositionDialog();

let selectPosBtn = null;

async function _applyDialogChanges() {
  const parseInput = (id) => {
    const value = startPositionDialogInstance.getInputValue(id);
    if (!value) return null;
    try {
      return safeEvalMathExpression(value.trim());
    } catch (error) {
      throw new Error(`Invalid expression in ${id}: ${error.message}`);
    }
  };

  let tileX, tileY, pixelX, pixelY;
  try {
    tileX = parseInput('startPosTileX');
    tileY = parseInput('startPosTileY');
    pixelX = parseInput('startPosPixelX');
    pixelY = parseInput('startPosPixelY');
  } catch (error) {
    showAlert(error.message, 'error');
    return false;
  }

  const isValid = [tileX, tileY, pixelX, pixelY].every(
    (v) => v === null || (Number.isInteger(v) && v >= 0)
  );

  if (!isValid) {
    showAlert(t('invalidPositionValues'), 'error');
    return false;
  }

  state.update({
    region: {
      x: tileX ?? state.region?.x ?? 0,
      y: tileY ?? state.region?.y ?? 0,
    },
    startPosition: {
      x: pixelX ?? state.startPosition?.x ?? 0,
      y: pixelY ?? state.startPosition?.y ?? 0,
    },
  });

  try {
    await overlayManager.setPosition(state.startPosition, state.region);
    await wplaceUI.forceRefreshCanvas();
  } catch (error) {
    console.warn('⚠️ Error during forceRefreshCanvas():', error);
  }
  return true;
}

export function onPositionSet() {
  updateUI('positionSet', 'success');
  updateSelectPositionButton(!!(state.startPosition && state.region));

  if (startPositionDialogInstance.getDialog()?.style.display === 'block') {
    startPositionDialogInstance.setValues(state.region, state.startPosition);
    startPositionDialogInstance.saveInitialValues(state.region, state.startPosition);
  }
}

export function setupStartPositionButton() {
  selectPosBtn = document.getElementById('selectPosBtn');
  if (!selectPosBtn) return;

  const hasPosition = !!(state.startPosition && state.region);
  updateSelectPositionButton(hasPosition);
}

export function handleSelectPositionClick() {
  const hasPosition = !!(state.startPosition && state.region);
  let selectionControllerInstance = null;
  if (!hasPosition) {
    selectionControllerInstance = new SelectionController();
    selectionControllerInstance.enable();
  }

  startPositionDialogInstance.open(createStartPositionDialog, selectionControllerInstance);
  startPositionDialogInstance.setValues(state.region, state.startPosition);
  startPositionDialogInstance.saveInitialValues(state.region, state.startPosition);

  const applyBtn = startPositionDialogInstance.getApplyBtn();
  if (applyBtn) {
    applyBtn.onclick = async () => {
      if (await _applyDialogChanges()) {
        onPositionSet();
      }
    };
  }
}

function updateSelectPositionButton(hasPosition) {
  if (!selectPosBtn) return;

  const icon = hasPosition ? 'fa-edit' : 'fa-crosshairs';
  const textKey = hasPosition ? 'editPosition' : 'selectPosition';
  const mainClass = hasPosition ? 'wplace-btn-primary' : 'wplace-btn-select';
  const altClass = hasPosition ? 'wplace-btn-select' : 'wplace-btn-primary';

  selectPosBtn.innerHTML = `
    <i class="fas ${icon}"></i>
    <span data-i18n-key="${textKey}">${t(textKey)}</span>
  `;
  selectPosBtn.classList.add(mainClass);
  selectPosBtn.classList.remove(altClass);
}
