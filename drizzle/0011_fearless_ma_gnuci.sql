CREATE TABLE `retention_maintenance` (
	`id` text PRIMARY KEY NOT NULL,
	`lock_token` text,
	`lock_until` integer DEFAULT 0 NOT NULL,
	`next_attempt` integer DEFAULT 0 NOT NULL,
	`last_started` integer,
	`last_finished` integer,
	`last_success` integer,
	`last_error` text,
	`reports` integer DEFAULT 0 NOT NULL,
	`objects` integer DEFAULT 0 NOT NULL,
	`more` integer DEFAULT 0 NOT NULL
);

--> statement-breakpoint
INSERT INTO retention_maintenance(id) VALUES ('retention');
