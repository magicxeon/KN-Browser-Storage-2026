import { useState } from 'react';

// Custom hook to manage SessionStorage with standard state interfaces
export function useSessionStorage(key, initialValue) {
  // Read value from session storage on load
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('[useSessionStorage] Read error:', error);
      return initialValue;
    }
  });

  // Update value in local state and write to sessionStorage
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('[useSessionStorage] Write error:', error);
    }
  };

  return [storedValue, setValue];
}
export default useSessionStorage;
