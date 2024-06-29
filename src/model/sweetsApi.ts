import { SweetsStoreType } from './sweets';

// TODO: このSweetsStoreTypeの型使用は問題ないのか
export interface ItemDetailSelector extends SweetsStoreType {
  readonly baseUrl: string;
  readonly baseSelector: string;
  readonly itemNameSelector: string;
  readonly itemPriceSelector: string;
  readonly itemImageSelector: string;
  readonly itemLaunchSelector?: string;
  readonly itemImageSelectorAttribute: 'data-original' | 'src';
  readonly itemHrefSelector: string;
}

export interface GetSweetsDetailParams extends ItemDetailSelector {
  readonly responseHtml: string;
}
