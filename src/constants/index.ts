import { ItemDetailSelector, QuickReplyTypes } from '../types';

export class Constants {
  /**
   * @description メッセージの定数
   * @static
   * @memberof Constants
   */
  static readonly MessageConstants = {
    /**「セブンのスイーツ」「ファミマのスイーツ」「ローソンのスイーツ」のどれかを送信すると、ランダムにスイーツの情報をお届けします！🍰
      「セブンの新商品」「ファミマの新商品」「ローソンの新商品」のどれかを送信すると、新商品のスイーツの情報をお届けします！🎉 */
    DEFAULT_MESSAGE: `「セブンのスイーツ」「ファミマのスイーツ」「ローソンのスイーツ」のどれかを送信すると、ランダムにスイーツの情報をお届けします！🍰\n「セブンの新商品」「ファミマの新商品」「ローソンの新商品」のどれかを送信すると、新商品のスイーツの情報をお届けします！🎉`,
    /**スイーツが見つかりませんでした😭 */
    NOT_SWEETS_MESSAGE: 'スイーツが見つかりませんでした😭',
    /**エラーが発生しました😭 時間をあけて再度送信してください。 */
    ERROR_MESSAGE: 'エラーが発生しました。\n時間をあけて再度送信してください🙇‍♂️',

    NEW_PRODUCTS_ESSAGEM:
      '新商品のスイーツ情報をお届けします！\nコンビニを選択してください🙏',
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

  /** キャッシュの有効期限 60 * 30 * 1000 で30分 */
  static readonly CACHE_TTL = 60 * 30 * 1000;

  /** LINE Messaging APIのベースURL */
  static readonly LINE_API_URL = 'https://api.line.me/v2';

  /** LINE Messaging APIのエンドポイント */
  static readonly LINE_API_ENDPOINT = {
    /** リプライメッセージ */
    REPLY: '/bot/message/reply',
    /** プッシュメッセージ */
    PUSH: '/bot/message/push',
    /** ローディングアニメーション */
    LOADING: '/bot/chat/loading/start',
  };

  /** クイックリプライの定数 */
  static readonly QUICK_REPLY_ITEMS: QuickReplyTypes[] = [
    {
      text: 'セブンの新商品',
      imageUrl:
        'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgoN4UTK5Lwr09cwyeeiBIOdFlD1I7IpZoPJUlLQmJpVbNhERIeH68cz_kqnPpi66rv93x-Ij7Pso3W2y981SD7sie0UKskCOhaYFJeQLv1Q6cmV33NPW3v09WF5EP4ou38hIHwa-D73C3C/s800/building_convenience_store1_notime.png',
    },
    {
      text: 'ファミマの新商品',
      imageUrl:
        'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiPy_ibJ-mQTOV-7WCMPcx0_V28vOH3LoNx8CDDuyJuedxEvzzAyY_9Ri6ip_vObvlFmn9w2kVmzFGB8IXkp4AV4A4P8w5F6lHQCtDdQ0tCbz6ywziH_9rxsl0iVwcWoVe3j3Xaov-fnz_D/s800/building_convenience_store2_notime.png',
    },
    {
      text: 'ローソンの新商品',
      imageUrl:
        'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj3Jp2nnjJejsd91wb1RK2c4mNc0y6xFkXUiBk4MxxGHLA8ODYRZvZSQ0tCWVvkZNTZVXsIcZ3Ppga1aHxFpYVw19NIu3sov6RrGssMaZJKCrTib6rRQ7fi2zs_6TVeDsM0APgcNchJ57ha/s800/building_convenience_store3_notime.png',
    },
  ];
}
