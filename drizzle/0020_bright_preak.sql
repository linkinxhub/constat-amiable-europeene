CREATE TABLE `mobile_settings` (
	`revision` integer PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`config` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL,
	`source_revision` integer
);
