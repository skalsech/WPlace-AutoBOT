import { safeOn } from '../../utils/dom.js';
import { handleUploadClick } from '../handlers/main-panel/upload-handler.js';
import {
  handleColorFilter,
  handleCooldownSliderInput,
  handleResizeClick,
  handleToggleOverlayClick,
  handleTogglePainting,
} from '../handlers/main-panel/main-panel-handler.js';
import { handleSelectPositionClick } from '../handlers/main-panel/handle-select-position-click.js';
import {
  handleLoadClick,
  handleLoadFromFileClick,
  handleSaveClick,
  handleSaveToFileClick,
} from '../handlers/main-panel/handle-data-buttons.js';
import {
  handleCompactClick,
  handleMinimizeClick,
  handleSettingsClick,
  handleStatsClick,
} from '../handlers/main-panel/handle-header-buttons.js';

export function setupMainPanelListeners() {
  const container = document.getElementById('wplace-image-bot-container');
  if (!container) return;

  // -- Main panel header buttons --
  const settingsBtn = container.querySelector('#settingsBtn');
  const statsBtn = container.querySelector('#statsBtn');
  const minimizeBtn = container.querySelector('#minimizeBtn');
  const compactBtn = container.querySelector('#compactBtn');
  // --- Image Section ---
  const uploadBtn = container.querySelector('#uploadBtn');
  const resizeBtn = container.querySelector('#resizeBtn');
  const selectPosBtn = container.querySelector('#selectPosBtn');
  // <!-- Control Section -->
  // <!-- Control Section -->
  const controlBtn = container.querySelector('#controlBtn');
  const colorFilterBtn = container.querySelector('#colorFilterBtn');
  const toggleOverlayBtn = container.querySelector('#toggleOverlayBtn');
  // <!-- Cooldown Section -->
  const cooldownSlider = container.querySelector('#cooldownSlider');
  // <!-- Data Section -->
  const saveBtn = container.querySelector('#saveBtn');
  const loadBtn = container.querySelector('#loadBtn');
  const saveToFileBtn = container.querySelector('#saveToFileBtn');
  const loadFromFileBtn = container.querySelector('#loadFromFileBtn');

  // --- Collapsible sections ---
  container.querySelectorAll('.wplace-section-title').forEach((title) => {
    if (!title.querySelector('i.arrow')) {
      const arrow = document.createElement('i');
      arrow.className = 'fas fa-chevron-down arrow';
      title.appendChild(arrow);
    }

    safeOn(title, 'click', () => {
      const section = title.parentElement;
      section.classList.toggle('collapsed');
    });
  });

  // --- Image Section ---
  safeOn(uploadBtn, 'click', handleUploadClick);
  safeOn(resizeBtn, 'click', handleResizeClick);
  safeOn(selectPosBtn, 'click', handleSelectPositionClick);

  // --- Control Section ---
  safeOn(controlBtn, 'click', handleTogglePainting);
  safeOn(colorFilterBtn, 'click', handleColorFilter);
  safeOn(toggleOverlayBtn, 'click', handleToggleOverlayClick);

  // --- Cooldown Section ---
  safeOn(cooldownSlider, 'input', handleCooldownSliderInput);

  // --- Data Section ---
  safeOn(saveBtn, 'click', handleSaveClick);
  safeOn(loadBtn, 'click', handleLoadClick);
  safeOn(saveToFileBtn, 'click', handleSaveToFileClick);
  safeOn(loadFromFileBtn, 'click', handleLoadFromFileClick);

  // --- Header Buttons ---
  safeOn(settingsBtn, 'click', handleSettingsClick);
  safeOn(statsBtn, 'click', handleStatsClick);
  safeOn(minimizeBtn, 'click', handleMinimizeClick);
  safeOn(compactBtn, 'click', handleCompactClick);
}
