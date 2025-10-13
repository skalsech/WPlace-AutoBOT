/**
 * Manages pan/zoom state and input events for canvas interaction.
 * Encapsulates all logic with minimal side effects.
 */
export function createPanZoomController({
  panStage,
  canvasStack,
  baseCanvas,
  maskCanvas,
  zoomSlider,
  zoomValue,
  zoomInBtn,
  zoomOutBtn,
  zoomFitBtn,
  zoomActualBtn,
  panModeBtn,
}) {
  let zoomLevel = 1;
  let panX = 0;
  let panY = 0;
  let panRaf = 0;
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let startPanX = 0;
  let startPanY = 0;
  let allowPan = false;
  let panMode = false;
  let lastTouchDist = null;
  let touchStartTime = 0;
  let doubleTapTimer = null;

  const clampPan = () => {
    if (!panStage) return;
    const rect = panStage.getBoundingClientRect();
    const w = (baseCanvas.width || 1) * zoomLevel;
    const h = (baseCanvas.height || 1) * zoomLevel;

    if (w <= rect.width) {
      panX = Math.floor((rect.width - w) / 2);
    } else {
      const minX = rect.width - w;
      panX = Math.min(0, Math.max(minX, panX));
    }

    if (h <= rect.height) {
      panY = Math.floor((rect.height - h) / 2);
    } else {
      const minY = rect.height - h;
      panY = Math.min(0, Math.max(minY, panY));
    }
  };

  const applyPan = () => {
    if (panRaf) return;
    panRaf = requestAnimationFrame(() => {
      clampPan();
      canvasStack.style.transform = `translate3d(${Math.round(panX)}px, ${Math.round(panY)}px, 0) scale(${zoomLevel})`;
      panRaf = 0;
    });
  };

  const updateZoomLayout = () => {
    const w = baseCanvas.width || 1;
    const h = baseCanvas.height || 1;
    baseCanvas.style.width = `${w}px`;
    baseCanvas.style.height = `${h}px`;
    maskCanvas.style.width = `${w}px`;
    maskCanvas.style.height = `${h}px`;
    canvasStack.style.width = `${w}px`;
    canvasStack.style.height = `${h}px`;
    applyPan();
  };

  const applyZoom = (z) => {
    zoomLevel = Math.max(0.05, Math.min(20, z || 1));
    if (zoomSlider) zoomSlider.value = zoomLevel;
    updateZoomLayout();
    if (zoomValue) zoomValue.textContent = `${Math.round(zoomLevel * 100)}%`;
  };

  const computeFitZoom = () => {
    if (!panStage) return 1;
    const rect = panStage.getBoundingClientRect();
    const w = baseCanvas.width || 1;
    const h = baseCanvas.height || 1;
    const margin = 10;
    const scaleX = (rect.width - margin) / w;
    const scaleY = (rect.height - margin) / h;
    return Math.max(0.05, Math.min(20, Math.min(scaleX, scaleY)));
  };

  const centerInView = () => {
    if (!panStage) return;
    const rect = panStage.getBoundingClientRect();
    const w = (baseCanvas.width || 1) * zoomLevel;
    const h = (baseCanvas.height || 1) * zoomLevel;
    panX = Math.floor((rect.width - w) / 2);
    panY = Math.floor((rect.height - h) / 2);
    applyPan();
  };

  const setCursor = (cursor) => {
    if (panStage) panStage.style.cursor = cursor;
  };

  const updatePanModeBtn = () => {
    if (!panModeBtn) return;
    panModeBtn.classList.toggle('active', panMode);
    panModeBtn.setAttribute('aria-pressed', panMode);
  };

  const handleZoomInput = () => {
    if (!zoomSlider) return;
    applyZoom(parseFloat(zoomSlider.value));
  };

  const handleZoomClick = (delta) => () => {
    applyZoom(parseFloat(zoomSlider?.value || 1) + delta);
  };

  const handleZoomFit = () => {
    applyZoom(computeFitZoom());
    centerInView();
  };

  const handleZoomActual = () => {
    applyZoom(1);
    centerInView();
  };

  const handlePanModeToggle = () => {
    panMode = !panMode;
    updatePanModeBtn();
    setCursor(panMode ? 'grab' : '');
  };

  const handleKeyDown = (e) => {
    if (e.code === 'Space') {
      allowPan = true;
      setCursor('grab');
    }
  };

  const handleKeyUp = (e) => {
    if (e.code === 'Space') {
      allowPan = false;
      if (!isPanning) setCursor('');
    }
  };

  const handleMouseDown = (e) => {
    // Middle/right click or Space/pan mode
    if (!(e.button === 1 || e.button === 2) && !allowPan && !panMode) return;
    e.preventDefault();
    isPanning = true;
    startX = e.clientX;
    startY = e.clientY;
    startPanX = panX;
    startPanY = panY;
    setCursor('grabbing');
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    panX = startPanX + (e.clientX - startX);
    panY = startPanY + (e.clientY - startY);
    applyPan();
  };

  const handleMouseUp = () => {
    if (isPanning) {
      isPanning = false;
      setCursor(panMode || allowPan ? 'grab' : '');
    }
  };

  const handleWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const rect = panStage.getBoundingClientRect();
    const cx = e.clientX - rect.left - panX;
    const cy = e.clientY - rect.top - panY;
    const step = Math.abs(e.deltaY) > 20 ? 0.2 : 0.1;
    const next = Math.max(0.05, Math.min(20, zoomLevel + (e.deltaY > 0 ? -step : step)));
    if (next === zoomLevel) return;
    const scale = next / zoomLevel;
    panX = panX - cx * (scale - 1);
    panY = panY - cy * (scale - 1);
    applyZoom(next);
  };

  const handleTouchStart = (e) => {
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
        clearTimeout(doubleTapTimer);
        const z = Math.abs(zoomLevel - 1) < 0.01 ? computeFitZoom() : 1;
        applyZoom(z);
        centerInView();
      } else {
        touchStartTime = now;
        doubleTapTimer = setTimeout(() => {
          doubleTapTimer = null;
        }, 320);
      }
    } else if (e.touches.length === 2) {
      const [a, b] = e.touches;
      lastTouchDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isPanning) {
      const t = e.touches[0];
      panX = startPanX + (t.clientX - startX);
      panY = startPanY + (t.clientY - startY);
      applyPan();
    } else if (e.touches.length === 2 && lastTouchDist !== null) {
      e.preventDefault();
      const [a, b] = e.touches;
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      const rect = panStage.getBoundingClientRect();
      const centerX = (a.clientX + b.clientX) / 2 - rect.left - panX;
      const centerY = (a.clientY + b.clientY) / 2 - rect.top - panY;
      const next = Math.max(0.05, Math.min(20, zoomLevel * (dist / lastTouchDist)));
      if (next !== zoomLevel) {
        panX = panX - centerX * (next / zoomLevel - 1);
        panY = panY - centerY * (next / zoomLevel - 1);
        applyZoom(next);
      }
      lastTouchDist = dist;
    }
  };

  const handleTouchEnd = () => {
    isPanning = false;
    lastTouchDist = null;
    setCursor(panMode || allowPan ? 'grab' : '');
  };

  const bindEvents = () => {
    const on = (el, ev, fn, opts) => el?.addEventListener(ev, fn, opts);

    on(zoomSlider, 'input', handleZoomInput);
    on(zoomInBtn, 'click', handleZoomClick(0.1));
    on(zoomOutBtn, 'click', handleZoomClick(-0.1));
    on(zoomFitBtn, 'click', handleZoomFit);
    on(zoomActualBtn, 'click', handleZoomActual);
    on(panModeBtn, 'click', handlePanModeToggle);

    on(panStage, 'contextmenu', (e) => allowPan && e.preventDefault());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    on(panStage, 'mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    on(panStage, 'wheel', handleWheel, { passive: false });

    on(panStage, 'touchstart', handleTouchStart, { passive: true });
    on(panStage, 'touchmove', handleTouchMove, { passive: false });
    on(panStage, 'touchend', handleTouchEnd);
  };

  const destroy = () => {
    if (panRaf) {
      cancelAnimationFrame(panRaf);
      panRaf = 0;
    }
    // Note: Global listeners (window) are not removed to avoid ref-count complexity.
    // Controller is reused per-dialog, so acceptable trade-off.
  };

  // Init
  bindEvents();
  updatePanModeBtn();

  return {
    applyZoom,
    computeFitZoom,
    centerInView,
    updateZoomLayout,
    get zoomLevel() {
      return zoomLevel;
    },
    isPanInteractionActive() {
      return panMode || allowPan;
    },
    destroy,
  };
}
