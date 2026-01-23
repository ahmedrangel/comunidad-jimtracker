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
  const body = await readBody(event);
  const { riotAccounts } = body;

  const newRiotAccountData = [];
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
    }
  }

  const newUserInfo = await twitch.users.getUserById(twitchId);

  if (newUserInfo) {
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

    const [userResults, ...riotAccountResults] = await Promise.all([updateUser, ...updateRiotAccounts]);

    return {
      user: userResults,
      riotAccounts: riotAccountResults
    };
  }

  throw createError({ status: ErrorCode.NOT_FOUND, statusMessage: "User not found" });
});
