ALTER TABLE `participant_profiles` MODIFY COLUMN `conditions` json;--> statement-breakpoint
ALTER TABLE `participant_profiles` MODIFY COLUMN `medications` json;--> statement-breakpoint
ALTER TABLE `screener_questions` MODIFY COLUMN `options` json;--> statement-breakpoint
ALTER TABLE `studies` MODIFY COLUMN `requiredConditions` json;--> statement-breakpoint
ALTER TABLE `studies` MODIFY COLUMN `excludedConditions` json;