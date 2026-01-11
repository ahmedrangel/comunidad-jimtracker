export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    name: z.string()
  }).parse);

  const twitchId = await getTwitchIdByLogin(event, params.name);

  const riotAccounts = await db.select().from(tables.riotAccounts).where(
    eq(tables.riotAccounts.twitchId, twitchId)
  ).all();

  return riotAccounts;
});
