const DB_NAME = 'WplaceDB';
const DB_VERSION = 1;
const STORE_NAME = 'progress-store';

let dbPromise = null;

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });

  return dbPromise;
}

async function transactionComplete(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('transaction error'));
    tx.onabort = () => reject(tx.error || new Error('transaction aborted'));
  });
}
/**
 * Normalizes data to a format safe for storage in IndexedDB.
 *
 * Why this is needed:
 * - IndexedDB supports structured cloning, which handles ArrayBuffer, TypedArrays,
 *   and even some complex types — but **not `Set`, `Map`, or custom classes**.
 * - While `ArrayBuffer` can be stored directly, `Set` becomes an empty object `{}` if
 *   accidentally passed through JSON.stringify (e.g., during export/import).
 * - To ensure reliable round-trip storage (save → load → use), we convert:
 *     • `Uint8ClampedArray` → `.buffer` (ArrayBuffer) — for efficient binary storage
 *     • `Set` → array — because IndexedDB structured clone **does support `Set`**,
 *       but **only if the environment fully complies**; however, many wrappers,
 *       devtools exports, or fallbacks use JSON, so explicit conversion is safer.
 *
 * What it does:
 * - Replaces `imageData.pixels` (if Uint8ClampedArray) with its `.buffer`.
 * - Converts known `Set` fields (e.g., `state.filteredColorIds`) to arrays.
 * - All other fields remain unchanged.
 *
 * This guarantees:
 * - Minimal storage size (binary as ArrayBuffer)
 * - Compatibility with both IndexedDB and JSON-based export
 * - Safe deserialization (caller must restore `Set` from array)
 *
 * @param {object} value - The object to normalize (e.g., progress data).
 * @returns {object} Normalized object, safe for IndexedDB and JSON.
 */
function normalizeForStorage(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }

  let normalized = value;

  if (value.imageData?.pixels instanceof Uint8ClampedArray) {
    normalized = {
      ...value,
      imageData: {
        ...value.imageData,
        pixels: value.imageData.pixels.buffer,
      },
    };
  }

  if (normalized.state?.filteredColorIds instanceof Set) {
    normalized = {
      ...normalized,
      state: {
        ...normalized.state,
        filteredColorIds: Array.from(normalized.state.filteredColorIds),
      },
    };
  }

  return normalized;
}

/**
 * Restores data loaded from IndexedDB or JSON into a usable runtime format.
 *
 * What it does:
 * - If `imageData.pixels` is a number array (e.g., from JSON export),
 *   converts it to Uint8ClampedArray.
 * - If `imageData.pixels` is an ArrayBuffer (from proper IndexedDB save),
 *   wraps it in Uint8ClampedArray.
 * - Converts `state.filteredColorIds` from array back to Set.
 *
 * @param {object} value - Loaded data object
 * @returns {object} Restored object with proper types
 */
function normalizeAfterLoad(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value.state?.filteredColorIds)) {
    value.state.filteredColorIds = new Set(value.state.filteredColorIds);
  }

  // Restore pixels → Uint8ClampedArray (not ArrayBuffer!)
  if (value.imageData?.pixels) {
    let pixelsArray;

    if (value.imageData.pixels instanceof ArrayBuffer) {
      pixelsArray = new Uint8ClampedArray(value.imageData.pixels);
    } else if (Array.isArray(value.imageData.pixels)) {
      pixelsArray = new Uint8ClampedArray(value.imageData.pixels);
    }

    if (pixelsArray) {
      value.imageData.pixels = pixelsArray;
    }
  }

  return value;
}

export const saveToIndexDB = async (key, value) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const normalized = normalizeForStorage(value);
    store.put(normalized, key);

    await transactionComplete(tx);
    return true;
  } catch (error) {
    console.error('❌ IndexedDB save failed:', error);
    return false;
  }
};

export const loadFromIndexDB = async (key, defaultValue = null) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const record = await promisifyRequest(store.get(key));
    await transactionComplete(tx);

    if (!record) return defaultValue;
    return normalizeAfterLoad(record);
  } catch (error) {
    console.error('❌ IndexedDB load failed:', error);
    return defaultValue;
  }
};

export async function clearIndexDBStorage() {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    await transactionComplete(tx);
    console.log('📋 IndexedDB cleared');
    return true;
  } catch (e) {
    console.error('Failed to clear IndexedDB:', e);
    return false;
  }
}
