const TTL_MS = 2 * 60 * 1000;
const cache = new Map<string, { data: unknown; expiry: number }>();

export function getEntriesCache(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiry) return null;
  return entry.data;
}

export function setEntriesCache(key: string, data: unknown) {
  cache.set(key, { data, expiry: Date.now() + TTL_MS });
}

export function clearEntriesCache() {
  cache.clear();
}
