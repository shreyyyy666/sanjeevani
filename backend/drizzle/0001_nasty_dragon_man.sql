CREATE TABLE `analysisRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`ownerId` int NOT NULL,
	`status` enum('uploaded','extracting','needs_review','retrieving','analyzing','report_ready','failed','deleted') NOT NULL DEFAULT 'uploaded',
	`progress` int NOT NULL DEFAULT 0,
	`currentStage` varchar(128) NOT NULL DEFAULT 'Upload received',
	`errorMessage` text,
	`embeddingModel` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`startedAt` timestamp,
	`completedAt` timestamp,
	CONSTRAINT `analysisRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assistantConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`mode` enum('explain','guide') NOT NULL DEFAULT 'guide',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assistantConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assistantMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`citations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assistantMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int NOT NULL,
	`workspaceId` int,
	`action` varchar(255) NOT NULL,
	`resourceType` varchar(128) NOT NULL,
	`resourceId` varchar(128),
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chemistryFindings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisRunId` int NOT NULL,
	`category` enum('identity','similarity','route','feasibility') NOT NULL,
	`label` varchar(500) NOT NULL,
	`status` enum('confirmed','needs_review','insufficient_evidence') NOT NULL DEFAULT 'needs_review',
	`details` text NOT NULL,
	`sourceName` varchar(255),
	`sourceUrl` varchar(1024),
	`pageNumber` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chemistryFindings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidenceItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisRunId` int NOT NULL,
	`collisionState` enum('no_match_found','possible_overlap','strong_collision','insufficient_evidence') NOT NULL,
	`sourceType` enum('public_record','scientific_literature','patent_record','institutional_network') NOT NULL,
	`sourceTitle` varchar(500) NOT NULL,
	`sourceUrl` varchar(1024),
	`sourceDate` timestamp,
	`pageReference` varchar(128),
	`rationale` text NOT NULL,
	`provenanceVersion` varchar(128) NOT NULL DEFAULT 'v1',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evidenceItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `extractedEntities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisRunId` int NOT NULL,
	`kind` enum('compound','api','synthesis_step','therapeutic_context','date','citation') NOT NULL,
	`label` varchar(500) NOT NULL,
	`details` text,
	`pageNumber` int,
	`sectionLabel` varchar(255),
	`confirmed` boolean NOT NULL DEFAULT false,
	`needsReview` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `extractedEntities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizationMemberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('researcher','reviewer','institution_admin') NOT NULL DEFAULT 'researcher',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organizationMemberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(96) NOT NULL,
	`participationStatus` enum('invited','active','paused') NOT NULL DEFAULT 'invited',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisRunId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`executiveSummary` text NOT NULL,
	`recommendedEscalation` varchar(255) NOT NULL,
	`disclaimer` text NOT NULL,
	`reportStatus` enum('draft','ready','shared') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `reports_analysisRunId_unique` UNIQUE(`analysisRunId`)
);
--> statement-breakpoint
CREATE TABLE `researchSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`ownerId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`institution` varchar(255),
	`fileKey` varchar(512),
	`fileName` varchar(512),
	`mimeType` varchar(128),
	`fileSizeBytes` int,
	`disclosureStatus` enum('private','internal_review','public_disclosure','published') NOT NULL DEFAULT 'private',
	`conceptionDate` timestamp,
	`disclosureDate` timestamp,
	`publicationDate` timestamp,
	`storageStatus` enum('private','deleted') NOT NULL DEFAULT 'private',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `researchSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `urgencyEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisRunId` int NOT NULL,
	`alertState` enum('30-day','7-day','critical','expired') NOT NULL,
	`ruleName` varchar(255) NOT NULL,
	`jurisdiction` varchar(128) NOT NULL,
	`ruleSourceUrl` varchar(1024),
	`dueDate` timestamp,
	`explanation` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `urgencyEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`organizationId` int,
	`name` varchar(255) NOT NULL,
	`institution` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`)
);
