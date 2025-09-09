/**
 * Handles width/height slider input and aspect ratio logic.
 * Manages drag state for preview optimization.
 */
export function createSizeHandlers({
  widthSlider,
  heightSlider,
  keepAspect,
  baseWidth,
  baseHeight,
  state,
  saveBotSettings,
  updatePreview,
  applyZoom,
  computeFitZoom,
}) {
  let isDraggingSize = false;
  let pendingSave = null;

  const onWidthInput = () => {
    if (keepAspect.checked) {
      // noinspection UnnecessaryLocalVariableJS
      const newHeight = Math.round(parseInt(widthSlider.value, 10) / (baseWidth / baseHeight));
      heightSlider.value = newHeight;
    }
    updatePreview();
  };

  const onHeightInput = () => {
    if (keepAspect.checked) {
      // noinspection UnnecessaryLocalVariableJS
      const newWidth = Math.round(parseInt(heightSlider.value, 10) * (baseWidth / baseHeight));
      widthSlider.value = newWidth;
    }
    updatePreview();
  };

  const syncStateAndZoom = () => {
    const curW = parseInt(widthSlider.value, 10);
    const curH = parseInt(heightSlider.value, 10);
    state.resizeSettings = { baseWidth, baseHeight, width: curW, height: curH };

    const fit = typeof computeFitZoom === 'function' ? computeFitZoom() : 1;
    if (!isNaN(fit) && isFinite(fit)) applyZoom(fit);
  };

  const saveSettings = () => {
    if (pendingSave) clearTimeout(pendingSave);
    pendingSave = null;
    saveBotSettings();
  };

  const markDragStart = () => {
    isDraggingSize = true;
    if (pendingSave) clearTimeout(pendingSave);
  };

  const markDragEnd = () => {
    isDraggingSize = false;
    syncStateAndZoom();
    saveSettings();
  };

  const bind = () => {
    const on = (el, ev, fn) => el?.addEventListener(ev, fn);
    const off = (el, ev, fn) => el?.removeEventListener(ev, fn);

    on(widthSlider, 'pointerdown', markDragStart);
    on(heightSlider, 'pointerdown', markDragStart);
    on(widthSlider, 'pointerup', markDragEnd);
    on(heightSlider, 'pointerup', markDragEnd);
    on(widthSlider, 'input', onWidthInput);
    on(heightSlider, 'input', onHeightInput);

    return () => {
      off(widthSlider, 'pointerdown', markDragStart);
      off(heightSlider, 'pointerdown', markDragStart);
      off(widthSlider, 'pointerup', markDragEnd);
      off(heightSlider, 'pointerup', markDragEnd);
      off(widthSlider, 'input', onWidthInput);
      off(heightSlider, 'input', onHeightInput);
    };
  };

  return {
    bind,
    get isDraggingSize() {
      return isDraggingSize;
    },
  };
}
