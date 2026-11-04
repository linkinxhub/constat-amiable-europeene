CREATE TABLE `report_deletion_requests` (
	`owner_id` text NOT NULL,
	`report_id` text NOT NULL,
	`revision` integer NOT NULL,
	`requested_at` text NOT NULL,
	PRIMARY KEY(`owner_id`, `report_id`),
	FOREIGN KEY (`owner_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
