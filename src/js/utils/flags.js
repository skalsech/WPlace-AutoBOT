/**
 * Manages a compact bitmap of boolean flags stored in Uint8Array.
 * Bits are indexed from 0; byte order is reversed (LSB in last byte).
 */
export class FlagsBitmap {
  /**
   * Creates a bit flag manager backed by a Uint8Array.
   * @param {Uint8Array} [bytes] - Initial byte data. Defaults to empty array.
   */
  constructor(bytes) {
    this.bytes = bytes || new Uint8Array(0);
  }

  /**
   * Sets a bit at the given index.
   * @param {number} bitIndex - Zero-based index of the bit to set.
   * @param {boolean} value - Value to set (true or false).
   */
  set(bitIndex, value) {
    const byteIndex = Math.floor(bitIndex / 8);
    const bitOffset = bitIndex % 8;

    if (byteIndex >= this.bytes.length) {
      const newBytes = new Uint8Array(byteIndex + 1);
      const offset = newBytes.length - this.bytes.length;

      for (let i = 0; i < this.bytes.length; i++) {
        newBytes[i + offset] = this.bytes[i];
      }

      this.bytes = newBytes;
    }

    const actualByteIndex = this.bytes.length - 1 - byteIndex;

    if (value) {
      this.bytes[actualByteIndex] |= 1 << bitOffset;
    } else {
      this.bytes[actualByteIndex] &= ~(1 << bitOffset);
    }
  }

  /**
   * Gets the value of a bit at the given index.
   * @param {number} bitIndex - Zero-based index of the bit to get.
   * @returns {boolean} - True if the bit is set, false otherwise.
   */
  get(bitIndex) {
    const byteIndex = Math.floor(bitIndex / 8);
    const bitOffset = bitIndex % 8;
    const totalBytes = this.bytes.length;

    if (byteIndex >= totalBytes) {
      return false;
    }

    const actualByteIndex = totalBytes - 1 - byteIndex;

    return (this.bytes[actualByteIndex] & (1 << bitOffset)) !== 0;
  }
}
