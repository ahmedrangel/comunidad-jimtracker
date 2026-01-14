import { StaticAuthProvider, refreshUserToken } from "@twurple/auth";
import { ApiClient } from "@twurple/api";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    name: z.string()
  }).parse);

  const config = useRuntimeConfig(event);

  const [twitchId, userModerator] = await Promise.all([
    getTwitchIdByLogin(event, params.name),
    db.select().from(tables.channelModerators).all()
  ]);

  if (!userModerator.length) {
    throw createError({ status: ErrorCode.NOT_FOUND, message: "Ha ocurrido un error." });
  }

  for (const moderator of userModerator) {
    const { accessToken, refreshToken, expiresIn, scope } = await refreshUserToken(config.oauth.twitch.clientId, config.oauth.twitch.clientSecret, moderator.refreshToken);
    const provider = new StaticAuthProvider(config.oauth.twitch.clientId, accessToken, scope);
    const twitch = new ApiClient({ authProvider: provider });
    const isFollowing = await twitch.channels.getChannelFollowers(SITE.twitchId, twitchId).then(({ data }) => data?.[0]?.userId === twitchId).catch(() => true);
    if (refreshToken && expiresIn) {
      await db.update(tables.channelModerators).set({
        accessToken,
        refreshToken,
        expiresIn,
        updatedAt: unixepoch({ mode: "ms" })
      }).where(eq(tables.channelModerators.twitchId, moderator.twitchId)).run();
    }
    if (isFollowing) {
      return { isFollowing: true };
    }
  }

  return { isFollowing: false };
});
