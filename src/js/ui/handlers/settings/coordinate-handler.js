import { state } from '../../../core/state.js';
import { saveBotSettings } from '../../../storage/settings-manager.js';
import { showAlert } from '../../alerts.js';
import { t } from '../../../i18n/i18.js';
import { updateCoordinateUI } from './coordinate-ui.js';

export function handleCoordinateModeChange(e) {
  state.coordinateMode = e.target.value;
  updateCoordinateUI({
    mode: state.coordinateMode,
    directionControls: document.getElementById('directionControls'),
    snakeControls: document.getElementById('snakeControls'),
    blockControls: document.getElementById('blockControls'),
  });
  saveBotSettings();
  console.log(`🔄 Coordinate mode changed to: ${state.coordinateMode}`);
  showAlert(
    t('coordinateModeSet', { mode: t(`mode${capitalize(state.coordinateMode)}`) }),
    'success'
  );
}

export function handleCoordinateDirectionChange(e) {
  state.coordinateDirection = e.target.value;
  saveBotSettings();
  console.log(`🧭 Coordinate direction changed to: ${state.coordinateDirection}`);
  showAlert(t('coordinateDirectionSet', { direction: t(state.coordinateDirection) }), 'success');
}

export function handleCoordinateSnakeChange(e) {
  state.coordinateSnake = e.target.checked;
  saveBotSettings();
  console.log(`🐍 Snake pattern ${state.coordinateSnake ? 'enabled' : 'disabled'}`);
  showAlert(t(state.coordinateSnake ? 'snakeEnabled' : 'snakeDisabled'), 'success');
}

export function handleSortCoordinateByFrequencyChange(e) {
  state.sortCoordinateByFrequency = e.target.checked;
  saveBotSettings();
  console.log(`SortCoordinateByFrequency ${e.target.checked ? 'enabled' : 'disabled'}`);
  showAlert(
    t(e.target.checked ? 'SortCoordinateByFrequencyEnabled' : 'SortCoordinateByFrequencyDisabled'),
    'success'
  );
}

export function handleBlockWidthInput(e) {
  const width = parseInt(e.target.value, 10);
  if (width >= 1 && width <= 50) {
    state.blockWidth = width;
    saveBotSettings();
  }
}

export function handleBlockHeightInput(e) {
  const height = parseInt(e.target.value, 10);
  if (height >= 1 && height <= 50) {
    state.blockHeight = height;
    saveBotSettings();
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
