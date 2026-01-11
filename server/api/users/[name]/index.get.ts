export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    name: z.string()
  }).parse);

  const user = await db.select({
    twitchId: tables.users.twitchId,
    twitchLogin: tables.users.twitchLogin,
    twitchDisplay: tables.users.twitchDisplay,
    twitchProfileImage: tables.users.twitchProfileImage,
    country: tables.users.country,
    bio: tables.users.bio,
    badges: tables.users.badges,
    updatedAt: tables.users.updatedAt
  }).from(tables.users).where(eq(tables.users.twitchLogin, params.name.toLowerCase())).get();

  if (!user) {
    throw createError({ status: ErrorCode.NOT_FOUND, statusMessage: "User not found" });
  }

  return user;
});
