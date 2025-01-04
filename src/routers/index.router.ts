import { createTRPCRouter } from "../trpc";
import { testSubscriptionRouter } from "./test.router";
import { userRouter } from "./user.router";

export const appRouter = createTRPCRouter({
  user: userRouter,
  testSubscription: testSubscriptionRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
