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
