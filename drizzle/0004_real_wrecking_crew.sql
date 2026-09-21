ALTER TABLE `shared_sessions` ADD `pdf_lock` text;--> statement-breakpoint
ALTER TABLE `shared_sessions` ADD `pdf_lock_until` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `sessions_participant_b_idx` ON `shared_sessions` (`participant_b`);