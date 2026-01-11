import { StaticAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";

export default defineOAuthTwitchEventHandler({
  config: {
    scope: ["user:read:moderated_channels", "moderator:read:followers"]
  },
  async onSuccess (event, result: { user: TwitchUser, tokens: any }) {
    const twitch = result.user;
    const config = useRuntimeConfig(event);
    const provider = new StaticAuthProvider(config.oauth.twitch.clientId, result.tokens.access_token);
    const twitchApi = new ApiClient({ authProvider: provider });
    const moderatedChannelsPagination = twitchApi.moderation.getModeratedChannelsPaginated(twitch.id);
    const moderatedChannels = await moderatedChannelsPagination.getAll();
    if (SITE.twitchId in moderatedChannels.map(c => c.id)) {
      await db.insert(tables.channelModerators).values({
        twitchId: twitch.id,
        accessToken: result.tokens.access_token,
        refreshToken: result.tokens.refresh_token,
        expiresIn: result.tokens.expires_in
      }).onConflictDoUpdate({
        target: tables.channelModerators.twitchId,
        set: {
          accessToken: result.tokens.access_token,
          refreshToken: result.tokens.refresh_token,
          expiresIn: result.tokens.expiresIn,
          updatedAt: unixepoch({ mode: "ms" })
        }
      }).returning().get();
      return sendRedirect(event, "/");
    }
    else {
      throw createError({
        status: ErrorCode.FORBIDDEN,
        message: "No eres moderador de JimRsng."
      });
    }
  }
});
