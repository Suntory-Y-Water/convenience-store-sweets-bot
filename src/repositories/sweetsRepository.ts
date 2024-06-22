import { ISweetsRepository } from '../interfaces/sweetsInterface';

export class SweetsRepository implements ISweetsRepository {
  /**
   * KVStoreから指定されたプレフィックスとパラメータに基づいてデータを取得し、リスト形式で返します。
   * @param KV - KVNamespaceインスタンス
   * @param prefixParam - プレフィックスパラメータ
   * @param params - 検索に使用するパラメータ
   * @returns データのリスト、またはデータが存在しない場合はnull
   */
  fetchItemsKVStore = async <T>(
    KV: KVNamespace<string>,
    prefixParam: string,
    params: string,
  ): Promise<T[] | null> => {
    const prefix = `${params}${prefixParam}`;
    const list = await KV.list({ prefix });
    const kvList: T[] = [];

    if (list.keys.length === 0) {
      console.log(`fetchItemsKVStore no data found params : ${params}${prefixParam}`);
      return null;
    }

    for (const key of list.keys) {
      const value = await KV.get<T>(key.name, 'json');
      if (value) {
        kvList.push(value);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kvList.sort((a: any, b: any) => (a.id > b.id ? 1 : -1));
    return kvList;
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
