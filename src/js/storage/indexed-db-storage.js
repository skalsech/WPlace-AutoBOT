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
 * - IndexedDB can store binary data directly (ArrayBuffer, TypedArray).
 * - However, JSON and structured cloning behave differently: if an object
 *   was ever serialized using JSON.stringify (e.g., during export),
 *   an ArrayBuffer becomes a regular array of numbers.
 * - Therefore, before writing to IndexedDB, it’s important to ensure
 *   that the stored value contains an actual ArrayBuffer.
 *
 * What it does:
 * - If `pixels` is a Uint8ClampedArray, it is replaced with its `.buffer` (ArrayBuffer).
 * - All other fields remain unchanged.
 *
 * This guarantees that IndexedDB stores binary data in its native format
 * (not as a numeric array), which reduces storage size and speeds up loading.
 *
 * @param {object} value - The object containing `imageData`, potentially with pixel data.
 * @returns {object} The normalized object, ready to be stored in IndexedDB.
 */
function normalizeForStorage(value) {
  if (value?.imageData?.pixels instanceof Uint8ClampedArray) {
    value = {
      ...value,
      imageData: {
        ...value.imageData,
        pixels: value.imageData.pixels.buffer,
      },
    };
  }
  return value;
}

function normalizeAfterLoad(value) {
  if (value?.imageData?.pixels instanceof Array) {
    value.imageData.pixels = new Uint8ClampedArray(value.imageData.pixels).buffer;
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
