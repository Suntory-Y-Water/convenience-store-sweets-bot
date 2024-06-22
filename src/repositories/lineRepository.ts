import { ILineRepository } from '../interfaces/lineInterface';
import { LineErrorMessage, SentMessage } from '../model/line';

export class LineRepository implements ILineRepository {
  /**
   * @description LINEのメッセージを送信する
   * @param {T} message 送信するメッセージ
   * @param {string} replyToken 返信用のリプライトークン
   * @param {string} accessToken LINE APIのアクセストークン
   * @memberof LineRepository
   */
  replyMessage = async <T>(
    message: T,
    replyToken: string,
    accessToken: string,
  ): Promise<LineErrorMessage | SentMessage> => {
    try {
      const response = await fetch(`https://api.line.me/v2/bot/message/reply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          replyToken: replyToken,
          messages: [message],
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as LineErrorMessage;
        return data;
      }

      const data = (await response.json()) as SentMessage;
      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      const errorMessage: LineErrorMessage = {
        message: 'Internal Server Error',
        state: 500,
      };

      return errorMessage;
    }
  };
}
