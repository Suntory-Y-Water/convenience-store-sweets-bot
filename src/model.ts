import { GetSweetsDetailParams, ItemDetail } from './types';

/**
 *
 * @description 商品ページにアクセスしてHTMLを取得する
 */
export const fetchSweetsUrl = async (apiUrl: string) => {
  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error('データの取得に失敗しました');
  }

  return response;
};

/**
 *
 * @description 商品名、価格、画像、リンクを取得する
 */
export const getSweetsDetail = async (params: GetSweetsDetailParams) => {
  const results: ItemDetail[] = [];
  let currentProduct: ItemDetail = { itemName: '', itemPrice: '', itemImage: '', itemHref: '' };

  const rewriter = new HTMLRewriter()
    .on(params.baseSelector, {
      element() {
        if (currentProduct.itemName || currentProduct.itemPrice || currentProduct.itemImage) {
          results.push(currentProduct);
          currentProduct = { itemName: '', itemPrice: '', itemImage: '', itemHref: '' };
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
          params.storeType === 'セブンイレブン' ? image : params.baseUrl + image;
      },
    })
    .on(params.baseSelector + params.itemHrefSelector, {
      element(element) {
        const href = element.getAttribute('href');
        if (!href) return;
        currentProduct.itemHref =
          params.storeType === 'ファミリーマート' ? href : params.baseUrl + href;
      },
    });

  await rewriter.transform(params.responseHtml).arrayBuffer();

  // 最後の商品が保存されていない場合はここで保存
  if (currentProduct.itemName || currentProduct.itemPrice || currentProduct.itemImage) {
    results.push(currentProduct);
  }

  return results;
};
