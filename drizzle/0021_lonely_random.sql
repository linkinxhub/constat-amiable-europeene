CREATE TABLE `vehicle_profiles` (
	`owner_id` text NOT NULL,
	`id` text NOT NULL,
	`label` text NOT NULL,
	`vehicle_json` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`owner_id`, `id`),
	FOREIGN KEY (`owner_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `vehicle_profiles_owner_created_idx` ON `vehicle_profiles` (`owner_id`,`created_at`);