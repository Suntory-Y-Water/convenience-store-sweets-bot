import { deleteAllSweets, fetchSweetsUrl, getRandomSweets, getSweetsDetail } from './model';
import { ItemDetail, PREFIX } from './types';
import * as constants from './constants';

/**
 * 取得先のサーバに負荷をかけないように一部のテストはskipしています。テストを実行する際はskipを外してください。
 */
const env = getMiniflareBindings();
const sweetsList: ItemDetail[] = [
  {
    itemName: '７プレミアム　金ごま　大福こしあん',
    itemPrice: '120円（税込129.60円）',
    itemImage:
      'https://img.7api-01.dp1.sej.co.jp/item-image/113144/91C97CB4764F1FCDB0E8AEF4454CB49C.jpg',
    itemHref: 'https://www.sej.co.jp/products/a/item/113144/kanto/',
    storeType: 'SevenEleven',
  },
  {
    itemName: 'くちどけショコラクレープ',
    itemPrice: '214円(税込)',
    itemImage: 'https://www.lawson.co.jp/recommend/original/detail/img/l746728.jpg',
    itemHref: 'https://www.lawson.co.jp/recommend/original/detail/1480892_1996.html',
    storeType: 'Lawson',
  },
  {
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
    await env.HONO_SWEETS.put(`${PREFIX}${id}`, JSON.stringify(sweets));
  }
};

describe('sweets tests', () => {
  beforeEach(() => {
    seed();
  });

  test('SevenEleven、FamilyMart、lawsonのアイスクリームを正しく取得できているか', async () => {
    const sevenElevenSweets = await getRandomSweets(env.HONO_SWEETS, { storeType: 'SevenEleven' });
    expect(sevenElevenSweets?.storeType).toBe('SevenEleven');

    const familyMartSweets = await getRandomSweets(env.HONO_SWEETS, { storeType: 'FamilyMart' });
    expect(familyMartSweets?.storeType).toBe('FamilyMart');

    const lawsonSweets = await getRandomSweets(env.HONO_SWEETS, { storeType: 'Lawson' });
    expect(lawsonSweets?.storeType).toBe('Lawson');
  });

  test.skip('商品ページを正しく取得できているか', async () => {
    const response = await fetchSweetsUrl(
      constants.convenienceStoreItemUrls.sevenElevenWesternSweetsUrl,
    );
    expect(response.status).toBe(200);
  });

  test.skip('正しくないURLを渡したときに404エラーが返ってくるか', async () => {
    const response = await fetchSweetsUrl(
      constants.convenienceStoreItemUrls.sevenElevenWesternSweetsUrl + 'error',
    );
    expect(response.status).toBe(404);
  });

  test.skip('誤ったパラメータを渡したときにcatchされ空の配列が返されるか', async () => {
    const sevenElevenSweetsResponse = await fetchSweetsUrl(
      constants.convenienceStoreItemUrls.sevenElevenWesternSweetsUrl,
    );

    // パラメータを誤っている。本来はstoreType: 'SevenEleven'であるべき
    const sweetsDetailParams = {
      responseHtml: sevenElevenSweetsResponse,
      ...constants.familyMartParams,
    };
    const response = await getSweetsDetail(sweetsDetailParams);
    expect(response).toEqual([]);
  });

  test.skip('セブンイレブンの商品ページから正しく商品情報抽出できているか', async () => {
    const sevenElevenSweetsResponse = await fetchSweetsUrl(
      constants.convenienceStoreItemUrls.sevenElevenWesternSweetsUrl,
    );
    const sweetsDetailParams = {
      responseHtml: sevenElevenSweetsResponse,
      ...constants.sevenElevenParams,
    };
    const response = await getSweetsDetail(sweetsDetailParams);
    expect(response).toEqual(
      expect.arrayContaining([expect.objectContaining({ itemName: expect.any(String) })]),
    );
    expect(response).toMatchSnapshot();
  });

  test.skip('ファミリーマートの商品ページから正しく商品情報抽出できているか', async () => {
    const familyMartSweetsResponse = await fetchSweetsUrl(
      constants.convenienceStoreItemUrls.familyMartUrl,
    );
    const sweetsDetailParams = {
      responseHtml: familyMartSweetsResponse,
      ...constants.familyMartParams,
    };
    const response = await getSweetsDetail(sweetsDetailParams);
    expect(response).toEqual(
      expect.arrayContaining([expect.objectContaining({ itemName: expect.any(String) })]),
    );
    expect(response).toMatchSnapshot();
  });

  test.skip('ローソンの商品ページから正しく商品情報抽出できているか', async () => {
    const lawsonSweetsResponse = await fetchSweetsUrl(constants.convenienceStoreItemUrls.lawsonUrl);
    const sweetsDetailParams = {
      responseHtml: lawsonSweetsResponse,
      ...constants.lawsonParams,
    };
    const response = await getSweetsDetail(sweetsDetailParams);
    expect(response).toEqual(
      expect.arrayContaining([expect.objectContaining({ itemName: expect.any(String) })]),
    );
    expect(response).toMatchSnapshot();
  });

  test('KVにスイーツデータを正しく登録できるか', async () => {
    // 複数件のデータを登録
    for (const sweets of sweetsList) {
      const id = sweets.storeType + Math.random().toString();
      await env.HONO_SWEETS.put(`${PREFIX}${id}`, JSON.stringify(sweets));
    }

    const allSweets = await env.HONO_SWEETS.list({ prefix: PREFIX });
    // 今回登録件数とseedで登録した件数を合わせて6件
    expect(allSweets.keys.length).toBe(6);

    const sweetsOnlyList: ItemDetail[] = [
      {
        itemName: '７プレミアム　金ごま　大福こしあん',
        itemPrice: '120円（税込129.60円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/113144/91C97CB4764F1FCDB0E8AEF4454CB49C.jpg',
        itemHref: 'https://www.sej.co.jp/products/a/item/113144/kanto/',
        storeType: 'SevenEleven',
      },
    ];

    // 複数件のデータを登録
    for (const sweets of sweetsOnlyList) {
      const id = sweets.storeType + Math.random().toString();
      await env.HONO_SWEETS.put(`${PREFIX}${id}`, JSON.stringify(sweets));
    }

    const allGetSweets = await env.HONO_SWEETS.list({ prefix: PREFIX });
    // 今回登録件数とseed + 前回登録した件数を合わせて7件
    expect(allGetSweets.keys.length).toBe(7);
  });

  test('KVに保存されているデータを全て削除できるか', async () => {
    await deleteAllSweets(env.HONO_SWEETS);

    const allGetSweets = await env.HONO_SWEETS.list({ prefix: PREFIX });
    expect(allGetSweets.keys.length).toBe(0);
  });
});
