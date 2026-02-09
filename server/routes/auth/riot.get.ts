import { Constants, LolApi } from "twisted";
import type { Regions } from "twisted/dist/constants";
import { withQuery } from "ufo";

export default defineOAuthRiotGamesEventHandler({
  config: {
    scope: ["cpid"],
    region: "americas",
    authorizationParams: {
      prompt: "login"
    }
  },
  async onSuccess (event, result) {
    const { user } = await requireUserSession(event);
    const userURL = `/u/${user.twitchLogin}`;
    const cpid = result.user.cpid as Regions;

    if (!cpid) {
      return sendRedirect(event, withQuery(userURL, { error: "riot_link_failed" }));
    }

    const config = useRuntimeConfig(event);
    const lol = new LolApi(config.oauth.riotgames.apiKey);
    const existing = await db.select().from(tables.riotAccounts).where(and(
      eq(tables.riotAccounts.puuid, result.user.puuid)
    )).get();

    if (existing) {
      return sendRedirect(event, withQuery(userURL, { error: "riot_account_already_linked" }));
    }

    const regionSupported = regionMap.some(r => r.value.toLowerCase() === cpid.toLowerCase());

    if (!regionSupported) {
      return sendRedirect(event, withQuery(userURL, { error: "riot_region_not_supported" }));
    }

    const [summoner, leagueData] = await Promise.all([
      lol.Summoner.getByPUUID(result.user.puuid, cpid),
      lol.League.byPUUID(result.user.puuid, cpid).catch(() => null)
    ]);

    const soloQueue = leagueData?.response.find(entry => entry.queueType === Constants.Queues.RANKED_SOLO_5x5);

    await db.insert(tables.riotAccounts).values({
      twitchId: user.twitchId,
      puuid: result.user.puuid,
      gameName: result.user.gameName,
      tagLine: result.user.tagLine,
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
