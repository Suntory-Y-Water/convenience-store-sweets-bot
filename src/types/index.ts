export type Bindings = {
  readonly HONO_SWEETS: KVNamespace;
  readonly CHANNEL_ACCESS_TOKEN: string;
  readonly API_URL: string;
  readonly BEARER_TOKEN: string;
};

export interface StoreType {
  readonly storeType: 'SevenEleven' | 'FamilyMart' | 'Lawson';
}
export interface ItemDetail extends StoreType {
  itemName: string;
  itemPrice: string;
  itemImage: string;
  itemHref: string;
}

export interface ItemDetailRequest extends ItemDetail {
  readonly id: string;
}

export interface ItemDetailSelector extends StoreType {
  readonly baseUrl: string;
  readonly baseSelector: string;
  readonly itemNameSelector: string;
  readonly itemPriceSelector: string;
  readonly itemImageSelector: string;
  readonly itemImageSelectorAttribute: 'data-original' | 'src';
  readonly itemHrefSelector: string;
}

export interface GetSweetsDetailParams extends ItemDetailSelector {
  readonly responseHtml: Response;
}

export const PREFIX = 'v1:sweets:';

declare global {
  function getMiniflareBindings(): Bindings;
}
