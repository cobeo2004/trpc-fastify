import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "./utils/db";

export const createTRPCContext = async (
  opts: CreateFastifyContextOptions | CreateWSSContextFnOptions
) => {
  const user = { name: opts.req.headers["x-trpc-username"] || "anonymous" };
  const source = opts.req.headers["x-trpc-source"] ?? "unknown";
  const connParams = opts.info?.connectionParams;

  console.log(
    ">>> tRPC Request from",
    source,
    "by",
    user,
    "with connParams",
    connParams
  );
  return {
    req: opts.req as FastifyRequest,
    res: opts.res as FastifyReply,
    user,
    source,
    connParams,
    db,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
