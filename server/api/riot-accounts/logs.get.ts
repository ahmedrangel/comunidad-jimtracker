export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20)
  }).parse);

  const offset = (query.page - 1) * query.limit;

  const logs = await db.select()
    .from(tables.riotAccountLogs)
    .orderBy(desc(tables.riotAccountLogs.createdAt))
    .limit(query.limit)
    .offset(offset)
    .all();

  return logs;
});
