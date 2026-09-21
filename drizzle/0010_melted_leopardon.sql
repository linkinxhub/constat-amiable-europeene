CREATE TABLE `offer_preferences` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`offer` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `retention_jobs` (
	`owner_id` text NOT NULL,
	`report_id` text NOT NULL,
	PRIMARY KEY(`owner_id`, `report_id`)
);
--> statement-breakpoint
CREATE TABLE `retention_objects` (
	`object_key` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`report_id` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `reports` ADD `retention_until` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
UPDATE reports SET retention_until=CAST(strftime('%s',MIN(
 datetime(COALESCE((SELECT MIN(created_at) FROM report_versions v WHERE v.owner_id=reports.owner_id AND v.report_id=reports.id),updated_at),'+2 months'),
 datetime(COALESCE((SELECT MIN(created_at) FROM report_versions v WHERE v.owner_id=reports.owner_id AND v.report_id=reports.id),updated_at),'start of month','+3 months','-1 day','+' || strftime('%H',COALESCE((SELECT MIN(created_at) FROM report_versions v WHERE v.owner_id=reports.owner_id AND v.report_id=reports.id),updated_at)) || ' hours','+' || strftime('%M',COALESCE((SELECT MIN(created_at) FROM report_versions v WHERE v.owner_id=reports.owner_id AND v.report_id=reports.id),updated_at)) || ' minutes','+' || strftime('%S',COALESCE((SELECT MIN(created_at) FROM report_versions v WHERE v.owner_id=reports.owner_id AND v.report_id=reports.id),updated_at)) || ' seconds')
)) AS INTEGER)*1000;
