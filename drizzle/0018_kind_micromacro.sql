CREATE TABLE `synthesis_proposals` (
	`sequence` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id` text NOT NULL,
	`session_id` text NOT NULL,
	`source_revision` integer NOT NULL,
	`content` text NOT NULL,
	`approved_a` integer DEFAULT 0 NOT NULL,
	`approved_b` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `synthesis_proposals_id_unique` ON `synthesis_proposals` (`id`);--> statement-breakpoint
CREATE INDEX `synthesis_session_sequence` ON `synthesis_proposals` (`session_id`,`sequence`);--> statement-breakpoint
ALTER TABLE `shared_sessions` ADD `summary_consent_a` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `shared_sessions` ADD `summary_consent_b` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `shared_sessions` ADD `auto_summary_revision` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `sketch_proposals` ADD `summary_id` text;