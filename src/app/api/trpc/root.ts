import {createTRPCRouter} from "@/app/api/trpc/trpc";
import {houseRouter} from "@/app/api/trpc/routers/house";
import {userRouter} from "@/app/api/trpc/routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  house: houseRouter,
  user: userRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
