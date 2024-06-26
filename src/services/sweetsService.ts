import { Constants } from '../constants';
import { Sweets } from '../model/sweets';
import { ISweetsRepository } from '../repositories/sweetsRepository';
import { Cache } from '../utils/cache';

export interface ISweetsService {
  /**
   * @description KVストアから指定したコンビニのスイーツ情報を全件取得する。
   * @param {KVNamespace} KV
   * @param {string} prefix (prefix + storeType)
   * @return {*}  {(Promise<Sweets[] | null>)}
   * @memberof ISweetsService
   */
  getStoreAllSweets(KV: KVNamespace, prefix: string): Promise<Sweets[] | null>;

  /**
   * @description Sweets型の配列から、新商品のSweetsだけを取り出して今週の新商品の昇順にして返却する。
   * @param {Sweets[]} sweetsArray
   * @return {*}  {Sweets[]}
   * @memberof ISweetsService
   */
  filterNewSweets(sweetsArray: Sweets[]): Sweets[];
  getRandomSweets(
    KV: KVNamespace,
    storeType: string,
    prefix: string,
  ): Promise<Sweets | null>;
  createSweets(KV: KVNamespace, prefix: string, sweets: Sweets[]): Promise<void>;
  deleteSweets(KV: KVNamespace, prefix: string): Promise<void>;
}

export class SweetsService implements ISweetsService {
  private sweetsRepository: ISweetsRepository;
  private cache: Cache<Sweets[]>;
  constructor(sweetsRepository: ISweetsRepository) {
    this.sweetsRepository = sweetsRepository;
    this.cache = new Cache<Sweets[]>(Constants.CACHE_TTL);
  }

  getStoreAllSweets = async (KV: KVNamespace, prefix: string) => {
    const cacheKey = `getStoreAllSweets-${prefix}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    try {
      const lists = await this.sweetsRepository.fetchItemKVStoreKey(KV, prefix);
      if (lists.keys.length === 0) {
        return null;
      }

      // コケたときに全てのPromiseが失敗するようにする
      const promises = lists.keys.map(async (list) => {
        const item = await this.sweetsRepository.fetchItemKVStoreValue<Sweets>(
          KV,
          list.name,
        );
        if (item === null) {
          throw new Error('Item is null');
        }
        return item;
      });

      const data = await Promise.all(promises);
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`スイーツの情報取得に失敗しました : ${error.message}`);
      }
      return null;
    }
  };

  filterNewSweets = (sweetsArray: Sweets[]): Sweets[] => {
    return sweetsArray
      .filter((sweets) => sweets.metadata?.isNew === true)
      .sort((a, b) => {
        const releaseOrder = { this_week: 0, next_week: 1 };

        if (a.metadata?.releasePeriod && b.metadata?.releasePeriod) {
          return (
            releaseOrder[a.metadata.releasePeriod] -
            releaseOrder[b.metadata.releasePeriod]
          );
        }

        if (a.metadata?.releasePeriod) {
          return -1;
        }

        if (b.metadata?.releasePeriod) {
          return 1;
        }

        return 0;
      });
  };

  getRandomSweets = async (
    KV: KVNamespace,
    storeType: string,
    prefix: string,
  ): Promise<Sweets | null> => {
    try {
      const params = prefix + storeType;
      const lists = await this.sweetsRepository.fetchItemKVStoreKey(KV, params);

      if (lists.keys.length === 0) {
        return null;
      }

      // キーの中からランダムに1つ選ぶ
      const randomIndex = Math.floor(Math.random() * lists.keys.length);
      const randomKeyName = lists.keys[randomIndex].name;

      return await this.sweetsRepository.fetchItemKVStoreValue<Sweets>(KV, randomKeyName);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`スイーツの情報取得に失敗しました : ${error.message}`);
      }
      return null;
    }
  };

  deleteSweets = async (KV: KVNamespace, prefix: string): Promise<void> => {
    return this.sweetsRepository.deleteItemsKVStore(KV, prefix);
  };

  createSweets = async (
    KV: KVNamespace,
    prefix: string,
    sweets: Sweets[],
  ): Promise<void> => {
    const promises = sweets.map(async (item) => {
      const id = item.storeType + crypto.randomUUID();
      const sweetsData: Sweets = {
        id: id,
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        itemImage: item.itemImage,
        itemHref: item.itemHref,
        storeType: item.storeType,
        metadata: item.metadata,
      };
      await this.sweetsRepository.putItemKVStore<Sweets>(
        KV,
        `${prefix}${id}`,
        sweetsData,
      );
    });
    await Promise.all(promises);
  };
}
