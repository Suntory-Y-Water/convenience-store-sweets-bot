interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export class Cache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private ttl: number;

  constructor(ttl: number) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key: string, value: T): void {
    const expiry = Date.now() + this.ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }
}
