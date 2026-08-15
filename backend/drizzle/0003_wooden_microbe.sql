CREATE TABLE `documentChunks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisRunId` int NOT NULL,
	`ownerId` int NOT NULL,
	`chunkText` text NOT NULL,
	`pageNumber` int,
	`sectionLabel` varchar(255),
	`embeddingVersion` varchar(128) NOT NULL,
	`tenantScope` enum('researcher','approved_institution') NOT NULL DEFAULT 'researcher',
	`indexStatus` enum('pending','indexed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documentChunks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `retrievalBatches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisRunId` int NOT NULL,
	`embeddingVersion` varchar(128) NOT NULL,
	`indexNamespace` varchar(255) NOT NULL,
	`filterSnapshot` text NOT NULL,
	`status` enum('pending','ready','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `retrievalBatches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sourceRegistries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`transport` enum('api','hermes_agent','manual_review') NOT NULL,
	`baseUrl` varchar(1024),
	`policy` enum('public_only','approved_partner_only') NOT NULL DEFAULT 'public_only',
	`enabled` boolean NOT NULL DEFAULT false,
	`reviewStatus` enum('draft','approved','paused') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sourceRegistries_id` PRIMARY KEY(`id`),
	CONSTRAINT `sourceRegistries_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `documentChunks` ADD CONSTRAINT `documentChunks_analysisRunId_analysisRuns_id_fk` FOREIGN KEY (`analysisRunId`) REFERENCES `analysisRuns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documentChunks` ADD CONSTRAINT `documentChunks_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `retrievalBatches` ADD CONSTRAINT `retrievalBatches_analysisRunId_analysisRuns_id_fk` FOREIGN KEY (`analysisRunId`) REFERENCES `analysisRuns`(`id`) ON DELETE cascade ON UPDATE no action;