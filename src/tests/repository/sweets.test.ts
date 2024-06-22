import { Constants } from '../../constants';
import { diContainer } from '../../containers/diConfig';
import { ISweetsRepository } from '../../interfaces/sweetsInterface';
import { Sweets } from '../../model/sweets';

const env = getMiniflareBindings();
const sweetsList: Sweets[] = [
  {
    id: '1',
    itemName: '７プレミアム　金ごま　大福こしあん',
    itemPrice: '120円（税込129.60円）',
    itemImage:
      'https://img.7api-01.dp1.sej.co.jp/item-image/113144/91C97CB4764F1FCDB0E8AEF4454CB49C.jpg',
    itemHref: 'https://www.sej.co.jp/products/a/item/113144/kanto/',
    storeType: 'SevenEleven',
  },
  {
    id: '2',
    itemName: 'くちどけショコラクレープ',
    itemPrice: '214円(税込)',
    itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l746728.jpg',
    itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1480892_1996.html',
    storeType: 'SevenEleven',
  },
  {
    id: '3',
    itemName: 'くちどけショコラクレープ',
    itemPrice: '214円(税込)',
    itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l746728.jpg',
    itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1480892_1996.html',
    storeType: 'Lawson',
  },
  {
    id: '4',
    itemName: 'ミルクレープロール',
    itemPrice: '212円（税込228円）',
    itemImage: 'https://www.family.co.jp/content/dam/family/goods/1940565.jpg',
    itemHref: 'https://www.family.co.jp/goods/dessert/1940565.html',
    storeType: 'FamilyMart',
  },
];

const seed = async () => {
  for (const sweets of sweetsList) {
    const id = sweets.storeType + Math.random().toString();
    await env.HONO_SWEETS.put(`${Constants.PREFIX}${id}`, JSON.stringify(sweets));
  }
};

describe('sweets repository tests', () => {
  let sweetsRepository: ISweetsRepository;

  beforeAll(() => {
    sweetsRepository = diContainer.get('SweetsRepository');
  });

  beforeEach(() => {
    seed();
  });

  test('fetchItemsKVStore セブンイレブンのスイーツを取得できる', async () => {
    // arrange
    const storeType = 'SevenEleven';

    // act
    const sevenElevenSweets = await sweetsRepository.fetchItemsKVStore<Sweets>(
      env.HONO_SWEETS,
      storeType,
      Constants.PREFIX,
    );
    // assert
    expect(sevenElevenSweets).toEqual([
      {
        id: '1',
        itemName: '７プレミアム　金ごま　大福こしあん',
        itemPrice: '120円（税込129.60円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/113144/91C97CB4764F1FCDB0E8AEF4454CB49C.jpg',
        itemHref: 'https://www.sej.co.jp/products/a/item/113144/kanto/',
        storeType: 'SevenEleven',
      },
      {
        id: '2',
        itemName: 'くちどけショコラクレープ',
        itemPrice: '214円(税込)',
        itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l746728.jpg',
        itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1480892_1996.html',
        storeType: 'SevenEleven',
      },
    ]);
  });

  test('fetchItemsKVStore FamilyMartのスイーツを取得できる', async () => {
    // arrange
    const storeType = 'FamilyMart';

    // act
    const sweets = await sweetsRepository.fetchItemsKVStore<Sweets>(
      env.HONO_SWEETS,
      storeType,
      Constants.PREFIX,
    );
    // assert
    expect(sweets).toEqual([
      {
        id: '4',
        itemName: 'ミルクレープロール',
        itemPrice: '212円（税込228円）',
        itemImage: 'https://www.family.co.jp/content/dam/family/goods/1940565.jpg',
        itemHref: 'https://www.family.co.jp/goods/dessert/1940565.html',
        storeType: 'FamilyMart',
      },
    ]);
  });

  test('fetchItemsKVStore Lawsonのスイーツを取得できる', async () => {
    // arrange
    const storeType = 'Lawson';

    // act
    const sweets = await sweetsRepository.fetchItemsKVStore<Sweets>(
      env.HONO_SWEETS,
      storeType,
      Constants.PREFIX,
    );
    // assert
    expect(sweets).toEqual([
      {
        id: '3',
        itemName: 'くちどけショコラクレープ',
        itemPrice: '214円(税込)',
        itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l746728.jpg',
        itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1480892_1996.html',
        storeType: 'Lawson',
      },
    ]);
  });

  test('putItemKVStore KVStoreに新しいsweetsを登録できる', async () => {
    // arrange
    const storeType = 'SevenEleven';
    const id = storeType + '5';
    const newSweets: Sweets = {
      id: id,
      itemName: 'ショートケーキ',
      itemPrice: '214円(税込)',
      itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l746728.jpg',
      itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1480892_1996.html',
      storeType: storeType,
    };

    // act
    await sweetsRepository.putItemKVStore<Sweets>(
      env.HONO_SWEETS,
      Constants.PREFIX + id,
      newSweets,
    );

    // assert
    const sevenElevenSweets = await sweetsRepository.fetchItemsKVStore<Sweets>(
      env.HONO_SWEETS,
      newSweets.storeType,
      Constants.PREFIX,
    );
    expect(sevenElevenSweets).toEqual([
      {
        id: '1',
        itemHref: 'https://www.sej.co.jp/products/a/item/113144/kanto/',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/113144/91C97CB4764F1FCDB0E8AEF4454CB49C.jpg',
        itemName: '７プレミアム　金ごま　大福こしあん',
        itemPrice: '120円（税込129.60円）',
        storeType: 'SevenEleven',
      },
      {
        id: '2',
        itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1480892_1996.html',
        itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l746728.jpg',
        itemName: 'くちどけショコラクレープ',
        itemPrice: '214円(税込)',
        storeType: 'SevenEleven',
      },
      {
        id: 'SevenEleven5',
        itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1480892_1996.html',
        itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l746728.jpg',
        itemName: 'ショートケーキ',
        itemPrice: '214円(税込)',
        storeType: 'SevenEleven',
      },
    ]);
  });

  test('deleteItemsKVStore KVStoreからsweetsを削除できる', async () => {
    // arrange
    const storeType = 'SevenEleven';

    // act
    await sweetsRepository.deleteItemsKVStore(env.HONO_SWEETS, Constants.PREFIX);

    // assert
    const sevenElevenSweets = await sweetsRepository.fetchItemsKVStore<Sweets>(
      env.HONO_SWEETS,
      storeType,
      Constants.PREFIX,
    );
    // to be null
    expect(sevenElevenSweets).toBeNull();
  });
});
