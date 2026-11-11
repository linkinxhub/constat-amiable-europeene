CREATE TABLE `mobile_pairings` (
	`code_hash` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`challenge` text NOT NULL,
	`code_expires_at` integer NOT NULL,
	`session_hash` text,
	`session_expires_at` integer,
	FOREIGN KEY (`owner_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mobile_pairings_session_hash_unique` ON `mobile_pairings` (`session_hash`);--> statement-breakpoint
CREATE INDEX `mobile_pairings_owner` ON `mobile_pairings` (`owner_id`);