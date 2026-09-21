CREATE TABLE `shared_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`report_id` text NOT NULL,
	`participant_b` text,
	`invite_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`consent_a` integer DEFAULT 0 NOT NULL,
	`consent_b` integer DEFAULT 0 NOT NULL,
	`ai_window` integer DEFAULT 0 NOT NULL,
	`ai_calls` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_owner_report_idx` ON `shared_sessions` (`owner_id`,`report_id`);--> statement-breakpoint
CREATE TABLE `sketch_proposals` (
	`session_id` text PRIMARY KEY NOT NULL,
	`source_revision` integer NOT NULL,
	`object_key` text NOT NULL,
	`approved_a` integer DEFAULT 0 NOT NULL,
	`approved_b` integer DEFAULT 0 NOT NULL
);
