import { Constants, LolApi } from "twisted";
import type { Regions } from "twisted/dist/constants";

export default defineTask({
  meta: {
    name: "updateLeagueData",
    description: "Update league data for riot accounts"
  },
  async run (): Promise<{
    result?: any[];
    updated?: number;
    unchanged?: number;
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
    const lol = new LolApi(config.oauth.riotgames.apiKey);

    const leagueDataPromises = riotAccounts.map(account => lol.League.byPUUID(account.puuid, account.region as Regions));

    const results = await Promise.allSettled(leagueDataPromises);

    const promisesWithChanges = [];
    const promisesWithNoChanges = [];
    const processedPuuids = new Set<string>();

    for (const result of results) {
      if (result.status === "rejected") continue;
      const league = result.value.response.find(entry => entry.queueType === Constants.Queues.RANKED_SOLO_5x5);
      if (league) {
        processedPuuids.add(league.puuid);
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

          const updatePromise = import.meta.dev ? updateQuery.returning({
            puuid: tables.riotAccounts.puuid,
            twitchId: tables.riotAccounts.twitchId,
            lp: tables.riotAccounts.lp,
            tier: tables.riotAccounts.tier,
            division: tables.riotAccounts.division,
            wins: tables.riotAccounts.wins,
            losses: tables.riotAccounts.losses
          }).get() : updateQuery.run();

          promisesWithChanges.push(updatePromise);
        }
        else {
          const touchQuery = db.update(tables.riotAccounts).set({
            updatedAt: unixepoch({ mode: "ms" })
          }).where(eq(tables.riotAccounts.puuid, league.puuid));

          const updatePromise = import.meta.dev ? touchQuery.returning({
            puuid: tables.riotAccounts.puuid
          }).get() : touchQuery.run();

          promisesWithNoChanges.push(updatePromise);
        }
      }
    }

    for (const account of riotAccounts) {
      if (!processedPuuids.has(account.puuid)) {
        const touchQuery = db.update(tables.riotAccounts).set({
          updatedAt: unixepoch({ mode: "ms" })
        }).where(eq(tables.riotAccounts.puuid, account.puuid));

        const updatePromise = import.meta.dev ? touchQuery.returning({
          puuid: tables.riotAccounts.puuid
        }).get() : touchQuery.run();

        promisesWithNoChanges.push(updatePromise);
      }
    }

    if (!promisesWithChanges.length && !promisesWithNoChanges.length) return { result: [] };

    const [changedData, noChangesData] = await Promise.all([
      Promise.all(promisesWithChanges),
      Promise.all(promisesWithNoChanges)
    ]);

    return {
      result: changedData,
      updated: changedData.length,
      unchanged: noChangesData.length
    };
  }
});
