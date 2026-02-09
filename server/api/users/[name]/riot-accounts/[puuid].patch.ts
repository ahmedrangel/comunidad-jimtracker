export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const params = await getValidatedRouterParams(event, z.object({
    name: z.string(),
    puuid: z.string()
  }).parse);

  const rolesEnum = ["top", "jungle", "mid", "adc", "support", "fill"] as const;

  const body = await readValidatedBody(event, z.object({
    role1: z.enum(rolesEnum).nullable(),
    role2: z.enum(rolesEnum).nullable()
  }).parse);

  if (params.name !== user.twitchLogin) {
    throw createError({ status: ErrorCode.FORBIDDEN, message: "No tienes permiso para realizar esta acción" });
  }

  const update = await db.update(tables.riotAccounts)
    .set({
      role1: body.role1,
      role2: body.role2
    })
    .where(and(
      eq(tables.riotAccounts.twitchId, user.twitchId),
      eq(tables.riotAccounts.puuid, params.puuid)
    ))
    .returning({
      role1: tables.riotAccounts.role1,
      role2: tables.riotAccounts.role2
    })
    .get();

  return update;
});
