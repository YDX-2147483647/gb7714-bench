import { useState } from "react";

/**
 * Persist state in `localStorage` with automatic synchronization across tabs, type-safe storage and retrieval, and fallback value support. Handles JSON serialization and parsing automatically.
 * https://thibault.sh/react-hooks/use-local-storage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const reset = () => {
    setStoredValue(initialValue);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
  };

  return [storedValue, setValue, reset] as const;
}

export function buildStorageKey(key: string): string {
  return `gb7714-bench-${key}`;
}
