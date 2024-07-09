export type Bindings = {
  readonly HONO_SWEETS: KVNamespace;
  readonly CHANNEL_ACCESS_TOKEN: string;
  readonly API_URL: string;
  readonly BEARER_TOKEN: string;
};
// TODO: このSweetsStoreTypeの型使用は問題ないのか
export interface ItemDetailSelector {
  readonly baseUrl: string;
  readonly baseSelector: string;
  readonly itemNameSelector: string;
  readonly itemPriceSelector: string;
  readonly itemImageSelector: string;
  readonly itemLaunchSelector?: string;
  readonly itemImageSelectorAttribute: 'data-original' | 'src';
  readonly itemHrefSelector: string;
  readonly storeType: StoreType;
}

export interface GetSweetsDetailParams extends ItemDetailSelector {
  readonly responseHtml: string;
}

declare global {
  function getMiniflareBindings(): Bindings;
}

export type StoreType = 'SevenEleven' | 'FamilyMart' | 'Lawson';
export type ProductType = 'randomSweets' | 'newProducts';

export interface LineMessageType {
  store: StoreType | null;
  productType: ProductType | null;
}

// TODO:なんでここにいる？
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isLineErrorMessage = (response: any): response is LineErrorMessage => {
  return (response as LineErrorMessage).message !== undefined;
};

export type SentMessage = {
  /**
   * ID of the sent message.
   */
  id: string /**/;
  /**
   * Quote token of the message. Only included when a message object that can be specified as a quote target was sent as a push or reply message.
   */
  quoteToken?: string /**/;
};

export type LineErrorMessage = {
  /**
   * Error message.
   */
  message: string;

  /**
   * エラー詳細の配列。配列が空の場合は、レスポンスに含まれません。
   */
  details?: DetailsEntity[] | null;
};

type DetailsEntity = {
  /**
   * エラーの詳細。特定の状況ではレスポンスに含まれません。詳しくは、「エラーの詳細」を参照してください。
   */
  message: string;

  /**
   * エラーの発生箇所。リクエストのJSONのフィールド名やクエリパラメータ名が返ります。特定の状況ではレスポンスに含まれません。
   */
  property: string;
};

export interface MessageEventHandler {
  /** クライアントから受信したLINEのリプライトークン */
  replyToken: string;

  /** クライアントから受信したLINEのメッセージ */
  message: string;

  /** クライアントから受信したLINEのユーザーID */
  userId: string;
}

export type QuickReplyTypes = {
  /** クイックリプライに設定するメッセージ文字列 */
  text: string;
  /** クイックリプライに設定する画像 */
  imageUrl: string;
};

export type ReleasePeriod = 'this_week' | 'next_week';

export interface Sweets {
  id?: string;
  itemName: string;
  itemPrice: string;
  itemImage: string;
  itemHref: string;
  metadata?: {
    isNew?: boolean;
    releasePeriod?: ReleasePeriod;
  };
  storeType: StoreType;
}

export type ErrorResponse = {
  message: string;
  method?: string;
  timestamp: string;
};
