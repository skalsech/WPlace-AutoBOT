const createStorageSaver = (options = {}) => {
  const { maxLength = 100, shouldLog = false, label = 'LocalStorage' } = options;

  return (key, value) => {
    let serializedValue;

    try {
      serializedValue = JSON.stringify(value);
    } catch (e) {
      console.groupCollapsed(`⚠️ ${label}: Could not serialize value`);
      console.log('%cKey:', 'font-weight: bold; color: #4a90e2;', key);
      console.log('%cValue (failed to serialize):', 'font-weight: bold; color: #d6333f;', value);
      console.log('%cError:', 'color: #999;', e);
      console.groupEnd();
      return false;
    }

    try {
      localStorage.setItem(key, serializedValue);

      if (shouldLog) {
        const displayValue =
          serializedValue.length > maxLength
            ? serializedValue.slice(0, maxLength) + '...'
            : serializedValue;

        console.groupCollapsed(`💾 ${label}: Saved to localStorage`);
        console.log('%cKey:', 'font-weight: bold; color: #4a90e2;', key);
        console.log('%cValue:', 'font-weight: bold; color: #50c878;', displayValue);
        if (serializedValue.length > maxLength) {
          console.log('%cFull serialized value:', 'color: #999;', serializedValue);
        }
        console.groupEnd();
      }
    } catch (e) {
      console.groupCollapsed(`❌ ${label}: Could not save to localStorage`);
      console.log('%cKey:', 'font-weight: bold; color: #4a90e2;', key);
      console.log('%cValue (failed to save):', 'font-weight: bold; color: #d6333f;', value);
      console.log('%cSerialized (partial):', 'color: #999;', serializedValue);
      console.log('%cError:', 'color: #999;', e);
      console.groupEnd();
      return false;
    }
    return true;
  };
};

const createStorageLoader = (options = {}) => {
  const { shouldLog = false, label = 'Storage' } = options;

  return (key, defaultValue = null) => {
    const raw = localStorage.getItem(key);

    // 1. key is not found
    if (raw === null) {
      if (shouldLog) {
        console.groupCollapsed(`🔍 ${label}: Key not found`);
        console.log('%cKey:', 'font-weight: bold; color: #4a90e2;', key);
        console.log('%cUsing default:', 'color: #999;', defaultValue);
        console.groupEnd();
      }
      return defaultValue;
    }

    let parsed = raw;
    let isParsed = false;

    // 2. try to parse as json
    try {
      parsed = JSON.parse(raw);
      isParsed = true;
    } catch (e) {
      // 3. JSON is failed, let's check if string is plain without json traces
      if (typeof raw === 'string') {
        const isSuspicious =
          raw.length > 100 ||
          // eslint-disable-next-line no-control-regex
          /[\x00-\x1F\x7F-\x9F]/.test(raw) || // control chars
          /[\uFFFD]/.test(raw) || // replacement character
          raw.trim() === '';

        if (isSuspicious) {
          // looks like garbage or corrupted json
          if (shouldLog) {
            console.groupCollapsed(`❌ ${label}: Invalid or corrupted data`);
            console.log('%cKey:', 'font-weight: bold; color: #4a90e2;', key);
            console.log('%cRaw value:', 'color: #d6333f;', raw);
            console.log('%cError:', 'color: #999;', e);
            console.log('%cUsing default:', 'color: #666;', defaultValue);
            console.groupEnd();
          }
          return defaultValue;
        }

        if (shouldLog) {
          console.groupCollapsed(`🟡 ${label}: Raw string (not JSON)`);
          console.log('%cKey:', 'font-weight: bold; color: #4a90e2;', key);
          console.log('%cValue:', 'color: #50c878;', raw);
          console.groupEnd();
        }
      }
    }

    // 4. successfully parsed JSON
    if (isParsed && shouldLog) {
      console.groupCollapsed(`✅ ${label}: Loaded (JSON)`);
      console.log('%cKey:', 'font-weight: bold; color: #4a90e2;', key);
      console.log('%cValue:', 'font-weight: bold; color: #50c878;', parsed);
      console.groupEnd();
    }

    return parsed;
  };
};

export const saveToStorage = createStorageSaver({
  maxLength: 80,
});

export const loadFromStorage = createStorageLoader();
