import { protectedProcedure } from "@/trpc";
import { RedisService } from "@/utils/redis";
import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

const pub = new RedisService().getPublisher();
const sub = new RedisService().getSubscriber();

/**
 * @deprecated This router is for testing purposes only and might not be used in production.
 */
export const testSubscriptionRouter = {
  publishTest: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      pub.publish("test", input.toString());
    }),
  onTest: protectedProcedure
    .input(z.number())
    .subscription(async function* ({ input }) {
      sub.on("test", async function* (data) {
        console.log("Received data:", data);
        yield data;
      });
    }),
} satisfies TRPCRouterRecord;
