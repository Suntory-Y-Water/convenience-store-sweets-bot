import {
  Bindings,
  GetSweetsDetailParams,
  ItemDetail,
  ItemDetailRequest,
  PREFIX,
  StoreType,
} from './types';
import * as constants from './constants';

/**
 *
 * @description 商品ページにアクセスしてHTMLを取得する
 */
export const fetchSweetsUrl = async (apiUrl: string): Promise<Response> => {
  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    },
  });

  if (!response.ok) {
    return new Response(null, { status: 404 });
  }

  // TODO: gloval.Response型になってしまうため、型を変換している
  return response as unknown as Response;
};

/**
 *
 * @description 商品名、価格、画像、リンクを取得する
 */
export const getSweetsDetail = async (params: GetSweetsDetailParams) => {
  try {
    const results: ItemDetail[] = [];
    let currentProduct: ItemDetail = {
      itemName: '',
      itemPrice: '',
      itemImage: '',
      itemHref: '',
      storeType: params.storeType,
    };

    const rewriter = new HTMLRewriter()
      .on(params.baseSelector, {
        element() {
          if (currentProduct.itemName || currentProduct.itemPrice || currentProduct.itemImage) {
            results.push(currentProduct);
            currentProduct = {
              itemName: '',
              itemPrice: '',
              itemImage: '',
              itemHref: '',
              storeType: params.storeType,
            };
          }
        },
      })
      .on(params.baseSelector + params.itemNameSelector, {
        text(text) {
          currentProduct.itemName += text.text.trim();
        },
      })
      .on(params.baseSelector + params.itemPriceSelector, {
        text(text) {
          currentProduct.itemPrice += text.text.replace(/\r\n\s+/g, '').trim();
        },
      })
      .on(params.baseSelector + params.itemImageSelector, {
        element(element) {
          const image = element.getAttribute(params.itemImageSelectorAttribute);
          if (!image) return;

          currentProduct.itemImage =
            params.storeType === 'SevenEleven' ? image : params.baseUrl + image;
        },
      })
      .on(params.baseSelector + params.itemHrefSelector, {
        element(element) {
          const href = element.getAttribute('href');
          if (!href) return;
          currentProduct.itemHref =
            params.storeType === 'FamilyMart' ? href : params.baseUrl + href;
        },
      });

    await rewriter.transform(params.responseHtml).arrayBuffer();

    // 最後の商品が保存されていない場合はここで保存
    if (currentProduct.itemName || currentProduct.itemPrice || currentProduct.itemImage) {
      results.push(currentProduct);
    }

    return results;
  } catch (error) {
    console.error(`スイーツの情報取得に失敗しました : ${error}`);
    console.error(`取得に失敗したスイーツ情報 : ${params}`);
    return [];
  }
};

export const createSweets = async (KV: KVNamespace, params: ItemDetail[]) => {
  try {
    // 非同期処理が終了するまで待機
    await Promise.all(
      params.map(async (param) => {
        const id = param.storeType + crypto.randomUUID();
        const sweetsData: ItemDetailRequest = {
          id: id,
          itemName: param.itemName,
          itemPrice: param.itemPrice,
          itemImage: param.itemImage,
          itemHref: param.itemHref,
          storeType: param.storeType,
        };
        await KV.put(`${PREFIX}${id}`, JSON.stringify(sweetsData));
      }),
    );
  } catch (error) {
    console.error(`データの登録に失敗しました。: ${error}`);
    return;
  }
};

export const deleteAllSweets = async (KV: KVNamespace) => {
  try {
    const list = await KV.list({ prefix: PREFIX });
    for (const key of list.keys) {
      await KV.delete(key.name);
    }
  } catch (error) {
    console.error(`データの削除に失敗しました。: ${error}`);
    return;
  }
};

export const getRandomSweets = async (KV: KVNamespace, storeType: StoreType) => {
  // storeTypeに基づいてキーをフィルタリング
  const prefix = `${PREFIX}${storeType.storeType}`;
  const list = await KV.list({ prefix });

  if (list.keys.length === 0) {
    return;
  }

  // リストからランダムにキーを選択
  const randomIndex = Math.floor(Math.random() * list.keys.length);
  const randomKey = list.keys[randomIndex];

  // ランダムに選んだキーに対応するスイーツのデータを取得
  const sweets: ItemDetail | null = await KV.get<ItemDetail>(randomKey.name, 'json');

  if (!sweets) {
    return;
  }

  return sweets;
};

export const doSomeTaskOnASchedule = async (env: Bindings) => {
  try {
    const urlsParams = [
      {
        url: constants.convenienceStoreItemUrls.sevenElevenWesternSweetsUrl,
        params: constants.sevenElevenParams,
      },
      {
        url: constants.convenienceStoreItemUrls.sevenElevenJapaneseSweetsUrl,
        params: constants.sevenElevenParams,
      },
      { url: constants.convenienceStoreItemUrls.familyMartUrl, params: constants.familyMartParams },
      { url: constants.convenienceStoreItemUrls.lawsonUrl, params: constants.lawsonParams },
    ];
    let allSweetsData: ItemDetail[] = [];

    // 全てのURLに対して順番にデータを取得
    for (const { url, params } of urlsParams) {
      const response = await fetchSweetsUrl(url);
      const sweetsDetailParams = {
        responseHtml: response,
        ...params,
      };
      const sweetsData = await getSweetsDetail(sweetsDetailParams);
      allSweetsData.push(...sweetsData);
    }

    // KVに保存する前に既存のデータを全て削除
    await deleteAllSweets(env.HONO_SWEETS);

    // 新しいスイーツデータをKVに保存
    await createSweets(env.HONO_SWEETS, allSweetsData);

    return new Response(null, { status: 201 });
  } catch (err) {
    console.error(err);
    return;
  }
};
