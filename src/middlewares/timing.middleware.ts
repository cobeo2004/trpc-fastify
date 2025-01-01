import type { TRPCMiddlewareFunction } from "../trpc";

export const timingMiddleware: TRPCMiddlewareFunction = async ({
  next,
  path,
}) => {
  const start = Date.now();
  if (process.env.NODE_ENV === "development") {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
};
