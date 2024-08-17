import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const SweetsTable = sqliteTable('Sweets', {
  id: text('id', { length: 40 }).primaryKey(), // 商品コードとしてのID
  itemName: text('itemName', { length: 40 }).notNull(), // 商品名
  itemPriceExTax: integer('itemPriceExTax').notNull(), // 税抜き価格
  itemPriceInTax: integer('itemPriceInTax').notNull(), // 税込み価格
  itemImage: text('itemImage', { length: 255 }).notNull(), // 商品画像URL
  itemHref: text('itemHref', { length: 255 }).notNull(), // 商品ページのURL
  isNew: integer('isNew', { mode: 'boolean' }).notNull(), // 新商品かどうか (0: いいえ, 1: はい)
  releasePeriod: integer('releasePeriod').notNull().default(0), // 発売期間 (0: 該当なし, 1: 今週, 2: 来週)
  storeTypeId: integer('storeTypeId').notNull(), // storeTypeを外部キーで管理
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`), // データ作成日時
});

export const StoreTypeTable = sqliteTable('StoreTypes', {
  id: integer('id').primaryKey(), // StoreTypeのID
  storeType: text('storeType').notNull().unique(), // 店舗タイプ
});
