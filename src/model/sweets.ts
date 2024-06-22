export interface Sweets extends SweetsStoreType {
  id?: string;
  itemName: string;
  itemPrice: string;
  itemImage: string;
  itemHref: string;
}

export interface SweetsStoreType {
  readonly storeType: 'SevenEleven' | 'FamilyMart' | 'Lawson';
}
