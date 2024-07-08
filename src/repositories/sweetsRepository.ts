import { injectable } from 'inversify';
import { KVException } from '../utils/exceptions';
export interface ISweetsRepository {
  /**
   * @description KVストアに保存されたデータを全て削除する。
   * @param {KVNamespace} KV KVストア
   * @param {string} prefix KVストアのキーのプレフィックス
   * @memberof SweetsRepository
   */
  deleteItemsKVStore(KV: KVNamespace, prefix: string): Promise<void>;
  /**
   *
   * @description KVストアにデータを追加する。
   * @param {KVNamespace} KV 環境変数から受け取ったKVストア
   * @param {string} key KVストアのキー
   * @param {T} value KVストアに保存するデータの型と値
   * @memberof SweetsRepository
   */
  putItemKVStore<T>(KV: KVNamespace, key: string, value: T): Promise<void>;
  /**
   *
   * @description KVストアからprefixが一致するkeyを取得する。
   * @param {KVNamespace<string>} KV
   * @param {string} params KVストアのキー
   * @memberof SweetsRepository
   */
  fetchItemKVStoreKey(
    KV: KVNamespace,
    params: string,
  ): Promise<KVNamespaceListResult<unknown, string>>;
  /**
   *
   * @description KVストアからkeyに紐づくデータを取得する。
   * @param {KVNamespace<string>} KV
   * @param {string} key
   * @memberof SweetsRepository
   */
  fetchItemKVStoreValue<T>(KV: KVNamespace, key: string): Promise<T | null>;
}

@injectable()
export class SweetsRepository implements ISweetsRepository {
  fetchItemKVStoreKey = async (
    KV: KVNamespace<string>,
    params: string,
  ): Promise<KVNamespaceListResult<unknown, string>> => {
    try {
      const prefix = params;
      return await KV.list({ prefix });
    } catch (error) {
      throw new KVException(500, 'Failed to get key from KV', 'fetchItemKVStoreKey');
    }
  };

  fetchItemKVStoreValue = async <T>(
    KV: KVNamespace<string>,
    key: string,
  ): Promise<T | null> => {
    try {
      const lists = await KV.get<T>(key, 'json');
      if (!lists) {
        return null;
      }
      return lists;
    } catch (error) {
      throw new KVException(500, 'Failed to get value from KV', 'fetchItemKVStoreValue');
    }
  };

  deleteItemsKVStore = async (KV: KVNamespace, prefix: string): Promise<void> => {
    try {
      const list = await KV.list({ prefix });
      for (const key of list.keys) {
        await KV.delete(key.name);
      }
    } catch (error) {
      throw new KVException(500, 'Failed to delete data from KV', 'deleteItemsKVStore');
    }
  };

  putItemKVStore = async <T>(KV: KVNamespace, key: string, value: T): Promise<void> => {
    try {
      await KV.put(key, JSON.stringify(value));
    } catch (error) {
      throw new KVException(
        500,
        `KV data update failed. key name is ${key}`,
        'deleteItemsKVStore',
      );
    }
  };
}
