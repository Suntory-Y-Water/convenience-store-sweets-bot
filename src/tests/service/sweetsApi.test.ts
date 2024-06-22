import { Constants } from '../../constants';
import { diContainer } from '../../containers/diConfig';
import { ISweetsApiService } from '../../services/sweetsApiService';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('sweetsApi tests', () => {
  let sweetsApiService: ISweetsApiService;

  beforeEach(() => {
    sweetsApiService = diContainer.get('SweetsApiService');
  });

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
    const sevenElevenHtml = readFileSync(
      resolve('./src/tests/html', 'sevenEleven.html'),
      'utf8',
    );
    const sweetsDetailParams = {
      responseHtml: sevenElevenHtml,
      ...params,
    };

    // act
    const data = await sweetsApiService.getSweetsDetail(sweetsDetailParams);
    console.log(data[0]);
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
    const familymartHtml = readFileSync(
      resolve('./src/tests/html', 'familymart.html'),
      'utf8',
    );
    const sweetsDetailParams = {
      responseHtml: familymartHtml,
      ...params,
    };

    // act
    const data = await sweetsApiService.getSweetsDetail(sweetsDetailParams);
    console.log(data[0]);
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
    const lawsonHtml = readFileSync(resolve('./src/tests/html', 'lawson.html'), 'utf8');
    const sweetsDetailParams = {
      responseHtml: lawsonHtml,
      ...params,
    };

    // act
    const data = await sweetsApiService.getSweetsDetail(sweetsDetailParams);

    console.log(data[0]);
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
});
