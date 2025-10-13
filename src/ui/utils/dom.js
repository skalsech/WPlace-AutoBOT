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

export function safeOn(el, event, handler) {
  if (el) el.addEventListener(event, handler);
}

/**
 * Modifies the opacity of a CSS color string.
 * Supports rgb(), rgba(), hsl(), hsla(), and #RRGGBB formats.
 * @param {string} colorString - The CSS color string (e.g., 'rgb(255, 0, 0)', '#ff0000', 'var(--color-name)').
 * @param {number} newAlpha - The new alpha value (0-1).
 * @returns {string} - The modified color string in rgba() or hsla() format, or a fallback.
 */
export function modifyColorOpacity(colorString, newAlpha) {
  colorString = colorString.trim();

  // Handle rgb(r, g, b) or rgba(r, g, b, a)
  if (colorString.startsWith('rgb')) {
    const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      // Use passed alpha, multiplied by existing if present
      const currentAlpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
      const finalAlpha = currentAlpha * newAlpha;
      return `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
    }
  }

  // Handle #RRGGBB
  if (colorString.startsWith('#')) {
    const hex = colorString.substring(1);
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${newAlpha})`;
    }
    // TODO: handle #RGB format, rarely used
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return `rgba(${r}, ${g}, ${b}, ${newAlpha})`;
    }
  }

  // Handle hsl(h, s, l) or hsla(h, s, l, a)
  if (colorString.startsWith('hsl')) {
    const match = colorString.match(/hsla?\(([\d.]+),\s*([\d.]+%),\s*([\d.]+%)(?:,\s*([\d.]+))?\)/);
    if (match) {
      const h = parseFloat(match[1]);
      const s = parseFloat(match[2]);
      const l = parseFloat(match[3]);
      const currentAlpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
      const finalAlpha = currentAlpha * newAlpha;
      return `hsla(${h}, ${s}, ${l}, ${finalAlpha})`;
    }
  }

  // If format not recognized, attempt fallback with added opacity
  console.warn(`Could not parse color: ${colorString}`);
  // Try creating rgba assuming it's a valid CSS color
  // TODO: improve parsing for additional formats
  try {
    const tempDiv = document.createElement('div');
    tempDiv.style.color = colorString;
    document.body.appendChild(tempDiv);
    const computedRgb = getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    if (computedRgb && computedRgb.startsWith('rgb')) {
      if (computedRgb.match(/rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\)/)) {
        return modifyColorOpacity(computedRgb, newAlpha);
      }
    }
  } catch {
    console.warn(`Fallback used for color: ${colorString}`);
  }

  // Fallback: if all else fails, return green with alpha
  return `rgba(0, 255, 0, ${newAlpha})`; // Green as example success
}
