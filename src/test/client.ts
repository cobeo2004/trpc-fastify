import {
  createTRPCClient,
  createWSClient,
  httpBatchLink,
  splitLink,
  wsLink,
} from "@trpc/client";
import { type AppRouter } from "..";
import superjson from "superjson";

async function subscribeToTest(
  trpc: ReturnType<typeof createTRPCClient<AppRouter>>
) {
  const sub = trpc.testSubscription.onTest.subscribe(undefined, {
    onData(data) {
      console.log(">>> Test data:", data);
    },
    onError(error) {
      console.error(">>> Test subscription error:", error);
    },
    onComplete() {
      console.log(">>> Test subscription completed");
    },
  });
  return sub;
}
async function subscribeToUsers(
  trpc: ReturnType<typeof createTRPCClient<AppRouter>>
) {
  console.log("Starting user subscription...");
  const sub = trpc.user.onUserEvents.subscribe(undefined, {
    onData(event) {
      console.log(">>> Observed new user event:", event);
    },
    onError(error) {
      console.error(">>> User subscription error:", error);
    },
    onComplete() {
      console.log(">>> User subscription completed");
    },
  });

  return sub;
}

async function createUsersPeriodically(
  trpc: ReturnType<typeof createTRPCClient<AppRouter>>
) {
  let count = 0;
  const interval = setInterval(async () => {
    try {
      const newUser = await trpc.user.createUser.mutate({
        name: `Test User ${count}`,
        bio: `This is test user ${count} created at ${new Date().toISOString()}`,
      });
      console.log(">>> Created user:", newUser);
      count++;
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }, 5000);

  return interval;
}
async function publishTestPeriodically(
  trpc: ReturnType<typeof createTRPCClient<AppRouter>>
) {
  let count = 0;
  const interval = setInterval(async () => {
    await trpc.testSubscription.publishTest.mutate(count);
    count++;
  }, 5000);
  return interval;
}
async function start() {
  const port = Number(process.env.PORT) ?? 3000;
  const prefix = "/trpc";
  const urlEnd = `localhost:${port}${prefix}`;
  const wsClient = createWSClient({
    url: `ws://${urlEnd}`,
    connectionParams: async () => {
      return { token: "secret" };
    },
  });
  const trpc = createTRPCClient<AppRouter>({
    links: [
      splitLink({
        condition(op) {
          return op.type === "subscription";
        },
        true: wsLink({ client: wsClient, transformer: superjson }),
        false: httpBatchLink({
          url: `http://${urlEnd}`,
          transformer: superjson,
          headers: async () => ({
            "x-trpc-username": "test",
            "x-trpc-source": "fastify-client",
          }),
        }),
      }),
    ],
  });

  // Get initial users
  const users = await trpc.user.getUsers.query();
  console.log(">>> Initial users list:", users);

  // Start test subscription
  const testSubscription = await subscribeToTest(trpc);

  // Start subscription
  const subscription = await subscribeToUsers(trpc);

  // Start creating users periodically
  // const interval = await createUsersPeriodically(trpc);

  const interval = await publishTestPeriodically(trpc);
  // Keep the process running
  process.on("SIGINT", () => {
    console.log("Cleaning up...");
    subscription.unsubscribe();
    testSubscription.unsubscribe();
    clearInterval(interval);
    wsClient.close();
    process.exit();
  });
}

void start();
