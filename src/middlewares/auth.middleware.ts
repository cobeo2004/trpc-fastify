import { TRPCError } from "@trpc/server";
import type { TRPCMiddlewareFunction } from "../trpc";

export const authMiddleware: TRPCMiddlewareFunction = async ({
  next,
  ctx,
  path,
}) => {
  const result = await next();
  if (path === "user.onUserCreated" && ctx.connParams?.token !== "secret") {
    console.error(">>> reject ws connection from", ctx.connParams?.token);
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid WS Token",
    });
  }
  console.log(">>> accepted ws connection from", ctx.connParams?.token);
  return result;
};
