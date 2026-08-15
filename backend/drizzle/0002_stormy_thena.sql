CREATE TABLE `researchFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`ownerId` int NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`originalFileName` varchar(512) NOT NULL,
	`mimeType` varchar(128) NOT NULL,
	`fileSizeBytes` int NOT NULL,
	`privacyStatus` enum('private','deleted') NOT NULL DEFAULT 'private',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `researchFiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `researchFiles` ADD CONSTRAINT `researchFiles_submissionId_researchSubmissions_id_fk` FOREIGN KEY (`submissionId`) REFERENCES `researchSubmissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `researchFiles` ADD CONSTRAINT `researchFiles_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analysisRuns` ADD CONSTRAINT `analysisRuns_submissionId_researchSubmissions_id_fk` FOREIGN KEY (`submissionId`) REFERENCES `researchSubmissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analysisRuns` ADD CONSTRAINT `analysisRuns_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assistantConversations` ADD CONSTRAINT `assistantConversations_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assistantConversations` ADD CONSTRAINT `assistantConversations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assistantMessages` ADD CONSTRAINT `assistantMessages_conversationId_assistantConversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `assistantConversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auditEvents` ADD CONSTRAINT `auditEvents_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auditEvents` ADD CONSTRAINT `auditEvents_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chemistryFindings` ADD CONSTRAINT `chemistryFindings_analysisRunId_analysisRuns_id_fk` FOREIGN KEY (`analysisRunId`) REFERENCES `analysisRuns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evidenceItems` ADD CONSTRAINT `evidenceItems_analysisRunId_analysisRuns_id_fk` FOREIGN KEY (`analysisRunId`) REFERENCES `analysisRuns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `extractedEntities` ADD CONSTRAINT `extractedEntities_analysisRunId_analysisRuns_id_fk` FOREIGN KEY (`analysisRunId`) REFERENCES `analysisRuns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationMemberships` ADD CONSTRAINT `organizationMemberships_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organizationMemberships` ADD CONSTRAINT `organizationMemberships_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reports` ADD CONSTRAINT `reports_analysisRunId_analysisRuns_id_fk` FOREIGN KEY (`analysisRunId`) REFERENCES `analysisRuns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `researchSubmissions` ADD CONSTRAINT `researchSubmissions_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `researchSubmissions` ADD CONSTRAINT `researchSubmissions_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `urgencyEvents` ADD CONSTRAINT `urgencyEvents_analysisRunId_analysisRuns_id_fk` FOREIGN KEY (`analysisRunId`) REFERENCES `analysisRuns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspaces` ADD CONSTRAINT `workspaces_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspaces` ADD CONSTRAINT `workspaces_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE set null ON UPDATE no action;