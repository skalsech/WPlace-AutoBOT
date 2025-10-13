import { APP_CONSTANTS } from '../../app/config/app-constants.js';

/**
 * Generate coordinates for given parameters (blocking version).
 * @param {number} width
 * @param {number} height
 * @param {Uint8ClampedArray} pixels
 * @param {'rows'|'columns'|'circle-out'|'circle-in'|'blocks'|'shuffle-blocks'} mode
 * @param {'top-left'|'top-right'|'bottom-left'|'bottom-right'} direction
 * @param {boolean} snake
 * @param {number} blockWidth
 * @param {number} blockHeight
 * @param {boolean} sortByFrequency
 * @param {Map<number, number>} artColorFrequency - color ID → pixel count.
 * @returns {[number, number][]}
 */
export function generateCoordinates(
  width,
  height,
  pixels,
  mode,
  direction,
  snake,
  blockWidth,
  blockHeight,
  sortByFrequency,
  artColorFrequency
) {
  const coords = [];

  // --------- Standard 4 corners traversal ----------
  let xStart, xEnd, xStep;
  let yStart, yEnd, yStep;
  switch (direction) {
    case 'top-left':
      xStart = 0;
      xEnd = width;
      xStep = 1;
      yStart = 0;
      yEnd = height;
      yStep = 1;
      break;
    case 'top-right':
      xStart = width - 1;
      xEnd = -1;
      xStep = -1;
      yStart = 0;
      yEnd = height;
      yStep = 1;
      break;
    case 'bottom-left':
      xStart = 0;
      xEnd = width;
      xStep = 1;
      yStart = height - 1;
      yEnd = -1;
      yStep = -1;
      break;
    case 'bottom-right':
      xStart = width - 1;
      xEnd = -1;
      xStep = -1;
      yStart = height - 1;
      yEnd = -1;
      yStep = -1;
      break;
    default:
      throw new Error(`Unknown direction: ${direction}`);
  }

  // --------- Traversal modes ----------
  if (mode === 'rows') {
    for (let y = yStart; y !== yEnd; y += yStep) {
      if (snake && (y - yStart) % 2 !== 0) {
        for (let x = xEnd - xStep; x !== xStart - xStep; x -= xStep) {
          coords.push([x, y]);
        }
      } else {
        for (let x = xStart; x !== xEnd; x += xStep) {
          coords.push([x, y]);
        }
      }
    }
  } else if (mode === 'columns') {
    for (let x = xStart; x !== xEnd; x += xStep) {
      if (snake && (x - xStart) % 2 !== 0) {
        for (let y = yEnd - yStep; y !== yStart - yStep; y -= yStep) {
          coords.push([x, y]);
        }
      } else {
        for (let y = yStart; y !== yEnd; y += yStep) {
          coords.push([x, y]);
        }
      }
    }
  } else if (mode === 'circle-out') {
    const cx = Math.floor(width / 2);
    const cy = Math.floor(height / 2);
    const maxRadius = Math.ceil(Math.sqrt(cx * cx + cy * cy));

    for (let r = 0; r <= maxRadius; r++) {
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const dx = x - cx;
            const dy = y - cy;
            const absX = dx < 0 ? -dx : dx;
            const absY = dy < 0 ? -dy : dy;
            const dist = absX > absY ? absX : absY;
            if (dist === r) coords.push([x, y]);
          }
        }
      }
    }
  } else if (mode === 'circle-in') {
    const cx = Math.floor(width / 2);
    const cy = Math.floor(height / 2);
    const maxRadius = Math.ceil(Math.sqrt(cx * cx + cy * cy));

    for (let r = maxRadius; r >= 0; r--) {
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const dx = x - cx;
            const dy = y - cy;
            const absX = dx < 0 ? -dx : dx;
            const absY = dy < 0 ? -dy : dy;
            const dist = absX > absY ? absX : absY;
            if (dist === r) coords.push([x, y]);
          }
        }
      }
    }
  } else if (mode === 'blocks' || mode === 'shuffle-blocks') {
    // TODO: implement option to sort blocks by frequency and respect start position + direction
    const blocks = [];
    for (let by = 0; by < height; by += blockHeight) {
      for (let bx = 0; bx < width; bx += blockWidth) {
        const block = [];
        for (let y = by; y < Math.min(by + blockHeight, height); y++) {
          for (let x = bx; x < Math.min(bx + blockWidth, width); x++) {
            block.push([x, y]);
          }
        }
        blocks.push(block);
      }
    }

    if (mode === 'shuffle-blocks') {
      for (let i = blocks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      }
    }

    for (const block of blocks) {
      for (const coord of block) {
        coords.push(coord);
      }
    }
  } else {
    throw new Error(`Unknown mode: ${mode}`);
  }

  if (sortByFrequency) return sortCoordsByFrequency(coords, width, pixels, artColorFrequency);
  return coords;
}

/**
 * Sort coordinates by color frequency using counting buckets.
 * @param {[number, number][]} coords
 * @param {number} width
 * @param {Uint8ClampedArray} pixels
 * @param {Map<number, number>} artColorFrequency - color ID → pixel count
 * @returns {[number, number][]}
 */
function sortCoordsByFrequency(coords, width, pixels, artColorFrequency) {
  if (!artColorFrequency || artColorFrequency.size === 0) {
    throw new Error('artColorFrequency must be provided for option sort-by-color-frequency');
  }

  let maxFreq = 0;
  for (const freq of artColorFrequency.values()) if (freq > maxFreq) maxFreq = freq;

  const buckets = new Array(maxFreq + 1);
  for (let i = 0; i <= maxFreq; i++) buckets[i] = [];

  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    const idx = (y * width + x) * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];

    const colorKey = (r << 16) | (g << 8) | b;
    const colorId = APP_CONSTANTS.RGB_KEY_TO_ID.get(colorKey);

    if (colorId === undefined) {
      throw new Error(`Unknown color RGB(${r},${g},${b}) at [${x}, ${y}]`);
    }

    const frequency = artColorFrequency.get(colorId) || 0;
    buckets[frequency].push(coords[i]);
  }

  const result = new Array(coords.length);
  let writeIndex = 0;

  for (let freq = 0; freq <= maxFreq; freq++) {
    const bucket = buckets[freq];
    for (let j = 0; j < bucket.length; j++) result[writeIndex++] = bucket[j];
  }

  return result;
}
