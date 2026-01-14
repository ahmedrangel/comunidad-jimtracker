import type { H3Event } from "h3";
import { createError, eventHandler, getQuery, sendRedirect } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { getOAuthRedirectURL, handleAccessTokenErrorResponse, handleInvalidState, handleMissingConfiguration, handleState, requestAccessToken } from "../../../node_modules/nuxt-auth-utils/dist/runtime/server/lib/utils";
import { useRuntimeConfig } from "#imports";
import type { OAuthConfig } from "#auth-utils";

export interface OAuthRiotGamesConfig {
  /**
   * RiotGames OAuth Client ID
   * @default process.env.NUXT_OAUTH_RIOT_CLIENT_ID
   */
  clientId?: string;
  /**
   * RiotGames OAuth Client Secret
   * @default process.env.NUXT_OAUTH_RIOT_CLIENT_SECRET
   */
  clientSecret?: string;
  /**
   * RiotGames OAuth Scope
   * @default []
   * @see https://beta.developer.riotgames.com/sign-on
   * @example ['cpid', 'offline_access']
   */
  scope?: string[];

  /**
   * RiotGames OAuth Authorization URL
   * @default 'https://auth.riotgames.com/authorize'
   */
  authorizationURL?: string;

  /**
   * Riot OAuth Token URL
   * @default 'https://auth.riotgames.com/token'
   */
  tokenURL?: string;

  /**
   * RiotGames API URL
   * @default 'https://auth.riotgames.com'
   */
  apiURL?: string;

  /**
   * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
   * @default process.env.NUXT_OAUTH_RIOT_REDIRECT_URL
   */
  redirectURL?: string;
}

interface RiotGamesUser {
  sub: string;
  cpid?: string;
  jti: string;
}

interface RiotGamesTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export function defineOAuthRiotGamesEventHandler ({ config, onSuccess, onError }: OAuthConfig<OAuthRiotGamesConfig, { user: RiotGamesUser, tokens: RiotGamesTokens }>) {
  return eventHandler(async (event: H3Event) => {
    config = defu(config, useRuntimeConfig(event)?.riot, {
      authorizationURL: "https://auth.riotgames.com/authorize?prompt=login",
      tokenURL: "https://auth.riotgames.com/token",
      apiURL: "https://auth.riotgames.com"
    }) as OAuthRiotGamesConfig;

    const query = getQuery<{ code?: string, error?: string, state?: string }>(event);

    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `RiotGames login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError) throw error;
      return onError(event, error);
    }

    if (!config.clientId || !config.clientSecret) {
      return handleMissingConfiguration(event, "riotgames", ["clientId", "clientSecret"], onError);
    }

    const redirectURL = config.redirectURL || getOAuthRedirectURL(event);
    const state = await handleState(event);

    if (!query.code) {
      config.scope = config.scope || [];
      if (!config.scope.includes("openid")) {
        config.scope.push("openid");
      }

      return sendRedirect(
        event,
        withQuery(config.authorizationURL as string, {
          client_id: config.clientId,
          redirect_uri: redirectURL,
          response_type: "code",
          scope: config.scope.join(" "),
          state
        })
      );
    }

    if (query.state !== state) {
      return handleInvalidState(event, "riotgames", onError);
    }

    const tokens = await requestAccessToken(config.tokenURL as string, {
      body: {
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectURL,
        code: query.code
      }
    });

    if (tokens.error) {
      return handleAccessTokenErrorResponse(event, "riotgames", tokens, onError);
    }

    const accessToken = tokens.access_token;

    // TODO: improve typing
    const user: any = await $fetch(`${config.apiURL}/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return onSuccess(event, {
      user,
      tokens
    });
  });
}
