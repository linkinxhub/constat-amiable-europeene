CREATE TABLE `storage_objects` (
	`object_key` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`state` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `storage_objects_owner_idx` ON `storage_objects` (`owner_id`);--> statement-breakpoint
ALTER TABLE `shared_sessions` ADD `ai_lock` text;--> statement-breakpoint
ALTER TABLE `shared_sessions` ADD `ai_lock_until` integer DEFAULT 0 NOT NULL;