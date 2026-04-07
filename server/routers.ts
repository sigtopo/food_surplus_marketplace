import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Store procedures
  stores: router({
    getAll: publicProcedure.query(async () => {
      return await db.getAllStores();
    }),

    getById: publicProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStoreById(input.storeId);
      }),

    getByUserId: protectedProcedure.query(async ({ ctx }) => {
      return await db.getStoreByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          category: z.enum(["restaurant", "grocery", "bakery", "cafe", "other"]),
          latitude: z.number(),
          longitude: z.number(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "store" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await db.createStore({
          userId: ctx.user.id,
          ...input,
          latitude: input.latitude.toString(),
          longitude: input.longitude.toString(),
        });

        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          storeId: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const store = await db.getStoreById(input.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const { storeId, ...updates } = input;
        return await db.updateStore(storeId, updates);
      }),
  }),

  // Meal procedures
  meals: router({
    getAvailable: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          storeId: z.number().optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await db.getAvailableMeals(input);
      }),

    getById: publicProcedure
      .input(z.object({ mealId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMealById(input.mealId);
      }),

    getByStoreId: publicProcedure
      .input(z.object({ storeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMealsByStoreId(input.storeId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          nameEn: z.string().min(1),
          nameAr: z.string().min(1),
          descriptionEn: z.string().optional(),
          descriptionAr: z.string().optional(),
          category: z.enum(["main", "side", "dessert", "beverage", "snack", "other"]),
          originalPrice: z.number().positive(),
          discountedPrice: z.number().positive(),
          imageUrl: z.string().url(),
          quantity: z.number().positive(),
          availableUntil: z.date(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const store = await db.getStoreByUserId(ctx.user.id);
        if (!store) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Store not found" });
        }

        return await db.createMeal({
          storeId: store.id,
          ...input,
          originalPrice: input.originalPrice.toString(),
          discountedPrice: input.discountedPrice.toString(),
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          mealId: z.number(),
          nameEn: z.string().optional(),
          nameAr: z.string().optional(),
          descriptionEn: z.string().optional(),
          descriptionAr: z.string().optional(),
          originalPrice: z.number().optional(),
          discountedPrice: z.number().optional(),
          imageUrl: z.string().optional(),
          quantity: z.number().optional(),
          availableUntil: z.date().optional(),
          isAvailable: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const meal = await db.getMealById(input.mealId);
        if (!meal) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const store = await db.getStoreById(meal.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const { mealId, ...updates } = input;
        const processedUpdates: any = { ...updates };
        if (updates.originalPrice !== undefined) {
          processedUpdates.originalPrice = updates.originalPrice.toString();
        }
        if (updates.discountedPrice !== undefined) {
          processedUpdates.discountedPrice = updates.discountedPrice.toString();
        }

        return await db.updateMeal(mealId, processedUpdates);
      }),

    delete: protectedProcedure
      .input(z.object({ mealId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const meal = await db.getMealById(input.mealId);
        if (!meal) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const store = await db.getStoreById(meal.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return await db.deleteMeal(input.mealId);
      }),
  }),

  // Cart procedures
  cart: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCartItems(ctx.user.id);
    }),

    addItem: protectedProcedure
      .input(z.object({ mealId: z.number(), quantity: z.number().positive().default(1) }))
      .mutation(async ({ ctx, input }) => {
        const meal = await db.getMealById(input.mealId);
        if (!meal || !meal.isAvailable) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Meal not available" });
        }

        return await db.addToCart(ctx.user.id, input.mealId, input.quantity);
      }),

    updateItem: protectedProcedure
      .input(z.object({ mealId: z.number(), quantity: z.number().positive() }))
      .mutation(async ({ ctx, input }) => {
        return await db.updateCartItem(ctx.user.id, input.mealId, input.quantity);
      }),

    removeItem: protectedProcedure
      .input(z.object({ mealId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.removeFromCart(ctx.user.id, input.mealId);
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      return await db.clearCart(ctx.user.id);
    }),
  }),

  // Order procedures
  orders: router({
    getUserOrders: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserOrders(ctx.user.id);
    }),

    getStoreOrders: protectedProcedure.query(async ({ ctx }) => {
      const store = await db.getStoreByUserId(ctx.user.id);
      if (!store) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.getStoreOrders(store.id);
    }),

    getById: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order || order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return order;
      }),

    create: protectedProcedure
      .input(
        z.object({
          storeId: z.number(),
          totalPrice: z.number().positive(),
          notes: z.string().optional(),
          pickupTime: z.date().optional(),
          items: z.array(
            z.object({
              mealId: z.number(),
              quantity: z.number().positive(),
              pricePerItem: z.number().positive(),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const store = await db.getStoreById(input.storeId);
        if (!store) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });
        }

        const order = await db.createOrder({
          userId: ctx.user.id,
          storeId: input.storeId,
          totalPrice: input.totalPrice.toString(),
          notes: input.notes,
          pickupTime: input.pickupTime,
        });

        // Create order items
        if (order && typeof order === 'object' && 'id' in order) {
          const orderItemsData = input.items.map((item) => ({
            orderId: order.id,
            mealId: item.mealId,
            quantity: item.quantity,
            pricePerItem: item.pricePerItem.toString(),
          }));

          await db.createOrderItems(orderItemsData);
        }

        // Clear cart
        await db.clearCart(ctx.user.id);

        return order;
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          status: z.enum(["pending", "confirmed", "ready", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const store = await db.getStoreById(order.storeId);
        if (!store || store.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return await db.updateOrder(input.orderId, { status: input.status });
      }),
  }),
});

export type AppRouter = typeof appRouter;
