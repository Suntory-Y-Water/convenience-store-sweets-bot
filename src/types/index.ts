import { LineErrorMessage } from '../model/line';

export type Bindings = {
  readonly HONO_SWEETS: KVNamespace;
  readonly CHANNEL_ACCESS_TOKEN: string;
  readonly API_URL: string;
  readonly BEARER_TOKEN: string;
};

export interface DefaultMessages {
  readonly type: string;
  readonly text: string;
}

export interface ItemDetailSelector {
  readonly baseUrl: string;
  readonly baseSelector: string;
  readonly itemNameSelector: string;
  readonly itemPriceSelector: string;
  readonly itemImageSelector: string;
  readonly itemLaunchSelector?: string;
  readonly itemImageSelectorAttribute: 'data-original' | 'src';
  readonly itemHrefSelector: string;
  readonly storeType: 'SevenEleven' | 'FamilyMart' | 'Lawson';
}

export interface GetSweetsDetailParams extends ItemDetailSelector {
  readonly responseHtml: string;
}

export const PREFIX = 'v1:sweets:';

declare global {
  function getMiniflareBindings(): Bindings;
}

export type StoreType = 'SevenEleven' | 'FamilyMart' | 'Lawson';
export type ProductType = 'randomSweets' | 'newProducts';

export interface LineMessageType {
  store: StoreType | null;
  productType: ProductType | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isLineErrorMessage = (response: any): response is LineErrorMessage => {
  return (response as LineErrorMessage).message !== undefined;
};
