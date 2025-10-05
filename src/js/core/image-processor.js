import { APP_CONSTANTS } from '../config/APP_CONSTANTS.js';

export class ImageProcessor {
  constructor(imageSrcOrData) {
    if (typeof imageSrcOrData === 'string') {
      this.imageSrc = imageSrcOrData;
      this.img = null;
      this.canvas = null;
      this.ctx = null;
    } else if (imageSrcOrData && typeof imageSrcOrData === 'object') {
      const { width, height, pixels } = imageSrcOrData;
      if (width && height && pixels) {
        this.imageSrc = null;
        this.img = null;
        this.canvas = null;
        this.ctx = null;

        this.createFromPixelData(width, height, pixels);
      } else {
        throw new Error('Invalid image data object: missing width, height, or pixels');
      }
    } else {
      this.imageSrc = null;
      this.img = null;
      this.canvas = null;
      this.ctx = null;
    }
  }

  /**
   * Creates canvas and context from pixel data
   * @param {number} width
   * @param {number} height
   * @param {Uint8ClampedArray | ArrayBuffer} pixels
   */
  createFromPixelData(width, height, pixels) {
    if (pixels instanceof ArrayBuffer) {
      pixels = new Uint8ClampedArray(pixels);
    }

    if (!(pixels instanceof Uint8ClampedArray)) {
      throw new Error('pixels must be Uint8ClampedArray or ArrayBuffer');
    }

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;

    const imageData = new ImageData(pixels, width, height);
    this.ctx.putImageData(imageData, 0, 0);

    this.img = this.canvas;
  }

  async load() {
    if (this.imageSrc) {
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
    } else {
      if (this.canvas && this.ctx) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error('No image source or pixel data available'));
      }
    }
  }

  getDimensions() {
    return {
      width: this.canvas?.width || 0,
      height: this.canvas?.height || 0,
    };
  }

  getPixelData() {
    if (!this.ctx) return null;
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
  }

  /**
   * Counts color frequency in the uploaded art.
   * Transparent pixels (a=0) are skipped if shouldSkipTransparent is true,
   * otherwise replaced with APP_CONSTANTS.COLOR_MAP['0'].rgb.
   * @param {boolean} shouldSkipTransparent - Whether to skip or replace transparent pixels.
   * @returns {Map<string, number>} RGB color string (e.g., "255,255,255") → pixel count.
   */
  countColors(shouldSkipTransparent) {
    const data = this.getPixelData();
    if (!data) return new Map();

    const colorCounts = new Map();
    const defaceColorObj = APP_CONSTANTS.COLOR_MAP['0'].rgb;
    const defaceTransparentColor = [defaceColorObj.r, defaceColorObj.g, defaceColorObj.b].join(',');

    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = data.slice(i, i + 4);

      if (a === 0 && shouldSkipTransparent) continue;
      const key = a === 0 ? defaceTransparentColor : `${r},${g},${b}`;

      colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
    }

    return colorCounts;
  }

  /**
   * Static helper to create ImageProcessor from pixel data
   * @param {number} width
   * @param {number} height
   * @param {Uint8ClampedArray | ArrayBuffer} pixels
   * @param {boolean} shouldSkipTransparent
   * @returns {ImageProcessor}
   */
  static fromPixelData(width, height, pixels, shouldSkipTransparent = false) {
    const proc = new ImageProcessor({ width, height, pixels });
    //proc.countColors(shouldSkipTransparent);
    return proc;
  }
}
