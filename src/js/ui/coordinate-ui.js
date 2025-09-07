export function updateCoordinateUI({ mode, directionControls, snakeControls, blockControls }) {
  const isLinear = mode === 'rows' || mode === 'columns';
  const isBlock = mode === 'blocks' || mode === 'shuffle-blocks';

  if (directionControls) directionControls.style.display = isLinear ? 'block' : 'none';
  if (snakeControls) snakeControls.style.display = isLinear ? 'block' : 'none';
  if (blockControls) blockControls.style.display = isBlock ? 'block' : 'none';
}
