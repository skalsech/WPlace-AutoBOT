export function showAlert(message, type = 'info') {
  const validTypes = ['info', 'success', 'warning', 'error'];
  const alertType = validTypes.includes(type) ? type : 'info';

  let container = document.querySelector('.wplace-alert-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'wplace-alert-container';
    document.body.appendChild(container);
  }

  const alertDiv = document.createElement('div');
  alertDiv.className = `wplace-alert-base wplace-alert-${alertType}`;
  alertDiv.textContent = message;

  alertDiv.addEventListener('click', () => {
    alertDiv.classList.add('fade-out');
    setTimeout(() => {
      if (alertDiv.parentElement) {
        alertDiv.parentElement.removeChild(alertDiv);
      }
    }, 300);
  });

  if (container.firstChild) {
    container.insertBefore(alertDiv, container.firstChild);
  } else {
    container.appendChild(alertDiv);
  }

  if (container.children.length > 6) {
    const oldest = container.lastChild;
    oldest.classList.add('fade-out');
    setTimeout(() => {
      if (oldest.parentElement) {
        oldest.parentElement.removeChild(oldest);
      }
    }, 300);
  }

  setTimeout(() => {
    alertDiv.classList.add('fade-out');
    setTimeout(() => {
      if (alertDiv.parentElement) {
        alertDiv.parentElement.removeChild(alertDiv);
      }
    }, 300);
  }, 4000);
}
