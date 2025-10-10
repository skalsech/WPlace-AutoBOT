import { state } from '../../core/state.js';
import { showAlert } from '../alerts.js';
import { makeDraggable, updateUI } from '../panel.js';
import { t } from '../../i18n/i18.js';
import { wplaceUI } from '../../core/wplace-ui.js';
import { createStartPositionDialog } from '../components/create-start-position-dialog.js';
import { overlayManager } from '../../tiles/overlay-manager.js';
import { SelectionController } from '../../core/selection-controller.js';

/** @type {HTMLElement | null} */
let startPositionDialog = null;
/** @type {SelectionController | null} */
let selectionController = null;
/** @type {HTMLElement | null} */
let selectPosBtn = null;

function setDialogValues(region, position) {
  document.getElementById('startPosTileX').value = region?.x ?? '';
  document.getElementById('startPosTileY').value = region?.y ?? '';
  document.getElementById('startPosPixelX').value = position?.x ?? '';
  document.getElementById('startPosPixelY').value = position?.y ?? '';
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

function openDialog() {
  if (startPositionDialog?.style.display === 'block') return;

  if (!startPositionDialog) {
    startPositionDialog = createStartPositionDialog();
    document.body.appendChild(startPositionDialog);
    makeDraggable(startPositionDialog);
    attachDialogListeners();
  }

  setDialogValues(state.region, state.startPosition);
  startPositionDialog.style.display = 'block';
}

function attachDialogListeners() {
  const closeBtn = document.getElementById('closeStartPositionDialogBtn');
  const applyBtn = document.getElementById('applyStartPositionBtn');

  closeBtn?.addEventListener('click', () => {
    startPositionDialog.style.display = 'none';
  });

  applyBtn?.addEventListener('click', onDialogApply);
}

async function onDialogApply() {
  const parseInput = (id) => {
    const val = document.getElementById(id).value;
    return val === '' ? null : Number.parseInt(val, 10);
  };

  const tileX = parseInput('startPosTileX');
  const tileY = parseInput('startPosTileY');
  const pixelX = parseInput('startPosPixelX');
  const pixelY = parseInput('startPosPixelY');

  const isValid = [tileX, tileY, pixelX, pixelY].every(
    (v) => v === null || (Number.isInteger(v) && v >= 0)
  );

  if (!isValid) {
    showAlert(t('invalidPositionValues'), 'error');
    return;
  }

  state.region = {
    x: tileX ?? state.region?.x ?? 0,
    y: tileY ?? state.region?.y ?? 0,
  };

  state.startPosition = {
    x: pixelX ?? state.startPosition?.x ?? 0,
    y: pixelY ?? state.startPosition?.y ?? 0,
  };

  try {
    await overlayManager.setPosition(state.startPosition, state.region);
    await wplaceUI.forceRefreshCanvas();
  } catch (error) {
    console.warn('⚠️ Error during forceRefreshCanvas():', error);
  }

  onPositionSet();
}

export function onPositionSet() {
  selectionController?.restoreControlButton();
  updateUI('positionSet', 'success');
  updateSelectPositionButton(true);

  if (startPositionDialog?.style.display === 'block') {
    setDialogValues(state.region, state.startPosition);
  }

  selectionController?.cleanup();
}

export function setupStartPositionButton() {
  selectPosBtn = document.getElementById('selectPosBtn');
  if (!selectPosBtn) return;

  const hasPosition = !!(state.startPosition && state.region);
  updateSelectPositionButton(hasPosition);
}

export function handleSelectPositionClick() {
  const hasPosition = !!(state.startPosition && state.region);
  if (!hasPosition) {
    selectionController = new SelectionController();
    selectionController.enable();
  }
  openDialog();
}
