import { StaticAuthProvider, refreshUserToken } from "@twurple/auth";
import { ApiClient } from "@twurple/api";

export default defineCachedEventHandler(async (event) => {
  const userModerator = await db.select().from(tables.channelModerators).all();

  if (!userModerator.length) {
    throw createError({ status: ErrorCode.NOT_FOUND, message: "Ha ocurrido un error." });
  }

  const config = useRuntimeConfig(event);

  for (const moderator of userModerator) {
    const { accessToken, scope } = await refreshUserToken(config.oauth.twitch.clientId, config.oauth.twitch.clientSecret, moderator.refreshToken);

    const provider = new StaticAuthProvider(config.oauth.twitch.clientId, accessToken, scope);
    const twitch = new ApiClient({ authProvider: provider });

    const chatters = await twitch.asUser(moderator.twitchId, async ctx => ctx.chat.getChattersPaginated(SITE.twitchId).getAll());

    if (!chatters.length) continue;

    return chatters.map(chatter => chatter.userId);
  }

  return [];
}, {
  maxAge: 300,
  swr: false,
  group: "api",
  name: "chatters",
  getKey: () => "all"
});
