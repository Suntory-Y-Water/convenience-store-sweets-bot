import { ItemDetailSelector } from '../types';

export class Constants {
  static readonly MessageConstants = {
    /**「セブンのスイーツ」「ファミマのスイーツ」「ローソンのスイーツ」のどれかを送信すると、スイーツの情報をお届けします！🍰 */
    DEFAULT_MESSAGE:
      '「セブンのスイーツ」「ファミマのスイーツ」「ローソンのスイーツ」のどれかを送信すると、スイーツの情報をお届けします！🍰',
    /**スイーツが見つかりませんでした😭 */
    NOT_SWEETS_MESSAGE: 'スイーツが見つかりませんでした😭',
  };

  static readonly ConvenienceStoreItemUrl = {
    sevenElevenWesternSweetsUrl:
      'https://www.sej.co.jp/products/a/cat/060010010000000/kanto/1/l100/',
    sevenElevenJapaneseSweetsUrl:
      'https://www.sej.co.jp/products/a/cat/060010020000000/kanto/1/l100/',
    familyMartUrl: 'https://www.family.co.jp/goods/dessert.html',
    lawsonUrl: 'https://www.lawson.co.jp/recommend/original/dessert/',
  };

  static readonly ConvenienceStoreDetailParams: Record<string, ItemDetailSelector> = {
    SEVEN_ELEVEN: {
      baseUrl: 'https://www.sej.co.jp',
      baseSelector: '.list_inner',
      itemNameSelector: ' .item_ttl a',
      itemPriceSelector: ' .item_price p',
      itemImageSelector: ' figure a img',
      itemImageSelectorAttribute: 'data-original',
      itemHrefSelector: ' figure a',
      storeType: 'SevenEleven',
    },
    FAMILY_MART: {
      baseUrl: 'https://www.family.co.jp',
      baseSelector: '.ly-mod-layout-clm',
      itemNameSelector: ' .ly-mod-infoset3-name',
      itemPriceSelector: ' .ly-mod-infoset3-price',
      itemImageSelector: ' .ly-wrp-mod-infoset3-img img',
      itemImageSelectorAttribute: 'src',
      itemHrefSelector: ' .ly-mod-infoset3-link',
      storeType: 'FamilyMart',
    },
    LAWSON: {
      baseUrl: 'https://www.lawson.co.jp',
      baseSelector: 'ul.col-4 li',
      itemNameSelector: ' .ttl',
      itemPriceSelector: ' .price span',
      itemImageSelector: ' .img a img',
      itemImageSelectorAttribute: 'src',
      itemHrefSelector: ' .img a',
      storeType: 'Lawson',
    },
  };

  /**
   * v1:sweets:
   */
  static readonly PREFIX = 'v1:sweets:';
}
