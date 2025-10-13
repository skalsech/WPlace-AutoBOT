export const colorCache = new Map();

export function invalidateColorCache(changedParams = {}) {
  if (changedParams.availableColors) {
    colorCache.clear();
    return;
  }

  for (const key of colorCache.keys()) {
    const [_, algo, chromaFlag, chromaWeight] = key.split('|');

    if (changedParams.colorMatchingAlgorithm && algo !== changedParams.colorMatchingAlgorithm) {
      colorCache.delete(key);
      continue;
    }

    if (
      changedParams.enableChromaPenalty !== undefined &&
      chromaFlag !== (changedParams.enableChromaPenalty ? 'c' : 'nc')
    ) {
      colorCache.delete(key);
      continue;
    }

    if (
      changedParams.chromaPenaltyWeight !== undefined &&
      Number(chromaWeight) !== changedParams.chromaPenaltyWeight
    ) {
      colorCache.delete(key);
      continue;
    }
  }
}
