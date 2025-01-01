import { z } from "zod";
import type { User } from "@prisma/client";
import { protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { EventEmitter2Service } from "@/utils/emitter";

type UserEvent = {
  event: "create" | "update" | "delete";
  data: User;
};

const ee = new EventEmitter2Service<
  "userCreated" | "userUpdated" | "userDeleted",
  [User]
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
      ee.emit("userCreated", user);
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
      ee.emit("userUpdated", updatedUser);
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
      ee.emit("userDeleted", user);
      return user;
    }),

  onUserCreated: protectedProcedure.subscription(async () => {
    return observable<User>((emit) => {
      const onUserCreated = (user: User) => emit.next(user);
      ee.on("userCreated", onUserCreated);
      return () => {
        ee.off("userCreated", onUserCreated);
      };
    });
  }),

  onUserUpdated: protectedProcedure.subscription(async () => {
    return observable<User>((emit) => {
      const onUserUpdated = (user: User) => emit.next(user);
      ee.on("userUpdated", onUserUpdated);
      return () => {
        ee.off("userUpdated", onUserUpdated);
      };
    });
  }),

  onUserDeleted: protectedProcedure.subscription(async () => {
    return observable<User>((emit) => {
      const onUserDeleted = (user: User) => emit.next(user);
      ee.on("userDeleted", onUserDeleted);
      return () => {
        ee.off("userDeleted", onUserDeleted);
      };
    });
  }),

  onUserEvents: protectedProcedure.subscription(async () => {
    return observable<UserEvent>((emit) => {
      const onUserCreated = (user: User) =>
        emit.next({ event: "create", data: user });
      const onUserUpdated = (user: User) =>
        emit.next({ event: "update", data: user });
      const onUserDeleted = (user: User) =>
        emit.next({ event: "delete", data: user });

      ee.on("userCreated", onUserCreated);
      ee.on("userUpdated", onUserUpdated);
      ee.on("userDeleted", onUserDeleted);

      return () => {
        ee.off("userCreated", onUserCreated);
        ee.off("userUpdated", onUserUpdated);
        ee.off("userDeleted", onUserDeleted);
      };
    });
  }),
} satisfies TRPCRouterRecord;
