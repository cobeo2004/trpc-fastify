import { z } from "zod";
import type { User } from "@prisma/client";
import { protectedProcedure, publicProcedure } from "../trpc";
import { tracked, TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { EventEmitterService } from "@/utils/emitter";
import { on } from "@/utils/event-emitter";
type UserEvent = {
  event: "create" | "update" | "delete";
  data: User;
};

const ee = new EventEmitterService<
  "userCreated" | "userUpdated" | "userDeleted",
  [UserEvent]
>().getEmitter();

export const userRouter = {
  getUsers: publicProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany();
  }),
  getUserById: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.user.findUnique({ where: { id: input } });
  }),
  createUser: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        bio: z.string().max(142).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = Date.now().toString();
      const user = await ctx.db.user.create({
        data: { id, ...input },
      });
      ee.emit("userCreated", { event: "create", data: user });
      return user;
    }),

  updateUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).optional(),
        bio: z.string().max(142).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { id: input.id } });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const updatedUser = await ctx.db.user.update({
        where: { id: input.id },
        data: input,
      });
      ee.emit("userUpdated", { event: "update", data: updatedUser });
      return updatedUser;
    }),

  deleteUser: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { id: input } });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      await ctx.db.user.delete({ where: { id: input } });
      ee.emit("userDeleted", { event: "delete", data: user });
      return user;
    }),

  onUserCreated: protectedProcedure.subscription(async function* (opts) {
    try {
      console.log("User subscription for onUserCreated started");
      for await (const [data] of on(ee, "userCreated", {
        signal: opts.signal,
      })) {
        console.log("User subscription for onUserCreated received user:", data);
        yield tracked(data.data.id, data.data);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: error.message,
        });
      }
      throw error;
    } finally {
      console.log("User subscription for onUserCreated cancelled");
    }
  }),
  onUserUpdated: protectedProcedure.subscription(async function* (opts) {
    try {
      for await (const [data] of on(ee, "userUpdated", {
        signal: opts.signal,
      })) {
        yield tracked(data.data.id, data.data);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: error.message,
        });
      }
      throw error;
    } finally {
      console.log("User subscription for onUserUpdated cancelled");
    }
  }),

  onUserDeleted: protectedProcedure.subscription(async function* (opts) {
    try {
      for await (const [data] of on(ee, "userDeleted", {
        signal: opts.signal,
      })) {
        yield tracked(data.data.id, data.data);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: error.message,
        });
      }
      throw error;
    } finally {
      console.log("User subscription for onUserDeleted cancelled");
    }
  }),

  onUserEvents: protectedProcedure.subscription(async function* (opts) {
    try {
      console.log("User events subscription started");
      const events = [
        on(ee, "userCreated", { signal: opts.signal }),
        on(ee, "userUpdated", { signal: opts.signal }),
        on(ee, "userDeleted", { signal: opts.signal }),
      ];

      while (true) {
        const results = Promise.race(
          events.map(async (event) => {
            const data = await event.next();
            return data;
          })
        );

        if (results) {
          switch (true) {
            case results instanceof Promise:
              const data = (await results).value;
              console.log("User event:", data);
              yield data;
              break;
            default:
              console.log("Unknown event type:", results);
              break;
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: error.message,
        });
      }
      throw error;
    } finally {
      console.log("User events subscription cancelled");
    }
  }),
} satisfies TRPCRouterRecord;
