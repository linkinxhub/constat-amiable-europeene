ALTER TABLE `final_documents` ADD `translated` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `shared_sessions` ADD `translation_consent_a` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `shared_sessions` ADD `translation_consent_b` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `shared_sessions` ADD `translation_window` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `shared_sessions` ADD `translation_calls` integer DEFAULT 0 NOT NULL;