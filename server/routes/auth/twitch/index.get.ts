import countries from "~/assets/json/countries.json";

export default defineOAuthTwitchEventHandler({
  async onSuccess (event, result: { user: TwitchUser }) {
    const twitch = result.user;

    const countryCode = event.context.cloudflare?.request?.cf?.country as string || null;

    const user = await db.insert(tables.users).values({
      twitchId: twitch.id,
      twitchLogin: twitch.login,
      twitchDisplay: twitch.display_name,
      twitchProfileImage: twitch.profile_image_url,
      country: countries.find(c => c.code === countryCode)?.emoji || null
    }).onConflictDoUpdate({
      target: tables.users.twitchId,
      set: {
        twitchLogin: twitch.login,
        twitchDisplay: twitch.display_name,
        twitchProfileImage: twitch.profile_image_url,
        updatedAt: unixepoch({ mode: "ms" })
      }
    }).returning().get();

    await setUserSession(event, { user });

    return send(event, `
      <script>
        localStorage.removeItem('temp-nuxt-auth-utils-popup');
        window.close();
      </script>
    `, "text/html");
  }
});
