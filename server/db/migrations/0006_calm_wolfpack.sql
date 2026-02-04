CREATE INDEX `log_reactions_twitch_id_idx` ON `log_reactions` (`twitch_id`);--> statement-breakpoint
CREATE INDEX `riot_account_logs_created_at_idx` ON `riot_account_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `riot_account_logs_puuid_idx` ON `riot_account_logs` (`puuid`);--> statement-breakpoint
CREATE INDEX `riot_account_logs_twitch_id_idx` ON `riot_account_logs` (`twitch_id`);--> statement-breakpoint
CREATE INDEX `riot_accounts_twitch_id_idx` ON `riot_accounts` (`twitch_id`);--> statement-breakpoint
CREATE INDEX `riot_accounts_updated_at_idx` ON `riot_accounts` (`updated_at`);--> statement-breakpoint
CREATE INDEX `users_updated_at_idx` ON `users` (`updated_at`);