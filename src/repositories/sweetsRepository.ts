import { ISweetsRepository } from '../interfaces/sweetsInterface';

export class SweetsRepository implements ISweetsRepository {
  /**
   *
   * @description KVストアからprefixが一致するkeyを取得する。
   * @param {KVNamespace<string>} KV
   * @param {string} prefixParam
   * @param {string} params
   * @memberof SweetsRepository
   */
  fetchItemKVStoreKey = async (
    KV: KVNamespace<string>,
    prefixParam: string,
    params: string,
  ): Promise<KVNamespaceListResult<unknown, string>> => {
    const prefix = `${params}${prefixParam}`;
    return await KV.list({ prefix });
  };

  /**
   *
   * @description KVストアからkeyに紐づくデータを取得する。
   * @param {KVNamespace<string>} KV
   * @param {string} key
   * @memberof SweetsRepository
   */
  fetchItemKVStoreValue = async <T>(
    KV: KVNamespace<string>,
    key: string,
  ): Promise<T | null> => {
    const lists = await KV.get<T>(key, 'json');

    if (!lists) {
      return null;
    }

    return lists;
  };

  /**
   * @description KVストアに保存されたデータを全て削除する。
   * @param {KVNamespace} KV KVストア
   * @param {string} prefix KVストアのキーのプレフィックス
   * @memberof SweetsRepository
   */
  deleteItemsKVStore = async (KV: KVNamespace, prefix: string): Promise<void> => {
    try {
      const list = await KV.list({ prefix });
      for (const key of list.keys) {
        await KV.delete(key.name);
      }
    } catch (error) {
      console.error(`Failed to delete data: ${error}`);
      return;
    }
  };

  /**
   *
   * @description KVストアにデータを追加する。
   * @param {KVNamespace} KV 環境変数から受け取ったKVストア
   * @param {string} key KVストアのキー
   * @param {T} value KVストアに保存するデータの型と値
   * @memberof SweetsRepository
   */
  putItemKVStore = async <T>(KV: KVNamespace, key: string, value: T): Promise<void> => {
    try {
      await KV.put(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to put data: ${error}`);
      return;
    }
  };
}
