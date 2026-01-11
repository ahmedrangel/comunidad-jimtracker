import { Constants, LolApi } from "twisted";
import type { Regions } from "twisted/dist/constants";

export default defineTask({
  meta: {
    name: "updateLeagueData",
    description: "Update league data for riot accounts"
  },
  async run (): Promise<{
    result?: any[];
  }> {
    const riotAccounts = await db.select({
      puuid: tables.riotAccounts.puuid,
      region: tables.riotAccounts.region,
      lp: tables.riotAccounts.lp,
      tier: tables.riotAccounts.tier,
      division: tables.riotAccounts.division,
      wins: tables.riotAccounts.wins,
      losses: tables.riotAccounts.losses
    }).from(tables.riotAccounts).orderBy(asc(tables.riotAccounts.updatedAt)).limit(100).all();

    const config = useRuntimeConfig();
    const lol = new LolApi(config.riot.apiKey);

    const leagueDataPromises = riotAccounts.map(account => lol.League.byPUUID(account.puuid, account.region as Regions));

    const results = await Promise.allSettled(leagueDataPromises);

    const toUpdatePromises = [];

    for (const result of results) {
      if (result.status === "rejected") continue;
      const league = result.value.response.find(entry => entry.queueType === Constants.Queues.RANKED_SOLO_5x5);
      if (league) {
        const account = riotAccounts.find(acc => acc.puuid === league.puuid);
        if (account?.division != league.rank || account?.tier != league.tier || account?.lp != league.leaguePoints || account?.wins != league.wins || account?.losses != league.losses) {
          const updateQuery = db.update(tables.riotAccounts).set({
            lp: league.leaguePoints,
            tier: league.tier,
            division: league.rank,
            wins: league.wins,
            losses: league.losses,
            updatedAt: unixepoch({ mode: "ms" })
          }).where(and(
            eq(tables.riotAccounts.puuid, league.puuid)
          ));

          if (import.meta.dev) {
            updateQuery.returning({
              puuid: tables.riotAccounts.puuid,
              twitchId: tables.riotAccounts.twitchId,
              lp: tables.riotAccounts.lp,
              tier: tables.riotAccounts.tier,
              division: tables.riotAccounts.division,
              wins: tables.riotAccounts.wins,
              losses: tables.riotAccounts.losses
            }).get();
          }
          else {
            updateQuery.run();
          }

          toUpdatePromises.push(updateQuery);
        }
      }
    }

    if (!toUpdatePromises.length) return { result: [] };

    const updatedData = await Promise.all(toUpdatePromises);
    return { result: updatedData };
  }
});
