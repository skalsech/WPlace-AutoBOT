export const appendResourceOnce = (src, options = {}) => {
  src = src.trim();
  const { type, attributes = {}, async = true } = options;

  const inferredType = src.endsWith('.css') ? 'link' : src.endsWith('.js') ? 'script' : type;

  if (!inferredType) {
    console.warn(
      `Failed to determine the resource type for: ${src}. Specify type: 'link' or 'script' in options.`
    );
    return Promise.reject(new Error('Unknown resource type'));
  }

  let exists = false;
  if (inferredType === 'link') {
    exists = Array.from(document.head.querySelectorAll('link')).some(
      (link) => link.href === src && link.rel === 'stylesheet'
    );
  } else if (inferredType === 'script') {
    exists = Array.from(document.head.querySelectorAll('script')).some(
      (script) => script.src === src
    );
  }

  if (exists) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const element = document.createElement(inferredType);

    if (inferredType === 'link') {
      element.rel = 'stylesheet';
      element.href = src;
    } else if (inferredType === 'script') {
      element.src = src;
      element.async = async;
    }

    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }

    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error(`Failed to load resource: ${src}`));

    document.head.appendChild(element);
  });
};

export const waitForSelector = async (selector, interval = 200, timeout = 5000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = document.querySelector(selector);
    if (el) return el;
    await new Promise((r) => setTimeout(r, interval));
  }
  return null;
};
