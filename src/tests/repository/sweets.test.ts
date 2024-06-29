import { Constants } from '../../constants';
import { diContainer } from '../../containers/diConfig';
import { Sweets } from '../../model/sweets';
import { ISweetsRepository } from '../../repositories/sweetsRepository';

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
    const id = sweets.storeType + sweets.id;
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

  test('fetchItemKVStoreKey KVStoreからkeyを取得できる', async () => {
    // arrange
    const prefix = Constants.PREFIX;
    const storeType = 'SevenEleven';

    // act
    const lists = await sweetsRepository.fetchItemKVStoreKey(
      env.HONO_SWEETS,
      prefix + storeType,
    );

    // assert
    expect(lists.keys.length).toBe(2);
    expect(lists.keys[0].name).toBe('v1:sweets:SevenEleven1');
    expect(lists.keys[1].name).toBe('v1:sweets:SevenEleven2');
  });

  test('fetchItemKVStoreValue KVStoreからvalueを取得できる', async () => {
    // arrange
    const key = 'v1:sweets:SevenEleven1';

    // act
    const lists = await sweetsRepository.fetchItemKVStoreValue<Sweets>(
      env.HONO_SWEETS,
      key,
    );

    // assert
    expect(lists).toEqual({
      id: '1',
      itemName: '７プレミアム　金ごま　大福こしあん',
      itemPrice: '120円（税込129.60円）',
      itemImage:
        'https://img.7api-01.dp1.sej.co.jp/item-image/113144/91C97CB4764F1FCDB0E8AEF4454CB49C.jpg',
      itemHref: 'https://www.sej.co.jp/products/a/item/113144/kanto/',
      storeType: 'SevenEleven',
    });
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
    const lists = await env.HONO_SWEETS.get<Sweets>(Constants.PREFIX + id, 'json');

    expect(lists).toEqual(newSweets);
  });

  test('deleteItemsKVStore KVStoreからsweetsを削除できる', async () => {
    const storeType = {
      sevenEleven: 'SevenEleven',
      familyMart: 'FamilyMart',
      lawson: 'Lawson',
    };

    // arrange and act
    await sweetsRepository.deleteItemsKVStore(env.HONO_SWEETS, Constants.PREFIX);

    // assert
    for (const key in storeType) {
      const prefix = `${Constants.PREFIX}${key}`;
      const lists = await env.HONO_SWEETS.list({ prefix });
      expect(lists.keys.length).toBe(0);
    }
  });
});
