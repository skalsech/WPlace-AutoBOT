/**
 * Handles mask painting interactions: brush, row/column fill, mode toggles.
 * Pure event controller with no DOM assumptions beyond provided elements.
 */
export function createMaskEvents({
  resizeContainer,
  baseCanvas,
  maskCanvas,
  state,
  saveBotSettings,
  maskOverlay, // { getMaskData, markDirty, flushDirty, ensureOverlayBuffers }
  mapClientToPixel,
}) {
  let draggingMask = false;
  let brushSize = 1;
  let rowColSize = 1;
  let maskMode = 'ignore';

  const elements = {
    brush: resizeContainer.querySelector('#maskBrushSize'),
    brushVal: resizeContainer.querySelector('#maskBrushSizeValue'),
    rowColSize: resizeContainer.querySelector('#rowColSize'),
    rowColSizeVal: resizeContainer.querySelector('#rowColSizeValue'),
    ignore: resizeContainer.querySelector('#maskModeIgnore'),
    unignore: resizeContainer.querySelector('#maskModeUnignore'),
    toggle: resizeContainer.querySelector('#maskModeToggle'),
    clear: resizeContainer.querySelector('#clearIgnoredBtn'),
    invert: resizeContainer.querySelector('#invertMaskBtn'),
  };

  const updateModeButtons = () => {
    const modes = /** @type {[HTMLElement, string][]} */ ([
      [elements.ignore, 'ignore'],
      [elements.unignore, 'unignore'],
      [elements.toggle, 'toggle'],
    ]);
    for (const [el, mode] of modes) {
      if (!el) continue;
      const active = maskMode === mode;
      el.classList.toggle('active', active);
      el.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  };

  const ensureMask = (w, h) => {
    const len = w * h;
    if (!state.resizeIgnoreMask || state.resizeIgnoreMask.length !== len) {
      state.update({
        resizeIgnoreMask: new Uint8Array(len),
      });
    }
  };

  /**
   * @param {number} cx
   * @param {number} cy
   * @param {number} radius
   */
  const paintCircle = (cx, cy, radius) => {
    const w = baseCanvas.width;
    const h = baseCanvas.height;
    ensureMask(w, h);
    const r2 = radius * radius;
    const md = maskOverlay.getMaskData();

    for (let yy = cy - radius; yy <= cy + radius; yy++) {
      if (yy < 0 || yy >= h) continue;
      for (let xx = cx - radius; xx <= cx + radius; xx++) {
        if (xx < 0 || xx >= w) continue;
        const dx = xx - cx;
        const dy = yy - cy;
        if (dx * dx + dy * dy > r2) continue;

        const idx = yy * w + xx;
        let val = 0;
        if (maskMode === 'toggle') val = state.resizeIgnoreMask[idx] ? 0 : 1;
        else if (maskMode === 'ignore') val = 1;
        else if (maskMode === 'unignore') val = 0;

        const newResizeIgnoreMask = structuredClone(state.resizeIgnoreMask);
        newResizeIgnoreMask[idx] = val;
        state.update({ resizeIgnoreMask: newResizeIgnoreMask });
        if (md) {
          const p = idx * 4;
          md[p] = val ? 255 : 0;
          md[p + 1] = 0;
          md[p + 2] = 0;
          md[p + 3] = val ? 150 : 0;
          maskOverlay.markDirty(xx, yy);
        }
      }
    }
  };

  /**
   * Paint entire row(s) centered at `y`
   * @param {number} y
   */
  const paintRow = (y) => {
    const w = baseCanvas.width;
    const h = baseCanvas.height;
    ensureMask(w, h);
    if (y < 0 || y >= h) return;

    const half = Math.floor(rowColSize / 2);
    const startY = Math.max(0, y - half);
    const endY = Math.min(h - 1, y + half);
    const md = maskOverlay.getMaskData();

    for (let rowY = startY; rowY <= endY; rowY++) {
      for (let x = 0; x < w; x++) {
        const idx = rowY * w + x;
        let val = 0;
        if (maskMode === 'toggle') val = state.resizeIgnoreMask[idx] ? 0 : 1;
        else if (maskMode === 'ignore') val = 1;
        else if (maskMode === 'unignore') val = 0;

        const newResizeIgnoreMask = structuredClone(state.resizeIgnoreMask);
        newResizeIgnoreMask[idx] = val;
        state.update({ resizeIgnoreMask: newResizeIgnoreMask });
        if (md) {
          const p = idx * 4;
          md[p] = val ? 255 : 0;
          md[p + 1] = 0;
          md[p + 2] = 0;
          md[p + 3] = val ? 150 : 0;
        }
      }
      if (md) {
        maskOverlay.markDirty(0, rowY);
        maskOverlay.markDirty(w - 1, rowY);
      }
    }
  };

  /**
   * Paint entire column(s) centered at `x`
   * @param {number} x
   */
  const paintColumn = (x) => {
    const w = baseCanvas.width;
    const h = baseCanvas.height;
    ensureMask(w, h);
    if (x < 0 || x >= w) return;

    const half = Math.floor(rowColSize / 2);
    const startX = Math.max(0, x - half);
    const endX = Math.min(w - 1, x + half);
    const md = maskOverlay.getMaskData();

    for (let colX = startX; colX <= endX; colX++) {
      for (let y = 0; y < h; y++) {
        const idx = y * w + colX;
        let val = 0;
        if (maskMode === 'toggle') val = state.resizeIgnoreMask[idx] ? 0 : 1;
        else if (maskMode === 'ignore') val = 1;
        else if (maskMode === 'unignore') val = 0;

        const newResizeIgnoreMask = structuredClone(state.resizeIgnoreMask);
        newResizeIgnoreMask[idx] = val;
        state.update({ resizeIgnoreMask: newResizeIgnoreMask });
        if (md) {
          const p = idx * 4;
          md[p] = val ? 255 : 0;
          md[p + 1] = 0;
          md[p + 2] = 0;
          md[p + 3] = val ? 150 : 0;
        }
      }
      if (md) {
        maskOverlay.markDirty(colX, 0);
        maskOverlay.markDirty(colX, h - 1);
      }
    }
  };

  const redraw = () => maskOverlay.flushDirty();

  const handleBrushChange = () => {
    brushSize = parseInt(elements.brush.value, 10) || 1;
    elements.brushVal.textContent = brushSize;
  };

  const handleRowColSizeChange = () => {
    rowColSize = parseInt(elements.rowColSize.value, 10) || 1;
    elements.rowColSizeVal.textContent = rowColSize;
  };

  const setMaskMode = (mode) => {
    maskMode = mode;
    updateModeButtons();
  };

  const handlePaint = (e) => {
    // Ignore right/middle click
    if (e.buttons & 2 || e.buttons & 4) return;

    const { x, y } = mapClientToPixel(e.clientX, e.clientY);
    const w = baseCanvas.width;
    const h = baseCanvas.height;

    if (x < 0 || y < 0 || x >= w || y >= h) return;

    if (e.shiftKey) {
      paintRow(y);
    } else if (e.altKey) {
      paintColumn(x);
    } else {
      const radius = Math.max(1, Math.floor(brushSize / 2));
      paintCircle(x, y, radius);
    }
    redraw();
  };

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    draggingMask = true;
    handlePaint(e);
  };

  const onMouseMove = (e) => {
    if (draggingMask) handlePaint(e);
  };

  const onMouseUp = () => {
    if (draggingMask) {
      draggingMask = false;
      saveBotSettings();
    }
  };

  const clearMask = () => {
    const w = baseCanvas.width;
    const h = baseCanvas.height;
    ensureMask(w, h);
    state.resizeIgnoreMask.fill(0);
    maskOverlay.ensureOverlayBuffers(w, h, true);
    redraw();
    saveBotSettings();
  };

  const invertMask = () => {
    const mask = state.resizeIgnoreMask;
    if (!mask) return;
    for (let i = 0; i < mask.length; i++) {
      mask[i] = mask[i] ? 0 : 1;
    }
    const w = baseCanvas.width;
    const h = baseCanvas.height;
    maskOverlay.ensureOverlayBuffers(w, h, true);
    redraw();
    saveBotSettings();
  };

  const bind = () => {
    const on = (el, ev, fn) => el?.addEventListener(ev, fn);

    on(elements.brush, 'input', handleBrushChange);
    on(elements.rowColSize, 'input', handleRowColSizeChange);

    on(elements.ignore, 'click', () => setMaskMode('ignore'));
    on(elements.unignore, 'click', () => setMaskMode('unignore'));
    on(elements.toggle, 'click', () => setMaskMode('toggle'));

    on(maskCanvas, 'mousedown', onMouseDown);
    on(window, 'mousemove', onMouseMove);
    on(window, 'mouseup', onMouseUp);
    on(elements.clear, 'click', clearMask);
    on(elements.invert, 'click', invertMask);

    // Init UI
    if (elements.brush && elements.brushVal) {
      brushSize = parseInt(elements.brush.value, 10) || 1;
      elements.brushVal.textContent = brushSize;
    }
    if (elements.rowColSize && elements.rowColSizeVal) {
      rowColSize = parseInt(elements.rowColSize.value, 10) || 1;
      elements.rowColSizeVal.textContent = rowColSize;
    }
    updateModeButtons();

    // Return unbind function
    return () => {
      const off = (el, ev, fn) => el?.removeEventListener(ev, fn);
      off(elements.brush, 'input', handleBrushChange);
      off(elements.rowColSize, 'input', handleRowColSizeChange);
      off(elements.ignore, 'click', () => setMaskMode('ignore'));
      off(elements.unignore, 'click', () => setMaskMode('unignore'));
      off(elements.toggle, 'click', () => setMaskMode('toggle'));
      off(maskCanvas, 'mousedown', onMouseDown);
      off(window, 'mousemove', onMouseMove);
      off(window, 'mouseup', onMouseUp);
      off(elements.clear, 'click', clearMask);
      off(elements.invert, 'click', invertMask);
    };
  };

  return { bind };
}
