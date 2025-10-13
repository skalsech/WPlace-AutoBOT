export function makeDraggable(element) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  let isDragging = false;
  const header =
    element.querySelector('.wplace-header') || element.querySelector('.wplace-settings-header');

  if (!header) {
    console.warn('No draggable header found for element:', element);
    return;
  }

  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (e.target.closest('.wplace-header-btn') || e.target.closest('button')) return;

    e.preventDefault();
    isDragging = true;

    const rect = element.getBoundingClientRect();

    element.style.transform = 'none';
    element.style.top = rect.top + 'px';
    element.style.left = rect.left + 'px';

    pos3 = e.clientX;
    pos4 = e.clientY;
    element.classList.add('wplace-dragging');
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;

    document.body.style.userSelect = 'none';
  }

  function elementDrag(e) {
    if (!isDragging) return;

    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    let newTop = element.offsetTop - pos2;
    let newLeft = element.offsetLeft - pos1;

    const rect = element.getBoundingClientRect();
    const maxTop = window.innerHeight - rect.height;
    const maxLeft = window.innerWidth - rect.width;

    newTop = Math.max(0, Math.min(newTop, maxTop));
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));

    element.style.top = newTop + 'px';
    element.style.left = newLeft + 'px';
  }

  function closeDragElement() {
    isDragging = false;
    element.classList.remove('wplace-dragging');
    document.onmouseup = null;
    document.onmousemove = null;
    document.body.style.userSelect = '';
  }
}
