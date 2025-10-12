export function createTestMask(width, height, fill = 1) {
  const total = width * height;
  const mask = new Uint8Array(total);
  mask.fill(fill);
  return mask;
}

export function encodeMask(mask) {
  const str = String.fromCharCode(...mask);
  return btoa(str);
}
