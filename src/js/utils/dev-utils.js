export function createDevReloadButton() {
  const container = document.getElementById('wplace-image-bot-container');
  if (!container) return;

  const headerControls = container.querySelector('.wplace-header-controls');
  if (!headerControls) return;

  const button = document.createElement('button');
  button.id = 'dev-reload-btn';
  button.className = 'wplace-header-btn';
  button.title = 'Force Script Reload';

  const icon = document.createElement('i');
  icon.className = 'fas fa-sync-alt';
  button.appendChild(icon);

  button.onclick = (e) => {
    e.stopPropagation();

    button.classList.add('animate-spin');
    setTimeout(() => button.classList.remove('animate-spin'), 500);

    const updateUrl = 'http://127.0.0.1:8000/dist/script.user.js';

    const updateTab = window.open(updateUrl, '_blank');

    setTimeout(() => {
      if (updateTab && !updateTab.closed) {
        updateTab.close();
      }

      setTimeout(() => {
        location.reload();
      }, 500);
    }, 1500);
  };

  const minimizeBtn = headerControls.querySelector('#settingsBtn');
  if (minimizeBtn) {
    headerControls.insertBefore(button, minimizeBtn);
  } else {
    headerControls.appendChild(button);
  }
}
