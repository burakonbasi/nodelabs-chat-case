import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: {
    serializer?: (value: T) => string;
    deserializer?: (value: string) => T;
    syncData?: boolean;
  }
): [T, SetValue<T>, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    syncData = true,
  } = options || {};

  // Get value from localStorage
  const getStoredValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [key, defaultValue, deserializer]);

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Set value to localStorage
  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, serializer(valueToStore));
        
        // Dispatch custom event for cross-tab synchronization
        if (syncData) {
          window.dispatchEvent(
            new CustomEvent('local-storage', {
              detail: { key, value: valueToStore },
            })
          );
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serializer, storedValue, syncData]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(defaultValue);
      
      if (syncData) {
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: { key, value: null },
          })
        );
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue, syncData]);

  // Handle storage change events (cross-tab synchronization)
  useEffect(() => {
    if (!syncData) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserializer(e.newValue));
        } catch (error) {
          console.error('Error parsing storage event value:', error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(defaultValue);
      }
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.key === key) {
        setStoredValue(customEvent.detail.value ?? defaultValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleCustomEvent);
    };
  }, [key, defaultValue, deserializer, syncData]);

  return [storedValue, setValue, removeValue];
}

// Specific typed versions for common use cases
export function useLocalStorageString(
  key: string,
  defaultValue: string
): [string, SetValue<string>, () => void] {
  return useLocalStorage(key, defaultValue, {
    serializer: (v) => v,
    deserializer: (v) => v,
  });
}

export function useLocalStorageNumber(
  key: string,
  defaultValue: number
): [number, SetValue<number>, () => void] {
  return useLocalStorage(key, defaultValue, {
    serializer: (v) => v.toString(),
    deserializer: (v) => Number(v),
  });
}

export function useLocalStorageBoolean(
  key: string,
  defaultValue: boolean
): [boolean, SetValue<boolean>, () => void] {
  return useLocalStorage(key, defaultValue, {
    serializer: (v) => v.toString(),
    deserializer: (v) => v === 'true',
  });
}

// Hook for managing multiple localStorage values
export function useLocalStorageObject<T extends Record<string, any>>(
  prefix: string,
  defaultValues: T
): {
  values: T;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  removeValue: <K extends keyof T>(key: K) => void;
  clear: () => void;
} {
  const [values, setValues] = useState<T>(() => {
    const stored: Partial<T> = {};
    Object.keys(defaultValues).forEach((key) => {
      try {
        const item = window.localStorage.getItem(`${prefix}:${key}`);
        if (item) {
          stored[key as keyof T] = JSON.parse(item);
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${prefix}:${key}":`, error);
      }
    });
    return { ...defaultValues, ...stored };
  });

  const setValue = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      try {
        window.localStorage.setItem(`${prefix}:${String(key)}`, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting localStorage key "${prefix}:${String(key)}":`, error);
      }
    },
    [prefix]
  );

  const removeValue = useCallback(
    <K extends keyof T>(key: K) => {
      setValues((prev) => ({ ...prev, [key]: defaultValues[key] }));
      try {
        window.localStorage.removeItem(`${prefix}:${String(key)}`);
      } catch (error) {
        console.error(`Error removing localStorage key "${prefix}:${String(key)}":`, error);
      }
    },
    [prefix, defaultValues]
  );

  const clear = useCallback(() => {
    setValues(defaultValues);
    Object.keys(defaultValues).forEach((key) => {
      try {
        window.localStorage.removeItem(`${prefix}:${key}`);
      } catch (error) {
        console.error(`Error removing localStorage key "${prefix}:${key}":`, error);
      }
    });
  }, [prefix, defaultValues]);

  return { values, setValue, removeValue, clear };
}