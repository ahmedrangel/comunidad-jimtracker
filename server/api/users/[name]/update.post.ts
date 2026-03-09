import { Constants, LolApi, RiotApi } from "twisted";
import { AppTokenAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    name: z.string()
  }).parse);

  const twitchId = await getTwitchIdByLogin(event, params.name);
  const config = useRuntimeConfig(event);

  const riot = new RiotApi(config.oauth.riotgames.apiKey);
  const lol = new LolApi(config.oauth.riotgames.apiKey);
  const authProvider = new AppTokenAuthProvider(config.oauth.twitch.clientId, config.oauth.twitch.clientSecret);
  const twitch = new ApiClient({ authProvider });

  const newRiotAccountData = [];
  const newRiotAccountLogs: Pick<JimRiotAccountLog, "puuid" | "data">[] = [];

  const riotAccounts = await db.select({
    puuid: tables.riotAccounts.puuid,
    region: tables.riotAccounts.region,
    tier: tables.riotAccounts.tier,
    division: tables.riotAccounts.division,
    lp: tables.riotAccounts.lp
  }).from(tables.riotAccounts).where(eq(tables.riotAccounts.twitchId, twitchId)).all();

  if (riotAccounts && riotAccounts.length) {
    for (const account of riotAccounts) {
      const [accountData, summonerData, leagueData] = await Promise.allSettled([
        riot.Account.getByPUUID(account.puuid, Constants.regionToRegionGroupForAccountAPI(account.region)),
        lol.Summoner.getByPUUID(account.puuid, account.region),
        lol.League.byPUUID(account.puuid, account.region)
      ]);

      if (accountData.status === "rejected" || summonerData.status === "rejected" || leagueData.status === "rejected") {
        continue;
      }

      const soloQueue = leagueData.value.response.find(entry => entry.queueType === Constants.Queues.RANKED_SOLO_5x5);

      newRiotAccountData.push({
        puuid: accountData.value.response.puuid,
        gameName: accountData.value.response.gameName,
        tagLine: accountData.value.response.tagLine,
        profileIcon: summonerData.value.response.profileIconId,
        tier: soloQueue?.tier || null,
        division: soloQueue?.rank || null,
        lp: soloQueue?.leaguePoints ?? null,
        wins: soloQueue?.wins ?? null,
        losses: soloQueue?.losses ?? null
      });

      if (soloQueue?.leaguePoints
        && (soloQueue?.tier !== account.tier
          || soloQueue?.rank !== account.division)
      ) {
        newRiotAccountLogs.push({
          puuid: accountData.value.response.puuid,
          data: {
            old: { tier: account.tier, division: account.division, lp: account.lp },
            new: { tier: soloQueue.tier, division: soloQueue.rank, lp: soloQueue.leaguePoints }
          }
        });
      }
    }
  }

  const newUserInfo = await twitch.users.getUserById(twitchId);

  if (!newUserInfo) {
    throw createError({
      status: ErrorCode.NOT_FOUND,
      message: "User not found"
    });
  }

  const updateUser = db.update(tables.users).set({
    twitchLogin: newUserInfo.name,
    twitchDisplay: newUserInfo.displayName,
    twitchProfileImage: newUserInfo.profilePictureUrl,
    updatedAt: unixepoch({ mode: "ms" })
  }).where(eq(tables.users.twitchId, twitchId)).returning().get();

  const updateRiotAccounts = newRiotAccountData.map((accountData) => {
    return db.update(tables.riotAccounts).set({
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      profileIcon: accountData.profileIcon,
      tier: accountData.tier,
      division: accountData.division,
      lp: accountData.lp,
      wins: accountData.wins,
      losses: accountData.losses,
      updatedAt: unixepoch({ mode: "ms" })
    }).where(and(
      eq(tables.riotAccounts.twitchId, twitchId),
      eq(tables.riotAccounts.puuid, accountData.puuid)
    )).returning().get();
  });

  const createRiotAccountLogs = newRiotAccountLogs.map((log) => {
    return db.insert(tables.riotAccountLogs).values({
      puuid: log.puuid,
      twitchId: twitchId,
      data: log.data
    }).returning().get();
  });

  const [userResults, riotAccountResults, riotAccountLogsResults] = await Promise.all([
    updateUser,
    Promise.all(updateRiotAccounts),
    Promise.all(createRiotAccountLogs)
  ]);

  const session = await getUserSession(event);

  if (session.user && (session.user.twitchId === userResults.twitchId) && (session.user?.twitchLogin !== userResults.twitchLogin
    || session.user?.twitchDisplay !== userResults.twitchDisplay
    || session.user?.twitchProfileImage !== userResults.twitchProfileImage)) {
    const newUserSessionData = {
      ...session.user,
      twitchLogin: userResults.twitchLogin,
      twitchDisplay: userResults.twitchDisplay,
      twitchProfileImage: userResults.twitchProfileImage
    };
    await setUserSession(event, { user: newUserSessionData });
  }

  return {
    user: userResults,
    riotAccounts: riotAccountResults,
    newRiotAccountLogs: riotAccountLogsResults
  };
});
