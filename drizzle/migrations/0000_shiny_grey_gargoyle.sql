DROP TABLE IF EXISTS `StoreTypes`;

DROP TABLE IF EXISTS `Sweets`;

CREATE TABLE
	`StoreTypes` (
		`id` integer PRIMARY KEY NOT NULL,
		`storeType` text NOT NULL
	);

--> statement-breakpoint
CREATE TABLE
	`Sweets` (
		`id` text (40) PRIMARY KEY NOT NULL,
		`itemName` text (40) NOT NULL,
		`itemPriceExTax` integer NOT NULL,
		`itemPriceInTax` integer NOT NULL,
		`itemImage` text (255) NOT NULL,
		`itemHref` text (255) NOT NULL,
		`isNew` integer NOT NULL,
		`releasePeriod` integer DEFAULT 0 NOT NULL,
		`storeTypeId` integer NOT NULL,
		`createdAt` text DEFAULT CURRENT_TIMESTAMP
	);

--> statement-breakpoint
CREATE UNIQUE INDEX `StoreTypes_storeType_unique` ON `StoreTypes` (`storeType`);