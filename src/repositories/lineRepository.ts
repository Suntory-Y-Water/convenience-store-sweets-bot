import { injectable } from 'inversify';
import 'reflect-metadata';
import { Constants } from '../constants';
import { LineErrorMessage, SentMessage } from '../types';

export interface ILineRepository {
  /**
   * @description LINEのリプライメッセージを送信する
   * @param {T} message 送信するメッセージ
   * @param {string} replyToken 返信用のリプライトークン
   * @param {string} accessToken LINE APIのアクセストークン
   * @memberof LineRepository
   */
  replyMessage<T>(
    message: T,
    replyToken: string,
    accessToken: string,
  ): Promise<SentMessage | LineErrorMessage>;

  /**
   * @description LINEのプッシュメッセージを送信する
   * @param {T} message 送信するメッセージ
   * @param {string} userId 送信先ユーザーID
   * @param {string} accessToken LINE APIのアクセストークン
   * @memberof LineRepository
   */
  pushMessage<T>(
    message: T,
    userId: string,
    accessToken: string,
  ): Promise<SentMessage | LineErrorMessage>;

  /**
   * @description LINEでローディングアニメーションを表示する
   * @param {string} userId 送信先ユーザーID
   * @param {string} accessToken LINE APIのアクセストークン
   * @memberof LineRepository
   */
  loadingAnimation(
    userId: string,
    accessToken: string,
  ): Promise<SentMessage | LineErrorMessage>;
}
@injectable()
export class LineRepository implements ILineRepository {
  private async sendRequest(
    endpoint: string,
    body: object,
    accessToken: string,
  ): Promise<SentMessage | LineErrorMessage> {
    try {
      const response = await fetch(Constants.LINE_API_URL + endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
      };

      return errorMessage;
    }
  }

  replyMessage = async <T>(
    message: T,
    replyToken: string,
    accessToken: string,
  ): Promise<LineErrorMessage | SentMessage> => {
    const body = {
      replyToken: replyToken,
      messages: [message],
    };
    return this.sendRequest(Constants.LINE_API_ENDPOINT.REPLY, body, accessToken);
  };

  pushMessage = async <T>(
    message: T,
    userId: string,
    accessToken: string,
  ): Promise<LineErrorMessage | SentMessage> => {
    const body = {
      to: userId,
      messages: [message],
    };
    return this.sendRequest(Constants.LINE_API_ENDPOINT.PUSH, body, accessToken);
  };

  loadingAnimation = async (
    userId: string,
    accessToken: string,
  ): Promise<LineErrorMessage | SentMessage> => {
    const body = {
      chatId: userId,
    };
    return this.sendRequest(Constants.LINE_API_ENDPOINT.LOADING, body, accessToken);
  };
}
