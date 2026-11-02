CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`category` text NOT NULL,
	`message` text NOT NULL,
	`lang` text NOT NULL,
	`source` text NOT NULL,
	`images` text NOT NULL,
	`digest` text NOT NULL,
	`created_at` integer NOT NULL,
	`resolved` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `feedback_owner_created` ON `feedback` (`owner_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `feedback_inbox` ON `feedback` (`resolved`,`created_at`);