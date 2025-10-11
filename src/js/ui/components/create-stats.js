// todo add currently painting color (if mode is by color freq)

export function createStatsContainer() {
  const statsContainer = document.createElement('div');
  statsContainer.id = 'wplace-stats-container';
  statsContainer.style.display = 'block';

  statsContainer.innerHTML = `
    <div class="wplace-header">
      <div class="wplace-header-title">
        <i class="fas fa-chart-bar"></i>
        <span data-i18n-key="paintingStats"></span>
      </div>
      <div class="wplace-header-controls">
        <button id="refreshChargesBtn" class="wplace-header-btn" title="" data-i18n-key="refreshCharges" data-i18n-attr="title">
          <i class="fas fa-sync"></i>
        </button>
        <button id="closeStatsBtn" class="wplace-header-btn" title="" data-i18n-key="closeStats" data-i18n-attr="title">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <div class="wplace-content">
      <div class="wplace-stats">
        <div id="statsArea">
          <div id="wplace-init-msg" class="wplace-stat-item">
            <div class="wplace-stat-label">
              <i class="fas fa-info-circle"></i>
              <span data-i18n-key="initMessage"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  return statsContainer;
}

function isStatsFullyRendered() {
  const blocks = ['wplace-charge-stats', 'wplace-image-stats', 'wplace-colors-section'];
  return blocks.every((id) => {
    const el = document.getElementById(id);
    return el && getComputedStyle(el).display !== 'none';
  });
}

export function tryRemoveStatsInitMessage() {
  if (isStatsFullyRendered()) {
    const msg = document.getElementById('wplace-init-msg');
    if (msg) msg.remove();
  }
}
