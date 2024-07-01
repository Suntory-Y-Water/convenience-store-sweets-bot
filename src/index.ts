import { Context, Hono } from 'hono';
import { Bindings, isLineErrorMessage } from './types';
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
import { BlankInput } from 'hono/types';

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

app.get('/random', async (c) => {
  const query = c.req.query('store_type');
  if (!query) {
    return c.json({ message: 'store_typeを指定してください' }, 400);
  }

  // store_typeの値がSevenEleven, FamilyMart, Lawsonのいずれかでない場合はエラーを返す
  if (query !== 'SevenEleven' && query !== 'FamilyMart' && query !== 'Lawson') {
    return c.json({ message: 'store_typeの値が不正です' }, 400);
  }

  const di = c.get('diContainer');
  const sweetsService = di.get('SweetsService');
  const data = await sweetsService.getRandomSweets(
    c.env.HONO_SWEETS,
    query,
    Constants.PREFIX,
  );

  if (!data) {
    return c.json({ message: 'データが存在しません' }, 404);
  }
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
        diContainer: DIContainer<DependencyTypes>;
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
  const di = c.get('diContainer');
  const lineService = di.get('LineService');
  const sweetsService = di.get('SweetsService');
  // 受け取ったメッセージを処理したあとに、LINEに返信する処理を行う
  await Promise.all(
    events.map(async (event: WebhookEvent) => {
      try {
        const webhookEventHandlers = await lineService.textEventHandler(event);
        // ここでSweets情報を取得する処理を行う。取得したメッセージから店舗情報を取得する
        const messageDetail = lineService.switchStoreType(webhookEventHandlers.message);

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
            return;
          }

          const newSweets = sweetsService.filterNewSweets(sweets);
          const carouselMessage = lineService.createCarouselMessage(newSweets);
          const response = await lineService.replyMessage<FlexMessage>(
            carouselMessage,
            webhookEventHandlers.replyToken,
            accessToken,
          );

          // エラーメッセージが返ってきた場合はエラーログを出力してエラーメッセージを返す。
          if (isLineErrorMessage(response)) {
            console.error(response);
            const textMessage = lineService.createTextMessage(
              Constants.MessageConstants.ERROR_MESSAGE,
            );
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
