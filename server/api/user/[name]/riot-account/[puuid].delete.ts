export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    name: z.string(),
    puuid: z.string()
  }).parse);

  const twitchId = await getTwitchIdByLogin(event, params.name);

  if (!twitchId) {
    throw createError({ status: 404, message: "Usuario no encontrado" });
  }

  const deleteResult = await db.delete(tables.riotAccounts).where(and(
    eq(tables.riotAccounts.twitchId, twitchId),
    eq(tables.riotAccounts.puuid, params.puuid)
  )).returning().get();
  if (!deleteResult) {
    throw createError({ status: 404, message: "Cuenta de Riot no encontrada" });
  }
  return deleteResult;
});
