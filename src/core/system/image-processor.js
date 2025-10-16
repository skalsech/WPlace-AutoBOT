import { APP_CONSTANTS } from '../../app/config/app-constants.js';
import { encodeRGBAToKey } from '../../utils/color-matching/color-matching.js';

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
   * @returns {Map<number, number>} color ID → pixel count.
   */
  countColors() {
    const data = this.getPixelData();
    if (!data) return new Map();

    /** @type {Map<number, number>}*/
    const colorCounts = new Map();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      const rgbKey = encodeRGBAToKey(r, g, b, a);
      const colorId = APP_CONSTANTS.RGB_KEY_TO_ID.get(rgbKey);

      if (colorId === undefined) {
        console.warn(
          `Unknown color RGB(${r},${g},${b}) found in the template on color frequency analysis`
        );
        continue;
      }

      colorCounts.set(colorId, (colorCounts.get(colorId) || 0) + 1);
    }

    return colorCounts;
  }

  /**
   * Static helper to create ImageProcessor from pixel data
   * @param {number} width
   * @param {number} height
   * @param {Uint8ClampedArray | ArrayBuffer} pixels
   * @returns {ImageProcessor}
   */
  static fromPixelData(width, height, pixels) {
    return new ImageProcessor({ width, height, pixels });
  }
}
