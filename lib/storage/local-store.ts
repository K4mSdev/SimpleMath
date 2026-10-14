"use client";

import { useSyncExternalStore } from "react";

export interface LocalStore<T> {
  read: () => T;
  write: (value: T) => void;
  subscribe: (listener: () => void) => () => void;
  getServerSnapshot: () => T;
}

/**
 * Mały magazyn oparty o localStorage, zgodny z useSyncExternalStore
 * (brak błędów hydracji, synchronizacja między kartami przeglądarki).
 */
export function createLocalStore<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
): LocalStore<T> {
  let cachedRaw: string | null | undefined;
  let cachedValue = fallback;
  const listeners = new Set<() => void>();

  const read = (): T => {
    if (typeof window === "undefined") return fallback;
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return cachedValue;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        const parsed: unknown = raw === null ? fallback : JSON.parse(raw);
        cachedValue = validate(parsed) ? parsed : fallback;
      } catch {
        cachedValue = fallback;
      }
    }
    return cachedValue;
  };

  const write = (value: T) => {
    const raw = JSON.stringify(value);
    cachedRaw = raw;
    cachedValue = value;
    try {
      window.localStorage.setItem(key, raw);
    } catch {
      // Brak dostępu do localStorage (np. tryb prywatny) – wartość zostaje w pamięci.
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  return { read, write, subscribe, getServerSnapshot: () => fallback };
}

export function useLocalStore<T>(store: LocalStore<T>): [T, (value: T) => void] {
  const value = useSyncExternalStore(store.subscribe, store.read, store.getServerSnapshot);
  return [value, store.write];
}
