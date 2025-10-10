import { overlayManager } from '../tiles/overlay-manager.js';
import { state } from './state.js';
import { isTransparentPixel } from '../utils/color-matching.js';
/**
 * @typedef {{ coord: [number, number], frequency: number, index: number } | null} EnrichedCoord
 */

/**
 * @param {number} width
 * @param {number} height
 * @param {'rows'|'columns'|'circle-out'|'circle-in'|'blocks'|'shuffle-blocks'} mode
 * @param {'top-left'|'top-right'|'bottom-left'|'bottom-right'} direction
 * @param {boolean} snake
 * @param {number} blockWidth
 * @param {number} blockHeight
 * @param {boolean} sortByFrequency
 * @param {Uint8ClampedArray} pixels
 * @returns {Promise<[number, number][]>}
 */
export async function generateCoordinates(
  width,
  height,
  mode,
  direction,
  snake,
  blockWidth,
  blockHeight,
  sortByFrequency,
  pixels
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
    // todo make this option as sort by frequency and respect start pos and direction
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
      // Simple Fisher-Yates shuffle
      for (let i = blocks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      }
    }

    // Concatenate all blocks
    for (const block of blocks) {
      for (const coord of block) {
        coords.push(coord);
      }
    }
  } else {
    throw new Error(`Unknown mode: ${mode}`);
  }

  if (sortByFrequency) {
    if (!overlayManager || state.artColorFrequency.size === 0) {
      throw new Error(
        'overlayManager and artColorFrequency must be provided for option sort-by-color-frequency'
      );
    }

    /** @type {EnrichedCoord[]} */
    const enrichedCoords = coords.map(([x, y], index) => {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];

      if (!state.paintTransparentPixels && isTransparentPixel(a)) return null;

      const colorStr = `${r},${g},${b}`;
      const frequency = state.artColorFrequency.get(colorStr) || 0;

      return { coord: [x, y], frequency, index };
    });

    /** @type {EnrichedCoord[]} */
    const validCoords = enrichedCoords.filter(Boolean);

    /** @type {Map<number, EnrichedCoord[]>} */
    const groupedByFreq = new Map();

    for (const item of validCoords) {
      const freq = item.frequency;
      if (!groupedByFreq.has(freq)) {
        groupedByFreq.set(freq, []);
      }
      groupedByFreq.get(freq).push(item);
    }

    const sortedFreqs = [...groupedByFreq.keys()].sort((a, b) => a - b);

    const result = [];
    for (const freq of sortedFreqs) {
      const group = groupedByFreq.get(freq);

      group.sort((a, b) => a.index - b.index);
      for (const item of group) {
        result.push(item);
      }
    }

    return result.map((item) => item.coord);
  }

  return coords;
}
