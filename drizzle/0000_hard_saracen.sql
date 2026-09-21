CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`budget_bytes` integer DEFAULT 0 NOT NULL,
	`rate_window` integer DEFAULT 0 NOT NULL,
	`rate_writes` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `report_versions` (
	`owner_id` text NOT NULL,
	`report_id` text NOT NULL,
	`revision` integer NOT NULL,
	`object_key` text NOT NULL,
	`created_at` text NOT NULL,
	`size_bytes` integer NOT NULL,
	PRIMARY KEY(`owner_id`, `report_id`, `revision`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`owner_id` text NOT NULL,
	`id` text NOT NULL,
	`revision` integer NOT NULL,
	`object_key` text NOT NULL,
	`title` text NOT NULL,
	`accident_date` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`owner_id`, `id`),
	FOREIGN KEY (`owner_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reports_owner_updated_idx` ON `reports` (`owner_id`,`updated_at`);