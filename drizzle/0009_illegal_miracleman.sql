CREATE TABLE `ai_daily_usage` (
	`day` text PRIMARY KEY NOT NULL,
	`calls` integer DEFAULT 0 NOT NULL,
	`sketches` integer DEFAULT 0 NOT NULL,
	`translations` integer DEFAULT 0 NOT NULL
);
