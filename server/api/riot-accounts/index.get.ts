import { eq } from "drizzle-orm";

export default defineEventHandler(async () => {
  const riotAccountsWithUsers = await db.select({
    // Campos de riot accounts
    puuid: tables.riotAccounts.puuid,
    twitchId: tables.riotAccounts.twitchId,
    gameName: tables.riotAccounts.gameName,
    tagLine: tables.riotAccounts.tagLine,
    region: tables.riotAccounts.region,
    tier: tables.riotAccounts.tier,
    division: tables.riotAccounts.division,
    lp: tables.riotAccounts.lp,
    wins: tables.riotAccounts.wins,
    losses: tables.riotAccounts.losses,
    profileIcon: tables.riotAccounts.profileIcon,
    role1: tables.riotAccounts.role1,
    role2: tables.riotAccounts.role2,
    // Campos de usuario
    twitchLogin: tables.users.twitchLogin,
    twitchDisplay: tables.users.twitchDisplay,
    twitchProfileImage: tables.users.twitchProfileImage,
    bio: tables.users.bio,
    country: tables.users.country,
    userUpdatedAt: tables.users.updatedAt
  })
    .from(tables.riotAccounts)
    .innerJoin(tables.users, eq(tables.riotAccounts.twitchId, tables.users.twitchId))
    .all();

  return riotAccountsWithUsers.map((account) => {
    const { twitchId, twitchLogin, twitchDisplay, twitchProfileImage, bio, country, userUpdatedAt, ...riotData } = account;

    return {
      ...riotData,
      eloValue: eloToValue(riotData.tier, riotData.division, riotData.lp),
      user: { twitchId, twitchLogin, twitchDisplay, twitchProfileImage, bio, country, updatedAt: userUpdatedAt }
    };
  }).sort((a, b) => a.gameName.localeCompare(b.gameName)).sort((a, b) => b.eloValue - a.eloValue).map((data, index) => ({
    rank: index + 1,
    ...data
  }));
});
