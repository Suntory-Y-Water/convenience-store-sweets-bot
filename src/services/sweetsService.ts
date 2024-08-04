import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { Constants } from '../constants';
import { ISweetsRepository } from '../repositories/sweetsRepository';
import { Sweets } from '../types';
import { Cache } from '../utils/cache';
import { TYPES } from '../containers/inversify.types';
import { ILoggingService } from './loggingService';

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
  /**
   * @description KVストアからランダムに1つのスイーツ情報を取得する。
   * @param {KVNamespace} KV
   * @param {string} storeType
   * @param {string} prefix
   */
  getRandomSweets(
    KV: KVNamespace,
    storeType: string,
    prefix: string,
  ): Promise<Sweets | null>;

  /**
   * @description KVストアにスイーツ情報を登録する。
   * @param {KVNamespace} KV
   * @param {string} prefix
   * @param {Sweets[]} sweets
   */
  createSweets(KV: KVNamespace, prefix: string, sweets: Sweets[]): Promise<void>;

  /**
   * @description KVストアから指定したprefixのスイーツ情報を全て削除する。
   * @param {KVNamespace} KV
   * @param {string} prefix
   */
  deleteSweets(KV: KVNamespace, prefix: string): Promise<void>;
}

@injectable()
export class SweetsService implements ISweetsService {
  private cache: Cache<Sweets[]>;
  private randomSweetsCache: Cache<KVNamespaceListResult<unknown, string>>;

  constructor(
    @inject(TYPES.SweetsRepository) private sweetsRepository: ISweetsRepository,
    @inject(TYPES.LoggingService) private loggingService: ILoggingService,
  ) {
    this.cache = new Cache<Sweets[]>(Constants.CACHE_TTL);
    this.randomSweetsCache = new Cache<KVNamespaceListResult<unknown, string>>(
      Constants.CACHE_TTL,
    );
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
          this.loggingService.error('商品が存在しません');
          throw new Error('商品が存在しません');
        }
        return item;
      });

      const data = await Promise.all(promises);
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        this.loggingService.error(
          `スイーツの情報の取得に失敗しました : ${error.message}`,
        );
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
      const cacheKey = `fetchItemKVStoreKey-${params}`;
      // キャッシュからデータを取得
      let lists = this.randomSweetsCache.get(cacheKey);
      if (!lists) {
        // キャッシュにデータがない場合、KVストアからデータを取得してキャッシュに保存
        lists = await this.sweetsRepository.fetchItemKVStoreKey(KV, params);
        this.randomSweetsCache.set(cacheKey, lists);
        this.loggingService.log('getRandomSweets', 'キャッシュからデータを取得します');
      }

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
