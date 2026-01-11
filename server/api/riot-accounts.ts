import { eloToValue } from "../utils/helpers";

export default defineEventHandler(async () => {
  // obtener solo los campos necesarios para la tabla
  const riotAccounts = await db.select({
    twitchId: tables.riotAccounts.twitchId,
    gameName: tables.riotAccounts.gameName,
    tagLine: tables.riotAccounts.tagLine,
    region: tables.riotAccounts.region,
    tier: tables.riotAccounts.tier,
    division: tables.riotAccounts.division,
    lp: tables.riotAccounts.lp,
    wins: tables.riotAccounts.wins,
    losses: tables.riotAccounts.losses
  }).from(tables.riotAccounts).all();

  const twitchIds = [...new Set(riotAccounts.map(account => account.twitchId))];

  const users = await db.select({
    twitchId: tables.users.twitchId,
    twitchLogin: tables.users.twitchLogin,
    twitchDisplay: tables.users.twitchDisplay,
    country: tables.users.country
  }).from(tables.users).where(or(...twitchIds.map(id => eq(tables.users.twitchId, id)))).all();

  // mapear los usuarios por su twitchId para fácil acceso
  const userMap = new Map(users.map(user => [user.twitchId, user]));

  return riotAccounts.map(({ twitchId, ...account }, index) => ({
    rank: index + 1,
    ...account,
    eloValue: eloToValue(account.tier || "", account.division || "", account.lp || 0),
    user: userMap.get(twitchId) || null
  })).sort((a, b) => a.gameName.localeCompare(b.gameName)).sort((a, b) => b.eloValue - a.eloValue);
});
