export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const params = await getValidatedRouterParams(event, z.object({
    name: z.string(),
    puuid: z.string()
  }).parse);

  const twitchId = await getTwitchIdByLogin(event, params.name);

  if (user.twitchId !== twitchId) {
    throw createError({ status: ErrorCode.FORBIDDEN, message: "No tienes permiso para realizar esta acción" });
  }

  const deleteResult = await db.delete(tables.riotAccounts).where(and(
    eq(tables.riotAccounts.twitchId, twitchId),
    eq(tables.riotAccounts.puuid, params.puuid)
  )).returning().get();

  if (!deleteResult) {
    throw createError({ status: ErrorCode.NOT_FOUND, message: "Cuenta de Riot no encontrada" });
  }

  return deleteResult;
});
