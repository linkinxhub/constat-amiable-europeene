CREATE TABLE `billing_test_grants` (
	`order_id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`credits` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
