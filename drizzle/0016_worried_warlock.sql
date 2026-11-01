ALTER TABLE `shared_sessions` ADD `owner_side` text DEFAULT 'A' NOT NULL;--> statement-breakpoint
ALTER TABLE `shared_sessions` ADD `auto_sketch_revision` integer DEFAULT 0 NOT NULL;