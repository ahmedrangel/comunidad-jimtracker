import { StaticAuthProvider, refreshUserToken } from "@twurple/auth";
import { ApiClient } from "@twurple/api";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { twitchId } = user;

  const params = await getValidatedRouterParams(event, z.object({
    name: z.string()
  }).parse);

  if (params.name !== user.twitchLogin) {
    throw createError({ status: ErrorCode.FORBIDDEN, message: "No tienes permiso para realizar esta acción" });
  }

  const config = useRuntimeConfig(event);

  const userModerator = await db.select().from(tables.channelModerators).all();

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
