CREATE TABLE `ai_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_id` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`encrypted_key` text,
	`model` text DEFAULT '' NOT NULL,
	`enabled` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	`test_after` integer DEFAULT 0 NOT NULL
);
