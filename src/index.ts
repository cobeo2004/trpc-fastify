import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { appRouter, type AppRouter } from "./router";
import { createCallerFactory } from "./trpc";
import { createTRPCContext, type TRPCContext } from "./context";

const createCaller = createCallerFactory(appRouter);

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export { createTRPCContext, createCaller, appRouter };

export type { RouterInputs, RouterOutputs, AppRouter, TRPCContext };
