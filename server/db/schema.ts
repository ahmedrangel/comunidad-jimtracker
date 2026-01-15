import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { unixepoch } from "../utils/db";

export const users = sqliteTable("users", {
  twitchId: text().primaryKey(),
  twitchLogin: text().notNull(),
  twitchDisplay: text().notNull(),
  twitchProfileImage: text(),
  twitchCumulativeMonths: integer(),
  twitchSubExpiration: integer(),
  country: text(),
  bio: text(),
  badges: text().$type<string[]>(),
  createdAt: integer().notNull().default(unixepoch({ mode: "ms" })),
  updatedAt: integer().notNull().default(unixepoch({ mode: "ms" }))
}, table => [
  index("users_twitch_login_idx").on(table.twitchLogin)
]);

export const riotAccounts = sqliteTable("riot_accounts", {
  puuid: text().primaryKey(),
  twitchId: text().notNull().references(() => users.twitchId, { onDelete: "cascade" }),
  gameName: text().notNull(),
  tagLine: text().notNull(),
  region: text().notNull(),
  tier: text(),
  division: text(),
  lp: integer(),
  wins: integer(),
  losses: integer(),
  profileIcon: integer(),
  verified: integer({ mode: "boolean" }).notNull().default(false),
  role1: text(),
  role2: text(),
  createdAt: integer().notNull().default(unixepoch({ mode: "ms" })),
  updatedAt: integer().notNull().default(unixepoch({ mode: "ms" }))
});

export const channelModerators = sqliteTable("channel_moderators", {
  twitchId: text().primaryKey(),
  accessToken: text().notNull(),
  refreshToken: text().notNull(),
  expiresIn: integer().notNull(),
  createdAt: integer().notNull().default(unixepoch({ mode: "ms" })),
  updatedAt: integer().notNull().default(unixepoch({ mode: "ms" }))
});
