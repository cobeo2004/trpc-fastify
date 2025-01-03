import { createTRPCRouter } from "../trpc";
import { testSubscriptionRouter } from "./test";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  user: userRouter,
  testSubscription: testSubscriptionRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
