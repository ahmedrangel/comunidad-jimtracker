import type { H3Event } from "h3";

export const getTwitchIdByLogin = defineCachedFunction(async (event: H3Event, login: string) => {
  const user = await db.select({
    twitchId: tables.users.twitchId
  }).from(tables.users).where(
    eq(tables.users.twitchLogin, login.toLowerCase())
  ).get();

  if (!user || !user.twitchId) {
    throw createError({
      status: ErrorCode.NOT_FOUND,
      message: "Usuario no encontrado"
    });
  }

  return user?.twitchId;
}, {
  maxAge: 60 * 60 * 24, // 1 day
  group: "functions",
  name: "getTwitchIdByLogin",
  swr: false,
  getKey: (event: H3Event, login: string) => login
});
