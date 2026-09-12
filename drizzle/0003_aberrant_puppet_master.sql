CREATE TABLE `saved_studies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileKey` varchar(64) NOT NULL,
	`studyId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_studies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`profileKey` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`scheduledFor` timestamp NOT NULL,
	`channel` enum('sms','email','in_app') NOT NULL DEFAULT 'in_app',
	`notes` text,
	`isSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `study_reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);