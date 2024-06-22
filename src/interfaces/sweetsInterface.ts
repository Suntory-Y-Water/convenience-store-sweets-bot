export interface ISweetsRepository {
  deleteItemsKVStore(KV: KVNamespace, prefix: string): Promise<void>;
  putItemKVStore<T>(KV: KVNamespace, key: string, value: T): Promise<void>;
  fetchItemsKVStore<T>(
    KV: KVNamespace,
    prefix: string,
    params: string,
  ): Promise<T[] | null>;
}
