import { initTRPC } from "@trpc/server";
import { type TRPCContext } from "./context";
import { timingMiddleware } from "./middlewares/timing.middleware";
import superjson from "superjson";
import { authMiddleware } from "./middlewares/auth.middleware";
import { limiterMiddleware } from "./middlewares/limiter.middleware";

export const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape }) => {
    return shape;
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

// const timingMiddleware = t.middleware(async ({ next, path }) => {
//   const start = Date.now();
//   const result = await next();
//   const end = Date.now();
//   console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
//   return result;
// });

// const authMiddleware = t.middleware(async ({ next, ctx, path }) => {
//   const result = await next();
//   if (path === "user.onUserCreated" && ctx.connParams?.token !== "secret") {
//     console.error(">>> reject ws connection from", ctx.connParams?.token);
//     throw new TRPCError({
//       code: "UNAUTHORIZED",
//       message: "Invalid WS Token",
//     });
//   }
//   console.log(">>> accepted ws connection from", ctx.connParams?.token);
//   return result;
// });
const standardProcedure = t.procedure
  .use(timingMiddleware)
  .use(limiterMiddleware);

export const publicProcedure = standardProcedure;

export const protectedProcedure = standardProcedure.use(authMiddleware);

export type TRPCMiddlewareFunction = Parameters<typeof t.middleware>[0];
