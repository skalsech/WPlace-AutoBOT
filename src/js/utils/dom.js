import { APP_CONSTANTS } from '../config/APP_CONSTANTS.js';

export function createElement(tag, props = {}, children = []) {
  const element = document.createElement(tag);

  Object.entries(props).forEach(([key, value]) => {
    if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key === 'className') {
      element.className = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else {
      element.setAttribute(key, value);
    }
  });

  if (typeof children === 'string') {
    element.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}

/**
 * Checks if a color with the given index is available.
 * Free colors (0–31) are always available.
 * Paid colors (32–63) are available if their bit is set in extraColorsBitmap.
 *
 * @param {number} colorId color index (0–63)
 * @param {number} extraColorsBitmap bitmask from /me API
 * @returns {boolean} true if the color is available, otherwise false
 */
export function hasColor(colorId, extraColorsBitmap) {
  if (colorId < 32) {
    return true;
  }

  const bitPosition = colorId - 32;
  return (extraColorsBitmap & (1 << bitPosition)) !== 0;
}

/**
 * Returns an array of color objects available to the user.
 * Free colors (0–31) are always available.
 * Paid colors (32–63) are available if their bit is set in extraColorsBitmap.
 *
 * @param {number} extraColorsBitmap bitmask from /me API
 * @returns {Array<{id: number, name: string, rgb: [number, number, number]}>}
 */
export function getAvailableColors(extraColorsBitmap) {
  const available = [];

  for (const colorIdStr of Object.keys(APP_CONSTANTS.COLOR_MAP)) {
    const colorId = Number(colorIdStr);

    if (isNaN(colorId) || colorId < 0 || colorId > 63) {
      console.warn(`Invalid color id in COLOR_MAP: ${colorId}`);
      continue;
    }

    if (hasColor(colorId, extraColorsBitmap)) {
      const color = APP_CONSTANTS.COLOR_MAP[colorId];
      if (color && color.id === colorId) {
        available.push({
          id: color.id,
          name: color.name,
          rgb: [color.rgb.r, color.rgb.g, color.rgb.b],
        });
      } else if (color) {
        console.warn(
          `COLOR_MAP[${colorId}] has an invalid id: ${color.id}. Expected ${colorId}.`,
          color
        );
      }
    }
  }

  return available;
}

export function safeOn(el, event, handler) {
  if (el) el.addEventListener(event, handler);
}
