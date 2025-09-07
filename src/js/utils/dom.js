import { CONFIG } from '../core/config.js';

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

export function extractColors() {
  const availableColors = [];
  const unavailableColors = [];

  const colorElements = document.querySelectorAll('.tooltip button[id^="color-"]');
  if (colorElements.length === 0) {
    console.log('❌ No color elements found on page');
    return { availableColors, unavailableColors };
  }

  function parseColorElement(el) {
    const id = Number(el.id.replace('color-', ''));

    const rgbMatch = el.style.backgroundColor.match(/\d+/g);
    if (!rgbMatch || rgbMatch.length < 3) {
      if (id !== 0) {
        console.warn(`Skipping color element ${el.id} — cannot parse RGB`);
        return null;
      } else {
        const configTransparent = CONFIG.COLOR_MAP[id];
        if (!configTransparent) return null;
        return {
          id: configTransparent.id,
          name: configTransparent.name,
          rgb: Object.values(configTransparent.rgb),
          isAvailable: true,
        };
      }
    }

    const rgb = rgbMatch.map(Number);
    const colorInfo = CONFIG.COLOR_MAP[id];
    const name = colorInfo ? colorInfo.name : `Unknown Color ${id}`;
    if (!colorInfo) console.warn(`Color id ${id} not found in known colors`);

    const isAvailable = !el.querySelector('svg');
    return { id, name, rgb, isAvailable };
  }

  for (const el of colorElements) {
    const colorData = parseColorElement(el);
    if (!colorData) continue;

    if (colorData.isAvailable) availableColors.push(colorData);
    else unavailableColors.push(colorData);
  }

  // Console log detailed color information
  console.log('=== CAPTURED COLORS STATUS ===');
  console.log(`Total available colors: ${availableColors.length}`);
  console.log(`Total unavailable colors: ${unavailableColors.length}`);
  console.log(`Total colors scanned: ${availableColors.length + unavailableColors.length}`);

  if (availableColors.length > 0) {
    console.log('\n--- AVAILABLE COLORS ---');
    availableColors.forEach((color, index) => {
      console.log(
        `${
          index + 1
        }. ID: ${color.id}, Name: "${color.name}", RGB: (${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`
      );
    });
  }

  if (unavailableColors.length > 0) {
    console.log('\n--- UNAVAILABLE COLORS ---');
    unavailableColors.forEach((color, index) => {
      console.log(
        `${
          index + 1
        }. ID: ${color.id}, Name: "${color.name}", RGB: (${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]}) [LOCKED]`
      );
    });
  }

  console.log('=== END COLOR STATUS ===');

  return { availableColors, unavailableColors };
}

export function safeOn(el, event, handler) {
  if (el) el.addEventListener(event, handler);
}
