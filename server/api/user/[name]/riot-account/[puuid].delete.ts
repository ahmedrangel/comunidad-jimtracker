export default defineEventHandler(async (event) => {
  const { name, puuid } = getRouterParams(event);

  const twitchId = await getTwitchIdByLogin(event, name);

  if (!twitchId) {
    throw createError({ statusCode: 404, message: "Usuario no encontrado" });
  }

  const deleteResult = await db.delete(tables.riotAccounts).where(and(
    eq(tables.riotAccounts.twitchId, twitchId),
    eq(tables.riotAccounts.puuid, puuid)
  )).returning().get();
  if (!deleteResult) {
    throw createError({ statusCode: 404, message: "Cuenta de Riot no encontrada" });
  }
  return deleteResult;
});
