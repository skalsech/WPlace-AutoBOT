export function createDevReloadButton() {
  const container = document.getElementById('wplace-image-bot-container');
  if (!container) return;

  const headerControls = container.querySelector('.wplace-header-controls');
  if (!headerControls) return;

  const button = document.createElement('button');
  button.id = 'dev-reload-btn';
  button.className = 'wplace-header-btn';
  button.title = 'Click: Local Dev Server | Alt+Click: GitHub (cached)';

  const icon = document.createElement('i');
  icon.className = 'fas fa-sync-alt';
  button.appendChild(icon);

  button.onclick = (e) => {
    e.stopPropagation();

    const isAltPressed = e.altKey;

    const localUrl = 'http://127.0.0.1:8000/dist/script.user.js';
    const githubUrl =
      'https://github.com/skalsech/WPlace-AutoBOT/raw/custom-main/dist/script.user.js';

    const targetUrl = isAltPressed ? githubUrl : localUrl;

    button.classList.add('animate-spin');
    setTimeout(() => button.classList.remove('animate-spin'), 500);

    const updateTab = window.open(targetUrl, '_blank');

    setTimeout(() => {
      if (updateTab && !updateTab.closed) {
        updateTab.close();
      }
    }, 2500);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        console.log(`🔄 Reloading page after ${isAltPressed ? 'GitHub' : 'local'} update...`);
        location.reload();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  };

  const minimizeBtn = headerControls.querySelector('#settingsBtn');
  if (minimizeBtn) {
    headerControls.insertBefore(button, minimizeBtn);
  } else {
    headerControls.appendChild(button);
  }
}

export function truncateString(str, prefixLength = 15, suffixLength = 20, middleLength = 15) {
  if (typeof str !== 'string') {
    return str;
  }
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
