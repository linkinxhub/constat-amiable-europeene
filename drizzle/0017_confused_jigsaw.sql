CREATE TABLE `document_extraction_usage` (
	`actor` text PRIMARY KEY NOT NULL,
	`window` integer NOT NULL,
	`calls` integer NOT NULL
);
