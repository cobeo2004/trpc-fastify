import type { TRPCMiddlewareFunction } from "@/trpc";
import { TRPCError } from "@trpc/server";

const requestMap = new Map<string, { count: number; timestamp: number }>();
const LIMIT = 10;
const BAN_DURATION = 60 * 1000; // 1 minute in milliseconds

export const limiterMiddleware: TRPCMiddlewareFunction = async ({
  next,
  ctx,
}) => {
  const ip = ctx.req.ip || ctx.req.socket.remoteAddress || "unknown";
  const now = Date.now();

  // Get or create rate limit info for this IP
  const rateLimit = requestMap.get(ip) || { count: 0, timestamp: now };

  // Reset count if ban duration has passed
  if (now - rateLimit.timestamp > BAN_DURATION) {
    rateLimit.count = 0;
    rateLimit.timestamp = now;
  }

  // Increment request count
  rateLimit.count++;

  // Update map
  requestMap.set(ip, rateLimit);

  // Check if rate limit exceeded
  if (rateLimit.count > LIMIT) {
    const timeLeft = Math.ceil(
      (BAN_DURATION - (now - rateLimit.timestamp)) / 1000
    );
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Please try again in ${timeLeft} seconds.`,
    });
  }

  const result = await next();
  return result;
};
