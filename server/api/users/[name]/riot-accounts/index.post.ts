import { Constants, LolApi, RiotApi } from "twisted";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const params = await getValidatedRouterParams(event, z.object({
    name: z.string()
  }).parse);

  const twitchId = await getTwitchIdByLogin(event, params.name);

  if (user.twitchLogin !== params.name || user.twitchId !== twitchId) {
    throw createError({ status: ErrorCode.FORBIDDEN, message: "No tienes permiso para realizar esta acción" });
  }

  const body = await readValidatedBody(event, z.object({
    gameName: z.string(),
    tagLine: z.string(),
    region: z.enum(Constants.Regions),
    iconVerificationId: z.number().min(0)
  }).parse);

  const { gameName, tagLine, region } = body;
  const config = useRuntimeConfig(event);
  const lol = new LolApi(config.riot.apiKey);
  const riot = new RiotApi(config.riot.apiKey);

  const account = await riot.Account.getByRiotId(gameName, tagLine, Constants.regionToRegionGroupForAccountAPI(region)).catch(() => null);
  if (!account?.response) {
    throw createError({ status: ErrorCode.NOT_FOUND, message: "Cuenta de Riot no encontrada" });
  }

  const existing = await db.select().from(tables.riotAccounts).where(and(
    eq(tables.riotAccounts.puuid, account.response.puuid)
  )).get();

  if (existing) {
    throw createError({ status: ErrorCode.CONFLICT, message: "Cuenta de Riot ya vinculada" });
  }

  const summoner = await lol.Summoner.getByPUUID(account.response.puuid, body.region);

  if (summoner.response.profileIconId !== body.iconVerificationId && !import.meta.dev) {
    throw createError({ status: ErrorCode.BAD_REQUEST, message: "La verificación del icono falló" });
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
