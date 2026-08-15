CREATE TABLE `institutionalConsents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`ownerId` int NOT NULL,
	`organizationId` int,
	`scope` enum('disabled','exact_match_only','approved_similarity') NOT NULL DEFAULT 'disabled',
	`status` enum('draft','active','revoked') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `institutionalConsents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviewHandoffs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`ownerId` int NOT NULL,
	`checklistSnapshot` text NOT NULL,
	`status` enum('prepared','released','revoked') NOT NULL DEFAULT 'prepared',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviewHandoffs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `institutionalConsents` ADD CONSTRAINT `institutionalConsents_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `institutionalConsents` ADD CONSTRAINT `institutionalConsents_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `institutionalConsents` ADD CONSTRAINT `institutionalConsents_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviewHandoffs` ADD CONSTRAINT `reviewHandoffs_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviewHandoffs` ADD CONSTRAINT `reviewHandoffs_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;