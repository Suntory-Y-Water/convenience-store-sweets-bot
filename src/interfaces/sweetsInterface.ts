export interface ISweetsRepository {
  deleteItemsKVStore(KV: KVNamespace, prefix: string): Promise<void>;
  putItemKVStore<T>(KV: KVNamespace, key: string, value: T): Promise<void>;
  fetchItemKVStoreKey(
    KV: KVNamespace,
    prefix: string,
    params: string,
  ): Promise<KVNamespaceListResult<unknown, string>>;
  fetchItemKVStoreValue<T>(KV: KVNamespace, key: string): Promise<T | null>;
}
