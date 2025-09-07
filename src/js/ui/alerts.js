export function showAlert(message, type = 'info') {
  const validTypes = ['info', 'success', 'warning', 'error'];
  const alertType = validTypes.includes(type) ? type : 'info';

  const alertDiv = document.createElement('div');
  alertDiv.className = `wplace-alert-base wplace-alert-${alertType}`;
  alertDiv.textContent = message;

  alertDiv.addEventListener('click', () => {
    alertDiv.classList.add('fade-out');
    setTimeout(() => document.body.removeChild(alertDiv), 300);
  });

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.classList.add('fade-out');
    setTimeout(() => {
      if (alertDiv.parentElement === document.body) {
        document.body.removeChild(alertDiv);
      }
    }, 300);
  }, 4000);
}
