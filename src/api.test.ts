import { getRandomSweets } from './model';
import { ItemDetail, PREFIX } from './types';

const env = getMiniflareBindings();

const seed = async () => {
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
});
