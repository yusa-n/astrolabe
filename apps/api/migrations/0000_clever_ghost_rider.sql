CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`clerk_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_id_unique` ON `users` (`clerk_id`);
--> statement-breakpoint
-- Consolidated from 0001_add_teams_and_members.sql
CREATE TABLE `teams` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL,
  `stripe_customer_id` text,
  `stripe_subscription_id` text,
  `stripe_product_id` text,
  `plan_name` text,
  `subscription_status` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_stripe_customer_id_unique` ON `teams` (`stripe_customer_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_stripe_subscription_id_unique` ON `teams` (`stripe_subscription_id`);
--> statement-breakpoint
CREATE TABLE `team_members` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text NOT NULL,
  `team_id` integer NOT NULL,
  `role` text NOT NULL,
  `joined_at` integer DEFAULT (unixepoch()) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`)
);
