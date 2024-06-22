import { Hono } from 'hono';
import { doSomeTaskOnASchedule } from './model';
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

const scheduled: ExportedHandlerScheduledHandler<Bindings> = async (event, env, ctx) => {
  ctx.waitUntil(doSomeTaskOnASchedule(env));
};

export default {
  fetch: app.fetch,
  scheduled,
};
