export default defineEventHandler(async (event) => {
  const { name } = getRouterParams(event);
  const userInfo = await db.select({
    twitchId: tables.users.twitchId,
    twitchLogin: tables.users.twitchLogin,
    twitchDisplay: tables.users.twitchDisplay,
    twitchProfileImage: tables.users.twitchProfileImage,
    country: tables.users.country,
    bio: tables.users.bio,
    badges: tables.users.badges,
    updatedAt: tables.users.updatedAt
  }).from(tables.users).where(eq(tables.users.twitchLogin, name.toLowerCase())).get();

  if (!userInfo) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const riotAccounts = await db.select().from(tables.riotAccounts).where(eq(tables.riotAccounts.twitchId, userInfo.twitchId)).all();

  return {
    user: userInfo,
    riotAccounts
  };
});
