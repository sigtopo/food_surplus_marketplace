import { eq, and, gte, lte, desc, asc, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, stores, meals, cartItems, orders, orderItems } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Store queries
export async function createStore(storeData: typeof stores.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(stores).values(storeData);
  return result;
}

export async function getStoreByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(stores).where(eq(stores.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoreById(storeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllStores() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(stores).where(eq(stores.isActive, true));
}

export async function updateStore(storeId: number, updates: Partial<typeof stores.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(stores).set(updates).where(eq(stores.id, storeId));
}

// Meal queries
export async function createMeal(mealData: typeof meals.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(meals).values(mealData);
  return result;
}

export async function getMealById(mealId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(meals).where(eq(meals.id, mealId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMealsByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(meals).where(eq(meals.storeId, storeId));
}

export async function getAvailableMeals(filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  storeId?: number;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [eq(meals.isAvailable, true)];

  if (filters?.category) {
    conditions.push(eq(meals.category, filters.category as any));
  }
  if (filters?.minPrice !== undefined) {
    conditions.push(gte(meals.discountedPrice, filters.minPrice.toString()));
  }
  if (filters?.maxPrice !== undefined) {
    conditions.push(lte(meals.discountedPrice, filters.maxPrice.toString()));
  }
  if (filters?.storeId) {
    conditions.push(eq(meals.storeId, filters.storeId));
  }
  if (filters?.search) {
    conditions.push(like(meals.nameEn, `%${filters.search}%`));
  }

  return await db.select().from(meals).where(and(...conditions));
}

export async function updateMeal(mealId: number, updates: Partial<typeof meals.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(meals).set(updates).where(eq(meals.id, mealId));
}

export async function deleteMeal(mealId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(meals).where(eq(meals.id, mealId));
}

// Cart queries
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
}

export async function addToCart(userId: number, mealId: number, quantity: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.mealId, mealId)))
    .limit(1);

  if (existing.length > 0) {
    return await db.update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.mealId, mealId)));
  }

  return await db.insert(cartItems).values({ userId, mealId, quantity });
}

export async function updateCartItem(userId: number, mealId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(cartItems)
    .set({ quantity })
    .where(and(eq(cartItems.userId, userId), eq(cartItems.mealId, mealId)));
}

export async function removeFromCart(userId: number, mealId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.mealId, mealId)));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// Order queries
export async function createOrder(orderData: typeof orders.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orders).values(orderData);
  // Fetch and return the created order
  const created = await db.select().from(orders)
    .where(eq(orders.userId, orderData.userId))
    .orderBy(desc(orders.createdAt))
    .limit(1);
  return created[0] || orderData;
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getStoreOrders(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders)
    .where(eq(orders.storeId, storeId))
    .orderBy(desc(orders.createdAt));
}

export async function updateOrder(orderId: number, updates: Partial<typeof orders.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(orders).set(updates).where(eq(orders.id, orderId));
}

// Order items queries
export async function createOrderItems(itemsData: (typeof orderItems.$inferInsert)[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(orderItems).values(itemsData);
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}
