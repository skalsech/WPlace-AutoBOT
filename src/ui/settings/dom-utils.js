export function getElement(selector) {
  return document.querySelector(selector);
}

export function setInputValue(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.value = value;
  return el;
}

export function setDisplay(target, display) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (el) el.style.display = display;
  return el;
}

export function playAnimationOnce(el, animationName, durationMs = 300) {
  if (!el) return;
  el.style.animation = `${animationName} ${durationMs / 1000}s ease-out forwards`;
  setTimeout(() => {
    el.style.animation = '';
  }, durationMs);
}
