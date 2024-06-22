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
   * http status code.
   */
  state: number;
};

export interface MessageEventHandler {
  /** クライアントから受信したLINEのリプライトークン */
  replyToken: string;

  /** クライアントから受信したLINEのメッセージ */
  message: string;
}
