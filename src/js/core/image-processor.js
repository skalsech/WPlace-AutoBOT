// IMAGE PROCESSOR CLASS
import { APP_CONSTANTS } from '../config/APP_CONSTANTS.js';

export class ImageProcessor {
  constructor(imageSrc) {
    this.imageSrc = imageSrc;
    this.img = null;
    this.canvas = null;
    this.ctx = null;
  }

  async load() {
    return new Promise((resolve, reject) => {
      this.img = new Image();
      this.img.crossOrigin = 'anonymous';
      this.img.onload = () => {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.img.width;
        this.canvas.height = this.img.height;
        this.ctx.drawImage(this.img, 0, 0);
        resolve();
      };
      this.img.onerror = reject;
      this.img.src = this.imageSrc;
    });
  }

  getDimensions() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  getPixelData() {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
  }

  /**
   * Counts color frequency in the uploaded art.
   * Transparent pixels (a=0) are skipped if shouldSkipTransparent is true,
   * otherwise replaced with APP_CONSTANTS.COLOR_MAP['0'].rgb.
   * @param {boolean} shouldSkipTransparent - Whether to skip or replace transparent pixels.
   * @returns {Record<string, number>} RGB color string (e.g., "255,255,255") → pixel count.
   */
  countColors(shouldSkipTransparent) {
    const data = this.getPixelData();
    const colorCounts = {};
    const defaceColorObj = APP_CONSTANTS.COLOR_MAP['0'].rgb;
    const defaceTransparentColor = [defaceColorObj.r, defaceColorObj.g, defaceColorObj.b].join(',');

    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = data.slice(i, i + 4);

      if (a === 0 && shouldSkipTransparent) continue;
      const key = a === 0 ? defaceTransparentColor : `${r},${g},${b}`;

      colorCounts[key] = (colorCounts[key] || 0) + 1;
    }

    return colorCounts;
  }
}
