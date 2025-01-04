# E2E Realtime Typesafe API with Fastify + tRPC + Prisma

This is a RESTful + Realtime + E2E typesafe API powered by Fastify server, tRPC as E2E typesafe API and Prisma for database
You can use this as a boilerplate code for further extends

To install dependencies:

```bash
bun install
```

Before run:

```bash
bunx prisma migrate dev
bunx prisma db push
```

To run:

```bash
bun run server.ts
bun run dev # For server
bun run dev:client # For client side
```

This project was created using `bun init` in bun v1.1.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
