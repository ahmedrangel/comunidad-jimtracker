import { eloToValue } from "../utils/helpers";

export default defineEventHandler(async () => {
  // obtener todos los riot accounts y con el twitchId obtener cada usuario único
  const riotAccounts = await db.select().from(tables.riotAccounts).all();
  const twitchIds = [...new Set(riotAccounts.map(account => account.twitchId))];
  const users = await db.select().from(tables.users).where(or(...twitchIds.map(id => eq(tables.users.twitchId, id)))).all();

  // mapear los usuarios por su twitchId para fácil acceso
  const userMap = new Map(users.map(user => [user.twitchId, user]));
  return riotAccounts.map((account, index) => ({
    rank: index + 1,
    ...account,
    eloValue: eloToValue(account.tier || "", account.division || "", account.lp || 0),
    user: userMap.get(account.twitchId) || null
  })).sort((a, b) => a.gameName.localeCompare(b.gameName)).sort((a, b) => b.eloValue - a.eloValue);
});
