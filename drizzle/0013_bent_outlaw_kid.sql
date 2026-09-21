CREATE TABLE `billing_test_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`report_id` text NOT NULL,
	`locale` text NOT NULL,
	`session_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `billing_test_order_report` ON `billing_test_orders` (`owner_id`,`report_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `billing_test_order_session` ON `billing_test_orders` (`session_id`);--> statement-breakpoint
CREATE TABLE `billing_test_receipts` (
	`event_id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`session_id` text NOT NULL,
	`received_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `billing_test_receipt_order` ON `billing_test_receipts` (`order_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `billing_test_receipt_session` ON `billing_test_receipts` (`session_id`);