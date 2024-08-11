import { Context, Hono } from 'hono';
import { Bindings, Sweets, isLineErrorMessage } from './types';
import { container } from './containers/inversify.config';
import {
  FlexMessage,
  TextMessage,
  WebhookEvent,
  WebhookRequestBody,
} from '@line/bot-sdk';
import { Constants } from './constants';
import { ISweetsService } from './services/sweetsService';
import { ISweetsApiService } from './services/sweetsApiService';
import { ILineService } from './services/lineService';
import { TYPES } from './containers/inversify.types';
import { HTTPException } from 'hono/http-exception';
import { errorHandler } from './middleware/errorHandler';
import { injectDependencies } from './middleware/injectDependencies';
import { BlankInput } from 'hono/types';
import { ILoggingService } from './services/loggingService';

const app = new Hono<{
  Variables: {
    container: typeof container;
  };
  Bindings: Bindings;
}>().basePath('/api');

app.use('*', injectDependencies);

app.onError(errorHandler);

app.get('/random', async (c) => {
  const loggingService = container.get<ILoggingService>(TYPES.LoggingService);
  const query = c.req.query('store_type');
  if (!query) {
    loggingService.error('/random', 'store_typeを指定してください');
    throw new HTTPException(400, { message: 'store_typeを指定してください' });
  }

  if (query !== 'SevenEleven' && query !== 'FamilyMart' && query !== 'Lawson') {
    loggingService.error('/random', 'store_typeの値が不正です');
    throw new HTTPException(400, { message: 'store_typeの値が不正です' });
  }

  const sweetsService = container.get<ISweetsService>(TYPES.SweetsService);
  const data = await sweetsService.getRandomSweets(
    c.env.HONO_SWEETS,
    query,
    Constants.PREFIX,
  );

  if (!data) {
    throw new HTTPException(404, { message: 'データが存在しません' });
  }
  loggingService.log('/random', '取得したスイーツ情報', data);
  return c.json(data, 200);
});

app.post('/webhook', async (c) => {
  const data = await c.req.json<WebhookRequestBody>();
  c.executionCtx.waitUntil(messageEvent(c, data));
  return c.json({ message: 'ok' }, 200);
});

const messageEvent = async (
  c: Context<
    {
      Variables: {
        container: typeof container;
      };
      Bindings: Bindings;
    },
    '/api/webhook',
    BlankInput
  >,
  data: WebhookRequestBody,
) => {
  const events = data.events;
  const accessToken = c.env.CHANNEL_ACCESS_TOKEN;
  const lineService = container.get<ILineService>(TYPES.LineService);
  const sweetsService = container.get<ISweetsService>(TYPES.SweetsService);
  const loggingService = container.get<ILoggingService>(TYPES.LoggingService);

  await Promise.all(
    events.map(async (event: WebhookEvent) => {
      try {
        const webhookEventHandlers = await lineService.textEventHandler(event);
        // ここでSweets情報を取得する処理を行う。取得したメッセージから店舗情報を取得する
        const messageDetail = lineService.switchStoreType(webhookEventHandlers.message);

        if (!messageDetail.store && messageDetail.productType === 'newProducts') {
          const quickReply = lineService.createQuickReply(
            Constants.MessageConstants.NEW_PRODUCTS_ESSAGEM,
            Constants.QUICK_REPLY_ITEMS,
          );
          await lineService.pushMessage(
            quickReply,
            webhookEventHandlers.userId,
            accessToken,
          );
        }
        // メッセージに店舗情報を含まない場合は、処理を終了する
        if (!messageDetail.store) {
          return;
        }

        // スイーツのmessageの場合
        if (messageDetail.productType === 'randomSweets') {
          // ローディングアニメーションを表示
          await lineService.loadingAnimation(webhookEventHandlers.userId, accessToken);
          const sweets = await sweetsService.getRandomSweets(
            c.env.HONO_SWEETS,
            messageDetail.store,
            Constants.PREFIX,
          );

          if (!sweets) {
            const textMessage = lineService.createTextMessage(
              Constants.MessageConstants.NOT_SWEETS_MESSAGE,
            );
            loggingService.log('/webhook', Constants.MessageConstants.NOT_SWEETS_MESSAGE);
            await lineService.replyMessage<TextMessage>(
              textMessage,
              webhookEventHandlers.replyToken,
              accessToken,
            );
            return;
          }

          const flexMessage = lineService.createFlexMessage(sweets);
          await lineService.replyMessage<FlexMessage>(
            flexMessage,
            webhookEventHandlers.replyToken,
            accessToken,
          );
        }

        // 新商品のmessageの場合
        if (messageDetail.productType === 'newProducts') {
          // ローディングアニメーションを表示
          await lineService.loadingAnimation(webhookEventHandlers.userId, accessToken);
          const sweets = await sweetsService.getStoreAllSweets(
            c.env.HONO_SWEETS,
            Constants.PREFIX + messageDetail.store,
          );
          if (!sweets) {
            const textMessage = lineService.createTextMessage(
              Constants.MessageConstants.NOT_SWEETS_MESSAGE,
            );
            await lineService.replyMessage<TextMessage>(
              textMessage,
              webhookEventHandlers.replyToken,
              accessToken,
            );
            loggingService.log('/webhook', '新商品メッセージの送信を終了します。');
            return;
          }

          const newSweets = sweetsService.filterNewSweets(sweets);
          const carouselMessage = lineService.createCarouselMessage(newSweets);
          const response = await lineService.replyMessage<FlexMessage>(
            carouselMessage,
            webhookEventHandlers.replyToken,
            accessToken,
          );

          if (isLineErrorMessage(response)) {
            loggingService.error('/webhook', response.message);
            const textMessage = lineService.createTextMessage(
              Constants.MessageConstants.ERROR_MESSAGE,
            );
            loggingService.error('/webhook', Constants.MessageConstants.ERROR_MESSAGE);
            await lineService.pushMessage<TextMessage>(
              textMessage,
              webhookEventHandlers.replyToken,
              accessToken,
            );
          }
        }
        const textMessage = lineService.createTextMessage(
          Constants.MessageConstants.DEFAULT_MESSAGE,
        );
        await lineService.replyMessage<TextMessage>(
          textMessage,
          webhookEventHandlers.replyToken,
          accessToken,
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err);
        }
      }
    }),
  );
};

export const scheduledEvent = async (env: Bindings) => {
  const sweetsService = container.get<ISweetsService>(TYPES.SweetsService);
  const sweetsApiService = container.get<ISweetsApiService>(TYPES.SweetsApiService);
  const urlsParams = [
    {
      url: Constants.ConvenienceStoreItemUrl.sevenElevenWesternSweetsUrl,
      params: Constants.ConvenienceStoreDetailParams.SEVEN_ELEVEN,
    },
    {
      url: Constants.ConvenienceStoreItemUrl.sevenElevenJapaneseSweetsUrl,
      params: Constants.ConvenienceStoreDetailParams.SEVEN_ELEVEN,
    },
    {
      url: Constants.ConvenienceStoreItemUrl.familyMartUrl,
      params: Constants.ConvenienceStoreDetailParams.FAMILY_MART,
    },
    {
      url: Constants.ConvenienceStoreItemUrl.familyMartJapaneseSweetsUrl,
      params: Constants.ConvenienceStoreDetailParams.FAMILY_MART,
    },
    {
      url: Constants.ConvenienceStoreItemUrl.lawsonUrl,
      params: Constants.ConvenienceStoreDetailParams.LAWSON,
    },
    {
      url: Constants.ConvenienceStoreItemUrl.lawsonGateauSweetsUrl,
      params: Constants.ConvenienceStoreDetailParams.LAWSON,
    },
  ];
  const allSweetsData: Sweets[] = [];
  const headers = {
    'User-Agent': Constants.USER_AGENT,
  };
  // 全てのURLに対して順番にデータを取得
  for (const urlsParam of urlsParams) {
    const response = await sweetsApiService.fetchSweetsUrl(urlsParam.url, headers);
    const sweetsDetailParams = {
      responseHtml: response,
      ...urlsParam.params,
    };
    const sweetsData = await sweetsApiService.getSweetsDetail(sweetsDetailParams);
    allSweetsData.push(...sweetsData);
  }
  // KVに保存する前に既存のデータを全て削除
  await sweetsService.deleteSweets(env.HONO_SWEETS, Constants.PREFIX);

  // 新しいスイーツデータをKVに保存
  await sweetsService.createSweets(env.HONO_SWEETS, Constants.PREFIX, allSweetsData);

  return new Response(null, { status: 201 });
};

const scheduled: ExportedHandlerScheduledHandler<Bindings> = async (event, env, ctx) => {
  ctx.waitUntil(scheduledEvent(env));
};

export default {
  fetch: app.fetch,
  scheduled,
};
