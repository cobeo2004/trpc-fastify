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
  onTest: protectedProcedure.subscription(async function* () {
    const channel = "test";
    console.log("Starting test subscription...");

    try {
      // Subscribe to the channel
      await sub.subscribe(channel);

      // Create async iterator to receive messages
      while (true) {
        const message = await new Promise<string>((resolve) => {
          sub.on("message", (ch, msg) => {
            if (ch === channel) {
              resolve(msg);
            }
          });
        });

        console.log("Received data:", message);
        yield Number(message);
      }
    } catch (error) {
      console.error("Subscription error:", error);
      throw error;
    } finally {
      await sub.unsubscribe(channel);
      console.log("Test subscription ended");
    }
  }),
} satisfies TRPCRouterRecord;
