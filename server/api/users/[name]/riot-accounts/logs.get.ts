export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    name: z.string()
  }).parse);

  const query = await getValidatedQuery(event, z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(5).default(5)
  }).parse);

  const offset = (query.page - 1) * query.limit;

  const twitchId = await getTwitchIdByLogin(event, params.name);

  const riotAccountLogs = await db.select()
    .from(tables.riotAccountLogs)
    .where(eq(tables.riotAccountLogs.twitchId, twitchId))
    .limit(query.limit)
    .offset(offset)
    .orderBy(desc(tables.riotAccountLogs.createdAt))
    .all();

  return riotAccountLogs;
});
