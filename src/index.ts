import { Hono } from 'hono';
import { Bindings } from './types';
import { DIContainer } from './containers/diContainer';
import { DependencyTypes, diContainer } from './containers/diConfig';
import {
  FlexMessage,
  TextMessage,
  WebhookEvent,
  WebhookRequestBody,
} from '@line/bot-sdk';
import { Constants } from './constants';
import { Sweets } from './model/sweets';

const app = new Hono<{
  Variables: {
    diContainer: DIContainer<DependencyTypes>;
  };
  Bindings: Bindings;
}>().basePath('/api');

app.use('*', (c, next) => {
  c.set('diContainer', diContainer);
  return next();
});

app.post('/webhook', async (c) => {
  const data = await c.req.json<WebhookRequestBody>();
  const events = data.events;
  const accessToken = c.env.CHANNEL_ACCESS_TOKEN;
  const di = c.get('diContainer');
  const lineService = di.get('LineService');
  const sweetsService = di.get('SweetsService');
  // 受け取ったメッセージを処理したあとに、LINEに返信する処理を行う
  await Promise.all(
    events.map(async (event: WebhookEvent) => {
      try {
        const webhookEventHandlers = await lineService.textEventHandler(event);
        // ここでSweets情報を取得する処理を行う。取得したメッセージから店舗情報を取得する
        const storeType = sweetsService.switchStoreType(webhookEventHandlers.message);

        // メッセージに店舗情報を含まない場合は、デフォルトメッセージを返す
        if (!storeType) {
          const textMessage = lineService.createTextMessage(
            Constants.MessageConstants.DEFAULT_MESSAGE,
          );
          return await lineService.replyMessage<TextMessage>(
            textMessage,
            webhookEventHandlers.replyToken,
            accessToken,
          );
        }

        const sweets = await sweetsService.getRandomSweets(
          c.env.HONO_SWEETS,
          storeType,
          Constants.PREFIX,
        );

        if (!sweets) {
          const textMessage = lineService.createTextMessage(
            Constants.MessageConstants.NOT_SWEETS_MESSAGE,
          );
          return await lineService.replyMessage<TextMessage>(
            textMessage,
            webhookEventHandlers.replyToken,
            accessToken,
          );
        }

        const flexMessage = lineService.createFlexMessage(sweets);
        const replyMessage = await lineService.replyMessage<FlexMessage>(
          flexMessage,
          webhookEventHandlers.replyToken,
          accessToken,
        );
        return replyMessage;
        // TODO: エラーハンドリング
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err);
        }
        return c.json(
          {
            status: 'error',
          },
          500,
        );
      }
    }),
  );

  return c.json({ message: 'ok' }, 200);
});

const scheduledEvent = async (env: Bindings) => {
  const di = diContainer;
  const sweetsService = di.get('SweetsService');
  const sweetsApiService = di.get('SweetsApiService');
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
      url: Constants.ConvenienceStoreItemUrl.lawsonUrl,
      params: Constants.ConvenienceStoreDetailParams.LAWSON,
    },
  ];
  const allSweetsData: Sweets[] = [];
  const headers = {
    'User-Agent': Constants.USER_AGENT,
  };
  // 全てのURLに対して順番にデータを取得
  for (const { url, params } of urlsParams) {
    const response = await sweetsApiService.fetchSweetsUrl(url, headers);
    const sweetsDetailParams = {
      responseHtml: response,
      ...params,
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
