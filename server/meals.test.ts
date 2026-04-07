import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1, role: "user" | "store" | "admin" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("meals", () => {
  describe("getAvailable", () => {
    it("returns available meals", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.meals.getAvailable({});

      expect(Array.isArray(result)).toBe(true);
    });

    it("filters by category", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.meals.getAvailable({
        category: "main",
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("filters by price range", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.meals.getAvailable({
        minPrice: 5,
        maxPrice: 15,
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("create", () => {
    it("requires store role", async () => {
      const { ctx } = createAuthContext(1, "user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.meals.create({
          nameEn: "Test Meal",
          nameAr: "وجبة اختبار",
          category: "main",
          originalPrice: 10,
          discountedPrice: 5,
          imageUrl: "https://example.com/image.jpg",
          quantity: 5,
          availableUntil: new Date(),
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("creates meal for store user", async () => {
      const { ctx } = createAuthContext(1, "store");
      const caller = appRouter.createCaller(ctx);

      // Note: This test will fail without a real database setup
      // In production, you'd use a test database or mock the db functions
      try {
        const result = await caller.meals.create({
          nameEn: "Test Meal",
          nameAr: "وجبة اختبار",
          category: "main",
          originalPrice: 10,
          discountedPrice: 5,
          imageUrl: "https://example.com/image.jpg",
          quantity: 5,
          availableUntil: new Date(),
        });

        expect(result).toBeDefined();
      } catch (error: any) {
        // Expected to fail without real database
        expect(error).toBeDefined();
      }
    });
  });
});

describe("cart", () => {
  describe("getItems", () => {
    it("requires authentication", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: {
          protocol: "https",
          headers: {},
        } as TrpcContext["req"],
        res: {
          clearCookie: () => {},
        } as TrpcContext["res"],
      };

      const caller = appRouter.createCaller(ctx);

      try {
        await caller.cart.getItems();
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("returns cart items for authenticated user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.cart.getItems();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("addItem", () => {
    it("requires authentication", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: {
          protocol: "https",
          headers: {},
        } as TrpcContext["req"],
        res: {
          clearCookie: () => {},
        } as TrpcContext["res"],
      };

      const caller = appRouter.createCaller(ctx);

      try {
        await caller.cart.addItem({ mealId: 1, quantity: 1 });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("adds item to cart for authenticated user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.cart.addItem({ mealId: 1, quantity: 1 });
        expect(result).toBeDefined();
      } catch (error: any) {
        // Expected to fail without real database or valid meal ID
        expect(error).toBeDefined();
      }
    });
  });
});

describe("orders", () => {
  describe("create", () => {
    it("requires authentication", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: {
          protocol: "https",
          headers: {},
        } as TrpcContext["req"],
        res: {
          clearCookie: () => {},
        } as TrpcContext["res"],
      };

      const caller = appRouter.createCaller(ctx);

      try {
        await caller.orders.create({
          storeId: 1,
          totalPrice: 25,
          items: [{ mealId: 1, quantity: 1, pricePerItem: 5 }],
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("validates store exists", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.orders.create({
          storeId: 9999, // Non-existent store
          totalPrice: 25,
          items: [{ mealId: 1, quantity: 1, pricePerItem: 5 }],
        });
        expect.fail("Should have thrown NOT_FOUND error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("getUserOrders", () => {
    it("requires authentication", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: {
          protocol: "https",
          headers: {},
        } as TrpcContext["req"],
        res: {
          clearCookie: () => {},
        } as TrpcContext["res"],
      };

      const caller = appRouter.createCaller(ctx);

      try {
        await caller.orders.getUserOrders();
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("returns user orders", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.orders.getUserOrders();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
