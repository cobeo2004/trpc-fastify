import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import fastifyWs from "@fastify/websocket";
import { appRouter, createTRPCContext, type AppRouter } from "./src";

const server = fastify({
  maxParamLength: 5000,
  logger: true,
  trustProxy: true,
});

server.get("/", (req, res) => {
  res.send("Hello World");
});

server.register(fastifyWs);

server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  useWSS: true,
  keepAlive: {
    enabled: true,
    pingMs: 30000,
    pongWaitMs: 5000,
  },
  trpcOptions: {
    router: appRouter,
    createContext: createTRPCContext,
    onError: ({ error, path }) => {
      console.error(">>> TRPC Error on '", path, "'", error);
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

server.listen({ port: 3000 }, (err, addr) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running on ${addr}`);

  process.on("SIGINT", () => {
    console.log("SIGINT received, closing server...");
    server.close();
    process.exit(0);
  });
});
