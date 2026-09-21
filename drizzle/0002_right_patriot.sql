CREATE TABLE `final_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`revision` integer NOT NULL,
	`style` text NOT NULL,
	`lang` text NOT NULL,
	`digest` text NOT NULL,
	`report_key` text NOT NULL,
	`sketch_key` text,
	`created_at` text NOT NULL,
	`signature_a` text,
	`signature_b` text,
	`pdf_key` text,
	`pdf_hash` text
);
--> statement-breakpoint
CREATE INDEX `final_documents_session_created` ON `final_documents` (`session_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `final_documents_session_digest` ON `final_documents` (`session_id`,`digest`);