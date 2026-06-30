import { useState, useEffect } from 'react';

// Custom hook to manage LocalStorage with real-time cross-tab synchronization
export function useLocalStorage(key, initialValue) {
  // Read value from local storage on load
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('[useLocalStorage] Read error:', error);
      return initialValue;
    }
  });

  const [syncLogs, setSyncLogs] = useState([]);

  // Update value in local state and write to localStorage
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('[useLocalStorage] Write error:', error);
    }
  };

  // Capture storage changes from other tabs of the same origin
  useEffect(() => {
    const handleStorageChange = (e) => {
      // e.key is null if storage was cleared globally (localStorage.clear())
      if (e.key === key && e.newValue !== null) {
        try {
          const parsedValue = JSON.parse(e.newValue);
          const oldParsedValue = e.oldValue ? JSON.parse(e.oldValue) : null;
          
          setStoredValue(parsedValue);

          // Add transaction logs to display in the visual console
          const timestamp = new Date().toLocaleTimeString();
          const logEntry = {
            timestamp,
            key: e.key,
            oldValue: oldParsedValue,
            newValue: parsedValue,
            url: e.url
          };
          setSyncLogs((prev) => [logEntry, ...prev]);
        } catch (error) {
          console.error('[useLocalStorage] Sync error:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, syncLogs, setSyncLogs];
}
export default useLocalStorage;
