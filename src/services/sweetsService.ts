import { ISweetsRepository } from '../interfaces/sweetsInterface';
import { Sweets } from '../model/sweets';

export interface ISweetsService {
  getRandomSweets(
    KV: KVNamespace,
    storeType: string,
    prefix: string,
  ): Promise<Sweets | null>;
  createSweets(KV: KVNamespace, prefix: string, sweets: Sweets[]): Promise<void>;
  deleteSweets(KV: KVNamespace, prefix: string): Promise<void>;
  switchStoreType(receivedMessage: string): string | null;
}

export class SweetsService implements ISweetsService {
  private sweetsRepository: ISweetsRepository;
  constructor(sweetsRepository: ISweetsRepository) {
    this.sweetsRepository = sweetsRepository;
  }

  switchStoreType = (receivedMessage: string): string | null => {
    switch (receivedMessage) {
      case 'セブンのスイーツ':
        return 'SevenEleven';
      case 'ファミマのスイーツ':
        return 'FamilyMart';
      case 'ローソンのスイーツ':
        return 'Lawson';
      default:
        return null;
    }
  };

  getRandomSweets = async (
    KV: KVNamespace,
    storeType: string,
    prefix: string,
  ): Promise<Sweets | null> => {
    try {
      const sweetsList = await this.sweetsRepository.fetchItemsKVStore<Sweets>(
        KV,
        storeType,
        prefix,
      );
      if (!sweetsList) {
        return null;
      }
      // sweetsListの中からランダムに1つ選ぶ
      const randomIndex = Math.floor(Math.random() * sweetsList.length);
      return sweetsList[randomIndex];
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
    sweets.map(async (item) => {
      const id = item.storeType + crypto.randomUUID();
      const sweetsData: Sweets = {
        id: id,
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        itemImage: item.itemImage,
        itemHref: item.itemHref,
        storeType: item.storeType,
      };
      await this.sweetsRepository.putItemKVStore<Sweets>(
        KV,
        `${prefix}${id}`,
        sweetsData,
      );
    });
    return;
  };
}
