export type Bindings = {
  HONO_KV: KVNamespace;
  CHANNEL_ACCESS_TOKEN: string;
  API_URL: string;
  BEARER_TOKEN: string;
};

export interface ItemDetail {
  itemName: string;
  itemPrice: string;
  itemImage: string;
  itemHref: string;
}

export interface ItemDetailSelector {
  baseUrl: string;
  baseSelector: string;
  itemNameSelector: string;
  itemPriceSelector: string;
  itemImageSelector: string;
  itemImageSelectorAttribute: 'data-original' | 'src';
  itemHrefSelector: string;
  storeType: 'セブンイレブン' | 'ファミリーマート' | 'ローソン';
}

export interface GetSweetsDetailParams extends ItemDetailSelector {
  responseHtml: Response;
}

export const PREFIX = 'v1:sweets:';
