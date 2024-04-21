import { Hono } from 'hono';
import { Bindings, GetSweetsDetailParams, ItemDetail } from './types';
import {
  getSweetsDetail,
  fetchSweetsUrl,
  createSweets,
  getRandomSweets,
  deleteAllSweets,
} from './model';
import * as constants from './constants';
import { WebhookEvent } from '@line/bot-sdk';

const router = new Hono<{ Bindings: Bindings }>();
router.get('/all', async (c) => {
  const response = await fetchSweetsUrl(
    constants.convenienceStoreItemUrls.sevenElevenWesternSweetsUrl,
  );
  const params: GetSweetsDetailParams = {
    responseHtml: response,
    ...constants.sevenElevenParams,
  };

  const data = await getSweetsDetail(params);

  const sevenElevenResponse = await fetchSweetsUrl(
    constants.convenienceStoreItemUrls.sevenElevenJapaneseSweetsUrl,
  );
  const sevenElevenJapaneseResponse: GetSweetsDetailParams = {
    responseHtml: sevenElevenResponse,
    ...constants.sevenElevenParams,
  };

  const sevenElevenJapaneseData = await getSweetsDetail(sevenElevenJapaneseResponse);

  const familyMartResponse = await fetchSweetsUrl(constants.convenienceStoreItemUrls.familyMartUrl);
  const familyMartParams: GetSweetsDetailParams = {
    responseHtml: familyMartResponse,
    ...constants.familyMartParams,
  };
  const familyMartData = await getSweetsDetail(familyMartParams);

  const lawsonResponse = await fetchSweetsUrl(constants.convenienceStoreItemUrls.lawsonUrl);
  const lawsonParams: GetSweetsDetailParams = {
    responseHtml: lawsonResponse,
    ...constants.lawsonParams,
  };
  const lawsonData = await getSweetsDetail(lawsonParams);

  data.push(...sevenElevenJapaneseData, ...familyMartData, ...lawsonData);

  return c.json(data);
});

router.get('/', async (c) => {
  const sweets = await getRandomSweets(c.env.HONO_SWEETS, { storeType: 'FamilyMart' });
  return c.json(sweets);
});

router.post('/', async (c) => {
  await deleteAllSweets(c.env.HONO_SWEETS);
  const params = await c.req.json<ItemDetail[]>();
  await createSweets(c.env.HONO_SWEETS, params);
  return new Response(null, { status: 201 });
});

router.post('/webhook', async (c) => {
  const data = await c.req.json();
  const events: WebhookEvent[] = data.events;
  const accessToken: string = c.env.CHANNEL_ACCESS_TOKEN;
  await Promise.all(
    events.map(async (event: WebhookEvent) => {
      try {
        await textEventHandler(event, accessToken, c.env.HONO_SWEETS);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err);
        }
        return c.json({
          status: 'error',
        });
      }
    }),
  );
  return c.json({ message: 'ok' }, 200);
});

const textEventHandler = async (
  event: WebhookEvent,
  accessToken: string,
  KVNamespace: KVNamespace,
): Promise<void> => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  const { replyToken } = event;
  const receivedText = event.message.text;
  let messages = [];
  let sweets;

  switch (receivedText) {
    case 'セブンのスイーツ':
      sweets = await getRandomSweets(KVNamespace, { storeType: 'SevenEleven' });
      break;
    case 'ファミマのスイーツ':
      sweets = await getRandomSweets(KVNamespace, { storeType: 'FamilyMart' });
      break;
    case 'ローソンのスイーツ':
      sweets = await getRandomSweets(KVNamespace, { storeType: 'Lawson' });
      break;
    default:
      // ユーザーのメッセージが対応するコマンドではない場合
      messages.push({
        type: 'text',
        text: '「セブンのスイーツ」「ファミマのスイーツ」「ローソンのスイーツ」のどれかを送信すると、スイーツの情報をお届けします！🍰',
      });
      await sendMessage(replyToken, messages, accessToken);
      return;
  }

  // スイーツ情報が見つからない場合
  if (!sweets) {
    messages.push({
      type: 'text',
      text: 'スイーツが見つかりませんでした😭',
    });
    await sendMessage(replyToken, messages, accessToken);
    return;
  }

  messages.push({
    type: 'flex',
    altText: 'スイーツ情報',
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: sweets.itemImage,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
        action: {
          type: 'uri',
          uri: sweets.itemHref,
          label: '商品リンク',
        },
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: sweets.itemName,
            weight: 'bold',
            size: 'xl',
            wrap: true,
            color: '#333333',
          },
          {
            type: 'text',
            text: sweets.itemPrice,
            weight: 'regular',
            size: 'md',
            color: '#333333',
          },
        ],
      },
    },
  });

  // メッセージをLINE APIを通じて送信
  await sendMessage(replyToken, messages, accessToken);
};

// LINE APIにメッセージを送信する共通関数
async function sendMessage(replyToken: string, messages: Array<any>, accessToken: string) {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  }).catch((err) => console.error('LINE API error:', err));
}

export default router;
