export type ReleasePeriod = 'this_week' | 'next_week';

export interface Sweets extends SweetsStoreType {
  id?: string;
  itemName: string;
  itemPrice: string;
  itemImage: string;
  itemHref: string;
  metadata?: {
    isNew?: boolean;
    releasePeriod?: ReleasePeriod;
  };
}

export interface SweetsStoreType {
  readonly storeType: 'SevenEleven' | 'FamilyMart' | 'Lawson';
}
