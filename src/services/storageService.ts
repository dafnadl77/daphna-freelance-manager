/**
 * Thin localStorage abstraction. This is the ONLY module allowed to touch
 * `window.localStorage` directly — everything else goes through dataService.
 * Swapping the persistence layer for Supabase later means rewriting this
 * file (and dataService's implementations) without touching any component.
 */

const NAMESPACE = "daphna-freelance-app";

function namespacedKey(key: string): string {
  return `${NAMESPACE}:${key}`;
}

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(namespacedKey(key));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(namespacedKey(key), JSON.stringify(value));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded).
    // Failing silently keeps the UI usable for the current session.
  }
}

export function removeItem(key: string): void {
  window.localStorage.removeItem(namespacedKey(key));
}
