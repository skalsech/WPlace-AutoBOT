import { ImageProcessor } from '../core/image-processor.js';
import { state } from '../core/state.js';
import {
  findClosestPaletteColor,
  isTransparentPixel,
  isWhitePixel,
} from '../utils/color-matching.js';
import { saveBotSettings } from '../core/settings-manager.js';
import { updateStats, updateUI } from './panel.js';
import { overlayManager } from '../overlay/overlay-manager.js';

let resizeContainer;
const widthSlider = resizeContainer.querySelector('#widthSlider');
const heightSlider = resizeContainer.querySelector('#heightSlider');
const widthValue = resizeContainer.querySelector('#widthValue');
const heightValue = resizeContainer.querySelector('#heightValue');
const keepAspect = resizeContainer.querySelector('#keepAspect');
const paintWhiteToggle = resizeContainer.querySelector('#paintWhiteToggle');
const paintTransparentToggle = resizeContainer.querySelector('#paintTransparentToggle');
const zoomSlider = resizeContainer.querySelector('#zoomSlider');
const zoomValue = resizeContainer.querySelector('#zoomValue');
const zoomInBtn = resizeContainer.querySelector('#zoomInBtn');
const zoomOutBtn = resizeContainer.querySelector('#zoomOutBtn');
const zoomFitBtn = resizeContainer.querySelector('#zoomFitBtn');
const zoomActualBtn = resizeContainer.querySelector('#zoomActualBtn');
const panModeBtn = resizeContainer.querySelector('#panModeBtn');
const panStage = resizeContainer.querySelector('#resizePanStage');
const canvasStack = resizeContainer.querySelector('#resizeCanvasStack');
const baseCanvas = resizeContainer.querySelector('#resizeCanvas');
const maskCanvas = resizeContainer.querySelector('#maskCanvas');
const baseCtx = baseCanvas.getContext('2d');
const maskCtx = maskCanvas.getContext('2d');
const confirmResize = resizeContainer.querySelector('#confirmResize');
const cancelResize = resizeContainer.querySelector('#cancelResize');
const downloadPreviewBtn = resizeContainer.querySelector('#downloadPreviewBtn');
const clearIgnoredBtn = resizeContainer.querySelector('#clearIgnoredBtn');

export function showResizeDialog(processor) {
  let baseProcessor = processor;
  let width, height;
  if (state.originalImage?.dataUrl) {
    baseProcessor = new ImageProcessor(state.originalImage.dataUrl);
    width = state.originalImage.width;
    height = state.originalImage.height;
  } else {
    const dims = processor.getDimensions();
    width = dims.width;
    height = dims.height;
  }
  const aspectRatio = width / height;

  const rs = state.resizeSettings;
  widthSlider.max = width * 2;
  heightSlider.max = height * 2;
  let initialW = width;
  let initialH = height;
  if (
    rs &&
    Number.isFinite(rs.width) &&
    Number.isFinite(rs.height) &&
    rs.width > 0 &&
    rs.height > 0
  ) {
    initialW = rs.width;
    initialH = rs.height;
  }
  // Clamp to slider ranges
  initialW = Math.max(
    parseInt(widthSlider.min, 10) || 10,
    Math.min(initialW, parseInt(widthSlider.max, 10))
  );
  initialH = Math.max(
    parseInt(heightSlider.min, 10) || 10,
    Math.min(initialH, parseInt(heightSlider.max, 10))
  );
  widthSlider.value = initialW;
  heightSlider.value = initialH;
  widthValue.textContent = initialW;
  heightValue.textContent = initialH;
  zoomSlider.value = 1;
  if (zoomValue) zoomValue.textContent = '100%';
  paintWhiteToggle.checked = state.paintWhitePixels;
  paintTransparentToggle.checked = state.paintTransparentPixels;

  let _previewTimer = null;
  let _previewJobId = 0;
  let _isDraggingSize = false;
  let _zoomLevel = 1;
  let _ditherWorkBuf = null;
  let _ditherEligibleBuf = null;
  const ensureDitherBuffers = (n) => {
    if (!_ditherWorkBuf || _ditherWorkBuf.length !== n * 3)
      _ditherWorkBuf = new Float32Array(n * 3);
    if (!_ditherEligibleBuf || _ditherEligibleBuf.length !== n)
      _ditherEligibleBuf = new Uint8Array(n);
    return { work: _ditherWorkBuf, eligible: _ditherEligibleBuf };
  };
  let _maskImageData = null;
  let _maskData = null;
  let _dirty = null;
  const _resetDirty = () => {
    _dirty = { minX: Infinity, minY: Infinity, maxX: -1, maxY: -1 };
  };
  const _markDirty = (x, y) => {
    if (!_dirty) _resetDirty();
    if (x < _dirty.minX) _dirty.minX = x;
    if (y < _dirty.minY) _dirty.minY = y;
    if (x > _dirty.maxX) _dirty.maxX = x;
    if (y > _dirty.maxY) _dirty.maxY = y;
  };
  const _flushDirty = () => {
    if (!_dirty || _dirty.maxX < _dirty.minX || _dirty.maxY < _dirty.minY) return;
    const x = Math.max(0, _dirty.minX);
    const y = Math.max(0, _dirty.minY);
    const w = Math.min(maskCanvas.width - x, _dirty.maxX - x + 1);
    const h = Math.min(maskCanvas.height - y, _dirty.maxY - y + 1);
    if (w > 0 && h > 0) maskCtx.putImageData(_maskImageData, 0, 0, x, y, w, h);
    _resetDirty();
  };
  const _ensureMaskOverlayBuffers = (w, h, rebuildFromMask = false) => {
    if (!_maskImageData || _maskImageData.width !== w || _maskImageData.height !== h) {
      _maskImageData = maskCtx.createImageData(w, h);
      _maskData = _maskImageData.data;
      rebuildFromMask = true;
    }
    if (rebuildFromMask) {
      const m = state.resizeIgnoreMask;
      const md = _maskData;
      md.fill(0);
      if (m) {
        for (let i = 0; i < m.length; i++)
          if (m[i]) {
            const p = i * 4;
            md[p] = 255;
            md[p + 1] = 0;
            md[p + 2] = 0;
            md[p + 3] = 150;
          }
      }
      maskCtx.putImageData(_maskImageData, 0, 0);
      _resetDirty();
    }
  };
  const ensureMaskSize = (w, h) => {
    if (!state.resizeIgnoreMask || state.resizeIgnoreMask.length !== w * h) {
      state.resizeIgnoreMask = new Uint8Array(w * h);
    }
    baseCanvas.width = w;
    baseCanvas.height = h;
    maskCanvas.width = w;
    maskCanvas.height = h;
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    // Ensure overlay buffers exist and rebuild from mask when dimensions change
    _ensureMaskOverlayBuffers(w, h, true);
  };
  _updateResizePreview = async () => {
    const jobId = ++_previewJobId;
    const newWidth = parseInt(widthSlider.value, 10);
    const newHeight = parseInt(heightSlider.value, 10);
    _zoomLevel = parseFloat(zoomSlider.value);

    widthValue.textContent = newWidth;
    heightValue.textContent = newHeight;

    ensureMaskSize(newWidth, newHeight);
    canvasStack.style.width = newWidth + 'px';
    canvasStack.style.height = newHeight + 'px';
    baseCtx.imageSmoothingEnabled = false;
    if (!state.availableColors || state.availableColors.length === 0) {
      if (baseProcessor !== processor && (!baseProcessor.img || !baseProcessor.canvas)) {
        await baseProcessor.load();
      }
      baseCtx.clearRect(0, 0, newWidth, newHeight);
      baseCtx.drawImage(baseProcessor.img, 0, 0, newWidth, newHeight);
      // Draw existing mask overlay buffer
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      if (_maskImageData) maskCtx.putImageData(_maskImageData, 0, 0);
      updateZoomLayout();
      return;
    }
    if (baseProcessor !== processor && (!baseProcessor.img || !baseProcessor.canvas)) {
      await baseProcessor.load();
    }
    baseCtx.clearRect(0, 0, newWidth, newHeight);
    baseCtx.drawImage(baseProcessor.img, 0, 0, newWidth, newHeight);
    const imgData = baseCtx.getImageData(0, 0, newWidth, newHeight);
    const data = imgData.data;

    const applyFSDither = () => {
      const w = newWidth,
        h = newHeight;
      const n = w * h;
      const { work, eligible } = ensureDitherBuffers(n);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          const i4 = idx * 4;
          const r = data[i4],
            g = data[i4 + 1],
            b = data[i4 + 2],
            a = data[i4 + 3];
          const isEligible =
            (state.paintTransparentPixels || !isTransparentPixel(a)) &&
            (state.paintWhitePixels || !isWhitePixel(r, g, b));
          eligible[idx] = isEligible ? 1 : 0;
          work[idx * 3] = r;
          work[idx * 3 + 1] = g;
          work[idx * 3 + 2] = b;
          if (!isEligible) {
            data[i4 + 3] = 0; // transparent in preview overlay
          }
        }
      }

      const diffuse = (nx, ny, er, eg, eb, factor) => {
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) return;
        const nidx = ny * w + nx;
        if (!eligible[nidx]) return;
        const base = nidx * 3;
        work[base] = Math.min(255, Math.max(0, work[base] + er * factor));
        work[base + 1] = Math.min(255, Math.max(0, work[base + 1] + eg * factor));
        work[base + 2] = Math.min(255, Math.max(0, work[base + 2] + eb * factor));
      };

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          if (!eligible[idx]) continue;
          const base = idx * 3;
          const r0 = work[base],
            g0 = work[base + 1],
            b0 = work[base + 2];
          const [nr, ng, nb] = findClosestPaletteColor(r0, g0, b0, state.activeColorPalette);
          const i4 = idx * 4;
          data[i4] = nr;
          data[i4 + 1] = ng;
          data[i4 + 2] = nb;
          data[i4 + 3] = 255;

          const er = r0 - nr;
          const eg = g0 - ng;
          const eb = b0 - nb;

          diffuse(x + 1, y, er, eg, eb, 7 / 16);
          diffuse(x - 1, y + 1, er, eg, eb, 3 / 16);
          diffuse(x, y + 1, er, eg, eb, 5 / 16);
          diffuse(x + 1, y + 1, er, eg, eb, 1 / 16);
        }
      }
    };

    // Skip expensive dithering while user is dragging sliders
    if (state.ditheringEnabled && !_isDraggingSize) {
      applyFSDither();
    } else {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2],
          a = data[i + 3];
        if (
          (!state.paintTransparentPixels && isTransparentPixel(a)) ||
          (!state.paintWhitePixels && isWhitePixel(r, g, b))
        ) {
          data[i + 3] = 0;
          continue;
        }
        const [nr, ng, nb] = findClosestPaletteColor(r, g, b, state.activeColorPalette);
        data[i] = nr;
        data[i + 1] = ng;
        data[i + 2] = nb;
        data[i + 3] = 255;
      }
    }

    if (jobId !== _previewJobId) return;
    baseCtx.putImageData(imgData, 0, 0);
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    if (_maskImageData) maskCtx.putImageData(_maskImageData, 0, 0);
    updateZoomLayout();
  };

  const onWidthInput = () => {
    if (keepAspect.checked) {
      heightSlider.value = Math.round(parseInt(widthSlider.value, 10) / aspectRatio);
    }
    _updateResizePreview();
    const curW = parseInt(widthSlider.value, 10);
    const curH = parseInt(heightSlider.value, 10);
    state.resizeSettings = {
      baseWidth: width,
      baseHeight: height,
      width: curW,
      height: curH,
    };
    saveBotSettings();
    // Auto-fit after size changes
    const fit = typeof computeFitZoom === 'function' ? computeFitZoom() : 1;
    if (!isNaN(fit) && isFinite(fit)) applyZoom(fit);
  };

  const onHeightInput = () => {
    if (keepAspect.checked) {
      widthSlider.value = Math.round(parseInt(heightSlider.value, 10) * aspectRatio);
    }
    _updateResizePreview();
    const curW = parseInt(widthSlider.value, 10);
    const curH = parseInt(heightSlider.value, 10);
    state.resizeSettings = {
      baseWidth: width,
      baseHeight: height,
      width: curW,
      height: curH,
    };
    saveBotSettings();
    // Auto-fit after size changes
    const fit = typeof computeFitZoom === 'function' ? computeFitZoom() : 1;
    if (!isNaN(fit) && isFinite(fit)) applyZoom(fit);
  };

  paintWhiteToggle.onchange = (e) => {
    state.paintWhitePixels = e.target.checked;
    _updateResizePreview();
    saveBotSettings();
  };

  paintTransparentToggle.onchange = (e) => {
    state.paintTransparentPixels = e.target.checked;
    _updateResizePreview();
    saveBotSettings();
  };

  let panX = 0,
    panY = 0;
  const clampPan = () => {
    const wrapRect = panStage?.getBoundingClientRect() || {
      width: 0,
      height: 0,
    };
    const w = (baseCanvas.width || 1) * _zoomLevel;
    const h = (baseCanvas.height || 1) * _zoomLevel;
    if (w <= wrapRect.width) {
      panX = Math.floor((wrapRect.width - w) / 2);
    } else {
      const minX = wrapRect.width - w;
      panX = Math.min(0, Math.max(minX, panX));
    }
    if (h <= wrapRect.height) {
      panY = Math.floor((wrapRect.height - h) / 2);
    } else {
      const minY = wrapRect.height - h;
      panY = Math.min(0, Math.max(minY, panY));
    }
  };
  let _panRaf = 0;
  const applyPan = () => {
    if (_panRaf) return;
    _panRaf = requestAnimationFrame(() => {
      clampPan();
      canvasStack.style.transform = `translate3d(${Math.round(
        panX
      )}px, ${Math.round(panY)}px, 0) scale(${_zoomLevel})`;
      _panRaf = 0;
    });
  };

  const updateZoomLayout = () => {
    const w = baseCanvas.width || 1,
      h = baseCanvas.height || 1;
    baseCanvas.style.width = w + 'px';
    baseCanvas.style.height = h + 'px';
    maskCanvas.style.width = w + 'px';
    maskCanvas.style.height = h + 'px';
    canvasStack.style.width = w + 'px';
    canvasStack.style.height = h + 'px';
    applyPan();
  };
  const applyZoom = (z) => {
    _zoomLevel = Math.max(0.05, Math.min(20, z || 1));
    zoomSlider.value = _zoomLevel;
    updateZoomLayout();
    if (zoomValue) zoomValue.textContent = `${Math.round(_zoomLevel * 100)}%`;
  };
  zoomSlider.addEventListener('input', () => {
    applyZoom(parseFloat(zoomSlider.value));
  });
  if (zoomInBtn)
    zoomInBtn.addEventListener('click', () => applyZoom(parseFloat(zoomSlider.value) + 0.1));
  if (zoomOutBtn)
    zoomOutBtn.addEventListener('click', () => applyZoom(parseFloat(zoomSlider.value) - 0.1));
  const computeFitZoom = () => {
    const wrapRect = panStage?.getBoundingClientRect();
    if (!wrapRect) return 1;
    const w = baseCanvas.width || 1;
    const h = baseCanvas.height || 1;
    const margin = 10;
    const scaleX = (wrapRect.width - margin) / w;
    const scaleY = (wrapRect.height - margin) / h;
    return Math.max(0.05, Math.min(20, Math.min(scaleX, scaleY)));
  };
  if (zoomFitBtn)
    zoomFitBtn.addEventListener('click', () => {
      applyZoom(computeFitZoom());
      centerInView();
    });
  if (zoomActualBtn)
    zoomActualBtn.addEventListener('click', () => {
      applyZoom(1);
      centerInView();
    });

  const centerInView = () => {
    if (!panStage) return;
    const rect = panStage.getBoundingClientRect();
    const w = (baseCanvas.width || 1) * _zoomLevel;
    const h = (baseCanvas.height || 1) * _zoomLevel;
    panX = Math.floor((rect.width - w) / 2);
    panY = Math.floor((rect.height - h) / 2);
    applyPan();
  };

  let isPanning = false;
  let startX = 0,
    startY = 0,
    startPanX = 0,
    startPanY = 0;
  let allowPan = false; // Space key
  let panMode = false; // Explicit pan mode toggle for touch/one-button mice
  const isPanMouseButton = (e) => e.button === 1 || e.button === 2;
  const setCursor = (val) => {
    if (panStage) panStage.style.cursor = val;
  };
  const isPanActive = (e) => panMode || allowPan || isPanMouseButton(e);
  const updatePanModeBtn = () => {
    if (!panModeBtn) return;
    panModeBtn.classList.toggle('active', panMode);
    panModeBtn.setAttribute('aria-pressed', panMode ? 'true' : 'false');
  };
  if (panModeBtn) {
    updatePanModeBtn();
    panModeBtn.addEventListener('click', () => {
      panMode = !panMode;
      updatePanModeBtn();
      setCursor(panMode ? 'grab' : '');
    });
  }
  if (panStage) {
    panStage.addEventListener('contextmenu', (e) => {
      if (allowPan) e.preventDefault();
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        allowPan = true;
        setCursor('grab');
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        allowPan = false;
        if (!isPanning) setCursor('');
      }
    });
    panStage.addEventListener('mousedown', (e) => {
      if (!isPanActive(e)) return;
      e.preventDefault();
      isPanning = true;
      startX = e.clientX;
      startY = e.clientY;
      startPanX = panX;
      startPanY = panY;
      setCursor('grabbing');
    });
    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      panX = startPanX + dx;
      panY = startPanY + dy;
      applyPan();
    });
    window.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        setCursor(allowPan ? 'grab' : '');
      }
    });
    panStage.addEventListener(
      'wheel',
      (e) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const rect = panStage.getBoundingClientRect();
        const cx = e.clientX - rect.left - panX;
        const cy = e.clientY - rect.top - panY;
        const before = _zoomLevel;
        const step = Math.max(0.05, Math.min(0.5, Math.abs(e.deltaY) > 20 ? 0.2 : 0.1));
        const next = Math.max(0.05, Math.min(20, before + (e.deltaY > 0 ? -step : step)));
        if (next === before) return;
        const scale = next / before;
        panX = panX - cx * (scale - 1);
        panY = panY - cy * (scale - 1);
        applyZoom(next);
      },
      { passive: false }
    );
    let lastTouchDist = null;
    let touchStartTime = 0;
    let doubleTapTimer = null;
    panStage.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length === 1) {
          const t = e.touches[0];
          isPanning = true;
          startX = t.clientX;
          startY = t.clientY;
          startPanX = panX;
          startPanY = panY;
          setCursor('grabbing');
          const now = Date.now();
          if (now - touchStartTime < 300) {
            // double tap -> toggle 100%/fit
            const z = Math.abs(_zoomLevel - 1) < 0.01 ? computeFitZoom() : 1;
            applyZoom(z);
            centerInView();
            if (doubleTapTimer) clearTimeout(doubleTapTimer);
          } else {
            touchStartTime = now;
            doubleTapTimer = setTimeout(() => {
              doubleTapTimer = null;
            }, 320);
          }
        } else if (e.touches.length === 2) {
          // Pinch start
          const [a, b] = e.touches;
          lastTouchDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        }
      },
      { passive: true }
    );
    panStage.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length === 1 && isPanning) {
          const t = e.touches[0];
          const dx = t.clientX - startX;
          const dy = t.clientY - startY;
          panX = startPanX + dx;
          panY = startPanY + dy;
          applyPan();
        } else if (e.touches.length === 2 && lastTouchDist != null) {
          e.preventDefault();
          const [a, b] = e.touches;
          const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
          const rect = panStage.getBoundingClientRect();
          const centerX = (a.clientX + b.clientX) / 2 - rect.left - panX;
          const centerY = (a.clientY + b.clientY) / 2 - rect.top - panY;
          const before = _zoomLevel;
          const scale = dist / (lastTouchDist || dist);
          const next = Math.max(0.05, Math.min(20, before * scale));
          if (next !== before) {
            panX = panX - centerX * (next / before - 1);
            panY = panY - centerY * (next / before - 1);
            applyZoom(next);
          }
          lastTouchDist = dist;
        }
      },
      { passive: false }
    );
    panStage.addEventListener('touchend', () => {
      isPanning = false;
      lastTouchDist = null;
      setCursor(panMode || allowPan ? 'grab' : '');
    });
  }
  const schedulePreview = () => {
    if (_previewTimer) clearTimeout(_previewTimer);
    const run = () => {
      _previewTimer = null;
      _updateResizePreview();
    };
    if (window.requestIdleCallback) {
      _previewTimer = setTimeout(() => requestIdleCallback(run, { timeout: 150 }), 50);
    } else {
      _previewTimer = setTimeout(() => requestAnimationFrame(run), 50);
    }
  };
  // Track dragging to reduce work and skip dithering during drag
  const markDragStart = () => {
    _isDraggingSize = true;
  };
  const markDragEnd = () => {
    _isDraggingSize = false;
    schedulePreview();
  };
  widthSlider.addEventListener('pointerdown', markDragStart);
  heightSlider.addEventListener('pointerdown', markDragStart);
  widthSlider.addEventListener('pointerup', markDragEnd);
  heightSlider.addEventListener('pointerup', markDragEnd);
  widthSlider.addEventListener('input', () => {
    onWidthInput();
    schedulePreview();
  });
  heightSlider.addEventListener('input', () => {
    onHeightInput();
    schedulePreview();
  });

  // Mask painting UX: brush size, modes, row/column fills, and precise coords
  let draggingMask = false;
  let lastPaintX = -1,
    lastPaintY = -1;
  let brushSize = 1;
  let rowColSize = 1;
  let maskMode = 'ignore'; // 'ignore' | 'unignore' | 'toggle'
  const brushEl = resizeContainer.querySelector('#maskBrushSize');
  const brushValEl = resizeContainer.querySelector('#maskBrushSizeValue');
  const btnIgnore = resizeContainer.querySelector('#maskModeIgnore');
  const btnUnignore = resizeContainer.querySelector('#maskModeUnignore');
  const btnToggle = resizeContainer.querySelector('#maskModeToggle');
  const clearIgnoredBtnEl = resizeContainer.querySelector('#clearIgnoredBtn');
  const invertMaskBtn = resizeContainer.querySelector('#invertMaskBtn');
  const rowColSizeEl = resizeContainer.querySelector('#rowColSize');
  const rowColSizeValEl = resizeContainer.querySelector('#rowColSizeValue');

  const updateModeButtons = () => {
    const map = [
      [btnIgnore, 'ignore'],
      [btnUnignore, 'unignore'],
      [btnToggle, 'toggle'],
    ];
    for (const [el, m] of map) {
      if (!el) continue;
      const active = maskMode === m;
      el.classList.toggle('active', active);
      el.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  };
  const setMode = (mode) => {
    maskMode = mode;
    updateModeButtons();
  };
  if (brushEl && brushValEl) {
    brushEl.addEventListener('input', () => {
      brushSize = parseInt(brushEl.value, 10) || 1;
      brushValEl.textContent = brushSize;
    });
    brushValEl.textContent = brushEl.value;
    brushSize = parseInt(brushEl.value, 10) || 1;
  }
  if (rowColSizeEl && rowColSizeValEl) {
    rowColSizeEl.addEventListener('input', () => {
      rowColSize = parseInt(rowColSizeEl.value, 10) || 1;
      rowColSizeValEl.textContent = rowColSize;
    });
    rowColSizeValEl.textContent = rowColSizeEl.value;
    rowColSize = parseInt(rowColSizeEl.value, 10) || 1;
  }
  if (btnIgnore) btnIgnore.addEventListener('click', () => setMode('ignore'));
  if (btnUnignore) btnUnignore.addEventListener('click', () => setMode('unignore'));
  if (btnToggle) btnToggle.addEventListener('click', () => setMode('toggle'));
  // Initialize button state (default to toggle mode)
  updateModeButtons();

  const mapClientToPixel = (clientX, clientY) => {
    // Compute without rounding until final step to avoid drift at higher zoom
    const rect = baseCanvas.getBoundingClientRect();
    const scaleX = rect.width / baseCanvas.width;
    const scaleY = rect.height / baseCanvas.height;
    const dx = (clientX - rect.left) / scaleX;
    const dy = (clientY - rect.top) / scaleY;
    const x = Math.floor(dx);
    const y = Math.floor(dy);
    return { x, y };
  };

  const ensureMask = (w, h) => {
    if (!state.resizeIgnoreMask || state.resizeIgnoreMask.length !== w * h) {
      state.resizeIgnoreMask = new Uint8Array(w * h);
    }
  };

  const paintCircle = (cx, cy, radius, value) => {
    const w = baseCanvas.width,
      h = baseCanvas.height;
    ensureMask(w, h);
    const r2 = radius * radius;
    for (let yy = cy - radius; yy <= cy + radius; yy++) {
      if (yy < 0 || yy >= h) continue;
      for (let xx = cx - radius; xx <= cx + radius; xx++) {
        if (xx < 0 || xx >= w) continue;
        const dx = xx - cx,
          dy = yy - cy;
        if (dx * dx + dy * dy <= r2) {
          const idx = yy * w + xx;
          let val = state.resizeIgnoreMask[idx];
          if (maskMode === 'toggle') {
            val = val ? 0 : 1;
          } else if (maskMode === 'ignore') {
            val = 1;
          } else {
            val = 0;
          }
          state.resizeIgnoreMask[idx] = val;
          if (_maskData) {
            const p = idx * 4;
            if (val) {
              _maskData[p] = 255;
              _maskData[p + 1] = 0;
              _maskData[p + 2] = 0;
              _maskData[p + 3] = 150;
            } else {
              _maskData[p] = 0;
              _maskData[p + 1] = 0;
              _maskData[p + 2] = 0;
              _maskData[p + 3] = 0;
            }
            _markDirty(xx, yy);
          }
        }
      }
    }
  };

  const paintRow = (y, value) => {
    const w = baseCanvas.width,
      h = baseCanvas.height;
    ensureMask(w, h);
    if (y < 0 || y >= h) return;

    // Paint multiple rows based on rowColSize
    const halfSize = Math.floor(rowColSize / 2);
    const startY = Math.max(0, y - halfSize);
    const endY = Math.min(h - 1, y + halfSize);

    for (let rowY = startY; rowY <= endY; rowY++) {
      for (let x = 0; x < w; x++) {
        const idx = rowY * w + x;
        let val = state.resizeIgnoreMask[idx];
        if (maskMode === 'toggle') {
          val = val ? 0 : 1;
        } else if (maskMode === 'ignore') {
          val = 1;
        } else {
          val = 0;
        }
        state.resizeIgnoreMask[idx] = val;
        if (_maskData) {
          const p = idx * 4;
          if (val) {
            _maskData[p] = 255;
            _maskData[p + 1] = 0;
            _maskData[p + 2] = 0;
            _maskData[p + 3] = 150;
          } else {
            _maskData[p] = 0;
            _maskData[p + 1] = 0;
            _maskData[p + 2] = 0;
            _maskData[p + 3] = 0;
          }
        }
      }
      if (_maskData) {
        _markDirty(0, rowY);
        _markDirty(w - 1, rowY);
      }
    }
  };

  const paintColumn = (x, value) => {
    const w = baseCanvas.width,
      h = baseCanvas.height;
    ensureMask(w, h);
    if (x < 0 || x >= w) return;

    // Paint multiple columns based on rowColSize
    const halfSize = Math.floor(rowColSize / 2);
    const startX = Math.max(0, x - halfSize);
    const endX = Math.min(w - 1, x + halfSize);

    for (let colX = startX; colX <= endX; colX++) {
      for (let y = 0; y < h; y++) {
        const idx = y * w + colX;
        let val = state.resizeIgnoreMask[idx];
        if (maskMode === 'toggle') {
          val = val ? 0 : 1;
        } else if (maskMode === 'ignore') {
          val = 1;
        } else {
          val = 0;
        }
        state.resizeIgnoreMask[idx] = val;
        if (_maskData) {
          const p = idx * 4;
          if (val) {
            _maskData[p] = 255;
            _maskData[p + 1] = 0;
            _maskData[p + 2] = 0;
            _maskData[p + 3] = 150;
          } else {
            _maskData[p] = 0;
            _maskData[p + 1] = 0;
            _maskData[p + 2] = 0;
            _maskData[p + 3] = 0;
          }
        }
      }
      if (_maskData) {
        _markDirty(colX, 0);
        _markDirty(colX, h - 1);
      }
    }
  };

  const redrawMaskOverlay = () => {
    // Only flush the dirty region; full rebuild happens on size change
    _flushDirty();
  };

  const handlePaint = (e) => {
    // Suppress painting while panning
    if ((e.buttons & 4) === 4 || (e.buttons & 2) === 2 || allowPan) return;
    const { x, y } = mapClientToPixel(e.clientX, e.clientY);
    const w = baseCanvas.width,
      h = baseCanvas.height;
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const radius = Math.max(1, Math.floor(brushSize / 2));
    if (e.shiftKey) {
      paintRow(y);
    } else if (e.altKey) {
      paintColumn(x);
    } else {
      paintCircle(x, y, radius);
    }
    lastPaintX = x;
    lastPaintY = y;
    redrawMaskOverlay();
  };

  maskCanvas.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.button === 2 || allowPan) return; // let pan handler manage
    draggingMask = true;
    handlePaint(e);
  });
  // Avoid hijacking touch gestures for panning/zooming
  maskCanvas.addEventListener(
    'touchstart',
    (e) => {
      /* let panStage handle */
    },
    { passive: true }
  );
  maskCanvas.addEventListener(
    'touchmove',
    (e) => {
      /* let panStage handle */
    },
    { passive: true }
  );
  maskCanvas.addEventListener(
    'touchend',
    (e) => {
      /* let panStage handle */
    },
    { passive: true }
  );
  window.addEventListener('mousemove', (e) => {
    if (draggingMask) handlePaint(e);
  });
  window.addEventListener('mouseup', () => {
    if (draggingMask) {
      draggingMask = false;
      saveBotSettings();
    }
  });

  if (clearIgnoredBtnEl)
    clearIgnoredBtnEl.addEventListener('click', () => {
      const w = baseCanvas.width,
        h = baseCanvas.height;
      if (state.resizeIgnoreMask) state.resizeIgnoreMask.fill(0);
      _ensureMaskOverlayBuffers(w, h, true);
      _updateResizePreview();
      saveBotSettings();
    });

  if (invertMaskBtn)
    invertMaskBtn.addEventListener('click', () => {
      if (!state.resizeIgnoreMask) return;
      for (let i = 0; i < state.resizeIgnoreMask.length; i++)
        state.resizeIgnoreMask[i] = state.resizeIgnoreMask[i] ? 0 : 1;
      const w = baseCanvas.width,
        h = baseCanvas.height;
      _ensureMaskOverlayBuffers(w, h, true);
      _updateResizePreview();
      saveBotSettings();
    });

  confirmResize.onclick = async () => {
    const newWidth = parseInt(widthSlider.value, 10);
    const newHeight = parseInt(heightSlider.value, 10);

    // Generate the final paletted image data
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    tempCtx.imageSmoothingEnabled = false;
    if (baseProcessor !== processor && (!baseProcessor.img || !baseProcessor.canvas)) {
      await baseProcessor.load();
    }
    tempCtx.drawImage(baseProcessor.img, 0, 0, newWidth, newHeight);
    const imgData = tempCtx.getImageData(0, 0, newWidth, newHeight);
    const data = imgData.data;

    let totalValidPixels = 0;
    const mask =
      state.resizeIgnoreMask && state.resizeIgnoreMask.length === newWidth * newHeight
        ? state.resizeIgnoreMask
        : null;

    const applyFSDitherFinal = async () => {
      const w = newWidth,
        h = newHeight;
      const n = w * h;
      const { work, eligible } = ensureDitherBuffers(n);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          const i4 = idx * 4;
          const r = data[i4],
            g = data[i4 + 1],
            b = data[i4 + 2],
            a = data[i4 + 3];
          const masked = mask && mask[idx];
          const isEligible =
            !masked &&
            (state.paintTransparentPixels || !isTransparentPixel(a)) &&
            (state.paintWhitePixels || !isWhitePixel(r, g, b));
          eligible[idx] = isEligible ? 1 : 0;
          work[idx * 3] = r;
          work[idx * 3 + 1] = g;
          work[idx * 3 + 2] = b;
          if (!isEligible) {
            data[i4 + 3] = 0;
          }
        }
        // Yield to keep UI responsive
        if ((y & 15) === 0) await Promise.resolve();
      }

      const diffuse = (nx, ny, er, eg, eb, factor) => {
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) return;
        const nidx = ny * w + nx;
        if (!eligible[nidx]) return;
        const base = nidx * 3;
        work[base] = Math.min(255, Math.max(0, work[base] + er * factor));
        work[base + 1] = Math.min(255, Math.max(0, work[base + 1] + eg * factor));
        work[base + 2] = Math.min(255, Math.max(0, work[base + 2] + eb * factor));
      };

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          if (!eligible[idx]) continue;
          const base = idx * 3;
          const r0 = work[base],
            g0 = work[base + 1],
            b0 = work[base + 2];
          const [nr, ng, nb] = findClosestPaletteColor(r0, g0, b0, state.activeColorPalette);
          const i4 = idx * 4;
          data[i4] = nr;
          data[i4 + 1] = ng;
          data[i4 + 2] = nb;
          data[i4 + 3] = 255;
          totalValidPixels++;

          const er = r0 - nr;
          const eg = g0 - ng;
          const eb = b0 - nb;

          diffuse(x + 1, y, er, eg, eb, 7 / 16);
          diffuse(x - 1, y + 1, er, eg, eb, 3 / 16);
          diffuse(x, y + 1, er, eg, eb, 5 / 16);
          diffuse(x + 1, y + 1, er, eg, eb, 1 / 16);
        }
        // Yield every row to reduce jank
        await Promise.resolve();
      }
    };

    if (state.ditheringEnabled) {
      await applyFSDitherFinal();
    } else {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2],
          a = data[i + 3];
        const masked = mask && mask[i >> 2];
        const shouldSkipTransparent =
          (!state.paintTransparentPixels && isTransparentPixel(a)) || masked;
        const shouldSkipWhite = !state.paintWhitePixels && isWhitePixel(r, g, b);
        if (shouldSkipTransparent || shouldSkipWhite) {
          data[i + 3] = 0; // overlay transparency
          continue;
        }
        totalValidPixels++;
        const [nr, ng, nb] = findClosestPaletteColor(r, g, b, state.activeColorPalette);
        data[i] = nr;
        data[i + 1] = ng;
        data[i + 2] = nb;
        data[i + 3] = 255;
      }
    }
    tempCtx.putImageData(imgData, 0, 0);

    // Save the final pixel data for painting
    // Persist the paletted (and possibly dithered) pixels so painting uses the same output seen in overlay
    const palettedPixels = new Uint8ClampedArray(imgData.data);
    state.imageData.pixels = palettedPixels;
    state.imageData.width = newWidth;
    state.imageData.height = newHeight;
    state.imageData.totalPixels = totalValidPixels;
    state.artTotalPixels = totalValidPixels;
    state.userPaintedPixels = 0;

    state.resizeSettings = {
      baseWidth: width,
      baseHeight: height,
      width: newWidth,
      height: newHeight,
    };
    saveBotSettings();

    const finalImageBitmap = await createImageBitmap(tempCanvas);
    await overlayManager.setImage(finalImageBitmap);
    overlayManager.enable();
    toggleOverlayBtn.classList.add('active');
    toggleOverlayBtn.setAttribute('aria-pressed', 'true');

    // Keep state.imageData.processor as the original-based source; painting uses paletted pixels already stored

    updateStats();
    updateUI('resizeSuccess', 'success', {
      width: newWidth,
      height: newHeight,
    });
    closeResizeDialog();
  };

  downloadPreviewBtn.onclick = () => {
    try {
      const w = baseCanvas.width,
        h = baseCanvas.height;
      const out = document.createElement('canvas');
      out.width = w;
      out.height = h;
      const octx = out.getContext('2d');
      octx.imageSmoothingEnabled = false;
      octx.drawImage(baseCanvas, 0, 0);
      octx.drawImage(maskCanvas, 0, 0);
      const link = document.createElement('a');
      link.download = 'wplace-preview.png';
      link.href = out.toDataURL();
      link.click();
    } catch (e) {
      console.warn('Failed to download preview:', e);
    }
  };

  cancelResize.onclick = closeResizeDialog;

  resizeOverlay.style.display = 'block';
  resizeContainer.style.display = 'block';

  // Reinitialize color palette with current available colors
  initializeColorPalette(resizeContainer);

  _updateResizePreview();
  _resizeDialogCleanup = () => {
    try {
      zoomSlider.replaceWith(zoomSlider.cloneNode(true));
    } catch {
      /* empty */
    }
    try {
      if (zoomInBtn) zoomInBtn.replaceWith(zoomInBtn.cloneNode(true));
    } catch {
      /* empty */
    }
    try {
      if (zoomOutBtn) zoomOutBtn.replaceWith(zoomOutBtn.cloneNode(true));
    } catch {
      /* empty */
    }
  };
  setTimeout(() => {
    if (typeof computeFitZoom === 'function') {
      const z = computeFitZoom();
      if (!isNaN(z) && isFinite(z)) {
        applyZoom(z);
        centerInView();
      }
    } else {
      centerInView();
    }
  }, 0);
}

function closeResizeDialog() {
  try {
    if (typeof _resizeDialogCleanup === 'function') {
      _resizeDialogCleanup();
    }
  } catch {
    /* empty */
  }
  resizeOverlay.style.display = 'none';
  resizeContainer.style.display = 'none';
  _updateResizePreview = () => {};
  try {
    if (typeof cancelAnimationFrame === 'function' && _panRaf) {
      cancelAnimationFrame(_panRaf);
    }
  } catch {
    /* empty */
  }
  try {
    if (_previewTimer) {
      clearTimeout(_previewTimer);
      _previewTimer = null;
    }
  } catch {
    /* empty */
  }
  _maskImageData = null;
  _maskData = null;
  _dirty = null;
  _ditherWorkBuf = null;
  _ditherEligibleBuf = null;
  _resizeDialogCleanup = null;
}
