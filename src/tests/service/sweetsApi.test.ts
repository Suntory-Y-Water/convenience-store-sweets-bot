import { Constants } from '../../constants';
import { container } from '../../containers/inversify.config';
import { TYPES } from '../../containers/inversify.types';
import { ISweetsApiService } from '../../services/sweetsApiService';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Sweets } from '../../types';

describe('sweetsApi tests', () => {
  let sweetsApiService: ISweetsApiService;

  beforeEach(() => {
    sweetsApiService = container.get(TYPES.SweetsApiService);
  });

  const testLoadHtml = (fileName: string) => {
    return readFileSync(resolve('./src/tests/html', fileName), 'utf8');
  };

  test('fetchSweetsUrlでテキスト形式のデータが取得できる', async () => {
    // arrange
    const url = 'https://i-scream.ayasnppk00.workers.dev/';
    const headers = {
      'User-Agent': Constants.USER_AGENT,
    };

    // act
    const result = await sweetsApiService.fetchSweetsUrl(url, headers);

    // assert
    // 取得したAPIのデータがテキスト形式であることを期待する
    expect(result).toEqual(expect.any(String));
  });

  test('getSweetsDetail sevenEleven HTML test', async () => {
    // arrange
    const params = Constants.ConvenienceStoreDetailParams.SEVEN_ELEVEN;
    const sevenElevenHtml = testLoadHtml('sevenEleven.html');
    const sweetsDetailParams = {
      responseHtml: sevenElevenHtml,
      ...params,
    };

    // act
    const data = await sweetsApiService.getSweetsDetail(sweetsDetailParams);
    // assert
    expect(data).toEqual(expect.any(Array));

    // 新商品だったらmetadataが空ではないことを期待する
    expect(data[0]).toEqual({
      itemName: 'ほろにがコーヒーゼリー＆パンナコッタ',
      itemPrice: '250円（税込270円）',
      itemImage:
        'https://img.7api-01.dp1.sej.co.jp/item-image/111506/AEAD253BF47F7395A68C0E8DFD14EA31.jpg',
      itemHref: 'https://www.sej.co.jp/products/a/item/111506/kanto/',
      storeType: 'SevenEleven',
      metadata: {
        isNew: true,
        releasePeriod: 'this_week',
      },
    });

    // テストデータの構造が正しいことを期待する
    data.forEach((item) => {
      expect(item).toHaveProperty('itemName');
      expect(item).toHaveProperty('itemPrice');
      expect(item).toHaveProperty('itemImage');
      expect(item).toHaveProperty('itemHref');
      expect(item).toHaveProperty('storeType');
    });
  });

  test('getSweetsDetail handles empty HTML', async () => {
    // arrange
    const params = Constants.ConvenienceStoreDetailParams.SEVEN_ELEVEN;
    const sweetsDetailParams = {
      responseHtml: '',
      ...params,
    };

    // act
    const data = await sweetsApiService.getSweetsDetail(sweetsDetailParams);

    // assert
    expect(data).toEqual([]);
  });

  test('getSweetsDetail FamilyMart HTML test', async () => {
    // arrange
    const params = Constants.ConvenienceStoreDetailParams.FAMILY_MART;
    const familymartHtml = testLoadHtml('familymart.html');
    const sweetsDetailParams = {
      responseHtml: familymartHtml,
      ...params,
    };

    // act
    const data = await sweetsApiService.getSweetsDetail(sweetsDetailParams);

    // 新商品かつ来週発売だったら、'next_week'になることを期待する
    expect(data[0]).toEqual({
      itemName: '珈琲ゼリー',
      itemPrice: '204円 （税込220円）',
      itemImage: 'https://www.family.co.jp/content/dam/family/goods/1945010.jpg',
      itemHref: 'https://www.family.co.jp/goods/dessert/1945010.html',
      storeType: 'FamilyMart',
      metadata: { isNew: true, releasePeriod: 'next_week' },
    });

    // 新商品かつ来週発売だったら、'this_week'になることを期待する
    expect(data[2]).toEqual({
      itemName: 'くりーむ抹茶パフェ',
      itemPrice: '297円 （税込320円）',
      itemImage: 'https://www.family.co.jp/content/dam/family/goods/1940459.jpg',
      itemHref: 'https://www.family.co.jp/goods/dessert/1940459.html',
      storeType: 'FamilyMart',
      metadata: { isNew: true, releasePeriod: 'this_week' },
    });
    // assert
    expect(data).toEqual(expect.any(Array));

    // テストデータの構造が正しいことを期待する
    data.forEach((item) => {
      expect(item).toHaveProperty('itemName');
      expect(item).toHaveProperty('itemPrice');
      expect(item).toHaveProperty('itemImage');
      expect(item).toHaveProperty('itemHref');
      expect(item).toHaveProperty('storeType');
    });
  });

  test('getSweetsDetail lawson HTML test', async () => {
    // arrange
    const params = Constants.ConvenienceStoreDetailParams.LAWSON;
    const lawsonHtml = testLoadHtml('lawson.html');
    const sweetsDetailParams = {
      responseHtml: lawsonHtml,
      ...params,
    };

    // act
    const data = await sweetsApiService.getSweetsDetail(sweetsDetailParams);

    // assert
    expect(data).toEqual(expect.any(Array));

    // テストデータの構造が正しいことを期待する
    data.forEach((item) => {
      expect(item).toHaveProperty('itemName');
      expect(item).toHaveProperty('itemPrice');
      expect(item).toHaveProperty('itemImage');
      expect(item).toHaveProperty('itemHref');
      expect(item).toHaveProperty('storeType');
    });
  });

  test('parseName test encode ', () => {
    // arrange
    const text = 'ダブルクリームサンド（ホイップ&amp;カスタード）';

    // act
    const result = sweetsApiService.parseName(text);

    // assert
    expect(result).toBe('ダブルクリームサンド（ホイップ&カスタード）');
  });

  test('parseName test encode &eacute;', () => {
    // arrange
    const text = 'Uchi Caf&eacute;×猿田彦珈琲　カフェラテどらもっち';

    // act
    const result = sweetsApiService.parseName(text);

    // assert
    expect(result).toBe('Uchi Café×猿田彦珈琲　カフェラテどらもっち');
  });

  test('isNewProductTextString tests', () => {
    // arrange
    const parsingText = '2024年06月18日（火）以降順次発売';

    // act
    expect(sweetsApiService.isNewProductTextString(parsingText)).toEqual({
      isNew: true,
      releasePeriod: 'this_week',
    });

    // arrange
    const parsingThisText = '新発売';

    // act
    expect(sweetsApiService.isNewProductTextString(parsingThisText)).toEqual({
      isNew: true,
      releasePeriod: 'this_week',
    });

    // arrange
    const parsingNewText = '6月25日発売';

    // act
    expect(sweetsApiService.isNewProductTextString(parsingNewText)).toEqual({
      isNew: true,
      releasePeriod: 'next_week',
    });

    // arrange
    const noText = '';

    // act
    expect(sweetsApiService.isNewProductTextString(noText)).toEqual({});
  });

  test('filterSevenElevenNewSweets セブンイレブンで来週の新商品が取得できているか', async () => {
    // arrange
    const params = Constants.ConvenienceStoreDetailParams.SEVEN_ELEVEN;
    const sevenElevenHtml = testLoadHtml('sevenElevenNewItem.html');
    const sweetsDetailParams = {
      responseHtml: sevenElevenHtml,
      ...params,
    };
    const data = await sweetsApiService.getSweetsDetail(sweetsDetailParams);

    // act
    const newSweets = sweetsApiService.filterSevenElevenNewSweets(data);

    // assert
    expect(newSweets).toEqual([
      {
        itemName: 'バニラビーンズ使用　　黄金色スイートポテト',
        itemPrice: '198円（税込213.84円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/110940/08496C575DD16E99DAC59982CB751B10.jpg',
        itemHref: 'https://www.sej.co.jp/products/a/item/110940/kanto/',
        storeType: 'SevenEleven',
        metadata: { isNew: true, releasePeriod: 'this_week' },
      },
      {
        itemName: 'グリコ　　　　　　　　Ｂｉｇプッチンプリン',
        itemPrice: '165円（税込178.20円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/111013/07B520E7AE72067E2EB30318E3E0C7DB.jpg',
        itemHref: 'https://www.sej.co.jp/products/a/item/111013/kanto/',
        storeType: 'SevenEleven',
        metadata: { isNew: true, releasePeriod: 'this_week' },
      },
      {
        itemName: 'もっちりみるくわらび　宇治抹茶',
        itemPrice: '250円（税込270円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/110786/10BB09D1D78140DFEBE4BA73FE45E3AE.jpg',
        itemHref: 'https://www.sej.co.jp/products/a/item/110786/kanto/',
        storeType: 'SevenEleven',
        metadata: { isNew: true, releasePeriod: 'this_week' },
      },
    ]);
  });

  test('metadataReleasePeriodConvert tests 今週の新商品を来週の新商品に変換する', () => {
    // arrange
    const sweets: Sweets[] = [
      {
        itemName: 'バニラビーンズ使用　　黄金色スイートポテト',
        itemPrice: '198円（税込213.84円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/110940/08496C575DD16E99DAC59982CB751B10.jpg',
        itemHref: 'https://www.sej.co.jp/products/a/item/110940/kanto/',
        storeType: 'SevenEleven',
        metadata: { isNew: true, releasePeriod: 'this_week' },
      },
      {
        itemName: 'グリコ　　　　　　　　Ｂｉｇプッチンプリン',
        itemPrice: '165円（税込178.20円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/111013/07B520E7AE72067E2EB30318E3E0C7DB.jpg',
        itemHref: 'https://www.sej.co.jp/products/a/item/111013/kanto/',
        storeType: 'SevenEleven',
        metadata: { isNew: true, releasePeriod: 'this_week' },
      },
      {
        itemName: 'もっちりみるくわらび　宇治抹茶',
        itemPrice: '250円（税込270円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/110786/10BB09D1D78140DFEBE4BA73FE45E3AE.jpg',
        itemHref: 'https://www.sej.co.jp/products/a/item/110786/kanto/',
        storeType: 'SevenEleven',
        metadata: { isNew: true, releasePeriod: 'this_week' },
      },
    ];

    // act
    const result = sweetsApiService.metadataReleasePeriodConvert(sweets);

    // assert
    expect(result).toEqual([
      {
        itemName: 'バニラビーンズ使用　　黄金色スイートポテト',
        itemPrice: '198円（税込213.84円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/110940/08496C575DD16E99DAC59982CB751B10.jpg',
        itemHref: 'https://www.sej.co.jp/products/a/item/110940/kanto/',
        storeType: 'SevenEleven',
        metadata: { isNew: true, releasePeriod: 'next_week' },
      },
      {
        itemName: 'グリコ　　　　　　　　Ｂｉｇプッチンプリン',
        itemPrice: '165円（税込178.20円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/111013/07B520E7AE72067E2EB30318E3E0C7DB.jpg',
        itemHref: 'https://www.sej.co.jp/products/a/item/111013/kanto/',
        storeType: 'SevenEleven',
        metadata: { isNew: true, releasePeriod: 'next_week' },
      },
      {
        itemName: 'もっちりみるくわらび　宇治抹茶',
        itemPrice: '250円（税込270円）',
        itemImage:
          'https://img.7api-01.dp1.sej.co.jp/item-image/110786/10BB09D1D78140DFEBE4BA73FE45E3AE.jpg',
        itemHref: 'https://www.sej.co.jp/products/a/item/110786/kanto/',
        storeType: 'SevenEleven',
        metadata: { isNew: true, releasePeriod: 'next_week' },
      },
    ]);
  });
});
