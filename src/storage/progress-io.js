import { clearIndexDBStorage, loadFromIndexDB, saveToIndexDB } from './indexeddb-storage.js';

export async function saveProgressRecord(key, data) {
  try {
    return await saveToIndexDB(key, data);
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
}

export async function loadProgressRecord(key) {
  try {
    return await loadFromIndexDB(key);
  } catch (error) {
    console.error('Error loading progress:', error);
    return null;
  }
}

export async function clearAllProgress() {
  try {
    await clearIndexDBStorage();
    localStorage.removeItem('wplace-bot-progress');
    return true;
  } catch (error) {
    console.error('Error clearing progress:', error);
    return false;
  }
}
