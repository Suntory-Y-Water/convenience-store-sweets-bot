import { FlexMessage, TextMessage, WebhookEvent } from '@line/bot-sdk';
import { LineErrorMessage, MessageEventHandler, SentMessage } from '../model/line';
import { Sweets } from '../model/sweets';
import { ILineRepository } from '../repositories/lineRepository';

export interface ILineService {
  replyMessage<T>(
    message: T,
    replyToken: string,
    accessToken: string,
  ): Promise<SentMessage | LineErrorMessage>;
  createTextMessage(message: string): TextMessage;
  createFlexMessage(content: Sweets): FlexMessage;
  textEventHandler(event: WebhookEvent): Promise<MessageEventHandler>;
}

export class LineService implements ILineService {
  private lineRepository: ILineRepository;
  constructor(lineRepository: ILineRepository) {
    this.lineRepository = lineRepository;
  }

  /**
   * @description クライアントから受信したメッセージを取得し、リプライトークンとメッセージ内容を返却する
   * @param {WebhookEvent} event
   * @memberof LineService
   */
  textEventHandler = async (event: WebhookEvent): Promise<MessageEventHandler> => {
    if (event.type !== 'message' || event.message.type !== 'text') {
      throw new Error('Invalid event type');
    }

    const returnMessage: MessageEventHandler = {
      replyToken: event.replyToken,
      message: event.message.text,
    };

    return returnMessage;
  };

  replyMessage<T>(
    message: T,
    replyToken: string,
    accessToken: string,
  ): Promise<SentMessage | LineErrorMessage> {
    return this.lineRepository.replyMessage(message, replyToken, accessToken);
  }

  createTextMessage(message: string): TextMessage {
    return {
      type: 'text',
      text: message,
    };
  }

  // TODO: 今の実装ではLINERepositoryなのにSweetsの情報を専用に扱ってしまっている
  createFlexMessage(content: Sweets): FlexMessage {
    return {
      type: 'flex',
      altText: 'スイーツ情報',
      contents: {
        type: 'bubble',
        hero: {
          type: 'image',
          url: content.itemImage,
          size: 'full',
          aspectRatio: '20:13',
          aspectMode: 'cover',
          action: {
            type: 'uri',
            uri: content.itemHref,
            label: content.itemName,
          },
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: content.itemName,
              weight: 'bold',
              size: 'xl',
              wrap: true,
              color: '#333333',
            },
            {
              type: 'text',
              text: content.itemPrice,
              weight: 'regular',
              size: 'md',
              color: '#333333',
            },
          ],
        },
      },
    };
  }
}
