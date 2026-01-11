import { Constants, LolApi, RiotApi } from "twisted";

export default defineEventHandler(async (event) => {
  const { name } = getRouterParams(event);

  const twitchId = await getTwitchIdByLogin(event, name);

  if (!twitchId) {
    throw createError({ statusCode: 404, message: "Usuario no encontrado" });
  }

  const body = await readBody(event);

  if (!body.gameName || !body.tagLine || !body.region || Number.isNaN(body.iconVerificationId)) {
    throw createError({ statusCode: 400, message: "Campos requeridos faltantes" });
  }

  const { gameName, tagLine, region } = body;
  const config = useRuntimeConfig(event);
  const lol = new LolApi(config.riot.apiKey);
  const riot = new RiotApi(config.riot.apiKey);

  const account = await riot.Account.getByRiotId(gameName, tagLine, Constants.regionToRegionGroupForAccountAPI(region)).catch(() => null);
  if (!account?.response) {
    throw createError({ status: 404, message: "Cuenta de Riot no encontrada" });
  }

  const existing = await db.select().from(tables.riotAccounts).where(and(
    eq(tables.riotAccounts.puuid, account.response.puuid)
  )).get();

  if (existing) {
    throw createError({ status: 409, message: "Cuenta de Riot ya vinculada" });
  }

  const summoner = await lol.Summoner.getByPUUID(account.response.puuid, body.region);

  if (summoner.response.profileIconId !== body.iconVerificationId) {
    throw createError({ status: 400, message: "La verificación del icono falló" });
  }

  const leagueData = await lol.League.byPUUID(account.response.puuid, body.region).catch(() => null);
  const soloQueue = leagueData?.response.find(entry => entry.queueType === Constants.Queues.RANKED_SOLO_5x5);

  const newAccount = await db.insert(tables.riotAccounts).values({
    twitchId,
    puuid: account.response.puuid,
    gameName: account.response.gameName,
    tagLine: account.response.tagLine,
    region: region,
    verified: true,
    profileIcon: summoner.response.profileIconId,
    tier: soloQueue?.tier || null,
    division: soloQueue?.rank || null,
    lp: soloQueue?.leaguePoints || null,
    wins: soloQueue?.wins || null,
    losses: soloQueue?.losses || null
  }).returning().get();

  return newAccount;
});
