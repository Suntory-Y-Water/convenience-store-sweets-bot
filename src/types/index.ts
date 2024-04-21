export type Bindings = {
  HONO_SWEETS: KVNamespace;
  CHANNEL_ACCESS_TOKEN: string;
  API_URL: string;
  BEARER_TOKEN: string;
};

export interface StoreType {
  storeType: 'SevenEleven' | 'FamilyMart' | 'Lawson';
}
export interface ItemDetail extends StoreType {
  itemName: string;
  itemPrice: string;
  itemImage: string;
  itemHref: string;
}

export interface ItemDetailRequest extends ItemDetail {
  id: string;
}

export interface ItemDetailSelector extends StoreType {
  baseUrl: string;
  baseSelector: string;
  itemNameSelector: string;
  itemPriceSelector: string;
  itemImageSelector: string;
  itemImageSelectorAttribute: 'data-original' | 'src';
  itemHrefSelector: string;
}

export interface GetSweetsDetailParams extends ItemDetailSelector {
  responseHtml: Response;
}

export const PREFIX = 'v1:sweets:';
