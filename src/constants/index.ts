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

  static readonly SEVEN_ELEVEN: ItemDetailSelector = {
    baseUrl: 'https://www.sej.co.jp',
    baseSelector: '.list_inner',
    itemNameSelector: ' .item_ttl a',
    itemPriceSelector: ' .item_price p',
    itemImageSelector: ' figure a img',
    itemLaunchSelector: ' .item_launch',
    itemImageSelectorAttribute: 'data-original',
    itemHrefSelector: ' figure a',
    storeType: 'SevenEleven',
  };

  static readonly FAMILY_MART: ItemDetailSelector = {
    baseUrl: 'https://www.family.co.jp',
    baseSelector: '.ly-mod-layout-clm',
    itemNameSelector: ' .ly-mod-infoset3-name',
    itemPriceSelector: ' .ly-mod-infoset3-price',
    itemImageSelector: ' .ly-wrp-mod-infoset3-img img',
    itemLaunchSelector: ' .ly-mod-infoset3-link',
    itemImageSelectorAttribute: 'src',
    itemHrefSelector: ' .ly-mod-infoset3-link',
    storeType: 'FamilyMart',
  };

  static readonly LAWSON: ItemDetailSelector = {
    baseUrl: 'https://www.lawson.co.jp',
    baseSelector: 'ul.col-4 li',
    itemNameSelector: ' .ttl',
    itemPriceSelector: ' .price span',
    itemImageSelector: ' .img a img',
    itemLaunchSelector: ' .ico_new',
    itemImageSelectorAttribute: 'src',
    itemHrefSelector: ' .img a',
    storeType: 'Lawson',
  };
  static readonly ConvenienceStoreDetailParams = {
    SEVEN_ELEVEN: Constants.SEVEN_ELEVEN,
    FAMILY_MART: Constants.FAMILY_MART,
    LAWSON: Constants.LAWSON,
  };

  /**
   * v1:sweets:
   */
  static readonly PREFIX = 'v1:sweets:';

  /** userAgent header部に何もつけないと各社HPの情報を取得しようとしたとき403Forbiddenになるため使用 */
  static readonly USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36';
}
