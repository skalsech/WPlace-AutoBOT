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

export function truncateString(str, prefixLength = 15, suffixLength = 20, middleLength = 15) {
  if (str.length <= prefixLength + suffixLength + middleLength) {
    return str;
  }

  const prefix = str.substring(0, prefixLength);
  const suffix = str.substring(str.length - suffixLength);

  const middleHash = Array.from(
    { length: middleLength },
    (_, i) =>
      str[
        Math.floor(
          prefixLength + (i * (str.length - prefixLength - suffixLength)) / (middleLength - 1)
        )
      ]
  ).join('');

  return `${prefix}...${middleHash}...${suffix}`;
}
