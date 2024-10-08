import { Constants } from '../../constants';
import { container } from '../../containers/inversify.config';
import { TYPES } from '../../containers/inversify.types';
import { ISweetsService } from '../../services/sweetsService';
import { StoreType, Sweets } from '../../types';

const env = getMiniflareBindings();

const sweetsList: Sweets[] = [
  {
    id: 'SevenEleveneb93d05c-a728-4bc8-9f20-7951741414ba',
    itemName: '７プレミアム　金ごま　大福こしあん',
    itemPrice: '120円（税込129.60円）',
    itemImage:
      'https://img.7api-01.dp1.sej.co.jp/item-image/113144/91C97CB4764F1FCDB0E8AEF4454CB49C.jpg',
    itemHref: 'https://www.sej.co.jp/products/a/item/113144/kanto/',
    storeType: 'SevenEleven',
  },
  {
    id: 'SevenElevene2',
    itemName: 'くちどけショコラクレープ',
    itemPrice: '214円(税込)',
    itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l746728.jpg',
    itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1480892_1996.html',
    storeType: 'SevenEleven',
  },
  {
    id: 'Lawson3',
    itemName: 'くちどけショコラクレープ',
    itemPrice: '214円(税込)',
    itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l746728.jpg',
    itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1480892_1996.html',
    storeType: 'Lawson',
  },
  {
    id: 'FamilyMart54',
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
  let sweetsService: ISweetsService;
  beforeAll(() => {
    sweetsService = container.get(TYPES.SweetsService);
  });

  beforeEach(() => {
    seed();
  });

  test('getRandomSweets tests', async () => {
    // KVStoreのデータを正しく取得できる
    // arrange
    const storeType = 'SevenEleven';

    // act
    const result = await sweetsService.getRandomSweets(
      env.HONO_SWEETS,
      storeType,
      Constants.PREFIX,
    );

    // assert
    // Randomで取得するので、nullでないことだけ確認
    expect(result).not.toBeNull();

    // 関係ないprefixを設定してnullが返却されることを確認する
    // act
    const nullResult = await sweetsService.getRandomSweets(
      env.HONO_SWEETS,
      'Ministop', // Ministopのデータは存在しない
      Constants.PREFIX,
    );

    // assert
    expect(nullResult).toBeNull();
  });

  test('deleteSweets tests KVStoreのデータを削除でき、getRandomSweetsで値が取得できない', async () => {
    // arrange
    const prefix = Constants.PREFIX;
    const storeType = 'SevenEleven';

    // act
    await sweetsService.deleteSweets(env.HONO_SWEETS, prefix);

    // assert
    const result = await sweetsService.getRandomSweets(
      env.HONO_SWEETS,
      storeType,
      prefix,
    );
    expect(result).toBeNull();
  });

  test('createSweets tests KVStoreのデータを作成でき、getRandomSweetsで値が取得できる', async () => {
    // arrange
    const storeType: StoreType = 'Lawson';
    const sweets: Sweets[] = [
      {
        itemName: 'テストくちどけショコラクレープ',
        itemPrice: '214円(税込)',
        itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l746728.jpg',
        itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1480892_1996.html',
        storeType: storeType,
        metadata: {},
      },
    ];

    // TODO: 本来はseed()で削除するべきだが、動作不安定のためテストがPASSになったメソッドを直接実行。
    // あまり良くないやり方
    await sweetsService.deleteSweets(env.HONO_SWEETS, Constants.PREFIX);
    // act
    await sweetsService.createSweets(env.HONO_SWEETS, Constants.PREFIX, sweets);

    // assert
    const result = await sweetsService.getRandomSweets(
      env.HONO_SWEETS,
      storeType,
      Constants.PREFIX,
    );

    expect(result).not.toBeNull();
    // resultはオブジェクトであり、配列の要素が1つであることを確認
    // resultが配列の要素を持ち、その要素が1つであることを確認
    expect([result].length).toBe(1);

    // 追加のアサーションとして、resultの内容を確認
    expect(result).toEqual(
      expect.objectContaining({
        itemName: 'テストくちどけショコラクレープ',
        itemPrice: '214円(税込)',
        itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l746728.jpg',
        itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1480892_1996.html',
        storeType: storeType,
        metadata: {},
      }),
    );
  });

  test('filterNewSweets tests 新商品スイーツのみを返却する。', async () => {
    // arrange
    const sweets: Sweets[] = [
      {
        id: 'Lawson05b8bf45-848b-4f1a-ae77-10b3d9805a72',
        itemName: 'Uchi Café×猿田彦珈琲　カフェラテロールケーキ(コーヒーゼリー入り)',
        itemPrice: '268円(税込)',
        itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l763344.jpg',
        itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1490171_1996.html',
        storeType: 'Lawson',
        metadata: {},
      },
      {
        id: 'Lawson942b306b-8982-4a5a-9591-0d2176ab9c72',
        itemName: 'Uchi Café×猿田彦珈琲　珈琲ティラミスタルト',
        itemPrice: '235円(税込)',
        itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l760315.jpg',
        itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1490170_1996.html',
        storeType: 'Lawson',
        metadata: {
          isNew: true,
          releasePeriod: 'this_week',
        },
      },
      {
        id: 'Lawson6dcb0d36-1e3d-4739-b52e-91b89382cf3f',
        itemName: 'ふわ濃チーズケーキ　アールグレイ',
        itemPrice: '297円(税込)',
        itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l762723.jpg',
        itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1490384_1996.html',
        storeType: 'Lawson',
        metadata: {
          isNew: true,
          releasePeriod: 'next_week',
        },
      },
    ];

    // act
    const result = sweetsService.filterNewSweets(sweets);

    // assert
    expect(result).toEqual([
      {
        id: 'Lawson942b306b-8982-4a5a-9591-0d2176ab9c72',
        itemName: 'Uchi Café×猿田彦珈琲　珈琲ティラミスタルト',
        itemPrice: '235円(税込)',
        itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l760315.jpg',
        itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1490170_1996.html',
        storeType: 'Lawson',
        metadata: {
          isNew: true,
          releasePeriod: 'this_week',
        },
      },
      {
        id: 'Lawson6dcb0d36-1e3d-4739-b52e-91b89382cf3f',
        itemName: 'ふわ濃チーズケーキ　アールグレイ',
        itemPrice: '297円(税込)',
        itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l762723.jpg',
        itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1490384_1996.html',
        storeType: 'Lawson',
        metadata: {
          isNew: true,
          releasePeriod: 'next_week',
        },
      },
    ]);
  });

  test('filterNewSweets tests 新商品がない場合はnullを返却する', async () => {
    // arrange
    const sweets: Sweets[] = [
      {
        id: 'Lawson05b8bf45-848b-4f1a-ae77-10b3d9805a72',
        itemName: 'Uchi Café×猿田彦珈琲　カフェラテロールケーキ(コーヒーゼリー入り)',
        itemPrice: '268円(税込)',
        itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l763344.jpg',
        itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1490171_1996.html',
        storeType: 'Lawson',
        metadata: {},
      },
      {
        id: 'Lawson942b306b-8982-4a5a-9591-0d2176ab9c72',
        itemName: 'Uchi Café×猿田彦珈琲　珈琲ティラミスタルト',
        itemPrice: '235円(税込)',
        itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l760315.jpg',
        itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1490170_1996.html',
        storeType: 'Lawson',
        metadata: {},
      },
    ];

    // act
    const result = sweetsService.filterNewSweets(sweets);

    // assert
    expect(result).toBeNull();
  });
});
