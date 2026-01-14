import { Constants, LolApi } from "twisted";
import type { Regions } from "twisted/dist/constants";
import { withQuery } from "ufo";

export default defineOAuthRiotGamesEventHandler({
  config: {
    scope: ["cpid"]
  },
  async onSuccess (event, result) {
    const { user } = await requireUserSession(event);
    const userURL = `/u/${user.twitchLogin}`;
    const cpid = result.user.cpid;

    if (!cpid) {
      return sendRedirect(event, withQuery(userURL, { error: "riot_link_failed" }));
    }

    const accessToken = result.tokens.access_token;
    const config = useRuntimeConfig(event);
    const lol = new LolApi(config.riot.apiKey);
    const account = await $fetch<{ puuid: string, gameName: string, tagLine: string }>(`https://${Constants.regionToRegionGroupForAccountAPI(cpid as Regions)}.api.riotgames.com/riot/account/v1/accounts/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).catch(() => null);
    if (!account) {
      return sendRedirect(event, withQuery(userURL, { error: "riot_link_failed" }));
    }
    const existing = await db.select().from(tables.riotAccounts).where(and(
      eq(tables.riotAccounts.puuid, account.puuid)
    )).get();

    if (existing) {
      return sendRedirect(event, withQuery(userURL, { error: "riot_account_already_linked" }));
    }

    const [summoner, leagueData] = await Promise.all([
      lol.Summoner.getByPUUID(account.puuid, cpid as Regions),
      lol.League.byPUUID(account.puuid, cpid as Regions).catch(() => null)
    ]);

    const soloQueue = leagueData?.response.find(entry => entry.queueType === Constants.Queues.RANKED_SOLO_5x5);

    await db.insert(tables.riotAccounts).values({
      twitchId: user.twitchId,
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      region: cpid,
      verified: true,
      profileIcon: summoner.response.profileIconId,
      tier: soloQueue?.tier || null,
      division: soloQueue?.rank || null,
      lp: soloQueue?.leaguePoints ?? null,
      wins: soloQueue?.wins ?? null,
      losses: soloQueue?.losses ?? null
    }).returning().get();

    return sendRedirect(event, userURL);
  }
});
