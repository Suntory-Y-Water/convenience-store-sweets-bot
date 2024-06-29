import { FlexMessage, TextMessage, WebhookEvent } from '@line/bot-sdk';
import { LineErrorMessage, MessageEventHandler, SentMessage } from '../model/line';
import { Sweets } from '../model/sweets';
import { ILineRepository } from '../repositories/lineRepository';
import { LineMessageType, ProductType, StoreType } from '../types';

export interface ILineService {
  /**
   * @description LINEにリプライメッセージを送信する
   * @template T
   * @param {T} message
   * @param {string} replyToken
   * @param {string} accessToken
   * @return {*}  {(Promise<SentMessage | LineErrorMessage>)}
   * @memberof ILineService
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
   * @description LINEに送信するテキストメッセージを作成する
   */
  createTextMessage(message: string): TextMessage;

  /**
   * @description LINEに送信するFlexメッセージを作成する
   */
  createFlexMessage(content: Sweets): FlexMessage;
  /**
   * @description クライアントから受信したメッセージを取得し、リプライトークンとメッセージ内容を返却する
   */
  textEventHandler(event: WebhookEvent): Promise<MessageEventHandler>;
  /**
   * @description カルーセルメッセージを作成する
   */
  createCarouselMessage(params: Sweets[]): FlexMessage;

  /**
   *
   * @description 受け取ったメッセージからコンビニ名とメッセージ種別を取得する
   * @param {string} receivedMessage
   * @return {*}  {LineMessageType} コンビニ名とメッセージ種別
   * @memberof ILineService
   */
  switchStoreType(receivedMessage: string): LineMessageType;
}

export class LineService implements ILineService {
  private lineRepository: ILineRepository;
  constructor(lineRepository: ILineRepository) {
    this.lineRepository = lineRepository;
  }

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

  pushMessage<T>(
    message: T,
    userId: string,
    accessToken: string,
  ): Promise<SentMessage | LineErrorMessage> {
    return this.lineRepository.pushMessage(message, userId, accessToken);
  }

  switchStoreType = (receivedMessage: string): LineMessageType => {
    let store: StoreType | null = null;
    let productType: ProductType | null = null;
    const storeNames: { [key: string]: StoreType } = {
      セブン: 'SevenEleven',
      ファミマ: 'FamilyMart',
      ローソン: 'Lawson',
    };

    const productTypes: { [key: string]: ProductType } = {
      スイーツ: 'randomSweets',
      新商品: 'newProducts',
    };

    // コンビニ名を抽出
    for (const [key, value] of Object.entries(storeNames)) {
      if (receivedMessage.includes(key)) {
        store = value;
        break;
      }
    }

    // メッセージ種別を取得
    for (const [key, value] of Object.entries(productTypes)) {
      if (receivedMessage.includes(key)) {
        productType = value;
        break;
      }
    }

    return { store, productType };
  };

  convertStoreType(storeType: string): string {
    switch (storeType) {
      case 'Lawson':
        return 'ローソン';
      case 'SevenEleven':
        return 'セブンイレブン';
      case 'FamilyMart':
        return 'ファミリーマート';
      default:
        return '';
    }
  }

  // TODO: 今の実装ではLINERepositoryなのにSweetsの情報を専用に扱ってしまっている
  createCarouselMessage(params: Sweets[]): FlexMessage {
    return {
      type: 'flex',
      altText: '新商品情報',
      contents: {
        type: 'carousel',
        contents: params.map((param) => ({
          type: 'bubble',
          hero: {
            type: 'image',
            url: param.itemImage,
            size: 'full',
            aspectRatio: '20:13',
            aspectMode: 'cover',
            action: {
              type: 'uri',
              uri: param.itemHref,
              label: param.itemName,
            },
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text:
                  param.metadata?.releasePeriod === 'this_week'
                    ? '今週の新商品'
                    : '来週の新商品',
                weight: 'regular',
                size: 'lg',
                color: '#333333',
              },
              {
                type: 'text',
                text: param.itemName,
                weight: 'bold',
                size: 'xl',
                wrap: true,
                color: '#333333',
              },
              {
                type: 'text',
                text: param.itemPrice,
                weight: 'regular',
                size: 'md',
                color: '#333333',
              },
            ],
          },
        })),
      },
    };
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
