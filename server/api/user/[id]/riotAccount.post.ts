import { Constants, LolApi, RiotApi } from "twisted";

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event);
  const body = await readBody(event);

  if (!body.gameName || !body.tagLine || !body.region) {
    throw createError({ statusCode: 400, statusMessage: "Missing required fields" });
  }

  const { gameName, tagLine, region } = body;
  const config = useRuntimeConfig(event);
  const lol = new LolApi(config.riot.apiKey);
  const riot = new RiotApi(config.riot.apiKey);

  const account = await riot.Account.getByRiotId(gameName, tagLine, Constants.regionToRegionGroupForAccountAPI(region)).catch(() => null);
  if (!account?.response) {
    throw createError({ statusCode: 404, statusMessage: "Riot account not found" });
  }

  const existing = await db.select().from(tables.riotAccounts).where(and(
    eq(tables.riotAccounts.puuid, account.response.puuid)
  )).get();

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: "Riot account already linked" });
  }

  const summoner = await lol.Summoner.getByPUUID(account.response.puuid, body.region);
  const leagueData = await lol.League.byPUUID(account.response.puuid, body.region).catch(() => null);
  const soloQueue = leagueData?.response.find(entry => entry.queueType === Constants.Queues.RANKED_SOLO_5x5);

  const newAccount = await db.insert(tables.riotAccounts).values({
    twitchId: id,
    puuid: account.response.puuid,
    gameName: account.response.gameName,
    tagLine: account.response.tagLine,
    region: region,
    profileIcon: summoner.response.profileIconId,
    tier: soloQueue?.tier || null,
    division: soloQueue?.rank || null,
    lp: soloQueue?.leaguePoints || null,
    wins: soloQueue?.wins || null,
    losses: soloQueue?.losses || null
  }).returning().get();

  return newAccount;
});
